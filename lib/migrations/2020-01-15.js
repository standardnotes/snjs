import { Migration } from '@Lib/migrations/migration';
import {
  isEnvironmentWebOrDesktop,
  isEnvironmentMobile,
  Challenges,
  StorageKeys,
  namespacedKey,
  ApplicationStages
} from '@Lib';
import { CopyPayload, CreateMaxPayloadFromAnyObject } from '@Payloads';
import { Copy, isNullOrUndefined } from '@Lib/utils';
import { ProtocolVersions, EncryptionIntents, SNRootKey } from '@Protocol';
import { SNItemsKey, ContentTypes } from '@Models';
import { SNStorageService } from '@Services';
import { Uuid } from '@Lib/uuid';
import { ValueModesKeys } from '@Services/storage_service';
import { Session } from '@Services/api/session';

const LEGACY_WEB_PASSCODE_PARAMS_KEY = 'offlineParams';
const LEGACY_MOBILE_PASSCODE_PARAMS_KEY = 'pc_params';
const LEGACY_ALL_ACCOUNT_KEY_PARAMS_KEY = 'auth_params';
const LEGACY_ALL_SESSION_TOKEN_KEY = 'jwt';
const LEGACY_WEB_ENCRYPTED_STORAGE_KEY = 'encryptedStorage';
const LEGACY_MOBILE_WRAPPED_ROOT_KEY_KEY = 'encrypted_account_keys';

export class Migration20200115 extends Migration {

  static timestamp() {
    return (new Date('2020-01-15').getTime());
  }

  /** @access protected */
  registerStageHandlers() {
    this.registerStageHandler(ApplicationStages.PreparingForLaunch_0, async () => {
      if (isEnvironmentWebOrDesktop(this.application.environment)) {
        return this.migrateStorageStructureForWebDesktop();
      } else if (isEnvironmentMobile(this.application.environment)) {
        return this.migrateStorageStructureForMobile();
      }
    });
    this.registerStageHandler(ApplicationStages.StorageDecrypted_09, async () => {
      await this.migrateArbitraryRawStorageToManagedStorageAllPlatforms();
      await this.migrateSessionStorage();
    });
    this.registerStageHandler(ApplicationStages.LoadingDatabase_11, async () => {
      await this.createDefaultItemsKeyForAllPlatforms();
      this.markDone();
    });
  }

