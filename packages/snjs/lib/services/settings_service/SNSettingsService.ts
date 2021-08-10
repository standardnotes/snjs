import { SettingPayload } from '@standardnotes/settings';
import { PureService } from '../pure_service';

import { SNApiService } from '../api/api_service';
import { SNStorageService } from '../storage_service';
import { SettingsProvider } from './SettingsProvider';
import { SettingsCache } from './SettingsCache';
import { SettingsRepo } from './SettingsRepo';
import { StorageKey } from '@Lib/storage_keys';
import { User } from '../api/responses';
export class SNSettingsService extends PureService implements SettingsProvider {
  private provider: SettingsProvider | null;

  constructor(
    private readonly storageService: SNStorageService,
    private readonly apiService: SNApiService
  ) {
    super();
    this.provider = null;
  }

  isAvailable() {
    return this.provider != null;
  }

  async saveSettings(payload: SettingPayload) {
    return await this.storageService.setValue(StorageKey.UserSettings, payload);
  }

  async loadSettings(): Promise<Partial<SettingPayload>> {
    return this.storageService.getValue(StorageKey.UserSettings);
  }

  private init(user: User) {
    const repo = new SettingsRepo(this.apiService, user.uuid);
    const cache = new SettingsCache(repo, this, 10 * 1000, () => Date.now());
    this.provider = cache;
  }

  async initializeFromDisk() {
    const user = await this.storageService.getValue(StorageKey.User);
    if (user == null) return;
    this.init(user);
  }

  async listSettings() {
    return this.provider!.listSettings();
  }

  async getSetting<Key extends keyof SettingPayload>(name: Key) {
    return this.provider!.getSetting(name);
  }

  async updateSetting<Key extends keyof SettingPayload>(
    name: Key,
    payload: SettingPayload[Key]
  ) {
    return this.provider!.updateSetting(name, payload);
  }

  async deleteSetting<Key extends keyof SettingPayload>(name: Key) {
    return this.provider!.deleteSetting(name);
  }

  deinit() {
    (this.apiService as unknown) = undefined;
    (this.storageService as unknown) = undefined;
    (this.provider as unknown) = undefined;
  }
}
