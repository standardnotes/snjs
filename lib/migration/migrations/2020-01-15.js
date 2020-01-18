import { Migration } from '@Lib/migration/migrations/migration';
import * as stages from '@Lib/stages';
import {
  STORAGE_KEY_ROOT_KEY_PARAMS,
  STORAGE_KEY_WRAPPED_ROOT_KEY,
  STORAGE_KEY_ROOT_KEY_WRAPPER_KEY_PARAMS,
  STORAGE_KEY_ENCRYPTED_STORAGE,
  namespacedKey
} from '@Lib/storage_keys';
import {
  STORAGE_VALUE_MODE_DEFAULT,
  STORAGE_VALUE_MODE_NONWRAPPED,
  STORAGE_VALUES_KEY_UNWRAPPED
} from '@Services/storage_manager';
import { isPlatformWebOrDesktop } from '@Lib/platforms';
import { SNRootKey } from '@Models/keys/root_key';
import {
  PROTOCOL_VERSION_002,
  PROTOCOL_VERSION_003,
  PROTOCOL_VERSION_004
} from '@Protocol/versions';

export class Migration20200115 extends Migration {

  static timestamp() {
    return (new Date('2020-01-15').getTime());
  }

  static async handleStageAll({stage, application, deviceInterface}) {
    if(stage === stages.APPLICATION_STAGE_AFTER_STORAGE_SERVICE_INIT) {
      /**
       * Rename key wrapper key params
       */

      const legacyKeyWrapperKey = isPlatformWebOrDesktop(application.platform)
        ? 'offlineParams'
        : 'pc_params';

      const keyWrapperParams = await deviceInterface.getJsonParsedStorageValue(
        legacyKeyWrapperKey
      );
      if(keyWrapperParams) {
        await application.storageManager.setValue(
          STORAGE_KEY_ROOT_KEY_WRAPPER_KEY_PARAMS,
          keyWrapperParams,
          STORAGE_VALUE_MODE_NONWRAPPED
        );
      }
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
       const rootKeyParams = await application.keyManager.getRootKeyParams();
       const rootKey = await application.keyManager.getRootKey();
       const itemsKey = SNItemsKey.FromRaw({
         mk: rootKey.masterKey,
         ak: rootKey.dataAuthenticationKey,
         version: rootKeyParams.version
       });
       await itemsKey.initUUID();
       await application.modelManager.mapItem({item: itemsKey});
       await application.modelManager.setItemDirty(itemsKey);
    }
  }

  static async handleStageDesktopWeb({stage, application, deviceInterface}) {
    /**
     * We don't need to migrate 'encrypted_account_keys' as we do on mobile,
     * since on web, these keys are stored together in normal encrypted storage,
     * which is already migrated above.
     */

     if(stage === stages.APPLICATION_STAGE_BEFORE_SERVICES_INIT) {
       /**
        * Migrate encrypted storage. Mobile did not have encrypted storage concept.
        */
       const legacyStorageKey = 'encryptedStorage';
       const encryptedStorage = await deviceInterface.getJsonParsedStorageValue(
         legacyStorageKey
       );
       if(encryptedStorage) {
         const newStructure = SNStorageManager.defaultValuesObject({
           wrapped: encryptedStorage
         });
         await deviceInterface.setRawStorageValue(
           namespacedKey(application.namespace, STORAGE_KEY_ENCRYPTED_STORAGE),
           JSON.stringify(newStructure)
         );
       }
     }

     if(stage === stages.APPLICATION_STAGE_AFTER_STORAGE_DECRYPTED) {
       /**
        * Encrypted storage had values embedded in content.storage
        * We want to unembed.
        */
        const storageManager = application.storageManager;
        const valueStore = storageManager.values[STORAGE_VALUES_KEY_UNWRAPPED];
        if(valueStore && valueStore.storage) {
          storageManager.values[STORAGE_VALUES_KEY_UNWRAPPED] = valueStore.storage;
        }

        const migratedValueStore = storageManager.values[STORAGE_VALUES_KEY_UNWRAPPED];

        /**
         * Move mk, pw, ak from newly decrypted storage, and create new
         * rootKey, and set it on key manager
         */
         if(migratedValueStore.mk) {
           /**
           * Rename account key params
           */
           const legacyKeyParamsKey = 'auth_params';
           const keyParams = migratedValueStore[legacyKeyParamsKey];
           if(keyParams) {
             migratedValueStore[STORAGE_KEY_ROOT_KEY_PARAMS] = keyParams;
           }
           const version = migratedValueStore.ak
            ? PROTOCOL_VERSION_003
            : PROTOCOL_VERSION_002;
           const rootKey = SNRootKey.FromRaw({
             mk: migratedValueStore.mk,
             pw: migratedValueStore.pw,
             ak: migratedValueStore.ak,
             version: version
           });
           await application.keyManager.setRootKey({
             key: rootKey,
             keyParams: keyParams
           })
           delete migratedValueStore[legacyKeyParamsKey];
           delete migratedValueStore.mk;
           delete migratedValueStore.pw;
           delete migratedValueStore.ak;
           await storageManager.repersistToDisk();
         }

     }
  }

  static async handleStageMobile({stage, application, deviceInterface}) {
    if(stage === stages.APPLICATION_STAGE_AFTER_STORAGE_SERVICE_INIT) {
      /**
       * Migrate wrapped root key
       */
       const wrappedRootKey = await deviceInterface.getJsonParsedStorageValue(
         'encrypted_account_keys'
       );
       if(wrappedRootKey) {
         await application.storageManager.setValue(
           STORAGE_KEY_WRAPPED_ROOT_KEY,
           wrappedRootKey,
           STORAGE_VALUE_MODE_NONWRAPPED
         );
       }
    }
    if(stage === stages.APPLICATION_STAGE_AFTER_APP_UNLOCKED) {
      /**
       * Wrapped root key had keys embedded in content.accountKeys.
       * We want to unembed.
       */
      const rootKey = await application.keyManager.getRootKey();
      if(rootKey) {
        const newRootKey = SNRootKey.FromRaw(rootKey.accountKeys);
        application.keyManager.rootKey = newRootKey;
      }
    }
  }

}
