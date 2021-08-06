import { SettingName } from './SettingName';

/**
 * Describe Setting payloads (contents) matched with Setting enum keys
 *
 * Extend by adding more properties with keys from {@link SettingName} enum and
 * value with the corresponding Payload.
 */
export type SettingPayload = {
  [SettingName.MfaSecret]: { secret: string };
};
