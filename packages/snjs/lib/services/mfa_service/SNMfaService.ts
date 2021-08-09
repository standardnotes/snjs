import { SettingName } from '@standardnotes/settings';

import { SNSettingsService } from '../settings_service';
import { PureService } from '../pure_service';
import { MfaActivation, newSecret } from './MfaActivation';

export class SNMfaService extends PureService {
  constructor(private settingsService: SNSettingsService) {
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
    return new MfaActivation(newSecret(), (secret) => this.saveMfa(secret));
  }
}
