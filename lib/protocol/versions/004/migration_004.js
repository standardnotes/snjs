import {
  WRAPPED_ROOT_KEY,
  WRAPPED_ROOT_KEY_PARAMS
} from '@Protocol/storageKeys';

export class SNProtocolMigration004 extends SNProtocolMigration {

  async runDesktop() {
    await this.storageManager.setItem(
      ROOT_KEY_PARAMS,
      await this.storageManager.getItem('auth_params')
    );

    await this.storageManager.setItem(
      WRAPPED_ROOT_KEY_PARAMS,
      await this.storageManager.getItem('offlineParams')
    );

    return super.runDesktop();
  }

  async runMobile()  {
    await this.storageManager.setItem(
      WRAPPED_ROOT_KEY,
      await this.storageManager.getItem('encrypted_account_keys')
    );
    await this.storageManager.setItem(
      WRAPPED_ROOT_KEY_PARAMS,
      await this.storageManager.getItem('pc_params')
    );

    await this.storageManager.setItem(
      ENCRYPTED_STORAGE_KEY,
      await this.storageManager.getItem('storage_encryption')
    );

    return super.runMobile();
  }

  async afterMigration() {
    const rootKeyParams = await this.storageManager.getItem(WRAPPED_ROOT_KEY_PARAMS);
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
     itemsKey.setDirty(true);
     this.modelManager.addItem(itemsKey);
     this.syncManager.sync();

     return super.afterMigration();
  }
}
