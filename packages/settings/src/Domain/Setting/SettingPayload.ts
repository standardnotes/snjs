import { SettingName } from './SettingName'

export type SettingPayload = {
  [SettingName.MfaSecret]: { secret: string };
};
