import { Migration } from '@Lib/migration/migrations/migration';
import {
  isEnvironmentWebOrDesktop,
  isEnvironmentMobile, 
  Challenges, 
  StorageKeys, 
  namespacedKey, 
  ApplicationStages
} from '@Lib';
import { CopyPayload, CreateMaxPayloadFromAnyObject} from '@Payloads';
import { Copy, isNullOrUndefined } from '@Lib/utils';
import { ProtocolVersions, EncryptionIntents, SNRootKey } from '@Protocol';
import { SFItem, SNItemsKey, ContentTypes } from '@Models';
import { SNStorageManager } from '@Services';
import { Uuid } from '@Lib/uuid';

const LEGACY_WEB_PASSCODE_PARAMS_KEY = 'offlineParams';
const LEGACY_MOBILE_PASSCODE_PARAMS_KEY = 'pc_params';
const LEGACY_ALL_ACCOUNT_KEY_PARAMS_KEY = 'auth_params';
const LEGACY_WEB_ENCRYPTED_STORAGE_KEY = 'encryptedStorage';
const LEGACY_MOBILE_WRAPPED_ROOT_KEY_KEY = 'encrypted_account_keys';

export class Migration20200115 extends Migration {

  static timestamp() {
    return (new Date('2020-01-15').getTime());
  }

  /** @protected */
  registerStageHandlers() {
    this.registerStageHandler(ApplicationStages.PreparingForLaunch_0, async () => {
      if (isEnvironmentWebOrDesktop(this.application.platform)) {
        return this.migrateStorageStructureForWebDesktop();
      } else if (isEnvironmentMobile(this.application.platform)) {
        return this.migrateStorageStructureForMobile();
      }
    });
    this.registerStageHandler(ApplicationStages.StorageDecrypted_09, async () => {
      await this.migrateArbitraryRawStorageToManagedStorageAllPlatforms();
      if (isEnvironmentMobile(this.application.platform)) {
        this.unembedAccountKeysForMobile();
      }
    });
    this.registerStageHandler(ApplicationStages.LoadingDatabase_11, async () => {
      return this.createDefaultItemsKeyForAllPlatforms();
    });
  }

  /**
   * @private
   * @web
   * Migrates legacy storage strucutre into new managed format.
   * If encrypted storage exists, we need to first decrypt it with the passcode.
   * Then extract the account key from it. Then, encrypt storage with the
   * account key. Then encrypt the account key with the passcode and store it
   * within the new storage format.
   */
  async migrateStorageStructureForWebDesktop() {
    const deviceInterface = this.application.deviceInterface;
    const newStorageRawStructure = {
      wrapped: null,
      unwrapped: {},
      nonwrapped: {}
    };
    const accountKeyParams = await deviceInterface.getJsonParsedStorageValue(
      LEGACY_ALL_ACCOUNT_KEY_PARAMS_KEY
    );
    /** Could be null if no account, or if account and storage is encrypted */
    if (accountKeyParams) {
      newStorageRawStructure.nonwrapped[
        StorageKeys.RootKeyParams] = accountKeyParams;
    }
    const encryptedStorage = await deviceInterface.getJsonParsedStorageValue(
      LEGACY_WEB_ENCRYPTED_STORAGE_KEY
    );
    if (encryptedStorage) {
      const encryptedStoragePayload = CreateMaxPayloadFromAnyObject({
        object: encryptedStorage
      });
      const passcodeResult = await this.webDesktopHelperGetPasscodeKeyAndDecryptEncryptedStorage(
        encryptedStoragePayload
      );
      const passcodeKey = passcodeResult.key;
      const decryptedStoragePayload = passcodeResult.decryptedStoragePayload;
      const passcodeParams = passcodeResult.keyParams;
      newStorageRawStructure.nonwrapped[
        StorageKeys.RootKeyWrapperKeyParams
      ] = passcodeParams;
      const storageValueStore = Copy(decryptedStoragePayload.content.storage);
      /** Store previously encrypted auth_params into new nonwrapped key */
      newStorageRawStructure.nonwrapped[
        StorageKeys.RootKeyParams
      ] = storageValueStore[
        LEGACY_ALL_ACCOUNT_KEY_PARAMS_KEY
        ];

      let keyToEncryptStorageWith = passcodeKey;
      /** Extract account key (mk, pw, ak) if it exists */
      const hasAccountKeys = !isNullOrUndefined(storageValueStore.mk);
      if (hasAccountKeys) {
        const accountResult = await this.webDesktopHelperExtractAndWrapAccountKeysFromValueStore(
          passcodeKey,
          storageValueStore
        );
        keyToEncryptStorageWith = accountResult.unwrappedKey;
        newStorageRawStructure.nonwrapped[
          StorageKeys.WrappedRootKey
        ] = accountResult.wrappedKey;
      }
      /** Encrypt storage with proper key */
      newStorageRawStructure.wrapped = await this.webDesktopHelperEncryptStorage(
        keyToEncryptStorageWith,
        decryptedStoragePayload,
        storageValueStore
      );
    }

    /** Persist storage under new key and structure */
    await this.allPlatformHelperSetStorageStructure(newStorageRawStructure);
  }

