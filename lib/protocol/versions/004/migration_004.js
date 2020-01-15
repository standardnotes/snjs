import {
  WRAPPED_ROOT_KEY,
  ROOT_KEY_WRAPPER_KEY_PARAMS
} from '@Lib/storage_keys';

export class SNProtocolMigration004 extends SNProtocolMigration {

  async runDesktop() {
    await this.storageManager.setValue(
      ROOT_KEY_PARAMS,
      localStorage.getItem('auth_params')
    );

    await this.storageManager.setValue(
      ROOT_KEY_WRAPPER_KEY_PARAMS,
      localStorage.getItem('offlineParams'),
      STORAGE_VALUE_MODE_UNWRAPPED
    );

    return super.runDesktop();
  }

  async runMobile()  {
    await this.storageManager.setValue(
      WRAPPED_ROOT_KEY,
      await this.storageManager.getValue('encrypted_account_keys')
    );
    await this.storageManager.setValue(
      ROOT_KEY_WRAPPER_KEY_PARAMS,
      await this.storageManager.getValue('pc_params'),
      STORAGE_VALUE_MODE_UNWRAPPED
    );

    await this.storageManager.setValue(
      STORAGE_KEY_ENCRYPTED_STORAGE,
      await this.storageManager.getValue('storage_encryption')
    );

    return super.runMobile();
  }

  async afterMigration() {
    const rootKeyParams = await this.storageManager.getValue(
      ROOT_KEY_WRAPPER_KEY_PARAMS,
      STORAGE_VALUE_MODE_UNWRAPPED
    );
    /**
     * Create a new SNItemsKey from root key.
     */
     const rootKey = await this.keyManager.getRootKey();
     const itemsKey = new SNItemsKey({
       content: {
         itemsKey: rootKey.masterKey,
         dataAuthenticationKey: rootKey.dataAuthenticationKey,
         version: rootKeyParams.version
       }
     })

     await itemsKey.initUUID();
     await this.modelManager.setItemDirty(itemsKey);
     this.modelManager.addItem(itemsKey);
     this.syncManager.sync();

     return super.afterMigration();
  }
}
