export const DEFAULT_APP_DOMAIN = 'org.standardnotes.sn';
export { ApplicationEvents, SyncEvents, applicationEventForSyncEvent } from '@Lib/events';
export { ApplicationStage as ApplicationStages } from '@Lib/stages';
export {
  Environment as Environments,
  Platform as Platforms,
  isEnvironmentWebOrDesktop,
  isEnvironmentMobile
} from '@Lib/platforms';
export { 
  Challenge, 
  ChallengeReason,
  challengeTypeToString, 
  ChallengeResponse,
  ChallengeType,
  ChallengeValue
} from '@Lib/challenges';
export {
  StorageKey as StorageKeys,
  RawStorageKey as RawStorageKeys,
  namespacedKey,
} from '@Lib/storage_keys';