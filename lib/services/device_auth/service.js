import { PureService } from '@Lib/services/pure_service';
import { STORAGE_KEY_BIOMETRIC_PREFS } from '@Lib/storage_keys';
import { isNullOrUndefined } from '@Lib/utils';
import { STORAGE_VALUE_MODE_NONWRAPPED } from '@Services/storage_manager';
import { Challenges } from '@Lib/challenges';

export class DeviceAuthService extends PureService {

  constructor({storageManager, keyManager, protocolService}) {
    super();
    this.storageManager = storageManager;
    this.keyManager = keyManager;
    this.protocolService = protocolService;
  }

  /** @public */
  async hasPasscode() {
    return this.keyManager.hasRootKeyWrapper();
  }

  /** @public */
  isPasscodeLocked() {
    return this.keyManager.rootKeyNeedsUnwrapping();
  }

  async getLaunchChallenges() {
    const challenges = [];

    const hasPasscode = await this.hasPasscode();
    if(hasPasscode) {
      challenges.push(Challenges.LocalPasscode);
    }

    const biometricPrefs = await this.storageManager.getValue(
      STORAGE_KEY_BIOMETRIC_PREFS,
      STORAGE_VALUE_MODE_NONWRAPPED
    );
    const biometricEnabled = biometricPrefs && biometricPrefs.enabled;
    if(biometricEnabled) {
      challenges.push(Challenges.Biometric)
    }

    return challenges;
  }

  async enableBiometrics() {
    await this.storageManager.setValue(
      STORAGE_KEY_BIOMETRIC_PREFS,
      {enabled: true},
      STORAGE_VALUE_MODE_NONWRAPPED
    );
  }

  async validateChallengeResponse(response)  {
    if(response.challenge === Challenges.LocalPasscode) {
      const keyParams = await this.keyManager.getRootKeyWrapperKeyParams();
      const key = await this.protocolService.computeRootKey({
        password: response.value,
        keyParams: keyParams
      });
      return this.keyManager.validateWrappingKey(key);
    }

    if(response.challenge === Challenges.AccountPassword) {
      return this.keyManager.validateAccountPassword(response.value);
    }

    if(response.challenge === Challenges.Biometric) {
      return response.value === true;
    }

    throw `Cannot validate challenge type ${response.challenge}`;
  }

  async handleChallengeResponse(response) {
    if(response.challenge === Challenges.LocalPasscode) {
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
