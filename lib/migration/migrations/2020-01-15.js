import { Migration } from '@Lib/migration/migrations/migration';
import { SNRootKey } from '@Protocol/versions/root_key';
import * as stages from '@Lib/stages';
import { isPlatformWebOrDesktop } from '@Lib/platforms';
import { CopyPayload } from '@Payloads/generator';
import { Copy } from '@Lib/utils';
import { PROTOCOL_VERSION_002, PROTOCOL_VERSION_003 } from '@Protocol/versions';
import { CONTENT_TYPE_ENCRYPTED_STORAGE } from '@Models/content_types';
import {
  ENCRYPTION_INTENT_LOCAL_STORAGE_ENCRYPTED,
  ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED
} from '@Protocol/intents';
import {
  STORAGE_KEY_ROOT_KEY_PARAMS,
  STORAGE_KEY_WRAPPED_ROOT_KEY,
  STORAGE_KEY_ROOT_KEY_WRAPPER_KEY_PARAMS,
  STORAGE_KEY_STORAGE_OBJECT,
  STORAGE_KEY_MOBILE_PASSCODE_TIMING,
  namespacedKey
} from '@Lib/storage_keys';

const LEGACY_WEB_PASSCODE_PARAMS_KEY     = 'offlineParams';
const LEGACY_MOBILE_PASSCODE_PARAMS_KEY  = 'pc_params';
const LEGACY_ALL_ACCOUNT_KEY_PARAMS_KEY  = 'auth_params';
const LEGACY_WEB_ENCRYPTED_STORAGE_KEY   = 'encryptedStorage';
const LEGACY_MOBILE_WRAPPED_ROOT_KEY_KEY = 'encrypted_account_keys';

export class Migration20200115 extends Migration {

  static timestamp() {
    return (new Date('2020-01-15').getTime());
  }

