import { SettingName } from '@standardnotes/settings';

import { SNSettingsService } from '../settings_service';
import { PureService } from '../pure_service';
import { MfaActivation, newSecret } from './MfaActivation';
import { SNPureCrypto } from '@standardnotes/sncrypto-common';

export class SNMfaService extends PureService {
  constructor(
    private settingsService: SNSettingsService,
    private crypto: SNPureCrypto
  ) {
    super();
  }

  private async saveMfa(secret: string): Promise<void> {
    await this.settingsService.updateSetting(SettingName.MfaSecret, {
      secret: secret,
    });
  }

  async mfaActivated() {
    const mfaSetting = await this.settingsService.getSetting(
      SettingName.MfaSecret
    );
    if (mfaSetting == null) return false;
    if (mfaSetting.secret == null) return false;
  }

  startMfaActivation(): MfaActivation {
    return new MfaActivation(
      newSecret(),
      (secret) => this.saveMfa(secret),
      (m, k) => this.crypto.hmac1(m, k)
    );
  }

  async disableMfa(): Promise<void> {
    await this.settingsService.deleteSetting(SettingName.MfaSecret);
  }
}
