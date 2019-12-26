import {
  WRAPPED_ROOT_KEY,
  WRAPPED_ROOT_KEY_KEY_PARAMS
} from '@Protocol/storageKeys';

export class SNProtocolMigration004 extends SNProtocolMigration {

  async runDesktop() {
    await this.storageManager.setItem(
      WRAPPED_ROOT_KEY_KEY_PARAMS,
      await this.storageManager.getItem('auth_params')
    );
    return super.runDesktop();
  }

  async runMobile()  {
    await this.storageManager.setItem(
      WRAPPED_ROOT_KEY,
      await this.storageManager.getItem('encrypted_account_keys')
    );
    await this.storageManager.setItem(
      WRAPPED_ROOT_KEY_KEY_PARAMS,
      await this.storageManager.getItem('pc_params')
    );

    return super.runMobile();
  }

  async afterMigration() {
    const rootKeyParams = await this.storageManager.getItem(WRAPPED_ROOT_KEY_KEY_PARAMS);
    /**
     * Create a new SNItemKey from root key.
     */
     const rootKey = await this.keyManager.getRootKey();
     const itemKey = new SNItemKey({
       content: {
         itemsKey: rootKey.masterKey,
         dataAuthenticationKey: rootKey.dataAuthenticationKey,
         version: rootKeyParams.version
       }
     })

     await itemKey.initUUID();
     itemKey.setDirty(true);
     this.modelManager.addItem(itemKey);
     this.syncManager.sync();

     return super.afterMigration();
  }
}
