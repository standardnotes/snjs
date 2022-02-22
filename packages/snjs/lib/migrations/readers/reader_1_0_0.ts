import { isNullOrUndefined } from '@standardnotes/utils';
import { isEnvironmentMobile } from '@Lib/platforms';
import { PreviousSnjsVersion1_0_0 } from './../../version';
import { LegacyKeys1_0_0 } from './../../storage_keys';
import { StorageReader } from './reader';

export class StorageReader1_0_0 extends StorageReader {
  static version() {
    return PreviousSnjsVersion1_0_0;
  }

  public async getAccountKeyParams() {
    return this.deviceInterface.getJsonParsedRawStorageValue(
      LegacyKeys1_0_0.AllAccountKeyParamsKey
    );
  }

  /**
   * In 1.0.0, web uses raw storage for unwrapped account key, and mobile uses
   * the keychain
   */
  public async hasNonWrappedAccountKeys() {
    if (isEnvironmentMobile(this.environment)) {
      const value = await this.deviceInterface.getRawKeychainValue();
      return !isNullOrUndefined(value);
    } else {
      const value = await this.deviceInterface.getRawStorageValue('mk');
      return !isNullOrUndefined(value);
    }
  }

  public async hasPasscode() {
    if (isEnvironmentMobile(this.environment)) {
      const rawPasscodeParams = await this.deviceInterface.getJsonParsedRawStorageValue(
        LegacyKeys1_0_0.MobilePasscodeParamsKey
      );
      return !isNullOrUndefined(rawPasscodeParams);
    } else {
      const encryptedStorage = await this.deviceInterface.getJsonParsedRawStorageValue(
        LegacyKeys1_0_0.WebEncryptedStorageKey
      );
      return !isNullOrUndefined(encryptedStorage);
    }
  }

  /** Keychain was not used on desktop/web in 1.0.0 */
  public usesKeychain() {
    return isEnvironmentMobile(this.environment) ? true : false;
  }
}
