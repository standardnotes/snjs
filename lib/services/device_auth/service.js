import { STORAGE_KEY_BIOMETRIC_PREFS } from '@Lib/storageKeys';
import { isNullOrUndefined } from '@Lib/utils';

export const DEVICE_AUTH_SOURCE_LOCAL_PASSCODE   = 1;
export const DEVICE_AUTH_SOURCE_ACCOUNT_PASSWORD = 2;
export const DEVICE_AUTH_SOURCE_BIOMETRIC        = 3;

export class DeviceAuthService {

  constructor({storageManager, keyManager, protocolManager}) {
    this.storageManager = storageManager;
    this.keyManager = keyManager;
    this.protocolManager = protocolManager;
  }

  /**
   * @public
   */

  async hasPasscodeEnabled() {
    const wrapperKeyParams = await this.keyManager.getRootKeyWrapperKeyParams();
    return !isNullOrUndefined(wrapperKeyParams);
  }

  async getRequiredLaunchSources() {
    const sources = [];

    const hasPasscode = await this.hasPasscodeEnabled();
    if(hasPasscode) {
      sources.push(DEVICE_AUTH_SOURCE_LOCAL_PASSCODE);
    }

    const biometricPrefs = await this.storageManager.getValue(
      STORAGE_KEY_BIOMETRIC_PREFS
    );
    const biometricEnabled = biometricPrefs && biometricPrefs.enabled;
    if(biometricEnabled) {
      sources.push(DEVICE_AUTH_SOURCE_BIOMETRIC)
    }

    return sources;
  }

  async handleResponse(response) {
    if(response.source === DEVICE_AUTH_SOURCE_LOCAL_PASSCODE) {
      return this.unlockDevicePasscode(response.value);
    }

    if(response.source === DEVICE_AUTH_SOURCE_ACCOUNT_PASSWORD) {
      return this.keyManager.verifyAccountPassword(response.value);
    }

    if(response.source === DEVICE_AUTH_SOURCE_BIOMETRIC) {
      return response.value === true;
    }

    throw `Cannot validate source ${response.source}`;
  }


  /**
   * @private
   */

   async unlockDevicePasscode(passcode) {
     const keyParams = await this.keyManager.getRootKeyWrapperKeyParams();
     const key = await this.protocolManager.computeRootKey({
       password: passcode,
       keyParams: keyParams
     });
     const result = await this.keyManager.unwrapRootKey({
       wrappingKey: key
     });
     return result.success;
   }

}