  /**
   * @helper
   * @allplatform
   */
  async allPlatformHelperSetStorageStructure(rawStructure) {
    const newStructure = SNStorageManager.defaultValuesObject(
      rawStructure
    );
    await this.application.deviceInterface.setRawStorageValue(
      namespacedKey(this.application.namespace, StorageKeys.StorageObject),
      JSON.stringify(newStructure)
    );
  }

  /**
   * @helper
   * @webdesktop
   */
  async webDesktopHelperGetPasscodeKeyAndDecryptEncryptedStorage(encryptedPayload) {
    const rawPasscodeParams = await this.application.deviceInterface
      .getJsonParsedStorageValue(
        LEGACY_WEB_PASSCODE_PARAMS_KEY
      );
    const passcodeParams = this.application.protocolService
      .createVersionedRootKeyParams(rawPasscodeParams);
    /** Decrypt it with the passcode */
    let decryptedStoragePayload = { errorDecrypting: true };
    let passcodeKey;
    while (decryptedStoragePayload.errorDecrypting) {
      const response = await this.requestChallengeResponse(Challenges.LocalPasscode);
      const passcode = response.value;
      passcodeKey = await this.application.protocolService.computeRootKey({
        password: passcode,
        keyParams: passcodeParams
      });
      decryptedStoragePayload = await this.application.protocolService
        .payloadByDecryptingPayload({
          payload: encryptedPayload,
          key: passcodeKey
        });
    }
    return {
      decryptedStoragePayload,
      key: passcodeKey,
      keyParams: rawPasscodeParams
    };
  }

  /**
   * @helper
   * @webdesktop
   */
  async webDesktopHelperExtractAndWrapAccountKeysFromValueStore(passcodeKey, storageValueStore) {
    const version = storageValueStore.ak
      ? ProtocolVersions.V003
      : ProtocolVersions.V002;
    const accountKey = await SNRootKey.Create({
      content: {
        mk: storageValueStore.mk,
        pw: storageValueStore.pw,
        ak: storageValueStore.ak,
        version: version
      }
    });
    delete storageValueStore.mk;
    delete storageValueStore.pw;
    delete storageValueStore.ak;

    const accountKeyPayload = CreateMaxPayloadFromAnyObject({
      object: accountKey
    });
    /** Encrypt account key with passcode */
    const encryptedAccountKey = await this.application.protocolService
      .payloadByEncryptingPayload({
        payload: accountKeyPayload,
        key: passcodeKey,
        intent: EncryptionIntents.LocalStorageEncrypted
      });
    return {
      unwrappedKey: accountKey,
      wrappedKey: encryptedAccountKey
    };
  }

  /**
   * @helper
   * @webdesktop
   * Encrypt storage with account key
   */
  async webDesktopHelperEncryptStorage(
    key,
    decryptedStoragePayload,
    storageValueStore
  ) {
    const wrapped = await this.application.protocolService.
      payloadByEncryptingPayload({
        key: key,
        intent: EncryptionIntents.LocalStoragePreferEncrypted,
        payload: CopyPayload({
          payload: decryptedStoragePayload,
          override: {
            content_type: ContentTypes.EncryptedStorage,
            content: storageValueStore,
          }
        })
      });
    return wrapped;
  }

