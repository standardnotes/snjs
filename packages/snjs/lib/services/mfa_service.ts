import { SettingName } from '@standardnotes/settings';

import { SNSettingsService } from './settings_service';
import { PureService } from './pure_service';
import * as messages from './api/messages';
import { SNPureCrypto } from '@standardnotes/sncrypto-common';

export class SNMfaService extends PureService {
  constructor(
    private settingsService: SNSettingsService,
    private crypto: SNPureCrypto
  ) {
    super();
  }

  private async saveMfaSetting(secret: string): Promise<void> {
    return await this.settingsService.updateSetting(
      SettingName.MfaSecret,
      secret,
      true
    );
  }

  async isMfaActivated() {
    const mfaSetting = await this.settingsService.getSensitiveSetting(
      SettingName.MfaSecret
    );
    return mfaSetting != null && mfaSetting != false;
  }

  async generateMfaSecret() {
    return this.crypto.generateOtpSecret();
  }

  async getOtpToken(secret: string) {
    return this.crypto.totpToken(secret, Date.now(), 6, 30);
  }

  async enableMfa(secret: string, otpToken: string) {
    const otpTokenValid =
      otpToken != null && otpToken === (await this.getOtpToken(secret));
    if (!otpTokenValid) throw new Error(messages.SignInStrings.IncorrectMfa);

    return this.saveMfaSetting(secret);
  }

  async disableMfa(): Promise<void> {
    return await this.settingsService.deleteSetting(SettingName.MfaSecret);
  }

  deinit() {
    (this.settingsService as unknown) = undefined;
    (this.crypto as unknown) = undefined;
    super.deinit();
  }
}
