export const ApplicationEvents = {
  WillSignIn: 1,
  SignedIn: 2,
  SignedOut: 3,
  LoadedLocalData: 4,
  CompletedSync: 5,
  FailedSync: 6,
  HighLatencySync: 7,
  EnteredOutOfSync: 8,
  ExitedOutOfSync: 9,
};

export { SyncEvents } from '@Services/sync/events';