import { PureService } from '../pure_service';

import { SNApiService } from '../api/api_service';
import { SettingsGateway } from './SettingsGateway';
import { SNSessionManager } from '../api/session_manager';
import { CloudProvider, EmailBackupFrequency, SettingName } from '@standardnotes/settings';
import { SensitiveSettingName } from './SensitiveSettingName';
import { EXTENSIONS_SERVER_HOST_DEV, EXTENSIONS_SERVER_HOST_PROD } from '@Lib/hosts';

export class SNSettingsService extends PureService {
  private _provider!: SettingsGateway;
  private _frequencyOptionsLabels = {
    [EmailBackupFrequency.Disabled]: 'No email backups',
    [EmailBackupFrequency.Daily]: 'Daily',
    [EmailBackupFrequency.Weekly]: 'Weekly',
  };

  private _cloudProviderIntegrationUrlEndpoints = {
    [CloudProvider.Dropbox]: 'dropbox',
    [CloudProvider.Google]: 'gdrive',
    [CloudProvider.OneDrive]: 'onedrive',

  }

  constructor(
    private readonly sessionManager: SNSessionManager,
    private readonly apiService: SNApiService
  ) {
    super();
  }

  initializeFromDisk(): void {
    this._provider = new SettingsGateway(this.apiService, this.sessionManager);
  }

  async listSettings() {
    return this._provider.listSettings();
  }

  async getSetting(name: SettingName) {
    return this._provider.getSetting(name);
  }

  async updateSetting(name: SettingName, payload: string, sensitive: boolean) {
    return this._provider.updateSetting(name, payload, sensitive);
  }

  async getSensitiveSetting(name: SensitiveSettingName) {
    return this._provider.getSensitiveSetting(name);
  }

  async deleteSetting(name: SettingName) {
    return this._provider.deleteSetting(name);
  }
  getEmailBackupFrequencyOptionLabel(frequency: EmailBackupFrequency): string {
    return this._frequencyOptionsLabels[frequency];
  }

  getCloudProviderIntegrationUrl(cloudProviderName: CloudProvider, isDevEnvironment: boolean): string {
    const extensionsServerHost = isDevEnvironment ? EXTENSIONS_SERVER_HOST_DEV : EXTENSIONS_SERVER_HOST_PROD;
    return `${extensionsServerHost}/${this._cloudProviderIntegrationUrlEndpoints[cloudProviderName]}?redirect_url=${extensionsServerHost}/components/cloudlink?`;
  }

  deinit(): void {
    this._provider?.deinit();
    (this._provider as unknown) = undefined;
    (this.sessionManager as unknown) = undefined;
    (this.apiService as unknown) = undefined;
  }
}
