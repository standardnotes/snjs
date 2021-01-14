/**
 * Unmanaged keys stored in root storage.
 * Raw storage keys exist outside of StorageManager domain
 */
export enum RawStorageKey {
  StorageObject = 'storage',
  DescriptorRecord = 'descriptors',
  SnjsVersion = 'snjs_version'
}

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
  MobilePasscodeKeyboardType = 'passcodeKeyboardType',
  MobilePreferences = 'preferences',
  ProtectionExpirey = 'SessionExpiresAtKey',
  ProtectionSessionLength = 'SessionLengthKey',
  SessionHistoryPersistable = 'sessionHistory_persist',
  SessionHistoryRevisions = 'sessionHistory_revisions',
  SessionHistoryOptimize = 'sessionHistory_autoOptimize',
  KeyRecoveryUndecryptableItems = 'key_recovery_undecryptable',
  StorageEncryptionPolicy = 'storage_policy'
}

export enum NonwrappedStorageKey {
  MobileFirstRun = 'first_run'
}

export function namespacedKey(namespace: string, key: string) {
  if (namespace) {
    return `${namespace}-${key}`;
  } else {
    return key;
  }
}

export const LegacyKeys1_0_0 = {
  WebPasscodeParamsKey: 'offlineParams',
  MobilePasscodeParamsKey: 'pc_params',
  AllAccountKeyParamsKey: 'auth_params',
  WebEncryptedStorageKey: 'encryptedStorage',
  MobileWrappedRootKeyKey: 'encrypted_account_keys',
  MobileBiometricsPrefs: 'biometrics_prefs',
  AllMigrations: 'migrations',
  MobileThemesCache: 'ThemePreferencesKey',
  MobileLightTheme: 'lightTheme',
  MobileDarkTheme: 'darkTheme',
  MobileLastExportDate: 'LastExportDateKey',
  MobileDoNotWarnUnsupportedEditors: 'DoNotShowAgainUnsupportedEditorsKey',
  MobileOptionsState: 'options',
  MobilePasscodeKeyboardType: 'passcodeKeyboardType',
};
