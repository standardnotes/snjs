export const StorageKeys = {
  RootKeyParams: 'ROOT_KEY_PARAMS',
  WrappedRootKey: 'WRAPPED_ROOT_KEY',
  RootKeyWrapperKeyParams: 'ROOT_KEY_WRAPPER_KEY_PARAMS',
  Jwt: 'jwt',
  User: 'user',
  ServerHost: 'server',
  LegacyUuid: 'uuid',
  LastSyncToken: 'syncToken',
  PaginationToken: 'cursorToken',
  StorageObject: 'storage',
  BiometricPrefs: 'biometrics_prefs',
  MobilePasscodeTiming: 'passcode_timing',
  PrivilegesExpirey: 'SessionExpiresAtKey',
  PrivilegesSessionLength: 'SessionLengthKey',
  SessionHistoryPersistable: 'sessionHistory_persist',
  SessionHistoryRevisions: 'sessionHistory_revisions',
  SessionHistoryOptimize: 'sessionHistory_autoOptimize'
};

/** Raw storage keys exist outside of StorageManager domain */
export const RAW_STORAGE_KEY_LAST_MIGRATION_TIMESTAMP = 'last_migration_timestamp';

export function namespacedKey(namespace, key) {
  if (namespace) {
    return `${namespace}-${key}`;
  } else {
    return key;
  }
}