/**
 * Unmanaged keys stored in root storage.
 * Raw storage keys exist outside of StorageManager domain
 */
export declare enum RawStorageKey {
    StorageObject = "storage",
    DescriptorRecord = "descriptors",
    SnjsVersion = "snjs_version"
}
/**
 * Keys used for retrieving and saving simple key/value pairs.
 * These keys are managed and are embedded inside RawStorageKey.StorageObject
 */
export declare enum StorageKey {
    RootKeyParams = "ROOT_KEY_PARAMS",
    WrappedRootKey = "WRAPPED_ROOT_KEY",
    RootKeyWrapperKeyParams = "ROOT_KEY_WRAPPER_KEY_PARAMS",
    Session = "session",
    User = "user",
    ServerHost = "server",
    LegacyUuid = "uuid",
    LastSyncToken = "syncToken",
    PaginationToken = "cursorToken",
    BiometricsState = "biometrics_state",
    MobilePasscodeTiming = "passcode_timing",
    MobileBiometricsTiming = "biometrics_timing",
    MobilePasscodeKeyboardType = "passcodeKeyboardType",
    MobilePreferences = "preferences",
    PrivilegesExpirey = "SessionExpiresAtKey",
    PrivilegesSessionLength = "SessionLengthKey",
    SessionHistoryPersistable = "sessionHistory_persist",
    SessionHistoryRevisions = "sessionHistory_revisions",
    SessionHistoryOptimize = "sessionHistory_autoOptimize",
    KeyRecoveryUndecryptableItems = "key_recovery_undecryptable",
    StorageEncryptionPolicy = "storage_policy"
}
export declare enum NonwrappedStorageKey {
    MobileFirstRun = "first_run"
}
export declare function namespacedKey(namespace: string, key: string): string;
export declare const LegacyKeys1_0_0: {
    WebPasscodeParamsKey: string;
    MobilePasscodeParamsKey: string;
    AllAccountKeyParamsKey: string;
    WebEncryptedStorageKey: string;
    MobileWrappedRootKeyKey: string;
    MobileBiometricsPrefs: string;
    AllMigrations: string;
    MobileThemesCache: string;
    MobileLightTheme: string;
    MobileDarkTheme: string;
    MobileLastExportDate: string;
    MobileDoNotWarnUnsupportedEditors: string;
    MobileOptionsState: string;
    MobilePasscodeKeyboardType: string;
};
