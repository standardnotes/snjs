export {
  SnjsVersion,
  isRightVersionGreaterThanLeft,
  compareSemVersions,
} from './version';

export type { ApplicationDescriptor } from './application_group';
export { ApplicationOptionsDefaults } from './options';
export type {
  ActionResponse,
  ListedAccount,
  ListedAccountInfo,
} from './services/api/responses';
export type { BackupFile } from '@Services/protocol_service';
export type {
  UuidString,
  ApplicationIdentifier,
  ApplicationEventPayload,
  IconType,
} from './types';

export { SNApplicationGroup } from './application_group';
export { DeinitSource } from './types';
export { KeyParamsOrigination } from './protocol/key_params';
export { KeyRecoveryStrings, SessionStrings } from './services/api/messages';
export type { RemoteSession } from './services/api/session';

export { SNApplication } from '@Lib/application';

export { SNProtocolService, KeyMode } from '@Services/protocol_service';
export { SNProtocolOperator001 } from '@Protocol/operator/001/operator_001';
export { SNProtocolOperator002 } from '@Protocol/operator/002/operator_002';
export { SNProtocolOperator003 } from '@Protocol/operator/003/operator_003';
export { SNProtocolOperator004 } from '@Protocol/operator/004/operator_004';

export { SNRootKey } from '@Protocol/root_key';
export { SNRootKeyParams } from './protocol/key_params';
export { DeviceInterface } from '@Lib/device_interface';
export {
  SNItem,
  ItemMutator,
  AppDataField,
  SNItemsKey,
  SNPredicate,
  SNNote,
  NoteMutator,
  SNTag,
  TagMutator,
  SNSmartTag,
  SNActionsExtension,
  ActionsExtensionMutator,
  SNTheme,
  ThemeMutator,
  SNComponent,
  ComponentMutator,
  SNEditor,
  SNUserPrefs,
  UserPrefsMutator,
  PrefKey,
} from './models';

export type { PrefValue, Action } from './models';
export { MutationType } from '@Models/core/item';
export { ComponentArea } from './models/app/component';
export type { ComponentPermission } from '@standardnotes/features';
export { ComponentAction } from '@standardnotes/features';
export { LiveItem } from './models/live_item';
export { FeatureStatus } from '@Lib/services/features_service';

export type {
  ItemMessagePayload,
  MessageData,
  PermissionDialog,
  DesktopManagerInterface,
} from './services/component_manager/types';
export {
  SNComponentManager,
  ComponentManagerEvent,
} from './services/component_manager';
export {
  ComponentViewer,
  ComponentViewerEvent,
  ComponentViewerError,
} from './services/component_manager/component_viewer';

export { HistoryEntry } from '@Services/history/entries/history_entry';
export { NoteHistoryEntry } from './services/history/entries/note_history_entry';
export { PayloadManager } from './services/payload_manager';

export type { TransactionalMutation } from './services/item_manager';
export { ItemManager } from './services/item_manager';

export { SNHttpService } from './services/api/http_service';
export { ChallengeService } from './services/challenge/challenge_service';
export { PureService } from '@Services/pure_service';
export { ApplicationService } from '@Services/application_service';
export {
  SNStorageService,
  StoragePersistencePolicies,
  StorageEncryptionPolicies,
  StorageValueModes,
  ValueModesKeys,
} from './services/storage_service';
export {
  Challenge,
  ChallengeReason,
  ChallengeResponse,
  ChallengeValidation,
  ChallengeValue,
  ChallengePrompt,
} from '@Lib/challenges';

