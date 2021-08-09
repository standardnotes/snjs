import { SettingPayload } from '@standardnotes/settings';

export interface SettingsProvider {
  listSettings(): Promise<Partial<SettingPayload>>;

  getSetting<Key extends keyof SettingPayload>(
    name: Key
  ): Promise<SettingPayload[Key] | null>;

  updateSetting<Key extends keyof SettingPayload>(
    name: Key,
    payload: SettingPayload[Key]
  ): Promise<SettingPayload[Key] | null>;

  deleteSetting<Key extends keyof SettingPayload>(name: Key): Promise<void>;
}
