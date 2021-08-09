import { SettingPayload } from '@standardnotes/settings';
import { PureService } from '../pure_service';

import { SNApiService } from '../api/api_service';
import { SNStorageService } from '../storage_service';
import { SettingsProvider } from './SettingsProvider';
import { SettingsCache } from './SettingsCache';
import { SettingsRepo } from './SettingsRepo';
import { StorageKey } from '@Lib/storage_keys';
import { UuidString } from '@Lib/types';

export class SNSettingsService extends PureService implements SettingsProvider {
  private provider!: SettingsProvider;

  constructor(
    private readonly storageService: SNStorageService,
    private readonly apiService: SNApiService
  ) {
    super();
  }

  async initializeFromDisk() {
    const user = await this.storageService.getValue(StorageKey.User);
    const userUuid: UuidString = user.uuid;
    const repo = new SettingsRepo(this.apiService, userUuid);
    const cache = new SettingsCache(repo, 10 * 1000, () => Date.now());
    this.provider = cache;
  }

  async listSettings() {
    return this.provider.listSettings();
  }

  async getSetting<Key extends keyof SettingPayload>(name: Key) {
    return this.provider.getSetting(name);
  }

  async updateSetting<Key extends keyof SettingPayload>(
    name: Key,
    payload: SettingPayload[Key]
  ) {
    return this.provider.updateSetting(name, payload);
  }

  async deleteSetting<Key extends keyof SettingPayload>(name: Key) {
    return this.provider.deleteSetting(name);
  }

  deinit() {
    (this.apiService as unknown) = undefined;
    (this.storageService as unknown) = undefined;
  }
}
