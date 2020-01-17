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
  STORAGE_VALUE_MODE_UNWRAPPED
} from '@Services/storage_manager';
import { isPlatformWebOrDesktop } from '@Lib/platforms';
import { SNRootKey } from '@Models/keys/root_key';

export class Migration20200115 extends Migration {

  static timestamp() {
    return (new Date('2020-01-15').getTime());
  }

  static async handleStageAll({stage, application, deviceInterface}) {
    if(stage === stages.APPLICATION_STAGE_AFTER_STORAGE_SERVICE_INIT) {
      /**
       * Rename account key params
       */
      const keyParams = await deviceInterface.getJsonParsedStorageValue(
        'auth_params'
      );
      if(keyParams) {
        await application.storageManager.setValue(
          STORAGE_KEY_ROOT_KEY_PARAMS,
          keyParams,
          STORAGE_VALUE_MODE_DEFAULT
        );
      }

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
          STORAGE_VALUE_MODE_UNWRAPPED
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
       const rootKey = await this.keyManager.getRootKey();
       const itemsKey = SNItemsKey.FromRaw({
         itemsKey: rootKey.masterKey,
         dataAuthenticationKey: rootKey.dataAuthenticationKey,
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
           defaultModeSeed: encryptedStorage
         });
         await deviceInterface.setRawStorageValue(
           namespacedKey(application.namespace, STORAGE_KEY_ENCRYPTED_STORAGE),
           JSON.stringify(newStructure)
         );
       }
     }

     if(stage === stages.APPLICATION_STAGE_AFTER_APP_UNLOCKED) {
       /**
        * Encrypted storage had values embedded in content.storage
        * We want to unembed.
        */
        const storageManager = application.storageManager;
        const defaultModeValue = storageManager.values[
          storageManager.domainKeyForMode(STORAGE_VALUE_MODE_DEFAULT)
        ];
        if(defaultModeValue && defaultModeValue.storage) {
          storageManager.values[
            storageManager.domainKeyForMode(STORAGE_VALUE_MODE_DEFAULT)
          ] = defaultModeValue.storage;
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
           STORAGE_VALUE_MODE_UNWRAPPED
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
