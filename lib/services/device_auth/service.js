import { PureService } from '@Lib/services/pure_service';
import { STORAGE_KEY_BIOMETRIC_PREFS } from '@Lib/storage_keys';
import { isNullOrUndefined } from '@Lib/utils';
import { STORAGE_VALUE_MODE_UNWRAPPED } from '@Services/storage_manager';

export const CHALLENGE_LOCAL_PASSCODE   = 1;
export const CHALLENGE_ACCOUNT_PASSWORD = 2;
export const CHALLENGE_BIOMETRIC        = 3;

export class DeviceAuthService extends PureService {

  constructor({storageManager, keyManager, protocolService}) {
    super();
    this.storageManager = storageManager;
    this.keyManager = keyManager;
    this.protocolService = protocolService;
  }

  /**
   * @public
   */

  async hasPasscodeEnabled() {
    const wrapperKeyParams = await this.keyManager.getRootKeyWrapperKeyParams();
    return !isNullOrUndefined(wrapperKeyParams);
  }

  async getLaunchChallenges() {
    const challenges = [];

    const hasPasscode = await this.hasPasscodeEnabled();
    if(hasPasscode) {
      challenges.push(CHALLENGE_LOCAL_PASSCODE);
    }

    const biometricPrefs = await this.storageManager.getValue(
      STORAGE_KEY_BIOMETRIC_PREFS,
      STORAGE_VALUE_MODE_UNWRAPPED
    );
    const biometricEnabled = biometricPrefs && biometricPrefs.enabled;
    if(biometricEnabled) {
      challenges.push(CHALLENGE_BIOMETRIC)
    }

    return challenges;
  }

  async enableBiometrics() {
    await this.storageManager.setValue(
      STORAGE_KEY_BIOMETRIC_PREFS,
      {enabled: true},
      STORAGE_VALUE_MODE_UNWRAPPED
    );
  }

  async validateChallengeResponse(response)  {
    if(response.challenge === CHALLENGE_LOCAL_PASSCODE) {
      const keyParams = await this.keyManager.getRootKeyWrapperKeyParams();
      const key = await this.protocolService.computeRootKey({
        password: response.value,
        keyParams: keyParams
      });
      return this.keyManager.validateWrappingKey(key);
    }

    if(response.challenge === CHALLENGE_ACCOUNT_PASSWORD) {
      return this.keyManager.validateAccountPassword(response.value);
    }

    if(response.challenge === CHALLENGE_BIOMETRIC) {
      return response.value === true;
    }

    throw `Cannot validate challenge type ${response.challenge}`;
  }

  async handleChallengeResponse(response) {
    if(response.challenge === CHALLENGE_LOCAL_PASSCODE) {
      const keyParams = await this.keyManager.getRootKeyWrapperKeyParams();
      const key = await this.protocolService.computeRootKey({
        password: response.value,
        keyParams: keyParams
      });
      await this.keyManager.unwrapRootKey({
        wrappingKey: key
      });
    } else {
      /** No action. */
    }
  }
}
