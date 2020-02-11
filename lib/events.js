export const ApplicationEvents = {
  WillSignIn: 1,
  SignedIn: 2,
  SignedOut: 3,
  CompletedSync: 5,
  FailedSync: 6,
  HighLatencySync: 7,
  EnteredOutOfSync: 8,
  ExitedOutOfSync: 9,
  /** The application has finished it `prepareForLaunch` state and is now ready for unlock */
  ApplicationStarted: 10,
  /** The applicaiton is fully unlocked and ready for i/o */
  ApplicationUnlocked: 11,
  PasscodeStatusChanged: 12
};

export { SyncEvents } from '@Services/sync/events';