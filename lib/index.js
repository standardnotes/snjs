export const DEFAULT_APP_DOMAIN = 'org.standardnotes.sn';
export { ApplicationEvents, SyncEvents, applicationEventForSyncEvent } from '@Lib/events';
export { ApplicationStages } from '@Lib/stages';
export {
  Environments,
  Platforms,
  isEnvironmentWebOrDesktop,
  isEnvironmentMobile
} from '@Lib/platforms';
export { Challenges } from '@Lib/challenges';
export {
  StorageKeys,
  RawStorageKeys,
  namespacedKey,
} from '@Lib/storage_keys';
