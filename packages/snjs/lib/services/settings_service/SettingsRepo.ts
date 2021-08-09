import { SettingName, SettingPayload } from '@standardnotes/settings';
import { SettingsProvider } from './SettingsProvider';
import {
  DeleteSettingResponse,
  GetSettingResponse,
  ListSettingsResponse,
  UpdateSettingResponse,
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

export class SettingsRepo implements SettingsProvider {
  constructor(
    private readonly api: SettingsAPI,
    private readonly userUuId: UuidString
  ) {}

  async listSettings() {
    const { error, settings } = await this.api.listSettings(this.userUuId);
    if (error != null) throw new Error(error.message);
    if (settings == null) return {};

    const settingVals = Object.values<string>(SettingName);

    const res: Partial<SettingPayload> = {};
    for (let s of settings) {
      if (settingVals.includes(s.name) && s.value != null) {
        res[s.name as SettingName] = JSON.parse(s.value);
      }
    }
    return res;
  }

  async getSetting<Key extends keyof SettingPayload>(name: Key) {
    const { error, setting } = await this.api.getSetting(this.userUuId, name);
    if (error != null) throw new Error(error.message);
    if (setting?.value == null) return null;
    return JSON.parse(setting.value);
  }

  async updateSetting<Key extends keyof SettingPayload>(
    name: Key,
    payload: SettingPayload[Key]
  ): Promise<SettingPayload[Key] | null> {
    const value = JSON.stringify(payload);
    const { error, setting } = await this.api.updateSetting(
      this.userUuId,
      name,
      value
    );
    if (error != null) throw new Error(error.message);

    if (setting?.value == null) return null;
    return JSON.parse(setting.value);
  }

  async deleteSetting<Key extends keyof SettingPayload>(
    name: Key
  ): Promise<void> {
    const { error } = await this.api.deleteSetting(this.userUuId, name);
    if (error != null) throw new Error(error.message);
  }
}