  /**
   * @private
   * @mobile
   * On mobile legacy structure is mostly similar to new structure,
   * in that the account key is encrypted with the passcode. But mobile did
   * not have encrypted storage, so we simply need to transfer all existing
   * storage values into new managed structure.

    * If no account but passcode only, the only thing we stored on mobile
    * previously was keys.offline.pw and keys.offline.timing in the keychain
    * that we compared against for valid decryption.
    * In the new version, we know a passcode is correct if it can decrypt storage.
    * As part of the migration, we’ll need to request the raw passcode from user,
    * compare it against the keychain offline.pw value, and if correct,
    * migrate storage to new structure, and encrypt with passcode key.
   */
  async migrateStorageStructureForMobile() {
    const wrappedAccountKey = await this.application.deviceInterface.getJsonParsedStorageValue(
      LEGACY_MOBILE_WRAPPED_ROOT_KEY_KEY
    );
    const accountKeyParams = await this.application.deviceInterface.getJsonParsedStorageValue(
      LEGACY_ALL_ACCOUNT_KEY_PARAMS_KEY
    );
    const rawPasscodeParams = await this.application.deviceInterface.getJsonParsedStorageValue(
      LEGACY_MOBILE_PASSCODE_PARAMS_KEY
    );
    const rawStructure = {
      nonwrapped: {
        [StorageKeys.WrappedRootKey]: wrappedAccountKey,
        [StorageKeys.RootKeyWrapperKeyParams]: rawPasscodeParams,
        [StorageKeys.RootKeyParams]: accountKeyParams
      },
      unwrapped: {},
    };
    if (rawPasscodeParams) {
      const passcodeParams = this.application.protocolService
        .createVersionedRootKeyParams(rawPasscodeParams);

      /** Move passcode timing into unwrapped storage */
      if (passcodeParams) {
        const keychainValue = await this.application.deviceInterface.getRawKeychainValue();
        const timing = keychainValue.offline.timing;
        rawStructure.unwrapped[StorageKeys.MobilePasscodeTiming] = timing;
      }

      /** Passcode only, no account */
      if (!wrappedAccountKey) {
        /** Validate current passcode by comparing against keychain offline.pw value */
        const keychainValue = await this.application.deviceInterface.getRawKeychainValue();
        const savedPw = keychainValue.offline.pw;
        let passcodeKey = { serverPassword: null };
        while (passcodeKey.serverPassword !== savedPw) {
          const response = await this.requestChallengeResponse(Challenges.LocalPasscode);
          const passcode = response.value;
          passcodeKey = await this.application.protocolService.computeRootKey({
            password: passcode,
            keyParams: passcodeParams
          });
        }
        const payload = CreateMaxPayloadFromAnyObject({
          object: {
            uuid: await Uuid.GenerateUuid(),
            content: rawStructure.unwrapped,
            content_type: ContentTypes.EncryptedStorage
          }
        });
        /** Encrypt new storage.unwrapped structure with passcode */
        const wrapped = await this.application.protocolService.payloadByEncryptingPayload({
          payload: payload,
          key: passcodeKey,
          intent: EncryptionIntents.LocalStoragePreferEncrypted
        });
        rawStructure.wrapped = wrapped;
      }
    }

    /** Move encrypted account key into place where it is now expected */
    await this.allPlatformHelperSetStorageStructure(rawStructure);
  }

  /**
   * @private
   * @mobile
   * Wrapped root key had keys embedded in content.accountKeys.
   * We want to unembed.
   */
  async unembedAccountKeysForMobile() {
    const rootKey = await this.application.keyManager.getRootKey();
    if (rootKey) {
      const accountKeys = rootKey.content.accountKeys;
      if (accountKeys) {
        const version = accountKeys.ak
          ? ProtocolVersions.V003
          : ProtocolVersions.V002;
        const rawKey = Object.assign(
          { version: version },
          accountKeys
        );
        const newRootKey = await SNRootKey.Create({
          content: rawKey
        });
        this.application.keyManager.rootKey = newRootKey;
      }
    }
  }

  /**
   * @private
   * @allplatform
   * Migrate all previously independently stored storage keys into new
   * managed approach. These keys are ones that do not need to be renamed.
   */
  async migrateArbitraryRawStorageToManagedStorageAllPlatforms() {
    const allKeyValues = await this.application.deviceInterface
      .getAllRawStorageKeyValues();
    const keysToExclude = [
      namespacedKey(this.application.namespace, StorageKeys.StorageObject),
      LEGACY_WEB_ENCRYPTED_STORAGE_KEY,
      LEGACY_WEB_PASSCODE_PARAMS_KEY,
      LEGACY_MOBILE_PASSCODE_PARAMS_KEY
    ];
    const tryJsonParse = (value) => {
      try { return JSON.parse(value); }
      catch (e) { return value; }
    };
    for (const keyValuePair of allKeyValues) {
      const key = keyValuePair.key;
      const value = keyValuePair.value;
      if (keysToExclude.includes(key)) {
        continue;
      }
      if (!isNullOrUndefined(value)) {
        /**
        * Raw values should always have been json stringified.
        * New values should always be objects/parsed.
        */
        const newValue = tryJsonParse(value);
        await this.application.storageManager.setValue(key, newValue);
      }
    }
  }

  /**
   * @private
   * @allplatform
   * Create new default SNItemsKey from root key.
   * Otherwise, when data is loaded, we won't be able to decrypt it
   * without existence of an item key. This will mean that if this migration
   * is run on two different platforms for the same user, they will create
   * two new items keys. Which one they use to decrypt past items and encrypt
   * future items doesn't really matter.
   */
  async createDefaultItemsKeyForAllPlatforms() {
    const rootKey = await this.application.keyManager.getRootKey();
    if (rootKey) {
      const rootKeyParams = await this.application.keyManager.getRootKeyParams();
      const itemsKey = SNItemsKey.FromRaw({
        itemsKey: rootKey.masterKey,
        dataAuthenticationKey: rootKey.dataAuthenticationKey,
        version: rootKeyParams.version
      });
      await itemsKey.initUUID();
      await this.application.modelManager.mapItem({ item: itemsKey });
      await this.application.modelManager.setItemDirty(itemsKey);
    }
  }
}
