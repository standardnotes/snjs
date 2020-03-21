import { SyncEvents } from '@Services/sync/events';
export { SyncEvents };

export const ApplicationEvents = {
  SignedIn: 2,
  SignedOut: 3,
  CompletedSync: 5,
  FailedSync: 6,
  HighLatencySync: 7,
  EnteredOutOfSync: 8,
  ExitedOutOfSync: 9,

  /** 
   * The application has finished it `prepareForLaunch` state and is now ready for unlock 
   * Called when the application has initialized and is ready for launch, but before
   * the application has been unlocked, if applicable. Use this to do pre-launch
   * configuration, but do not attempt to access user data like notes or tags.
   */
  Started: 10,

  /** 
   * The applicaiton is fully unlocked and ready for i/o 
   * Called when the application has been fully decrypted and unlocked. Use this to
   * to begin streaming data like notes and tags.
   */
  Launched: 11,

  LocalDataLoaded: 12,

  /**
   * When the root key or root key wrapper changes. Includes events like account state
   * changes (registering, signing in, changing pw, logging out) and passcode state
   * changes (adding, removing, changing).
   */
  KeyStatusChanged: 13,
  MajorDataChange: 14,
  CompletedRestart: 15,
  LocalDataIncrementalLoad: 16,
  SyncStatusChanged: 17,
  WillSync: 18,
  InvalidSyncSession: 19
};

export function applicationEventForSyncEvent(syncEvent) {
  return {
    [SyncEvents.FullSyncCompleted]: ApplicationEvents.CompletedSync,
    [SyncEvents.SyncError]: ApplicationEvents.FailedSync,
    [SyncEvents.SyncTakingTooLong]: ApplicationEvents.HighLatencySync,
    [SyncEvents.EnterOutOfSync]: ApplicationEvents.EnteredOutOfSync,
    [SyncEvents.ExitOutOfSync]: ApplicationEvents.ExitedOutOfSync,
    [SyncEvents.LocalDataLoaded]: ApplicationEvents.LocalDataLoaded,
    [SyncEvents.MajorDataChange]: ApplicationEvents.MajorDataChange,
    [SyncEvents.LocalDataIncrementalLoad]: ApplicationEvents.LocalDataIncrementalLoad,
    [SyncEvents.StatusChanged]: ApplicationEvents.SyncStatusChanged,
    [SyncEvents.SyncWillBegin]: ApplicationEvents.WillSync,
    [SyncEvents.InvalidSession]: ApplicationEvents.InvalidSyncSession
  }[syncEvent];
}