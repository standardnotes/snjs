export const STORAGE_KEY_ROOT_KEY_PARAMS                = 'ROOT_KEY_PARAMS';
export const STORAGE_KEY_WRAPPED_ROOT_KEY               = 'WRAPPED_ROOT_KEY';
export const STORAGE_KEY_ROOT_KEY_WRAPPER_KEY_PARAMS    = 'ROOT_KEY_WRAPPER_KEY_PARAMS';

export const STORAGE_KEY_JWT                         = 'jwt';
export const STORAGE_KEY_USER                        = 'user';
export const STORAGE_KEY_SERVER_HOST                 = 'server';
export const STORAGE_KEY_LEGACY_UUID                 = 'uuid';
export const STORAGE_KEY_LAST_SYNC_TOKEN             = 'syncToken';
export const STORAGE_KEY_PAGINATION_TOKEN            = 'cursorToken';
export const STORAGE_KEY_STORAGE_OBJECT              = 'storage';
export const STORAGE_KEY_BIOMETRIC_PREFS             = 'biometrics_prefs';
export const STORAGE_KEY_MOBILE_PASSCODE_TIMING      = 'passcode_timing';

export const STORAGE_KEY_PRIVILEGES_EXPIREY          = 'SessionExpiresAtKey';
export const STORAGE_KEY_PRIVILEGES_SESSION_LENGTH   = 'SessionLengthKey';

export const STORAGE_KEY_SESSION_HISTORY_PERSISTABLE      = 'sessionHistory_persist';
export const STORAGE_KEY_SESSION_HISTORY_REVISIONS    = 'sessionHistory_revisions';
export const STORAGE_KEY_SESSION_HISTORY_OPTIMIZE     = 'sessionHistory_autoOptimize';

/** Raw storage keys exist outside of StorageManager domain */
export const RAW_STORAGE_KEY_LAST_MIGRATION_TIMESTAMP = 'last_migration_timestamp';

export function namespacedKey(namespace, key) {
  if(namespace) {
    return `${namespace}-${key}`;
  } else  {
    return key;
  }
}
