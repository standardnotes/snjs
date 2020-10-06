/**
 * Unmanaged keys stored in root storage.
 * Raw storage keys exist outside of StorageManager domain
 */
export enum RawStorageKey {
  StorageObject = 'storage',
  LastMigrationTimestamp = 'last_migration_timestamp',
  DescriptorRecord = "descriptors"
};

/**
 * Keys used for retrieving and saving simple key/value pairs.
 * These keys are managed and are embedded inside RawStorageKey.StorageObject
 */
export enum StorageKey {
  RootKeyParams = 'ROOT_KEY_PARAMS',
  WrappedRootKey = 'WRAPPED_ROOT_KEY',
  RootKeyWrapperKeyParams = 'ROOT_KEY_WRAPPER_KEY_PARAMS',
  Session = 'session',
  User = 'user',
  ServerHost = 'server',
  LegacyUuid = 'uuid',
  LastSyncToken = 'syncToken',
  PaginationToken = 'cursorToken',
  BiometricsState = 'biometrics_state',
  MobilePasscodeTiming = 'passcode_timing',
  MobileBiometricsTiming = 'biometrics_timing',
  MobilePreferences = 'preferences',
  PrivilegesExpirey = 'SessionExpiresAtKey',
  PrivilegesSessionLength = 'SessionLengthKey',
  SessionHistoryPersistable = 'sessionHistory_persist',
  SessionHistoryRevisions = 'sessionHistory_revisions',
  SessionHistoryOptimize = 'sessionHistory_autoOptimize',
  KeyRecoveryUndecryptableItems = 'key_recovery_undecryptable'
};

export function namespacedKey(namespace: string, key: string) {
  if (namespace) {
    return `${namespace}-${key}`;
  } else {
    return key;
  }
}