export {
  SNSyncService,
  SyncSources,
  SyncModes,
  SyncQueueStrategy,
} from './services/sync/sync_service';
export { SNCredentialService } from './services/credential_service';
export { SyncResponse } from './services/sync/response';
export { SyncResponseResolver } from '@Services/sync/account/response_resolver';
export { SyncOpStatus } from './services/sync/sync_op_status';
export { SortPayloadsByRecentAndContentPriority } from './services/sync/utils';
export { SyncUpDownLimit } from './services/sync/account/operation';
export { SNSessionManager, SessionEvent } from './services/api/session_manager';
export { SNMigrationService } from './services/migration_service';
export { ButtonType } from './services/alert_service';
export type {
  DismissBlockingDialog,
  SNAlertService,
} from './services/alert_service';
export { SNHistoryManager } from './services/history/history_manager';
export {
  SNProtectionService,
  UnprotectedAccessSecondsDuration,
  ProposedSecondsToDeferUILevelSessionExpirationDuringActiveInteraction,
} from './services/protection_service';
export { SNSingletonManager } from './services/singleton_manager';
export { SNApiService } from './services/api/api_service';
export type {
  RevisionListEntry,
  SingleRevision,
} from './services/api/responses';
export {
  addIfUnique,
  arrayByDifference,
  Copy,
  dateSorted,
  deepMerge,
  dictToArray,
  extendArray,
  filterFromArray,
  findInArray,
  getGlobalScope,
  greaterOfTwoDates,
  isNullOrUndefined,
  isSameDay,
  jsonParseEmbeddedKeys,
  naturalSort,
  omitInPlace,
  omitUndefinedCopy,
  removeFromArray,
  removeFromIndex,
  subtractFromArray,
  topLevelCompare,
  truncateHexString,
  uniqueArrayByKey,
  uniqCombineObjArrays,
  convertTimestampToMilliseconds,
  arraysEqual,
  isValidUrl,
  dateToLocalizedString,
  nonSecureRandomIdentifier,
  sanitizeHtmlString,
  lastElement,
} from './utils';
export { Uuid } from '@Lib/uuid';
export {
  EncryptionIntent,
  isLocalStorageIntent,
  isFileIntent,
  isDecryptedIntent,
  intentRequiresEncryption,
  ContentTypeUsesRootKeyEncryption,
} from '@Protocol/intents';
export { displayStringForContentType } from '@Models/content_types';
export { ContentType, Runtime } from '@standardnotes/common';
export { CreateItemFromPayload } from '@Models/generator';
export { Uuids, FillItemContent } from '@Models/functions';

export { ApplicationEvent } from '@Lib/events';
export {
  Environment,
  Platform,
  isEnvironmentWebOrDesktop,
  isEnvironmentMobile,
  platformFromString,
  environmentFromString,
} from '@Lib/platforms';
export { SyncEvent } from '@Lib/services/sync/events';

/** Payloads */
export { MutableCollection } from '@Protocol/collection/collection';
export { ImmutablePayloadCollection } from '@Protocol/collection/payload_collection';
export {
  ItemCollection,
  CollectionSort,
} from '@Protocol/collection/item_collection';
export {
  CreateMaxPayloadFromAnyObject,
  CreateSourcedPayloadFromObject,
  CreateIntentPayloadFromObject,
  CreateEncryptionParameters,
  PayloadByMerging,
  CopyPayload,
} from '@Payloads/generator';
export { PayloadsByAlternatingUuid } from './protocol/payloads';
export {
  PayloadSource,
  isPayloadSourceRetrieved,
  isPayloadSourceInternalChange,
} from '@Lib/protocol/payloads/sources';
export { DeltaOutOfSync } from '@Payloads/deltas';
export { ProtocolVersion } from '@Lib/protocol/versions';
export { PayloadFormat } from '@Payloads/formats';
export { PurePayload } from '@Payloads/pure_payload';
export { PayloadField } from '@Payloads/fields';
export type { PayloadContent } from '@Payloads/generator';

export {
  NotesDisplayCriteria,
  notesMatchingCriteria,
} from '@Lib/protocol/collection/notes_display_criteria';

export {
  StorageKey,
  RawStorageKey,
  NonwrappedStorageKey,
  namespacedKey,
} from '@Lib/storage_keys';

export { NoteViewController } from './ui/note_view_controller';
export { NoteGroupController } from './ui/note_group_controller';
export { IconsController } from './ui/icons_controller';

export { SNFile, FileProtocolV1 } from '@Models/app/file';

/** Migrations */
export { BaseMigration } from '@Lib/migrations/base';

export { ProtectionSessionDurations } from '@Lib/services/protection_service';

export { SNLog } from './log';

/** Used by e2e tests */
export { GetFeatures, FeatureIdentifier } from '@standardnotes/features';
export { RoleName } from '@standardnotes/common';
export {
  SettingName,
  MuteFailedBackupsEmailsOption,
} from '@standardnotes/settings';
export { Migration2_20_0 } from './migrations/2_20_0';
export { Migration2_42_0 } from './migrations/2_42_0';
export { ApplicationStage } from '@Lib/stages';

export { ActionVerb } from '@Lib/models/app/extension';
