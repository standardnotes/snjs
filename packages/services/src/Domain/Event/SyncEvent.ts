/* istanbul ignore file */
export enum SyncEvent {
  /** A full sync can consist of many round-trips to the server */
  FullSyncCompleted = 'sync:full-completed',
  /** A single sync is just one round-trip to the server completion */
  SingleSyncCompleted = 'sync:single-completed',
  SyncWillBegin = 'sync:will-begin',
  DownloadFirstSyncCompleted = 'sync:download-first-completed',
  SyncTakingTooLong = 'sync:taking-too-long',
  SyncError = 'sync:error',
  InvalidSession = 'sync:invalid-session',
  MajorDataChange = 'major-data-change',
  LocalDataIncrementalLoad = 'local-data-incremental-load',
  LocalDataLoaded = 'local-data-loaded',
  EnterOutOfSync = 'enter-out-of-sync',
  ExitOutOfSync = 'exit-out-of-sync',
  StatusChanged = 'status-changed',
  DatabaseWriteError = 'database-write-error',
  DatabaseReadError = 'database-read-error',
  SyncRequestsIntegrityCheck = 'sync:requests-integrity-check',
}
