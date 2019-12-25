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
  }

}
