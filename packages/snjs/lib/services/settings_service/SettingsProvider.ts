import { SettingName } from '@standardnotes/settings';

export type Settings = {
  [key in SettingName]: string;
};

export interface SettingsProvider {
  isReadyForModification(): boolean;

  listSettings(): Promise<Partial<Settings>>;

  getSetting(name: SettingName): Promise<string | null>;

  updateSetting(name: SettingName, payload: string): Promise<void>;

  deleteSetting(name: SettingName): Promise<void>;
}
