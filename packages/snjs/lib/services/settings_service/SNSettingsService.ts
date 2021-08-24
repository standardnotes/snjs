import { PureService } from '../pure_service';

import { SNApiService } from '../api/api_service';
import { SettingsProvider } from './SettingsProvider';
import { SettingsGateway } from './SettingsGateway';
import { SNSessionManager } from '../api/session_manager';
import { SettingName } from '@Lib/../../settings/dist';
import { SensitiveSettingName } from './SensitiveSettingName';

export class SNSettingsService extends PureService {
  private _provider!: SettingsProvider;

  constructor(
    private readonly sessionManager: SNSessionManager,
    private readonly apiService: SNApiService
  ) {
    super();
  }

  initializeFromDisk() {
    this._provider = new SettingsGateway(this.apiService, this.sessionManager);
  }

  async listSettings() {
    return this._provider.listSettings();
  }

  async getSetting(name: SettingName) {
    return this._provider.getSetting(name);
  }

  async getSensitiveSetting(name: SensitiveSettingName) {
    return this._provider.getSensitiveSetting(name);
  }

  async updateSetting(name: SettingName, payload: string) {
    return this._provider.updateSetting(name, payload);
  }

  async deleteSetting(name: SettingName) {
    return this._provider.deleteSetting(name);
  }

  deinit(): void {
    this._provider.deinit();
    (this._provider as unknown) = undefined;
    (this.sessionManager as unknown) = undefined;
    (this.apiService as unknown) = undefined;
  }
}
