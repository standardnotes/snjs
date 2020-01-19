import { Migration } from '@Lib/migration/migrations/migration';
import { SNRootKey } from '@Models/keys/root_key';
import * as stages from '@Lib/stages';
import { isPlatformWebOrDesktop } from '@Lib/platforms';
import { CopyPayload } from '@Payloads/generator';
import { Copy } from '@Lib/utils';
import { 
  ENCRYPTION_INTENT_LOCAL_STORAGE_ENCRYPTED,
  ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED
} from '@Protocol/intents';
import {
  STORAGE_KEY_ROOT_KEY_PARAMS,
  STORAGE_KEY_WRAPPED_ROOT_KEY,
  STORAGE_KEY_ROOT_KEY_WRAPPER_KEY_PARAMS,
  STORAGE_KEY_STORAGE_OBJECT,
  STORAGE_KEY_USER,
  STORAGE_KEY_BIOMETRIC_PREFS,
  namespacedKey
} from '@Lib/storage_keys';
import {
  STORAGE_VALUE_MODE_DEFAULT,
  STORAGE_VALUE_MODE_NONWRAPPED,
  STORAGE_VALUES_KEY_UNWRAPPED
} from '@Services/storage_manager';
import {
  PROTOCOL_VERSION_002,
  PROTOCOL_VERSION_003,
  PROTOCOL_VERSION_004
} from '@Protocol/versions';
import {
  CONTENT_TYPE_ROOT_KEY,
  CONTENT_TYPE_ENCRYPTED_STORAGE
} from '@Models/content_types';

const LEGACY_WEB_PASSCODE_PARAMS_KEY    = 'offlineParams';
const LEGACY_MOBILE_PASSCODE_PARAMS_KEY = 'pc_params';
const LEGACY_ALL_ACCOUNT_KEY_PARAMS_KEY = 'auth_params';
const LEGACY_WEB_ENCRYPTED_STORAGE_KEY  = 'encryptedStorage';

export class Migration20200115 extends Migration {

  static timestamp() {
    return (new Date('2020-01-15').getTime());
  }

  async handleStageAll(stage) {
    if(stage === stages.APPLICATION_STAGE_AFTER_STORAGE_READY) {
      const storageManager = this.application.storageManager;
      /**
       * Migrate all previously independently stored storage keys into new
       * managed approach. These keys are ones that do not need to be renamed.
       */
       const keysToMigrate = [
         {
           key: STORAGE_KEY_USER,
           mode: STORAGE_VALUE_MODE_DEFAULT,
           platform: 'cross-platform',
         },
         {
           key: 'storage_encryption',
           mode: STORAGE_VALUE_MODE_DEFAULT,
           platform: 'mobile',
         },
         {
           key: 'first_run',
           mode: STORAGE_VALUE_MODE_DEFAULT,
           platform: 'mobile',
         },
         {
           key: STORAGE_KEY_BIOMETRIC_PREFS,
           mode: STORAGE_VALUE_MODE_DEFAULT,
           platform: 'mobile',
         }
       ]

       for(const keyObj of keysToMigrate) {
         const value = await this.application.deviceInterface
          .getJsonParsedStorageValue(keyObj.key);
         if(!isNullOrUndefined(value)) {
           await storageManager.setValue(
             keyObj.newKey|| keyObj.key,
             value,
             keyObj.mode
           );
         }
       }
      await storageManager.repersistToDisk();
    }

    if(stage === stages.APPLICATION_STAGE_BEFORE_LOCAL_DATA_LOAD) {
      /**
       * Create new default SNItemsKey from root key.
       * Otherwise, when data is loaded, we won't be able to decrypt it
       * without existence of an item key. This will mean that if this migration
       * is run on two different platforms for the same user, they will create
       * two new items keys. Which one they use to decrypt past items and encrypt
       * future items doesn't really matter.
       */
       const rootKey = await this.application.keyManager.getRootKey();
       if(rootKey) {
         const rootKeyParams = await this.application.keyManager.getRootKeyParams();
         const itemsKey = SNItemsKey.FromRaw({
           mk: rootKey.masterKey,
           ak: rootKey.dataAuthenticationKey,
           version: rootKeyParams.version
         });
         await itemsKey.initUUID();
         await this.application.modelManager.mapItem({item: itemsKey});
         await this.application.modelManager.setItemDirty(itemsKey);
       }
    }
  }