  /** @protected */
  registerStageHandlers() {
    this.registerStageHandler(stages.APPLICATION_STAGE_0_PREPARING_FOR_LAUNCH, async () => {
      if(isPlatformWebOrDesktop(this.application.platform)) {
        return this.migrateStorageStructureForWebDesktop();
      } else if(isPlatformMobile(this.application.platform)) {
        return this.migrateStorageStructureForMobile();
      }
    })
    this.registerStageHandler(stages.APPLICATION_STAGE_09_STORAGE_DECRYPTED, async () => {
      await this.migrateArbitraryRawStorageToManagedStorageAllPlatforms();
      if(isPlatformMobile(this.application.platform)) {
        this.unembedAccountKeysForMobile()
      }
    });
    this.registerStageHandler(stages.APPLICATION_STAGE_11_LOADING_DATABASE, async () => {
      return this.createDefaultItemsKeyForAllPlatforms();
    })
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
     if(accountKeyParams) {
       newStorageRawStructure.nonwrapped[
         STORAGE_KEY_ROOT_KEY_PARAMS] = accountKeyParams;
     }
     const encryptedStorage = await deviceInterface.getJsonParsedStorageValue(
       LEGACY_WEB_ENCRYPTED_STORAGE_KEY
     );
     if(encryptedStorage) {
       const encryptedStoragePayload = CreateMaxPayloadFromAnyObject({
         object: encryptedStorage
       });
       const passcodeResult = await this.webDesktopHelper_getPasscodeKeyAndDecryptEncryptedStorage(
         encryptedStoragePayload
       );
       const passcodeKey = passcodeResult.key;
       const decryptedStoragePayload = passcodeResult.decryptedStoragePayload;
       const passcodeParams = passcodeResult.keyParams;
       newStorageRawStructure.nonwrapped[
         STORAGE_KEY_ROOT_KEY_WRAPPER_KEY_PARAMS
       ] = passcodeParams;
       const storageValueStore = Copy(decryptedStoragePayload.content.storage);
       /** Store previously encrypted auth_params into new nonwrapped key */
       newStorageRawStructure.nonwrapped[
         STORAGE_KEY_ROOT_KEY_PARAMS
       ] = storageValueStore[
         LEGACY_ALL_ACCOUNT_KEY_PARAMS_KEY
       ];

       let keyToEncryptStorageWith = passcodeKey;
       /** Extract account key (mk, pw, ak) if it exists */
       const hasAccountKeys = !isNullOrUndefined(storageValueStore.mk);
       if(hasAccountKeys) {
         const accountResult = await this.webDesktopHelper_extractAndWrapAccountKeysFromValueStore(
           passcodeKey,
           storageValueStore
         )
         keyToEncryptStorageWith = accountResult.unwrappedKey;
         newStorageRawStructure.nonwrapped[
           STORAGE_KEY_WRAPPED_ROOT_KEY
         ] = accountResult.wrappedKey;
       }
       /** Encrypt storage with proper key */
       newStorageRawStructure.wrapped = await this.webDesktopHelper_encryptStorage(
         keyToEncryptStorageWith,
         decryptedStoragePayload,
         storageValueStore
       );
     }

     /** Persist storage under new key and structure */
     await this.allPlatformHelper_setStorageStructure(newStorageRawStructure);
  }
  /**
   * @helper
   * @allplatform
   */
  async allPlatformHelper_setStorageStructure(rawStructure) {
    const newStructure = SNStorageManager.defaultValuesObject(
      rawStructure
    );
    await this.application.deviceInterface.setRawStorageValue(
      namespacedKey(this.application.namespace, STORAGE_KEY_STORAGE_OBJECT),
      JSON.stringify(newStructure)
    );
  }
  /**
   * @helper
   * @webdesktop
   */
  async webDesktopHelper_getPasscodeKeyAndDecryptEncryptedStorage(encryptedPayload) {
    const rawPasscodeParams = await this.application.deviceInterface
    .getJsonParsedStorageValue(
      LEGACY_WEB_PASSCODE_PARAMS_KEY
    );
    const passcodeParams = this.application.protocolService
    .createVersionedRootKeyParams(rawPasscodeParams);
    /** Decrypt it with the passcode */
    let decryptedStoragePayload = {errorDecrypting: true};
    let passcodeKey;
    while(decryptedStoragePayload.errorDecrypting) {
      const response = await this.requestChallengeResponse(CHALLENGE_LOCAL_PASSCODE);
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
  async webDesktopHelper_extractAndWrapAccountKeysFromValueStore(passcodeKey, storageValueStore) {
    const version = storageValueStore.ak
    ? PROTOCOL_VERSION_003
    : PROTOCOL_VERSION_002;
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
        intent: ENCRYPTION_INTENT_LOCAL_STORAGE_ENCRYPTED
      })
    return {
      unwrappedKey: accountKey,
      wrappedKey: encryptedAccountKey
    }
  }
  /**
   * @helper
   * @webdesktop
   * Encrypt storage with account key
   */
  async webDesktopHelper_encryptStorage(
    key,
    decryptedStoragePayload,
    storageValueStore
  ) {
    const wrapped = await this.application.protocolService.
    payloadByEncryptingPayload({
      key: key,
      intent: ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED,
      payload: CopyPayload({
        payload: decryptedStoragePayload,
        override: {
          content_type: CONTENT_TYPE_ENCRYPTED_STORAGE,
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
    )
    const rawPasscodeParams = await this.application.deviceInterface.getJsonParsedStorageValue(
      LEGACY_MOBILE_PASSCODE_PARAMS_KEY
    )
    const rawStructure = {
      nonwrapped: {
        [STORAGE_KEY_WRAPPED_ROOT_KEY]: wrappedAccountKey,
        [STORAGE_KEY_ROOT_KEY_WRAPPER_KEY_PARAMS]: rawPasscodeParams,
        [STORAGE_KEY_ROOT_KEY_PARAMS]: accountKeyParams
      },
      unwrapped: {},
    }
    if(rawPasscodeParams) {
      const passcodeParams = this.application.protocolService
      .createVersionedRootKeyParams(rawPasscodeParams);

      /** Move passcode timing into unwrapped storage */
      if(passcodeParams) {
        const keychainValue = await this.application.deviceInterface.getRawKeychainValue();
        const timing = keychainValue.offline.timing;
        rawStructure.unwrapped[STORAGE_KEY_MOBILE_PASSCODE_TIMING] = timing;
      }

      /** Passcode only, no account */
      if(!wrappedAccountKey) {
        /** Validate current passcode by comparing against keychain offline.pw value */
        const keychainValue = await this.application.deviceInterface.getRawKeychainValue();
        const savedPw = keychainValue.offline.pw;
        let passcodeKey = {serverPassword: null};
        while(passcodeKey.serverPassword !== savedPw) {
          const response = await this.requestChallengeResponse(CHALLENGE_LOCAL_PASSCODE);
          const passcode = response.value;
          passcodeKey = await this.application.protocolService.computeRootKey({
            password: passcode,
            keyParams: passcodeParams
          });
        }
        const payload = CreateMaxPayloadFromAnyObject({
          object: {
            uuid: await SFItem.GenerateUuid(),
            content: rawStructure.unwrapped,
            content_type: CONTENT_TYPE_ENCRYPTED_STORAGE
          }
        })
        /** Encrypt new storage.unwrapped structure with passcode */
        const wrapped = await this.application.protocolService.payloadByEncryptingPayload({
          payload: payload,
          key: passcodeKey,
          intent: ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED
        });
        rawStructure.wrapped = wrapped;
      }
    }

    /** Move encrypted account key into place where it is now expected */
    await this.allPlatformHelper_setStorageStructure(rawStructure);
  }

  /**
   * @private
   * @mobile
   * Wrapped root key had keys embedded in content.accountKeys.
   * We want to unembed.
   */
  async unembedAccountKeysForMobile() {
    const rootKey = await this.application.keyManager.getRootKey();
    if(rootKey) {
      const accountKeys = rootKey.content.accountKeys;
      if(accountKeys) {
        const version = accountKeys.ak
        ? PROTOCOL_VERSION_003
        : PROTOCOL_VERSION_002;
        const rawKey = Object.assign(
          {version: version},
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
      namespacedKey(this.application.namespace, STORAGE_KEY_STORAGE_OBJECT),
      LEGACY_WEB_ENCRYPTED_STORAGE_KEY,
      LEGACY_WEB_PASSCODE_PARAMS_KEY,
      LEGACY_MOBILE_PASSCODE_PARAMS_KEY
    ]
    const tryJsonParse = (value) => {
      try { return JSON.parse(value); }
      catch (e) { return value; }
    }
    for(const keyValuePair of allKeyValues) {
      const key = keyValuePair.key;
      const value = keyValuePair.value;
      if(keysToExclude.includes(key)) {
        continue;
      }
      if(!isNullOrUndefined(value)) {
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
    if(rootKey) {
     const rootKeyParams = await this.application.keyManager.getRootKeyParams();
     const itemsKey = SNItemsKey.FromRaw({
       itemsKey: rootKey.masterKey,
       dataAuthenticationKey: rootKey.dataAuthenticationKey,
       version: rootKeyParams.version
     });
     await itemsKey.initUUID();
     await this.application.modelManager.mapItem({item: itemsKey});
     await this.application.modelManager.setItemDirty(itemsKey);
    }
  }
}
