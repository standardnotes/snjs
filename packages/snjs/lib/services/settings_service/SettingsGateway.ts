import { SettingName } from '@standardnotes/settings';
import * as messages from '../api/messages';
import { Settings, SettingsProvider } from './SettingsProvider';
import {
  DeleteSettingResponse,
  GetSettingResponse,
  ListSettingsResponse,
  UpdateSettingResponse,
  User,
} from '../api/responses';
import { UuidString } from '@Lib/types';

interface SettingsAPI {
  listSettings(userUuid: UuidString): Promise<ListSettingsResponse>;

  updateSetting(
    userUuid: UuidString,
    settingName: string,
    settingValue: string
  ): Promise<UpdateSettingResponse>;

  getSetting(
    userUuid: UuidString,
    settingName: string
  ): Promise<GetSettingResponse>;

  deleteSetting(
    userUuid: UuidString,
    settingName: string
  ): Promise<DeleteSettingResponse>;
}

/**
 * SettingsGateway coordinates communication with the API service
 * wrapping the userUuid provision for simpler consumption
 */
export class SettingsGateway implements SettingsProvider {
  constructor(
    private readonly settingsApi: SettingsAPI,
    private readonly userProvider: { getUser: () => User | undefined }
  ) {}

  isReadyForModification() {
    return this.getUser() != null;
  }

  private getUser() {
    return this.userProvider.getUser();
  }

  private get userUuid() {
    const user = this.getUser();
    if (user == null || user.uuid == null) {
      throw new Error(messages.API_MESSAGE_INVALID_SESSION);
    }
    return user.uuid;
  }

  async listSettings() {
    const { error, data } = await this.settingsApi.listSettings(this.userUuid);
    if (error != null) throw new Error(error.message);
    if (data == null || data.settings == null) return {};

    const settings: Partial<Settings> = {};
    for (const setting of data.settings) {
      settings[setting.name as SettingName] = setting.value;
    }
    return settings;
  }

  async getSetting(name: SettingName): Promise<string | null> {
    const { error, data } = await this.settingsApi.getSetting(
      this.userUuid,
      name
    );

    if (error != null) throw new Error(error.message);
    return data?.setting?.value ?? null;
  }

  async updateSetting(name: SettingName, payload: string): Promise<void> {
    const { error } = await this.settingsApi.updateSetting(
      this.userUuid,
      name,
      payload
    );
    if (error != null) throw new Error(error.message);
  }

  async deleteSetting(name: SettingName): Promise<void> {
    const { error } = await this.settingsApi.deleteSetting(this.userUuid, name);
    if (error != null) throw new Error(error.message);
  }

  deinit() {
    (this.settingsApi as unknown) = null;
    (this.userProvider as unknown) = null;
  }
}