  /**
   * Web
   * Migrates legacy storage strucutre into new managed format.
   * If encrypted storage exists, we need to first decrypt it with the passcode.
   * Then extract the account key from it. Then, encrypt storage with the
   * account key. Then encrypt the account key with the passcode and store it
   * within the new storage format.
   *
   * Generate note: We do not use the keychain if passcode is available.
   * @access private
   */
  async migrateStorageStructureForWebDesktop() {
    const deviceInterface = this.application.deviceInterface;
    const newStorageRawStructure = {
      [ValueModesKeys.Wrapped]: null,
      [ValueModesKeys.Unwrapped]: {},
      [ValueModesKeys.Nonwrapped]: {}
    };
    const rawAccountKeyParams = await deviceInterface.getJsonParsedStorageValue(
      LEGACY_ALL_ACCOUNT_KEY_PARAMS_KEY
    );
    /** Could be null if no account, or if account and storage is encrypted */
    if (rawAccountKeyParams) {
      newStorageRawStructure.nonwrapped[StorageKeys.RootKeyParams] = rawAccountKeyParams;
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
      ] = passcodeParams.getPortableValue();
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
        const { accountKey, wrappedKey } = await this.webDesktopHelperExtractAndWrapAccountKeysFromValueStore(
          passcodeKey,
          storageValueStore
        );
        keyToEncryptStorageWith = accountKey;
        newStorageRawStructure.nonwrapped[StorageKeys.WrappedRootKey] = wrappedKey;
      }
      /** Encrypt storage with proper key */
      newStorageRawStructure.wrapped = await this.webDesktopHelperEncryptStorage(
        keyToEncryptStorageWith,
        decryptedStoragePayload,
        storageValueStore
      );
    } else {
      /** 
       * No encrypted storage, take account keys out of raw storage 
       * and place them in the keychain. */
      const ak = await this.application.deviceInterface.getRawStorageValue('ak');
      const version = !isNullOrUndefined(ak)
        ? ProtocolVersions.V003
        : ProtocolVersions.V002;
      const accountKey = await SNRootKey.Create({
        content: {
          masterKey: await this.application.deviceInterface.getRawStorageValue('mk'),
          serverPassword: await this.application.deviceInterface.getRawStorageValue('pw'),
          dataAuthenticationKey: ak,
          version: version
        }
      });
      await this.application.deviceInterface.setKeychainValue(
        accountKey.getPersistableValue()
      );
    }

    /** Persist storage under new key and structure */
    await this.allPlatformHelperSetStorageStructure(newStorageRawStructure);
  }

  /**
   * Helper
   * All platforms
   */
  async allPlatformHelperSetStorageStructure(rawStructure) {
    const newStructure = SNStorageService.defaultValuesObject(
      rawStructure
    );
    newStructure[ValueModesKeys.Unwrapped] = null;
    await this.application.deviceInterface.setRawStorageValue(
      namespacedKey(this.application.namespace, StorageKeys.StorageObject),
      JSON.stringify(newStructure)
    );
  }

  /**
   * Helper
   * Web/desktop only
   */
  async webDesktopHelperGetPasscodeKeyAndDecryptEncryptedStorage(encryptedPayload) {
    const rawPasscodeParams = await this.application.deviceInterface
      .getJsonParsedStorageValue(
        LEGACY_WEB_PASSCODE_PARAMS_KEY
      );
    const passcodeParams = this.application.protocolService
      .createKeyParams(rawPasscodeParams);
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
      keyParams: passcodeParams
    };
  }

  /**
   * Helper
   * Web/desktop only
   */
  async webDesktopHelperExtractAndWrapAccountKeysFromValueStore(passcodeKey, storageValueStore) {
    const version = storageValueStore.ak
      ? ProtocolVersions.V003
      : ProtocolVersions.V002;
    const accountKey = await SNRootKey.Create({
      content: {
        masterKey: storageValueStore.mk,
        serverPassword: storageValueStore.pw,
        dataAuthenticationKey: storageValueStore.ak,
        version: version
      }
    });
    delete storageValueStore.mk;
    delete storageValueStore.pw;
    delete storageValueStore.ak;

    const accountKeyPayload = CreateMaxPayloadFromAnyObject({
      object: accountKey
    });
    let encryptedAccountKey;
    if (passcodeKey) {
      /** Encrypt account key with passcode */
      encryptedAccountKey = await this.application.protocolService
        .payloadByEncryptingPayload({
          payload: accountKeyPayload,
          key: passcodeKey,
          intent: EncryptionIntents.LocalStorageEncrypted
        });
    }
    return {
      accountKey: accountKey,
      wrappedKey: encryptedAccountKey
    };
  }

  /**
   * Helper
   * Web/desktop only
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
   * Mobile
   * On mobile legacy structure is mostly similar to new structure,
   * in that the account key is encrypted with the passcode. But mobile did
   * not have encrypted storage, so we simply need to transfer all existing
   * storage values into new managed structure.
   *
   * If no account but passcode only, the only thing we stored on mobile
   * previously was keys.offline.pw and keys.offline.timing in the keychain
   * that we compared against for valid decryption.
   * In the new version, we know a passcode is correct if it can decrypt storage.
   * As part of the migration, we’ll need to request the raw passcode from user,
   * compare it against the keychain offline.pw value, and if correct,
   * migrate storage to new structure, and encrypt with passcode key.
   * 
   * If account only, take the value in the keychain, and rename the values
   * (i.e mk > masterKey).
   * @access private
   */
  async migrateStorageStructureForMobile() {
    const wrappedAccountKey = await this.application.deviceInterface.getJsonParsedStorageValue(
      LEGACY_MOBILE_WRAPPED_ROOT_KEY_KEY
    );
    const rawAccountKeyParams = await this.application.deviceInterface.getJsonParsedStorageValue(
      LEGACY_ALL_ACCOUNT_KEY_PARAMS_KEY
    );
    const rawPasscodeParams = await this.application.deviceInterface.getJsonParsedStorageValue(
      LEGACY_MOBILE_PASSCODE_PARAMS_KEY
    );
    const rawStructure = {
      nonwrapped: {
        [StorageKeys.WrappedRootKey]: wrappedAccountKey,
        [StorageKeys.RootKeyWrapperKeyParams]: rawPasscodeParams,
        [StorageKeys.RootKeyParams]: rawAccountKeyParams
      },
      unwrapped: {},
    };
    const keychainValue = await this.application.deviceInterface.getKeychainValue();
    if (rawPasscodeParams) {
      const passcodeParams = this.application.protocolService
        .createKeyParams(rawPasscodeParams);
      const getPasscodeKey = async () => {
        /** Validate current passcode by comparing against keychain offline.pw value */
        const pwHash = keychainValue.offline.pw;
        let passcodeKey = { serverPassword: null };
        while (passcodeKey.serverPassword !== pwHash) {
          const response = await this.requestChallengeResponse(Challenges.LocalPasscode);
          const passcode = response.value;
          passcodeKey = await this.application.protocolService.computeRootKey({
            password: passcode,
            keyParams: passcodeParams
          });
        }
        return passcodeKey;
      };
      const timing = keychainValue.offline.timing;
      rawStructure.unwrapped[StorageKeys.MobilePasscodeTiming] = timing;
      if (wrappedAccountKey) {
        /** 
         * Account key is encrypted with passcode. Inside, the accountKey is located inside
         * content.accountKeys. We want to unembed these values to main content, rename 
         * with proper property names, wrap again, and store in new rawStructure.
         */
        const passcodeKey = await getPasscodeKey();
        const unwrappedAccountKey = await this.application.protocolService.payloadByDecryptingPayload({
          payload: CreateMaxPayloadFromAnyObject({ object: wrappedAccountKey }),
          key: passcodeKey
        });
        const accountKeyContent = unwrappedAccountKey.content.accountKeys;
        const defaultVersion = !isNullOrUndefined(accountKeyContent.ak)
          ? ProtocolVersions.V003
          : ProtocolVersions.V002;
        const newAccountKey = CopyPayload({
          payload: unwrappedAccountKey,
          override: {
            content: {
              masterKey: accountKeyContent.mk,
              serverPassword: accountKeyContent.pw,
              dataAuthenticationKey: accountKeyContent.ak,
              version: accountKeyContent.version || defaultVersion,
              accountKeys: null
            }
          }
        });
        const newWrappedAccountKey = await this.application.protocolService.payloadByEncryptingPayload({
          payload: newAccountKey,
          key: passcodeKey,
          intent: EncryptionIntents.LocalStoragePreferEncrypted
        });
        rawStructure.nonwrapped[StorageKeys.WrappedRootKey] = newWrappedAccountKey;
        await this.application.deviceInterface.clearKeychainValue();
      } else if (!wrappedAccountKey) {
        /** Passcode only, no account */
        const passcodeKey = await getPasscodeKey();
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
        await this.application.deviceInterface.clearKeychainValue();
      }
    } else {
      /** No passcode, potentially account. Migrate keychain property keys. */
      const hasAccount = keychainValue && keychainValue.mk;
      if (hasAccount) {
        const defaultVersion = !isNullOrUndefined(keychainValue.ak)
          ? ProtocolVersions.V003
          : ProtocolVersions.V002;
        const accountKey = await SNRootKey.Create({
          content: {
            masterKey: keychainValue.mk,
            serverPassword: keychainValue.pw,
            dataAuthenticationKey: keychainValue.ak,
            version: keychainValue.version || defaultVersion
          }
        });
        await this.application.deviceInterface.setKeychainValue(
          accountKey.getPersistableValue()
        );
      }
    }

    /** Move encrypted account key into place where it is now expected */
    await this.allPlatformHelperSetStorageStructure(rawStructure);
  }

  /**
   * All platforms
   * Migrate all previously independently stored storage keys into new
   * managed approach.
   * @access private
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
        await this.application.storageService.setValue(key, newValue);
      }
    }
  }

  /**
   * All platforms
   * Migrate previously stored session string token into object
   * @access private
   */
  async migrateSessionStorage() {
    const currentToken = await this.application.storageService.getValue(
      LEGACY_ALL_SESSION_TOKEN_KEY
    );
    if(!currentToken) {
      return;
    }
    const session = new Session(currentToken);
    await this.application.storageService.setValue(StorageKeys.Session, session);
  }

  /**
   * All platforms
   * Create new default SNItemsKey from root key.
   * Otherwise, when data is loaded, we won't be able to decrypt it
   * without existence of an item key. This will mean that if this migration
   * is run on two different platforms for the same user, they will create
   * two new items keys. Which one they use to decrypt past items and encrypt
   * future items doesn't really matter.
   * @access private
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
