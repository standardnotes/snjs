export { SnjsVersion, isRightVersionGreaterThanLeft, compareSemVersions } from './version'

export type { ApplicationDescriptor } from './application_group'
export { ApplicationOptionsDefaults } from './options'
export type {
  ActionResponse,
  ListedAccount,
  ListedAccountInfo,
  RevisionListEntry,
  SingleRevision,
} from '@standardnotes/responses'
export type { BackupFile } from '@Lib/services/ProtocolService'
export type { UuidString, ApplicationEventPayload, IconType } from './types'
export type { ApplicationIdentifier } from '@standardnotes/applications'

export { SNApplicationGroup } from './application_group'
export { DeinitSource } from './types'
export { KeyRecoveryStrings, SessionStrings } from './services/Api/Messages'
export type { RemoteSession } from './services/Api/Session'

export { SNApplication } from '@Lib/application'

export { SNProtocolService, KeyMode } from '@Lib/services/ProtocolService'
export { SNProtocolOperator001 } from '@Protocol/operator/001/operator_001'
export { SNProtocolOperator002 } from '@Protocol/operator/002/operator_002'
export { SNProtocolOperator003 } from '@Protocol/operator/003/operator_003'
export { SNProtocolOperator004 } from '@Protocol/operator/004/operator_004'

export { SNRootKey } from '@Protocol/root_key'
export { SNRootKeyParams } from './protocol/key_params'
export { AbstractDevice, AbstractService } from '@standardnotes/services'
export type { DeviceInterface, ServiceInterface } from '@standardnotes/services'

export * from './models'
export * from '@Lib/services/Features'

export type { ComponentPermission } from '@standardnotes/features'
export { ComponentArea, ComponentAction } from '@standardnotes/features'

export type {
  ItemMessagePayload,
  MessageData,
  PermissionDialog,
  DesktopManagerInterface,
} from './services/ComponentManager/types'
export {
  SNComponentManager,
  ComponentManagerEvent,
} from './services/ComponentManager/ComponentManager'
export {
  ComponentViewer,
  ComponentViewerEvent,
  ComponentViewerError,
} from './services/ComponentManager/ComponentViewer'

export { HistoryEntry } from '@Lib/services/History/Entries/HistoryEntry'
export { NoteHistoryEntry } from './services/History/Entries/NoteHistoryEntry'
export { PayloadManager } from './services/PayloadManager'

export type { TransactionalMutation } from './services/ItemManager'
export { ItemManager } from './services/ItemManager'

export { SNHttpService } from './services/Api/HttpService'
export { ChallengeService } from './services/Challenge/ChallengeService'
export { ApplicationService } from '@Lib/services/ApplicationService'
export {
  SNStorageService,
  StoragePersistencePolicies,
  StorageEncryptionPolicies,
  StorageValueModes,
  ValueModesKeys,
} from './services/StorageService'
export {
  Challenge,
  ChallengeReason,
  ChallengeResponse,
  ChallengeValidation,
  ChallengeValue,
  ChallengePrompt,
} from '@Lib/challenges'

export {
  SNSyncService,
  SyncSources,
  SyncModes,
  SyncQueueStrategy,
} from './services/Sync/SyncService'
export { SNCredentialService } from './services/CredentialService'
export { SyncResponse } from './services/Sync/Response'
export { SyncResponseResolver } from '@Lib/services/Sync/Account/ResponseResolver'
export { SyncOpStatus } from './services/Sync/SyncOpStatus'
export { SortPayloadsByRecentAndContentPriority } from './services/Sync/Utils'
export { SyncUpDownLimit } from './services/Sync/Account/Operation'
export { SNSessionManager, SessionEvent } from './services/Api/SessionManager'
export { SNMigrationService } from './services/MigrationService'
export { ButtonType } from './services/AlertService'
export type { DismissBlockingDialog, SNAlertService } from './services/AlertService'
export { SNHistoryManager } from './services/History/HistoryManager'
export {
  SNProtectionService,
  UnprotectedAccessSecondsDuration,
  ProposedSecondsToDeferUILevelSessionExpirationDuringActiveInteraction,
} from './services/ProtectionService'
export { SNSingletonManager } from './services/SingletonManager'
export { SNApiService } from './services/Api/ApiService'
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
  UuidGenerator,
} from '@standardnotes/utils'

export { ContentType, Runtime, KeyParamsOrigination } from '@standardnotes/common'
export {
  AppDataField,
  ApplicationStage,
  EncryptionIntent,
  isLocalStorageIntent,
  isFileIntent,
  isDecryptedIntent,
  intentRequiresEncryption,
  ContentTypeUsesRootKeyEncryption,
} from '@standardnotes/applications'

export { ApplicationEvent } from '@Lib/events'
export {
  Environment,
  Platform,
  isEnvironmentWebOrDesktop,
  isEnvironmentMobile,
  platformFromString,
  environmentFromString,
} from '@Lib/platforms'
export { SyncEvent } from '@Lib/services/Sync/Events'

/** Payloads */
export {
  FillItemContent,
  MutableCollection,
  ImmutablePayloadCollection,
  ItemCollection,
  CollectionSort,
  CreateMaxPayloadFromAnyObject,
  CreateSourcedPayloadFromObject,
  CreateIntentPayloadFromObject,
  CreateEncryptionParameters,
  PayloadByMerging,
  CopyPayload,
  PayloadsByAlternatingUuid,
  PayloadSource,
  isPayloadSourceRetrieved,
  isPayloadSourceInternalChange,
  PayloadFormat,
  PurePayload,
  PayloadField,
} from '@standardnotes/payloads'
export type { PayloadContent } from '@standardnotes/payloads'
export { DeltaOutOfSync } from '@Payloads/deltas'

export {
  NotesDisplayCriteria,
  notesMatchingCriteria,
} from '@Lib/protocol/collection/notes_display_criteria'

export { StorageKey, RawStorageKey, NonwrappedStorageKey, namespacedKey } from '@Lib/storage_keys'

export { NoteViewController } from './ui/note_view_controller'
export { NoteGroupController } from './ui/note_group_controller'
export { IconsController } from './ui/icons_controller'

/** Migrations */
export { BaseMigration } from '@Lib/migrations/base'

export { ProtectionSessionDurations } from '@Lib/services/ProtectionService'

export { SNLog } from './log'

/** Used by e2e tests */
export { GetFeatures, FeatureIdentifier } from '@standardnotes/features'
export { RoleName, ProtocolVersion } from '@standardnotes/common'
export { SettingName, MuteFailedBackupsEmailsOption } from '@standardnotes/settings'
export { Migration2_20_0 } from './migrations/2_20_0'
export { Migration2_42_0 } from './migrations/2_42_0'
export { Predicate, CompoundPredicate } from '@standardnotes/payloads'
