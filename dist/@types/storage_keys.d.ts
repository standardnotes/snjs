/**
 * Unmanaged keys stored in root storage
 */
export declare enum RawStorageKey {
    StorageObject = "storage",
    /** Raw storage keys exist outside of StorageManager domain */
    LastMigrationTimestamp = "last_migration_timestamp"
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
    PrivilegesExpirey = "SessionExpiresAtKey",
    PrivilegesSessionLength = "SessionLengthKey",
    SessionHistoryPersistable = "sessionHistory_persist",
    SessionHistoryRevisions = "sessionHistory_revisions",
    SessionHistoryOptimize = "sessionHistory_autoOptimize"
}
export declare function namespacedKey(namespace: string, key: string): string;
