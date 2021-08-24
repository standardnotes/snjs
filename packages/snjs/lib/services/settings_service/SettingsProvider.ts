import { SettingName } from '@standardnotes/settings';
import { SensitiveSettingName } from './SensitiveSettingName';

export type Settings = {
  [key in SettingName]: string;
};

export interface SettingsProvider {
  isReadyForModification(): boolean;

  listSettings(): Promise<Partial<Settings>>;

  getSetting(name: SettingName): Promise<string | null>;

  getSensitiveSetting(name: SensitiveSettingName): Promise<boolean>;

  updateSetting(name: SettingName, payload: string): Promise<void>;

  deleteSetting(name: SettingName): Promise<void>;

  deinit(): void;
}
