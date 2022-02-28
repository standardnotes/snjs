import { SNApiService } from '../api/api_service'
import { SettingsGateway } from './SettingsGateway'
import { SNSessionManager } from '../api/session_manager'
import { CloudProvider, EmailBackupFrequency, SettingName } from '@standardnotes/settings'
import { SensitiveSettingName } from './SensitiveSettingName'
import { ExtensionsServerURL } from '@Lib/hosts'
import { AbstractService } from '@standardnotes/services'

export class SNSettingsService extends AbstractService {
  private provider!: SettingsGateway
  private frequencyOptionsLabels = {
    [EmailBackupFrequency.Disabled]: 'No email backups',
    [EmailBackupFrequency.Daily]: 'Daily',
    [EmailBackupFrequency.Weekly]: 'Weekly',
  }

  private cloudProviderIntegrationUrlEndpoints = {
    [CloudProvider.Dropbox]: 'dropbox',
    [CloudProvider.Google]: 'gdrive',
    [CloudProvider.OneDrive]: 'onedrive',

  }

  constructor(
    private readonly sessionManager: SNSessionManager,
    private readonly apiService: SNApiService
  ) {
    super()
  }

  initializeFromDisk(): void {
    this.provider = new SettingsGateway(this.apiService, this.sessionManager)
  }

  async listSettings() {
    return this.provider.listSettings()
  }

  async getSetting(name: SettingName) {
    return this.provider.getSetting(name)
  }

  async updateSetting(name: SettingName, payload: string, sensitive: boolean) {
    return this.provider.updateSetting(name, payload, sensitive)
  }

  async getSensitiveSetting(name: SensitiveSettingName) {
    return this.provider.getSensitiveSetting(name)
  }

  async deleteSetting(name: SettingName) {
    return this.provider.deleteSetting(name)
  }
  getEmailBackupFrequencyOptionLabel(frequency: EmailBackupFrequency): string {
    return this.frequencyOptionsLabels[frequency]
  }

  getCloudProviderIntegrationUrl(cloudProviderName: CloudProvider, isDevEnvironment: boolean): string {
    const { Dev, Prod } = ExtensionsServerURL
    const extServerUrl = isDevEnvironment ? Dev : Prod
    return `${extServerUrl}/${this.cloudProviderIntegrationUrlEndpoints[cloudProviderName]}?redirect_url=${extServerUrl}/components/cloudlink?`
  }

  deinit(): void {
    this.provider?.deinit();
    (this.provider as unknown) = undefined;
    (this.sessionManager as unknown) = undefined;
    (this.apiService as unknown) = undefined
  }
}
