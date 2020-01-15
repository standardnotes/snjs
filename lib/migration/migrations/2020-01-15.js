import { Migration } from '@Lib/migration/migrations/migration';
import * as stages from '@Lib/migration/stages';
import {
  STORAGE_KEY_WRAPPED_ROOT_KEY,
  STORAGE_KEY_ROOT_KEY_WRAPPER_KEY_PARAMS
} from '@Lib/storage_keys';

export class Migration20200115 extends Migration {

  static timestamp() {
    return (new Date('2020-01-15').getTime());
  }

  static async handleStageAll({stage, application, deviceInterface}) {
    if(stage === stages.MIGRATION_STAGE_AFTER_STORAGE_SERVICE_INIT) {
      await application.storageManager.setValue(
        STORAGE_KEY_ROOT_KEY_PARAMS,
        await deviceInterface.getStorageValue('auth_params'),
        STORAGE_VALUE_MODE_DEFAULT
      );
    }
    if(stage === stages.MIGRATION_STAGE_BEFORE_LOCAL_DATA_LOAD) {
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
    if(stage === stages.MIGRATION_STAGE_AFTER_STORAGE_SERVICE_INIT) {
      await application.storageManager.setValue(
        STORAGE_KEY_ROOT_KEY_WRAPPER_KEY_PARAMS,
        await deviceInterface.getStorageValue('offlineParams'),
        STORAGE_VALUE_MODE_UNWRAPPED
      );
    }
  }

  static async handleStageMobile({stage, application, deviceInterface}) {
    if(stage === stages.MIGRATION_STAGE_BEFORE_SERVICES_INIT) {
      const encryptedStorage = await deviceInterface.getStorageValue(
        'storage_encryption'
      );
      const newStructure = SNStorageManager.defaultValuesObject({
        defaultModeSeed: encryptedStorage
      });
      await deviceInterface.setStorageValue(
        STORAGE_KEY_ENCRYPTED_STORAGE,
        newStructure
      );
    }

    if(stage === stages.MIGRATION_STAGE_AFTER_STORAGE_SERVICE_INIT) {
      await application.storageManager.setValue(
        STORAGE_KEY_WRAPPED_ROOT_KEY,
        await deviceInterface.getStorageValue('encrypted_account_keys'),
        STORAGE_VALUE_MODE_UNWRAPPED
      );
      await application.storageManager.setValue(
        STORAGE_KEY_ROOT_KEY_WRAPPER_KEY_PARAMS,
        await deviceInterface.getStorageValue('pc_params'),
        STORAGE_VALUE_MODE_UNWRAPPED
      );
    }
  }
}