  async handleStageDesktopWeb(stage) {
    /**
     * We don't need to migrate 'encrypted_account_keys' as we do on mobile,
     * since on web, these keys are stored together in normal encrypted storage,
     * which is already migrated above.
     */
     if(stage === stages.APPLICATION_STAGE_BEFORE_SERVICES_INIT) {
       /**
         Upon migrating web, if encrypted storage exists, we need to first
         decrypt it with the passcode. Then extract the account key from there.
         Then encrypt storage with the account key. Then encrypt the account
         key with the passcode and store in raw storage.
       */
       /**
        * Migrate encrypted storage. Mobile did not have encrypted storage concept.
        */
       const encryptedStorage = await this.application.deviceInterface
       .getJsonParsedStorageValue(
         LEGACY_WEB_ENCRYPTED_STORAGE_KEY
       );
       if(encryptedStorage) {
         const encryptedStoragePayload = CreateMaxPayloadFromAnyObject({
           object: encryptedStorage
         });
         const rawPasscodeParams = await this.application.deviceInterface
         .getJsonParsedStorageValue(
           LEGACY_WEB_PASSCODE_PARAMS_KEY
         );
         const passcodeParams = this.application.protocolService
         .createVersionedKeyParams(rawPasscodeParams);
         /** Decrypt it with the passcode */
         let needsDecrypting = true;
         let decryptedStoragePayload, passcodeKey;
         while(needsDecrypting) {
           const response = await this.requestChallengeResponse(CHALLENGE_LOCAL_PASSCODE);
           const passcode = response.value;
           passcodeKey = await this.application.protocolService.computeRootKey({
             password: passcode,
             keyParams: passcodeParams
           });
          decryptedStoragePayload = await this.application.protocolService
           .payloadByDecryptingPayload({
             payload: encryptedStoragePayload,
             key: passcodeKey
           });
           needsDecrypting = decryptedStoragePayload.errorDecrypting;
         }

         const storageValueStore = Copy(decryptedStoragePayload.content.storage);
         storageValueStore[STORAGE_KEY_ROOT_KEY_PARAMS] = storageValueStore[
           LEGACY_ALL_ACCOUNT_KEY_PARAMS_KEY
         ];

         /** Extract account key (mk, pw, ak) */
         const version = storageValueStore.ak
          ? PROTOCOL_VERSION_003
          : PROTOCOL_VERSION_002;
         const accountKey = SNRootKey.FromRaw({
           mk: storageValueStore.mk,
           pw: storageValueStore.pw,
           ak: storageValueStore.ak,
           version: version
         });
         delete storageValueStore.mk;
         delete storageValueStore.pw;
         delete storageValueStore.ak;

         /** Encrypt storage with account key */
         const newEncryptedStoragePayload = await this.application.protocolService.
         payloadByEncryptingPayload({
           key: accountKey,
           intent: ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED,
           payload: CopyPayload({
             payload: decryptedStoragePayload,
             override: {
               content_type: CONTENT_TYPE_ENCRYPTED_STORAGE,
               content: storageValueStore,
             }
           })
         });
         /** Encrypt account key with passcode */
         const encryptedAccountKey = await this.application.protocolService
         .payloadByEncryptingPayload({
           payload: accountKey.payloadRepresentation(),
           key: passcodeKey,
           intent: ENCRYPTION_INTENT_LOCAL_STORAGE_ENCRYPTED
         })
         /** Persist storage under new key and structure */
         const newStructure = SNStorageManager.defaultValuesObject({
           wrapped: newEncryptedStoragePayload,
           nonwrapped: {
             [STORAGE_KEY_WRAPPED_ROOT_KEY]: encryptedAccountKey,
             [STORAGE_KEY_ROOT_KEY_WRAPPER_KEY_PARAMS]: rawPasscodeParams
           }
         });
         await this.application.deviceInterface.setRawStorageValue(
           namespacedKey(this.application.namespace, STORAGE_KEY_STORAGE_OBJECT),
           JSON.stringify(newStructure)
         );
       }
     }
  }

  async handleStageMobile(stage) {
    const wrappedRootKey = await this.application.deviceInterface.getJsonParsedStorageValue(
      'encrypted_account_keys'
    );
    const wrapperKeyParams = await this.application.deviceInterface.getJsonParsedStorageValue(
      LEGACY_MOBILE_PASSCODE_PARAMS_KEY
    )
    const accountKeyParams = await this.application.deviceInterface.getJsonParsedStorageValue(
      LEGACY_ALL_ACCOUNT_KEY_PARAMS_KEY
    )
    if(stage === stages.APPLICATION_STAGE_BEFORE_SERVICES_INIT) {
      /** Move encrypted account key into place where it is now expected */
       const newStructure = SNStorageManager.defaultValuesObject({
         nonwrapped: {
           [STORAGE_KEY_WRAPPED_ROOT_KEY]: wrappedRootKey,
           [STORAGE_KEY_ROOT_KEY_WRAPPER_KEY_PARAMS]: wrapperKeyParams
         },
         unwrapped: {
           [STORAGE_KEY_ROOT_KEY_PARAMS]: accountKeyParams
         }
       });
       await this.application.deviceInterface.setRawStorageValue(
         namespacedKey(this.application.namespace, STORAGE_KEY_STORAGE_OBJECT),
         JSON.stringify(newStructure)
       );
    }

    if(stage === stages.APPLICATION_STAGE_AFTER_APP_UNLOCKED) {
      /**
       * Wrapped root key had keys embedded in content.accountKeys.
       * We want to unembed.
       */
      const rootKey = await this.application.keyManager.getRootKey();
      if(rootKey) {
        const accountKeys = rootKey.content.accountKeys;
        const version = accountKeys.ak
         ? PROTOCOL_VERSION_003
         : PROTOCOL_VERSION_002;
        const rawKey = Object.assign(
          {version: version},
          accountKeys
        );
        const newRootKey = SNRootKey.FromRaw(rawKey);
        this.application.keyManager.rootKey = newRootKey;
      }
    }
  }
}
