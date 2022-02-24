import { ListedService } from './services/listed_service';
import { ListedInterface } from './application_interfaces/listed_interface';
import { TagNoteCountChangeObserver } from './protocol/collection/tag_notes_index';
import { TransactionalMutation } from './services/item_manager';
import { FeatureStatus } from '@Lib/services/features_service';
import { Settings } from './services/settings_service';
import { SyncOpStatus } from './services/sync/sync_op_status';
import { createMutatorForItem } from '@Lib/models/mutator';
import {
  SNCredentialService,
  CredentialsChangeFunctionResponse,
  AccountServiceResponse,
  AccountEvent,
} from './services/credential_service';
import { NotesDisplayCriteria } from './protocol/collection/notes_display_criteria';
import { SNKeyRecoveryService } from './services/key_recovery_service';
import {
  CollectionSort,
  SortDirection,
} from '@Protocol/collection/item_collection';
import { Uuids } from '@Models/functions';
import { PayloadOverride, RawPayload } from './protocol/payloads/generator';
import { ApplicationStage, ApplicationIdentifier } from '@standardnotes/common';
import { DeinitSource, UuidString, ApplicationEventPayload } from './types';
import {
  ApplicationOptionsDefaults,
  ApplicationOptions,
  FullyResolvedApplicationOptions,
} from './options';
import {
  ApplicationEvent,
  SyncEvent,
  applicationEventForSyncEvent,
} from '@Lib/events';
import { StorageEncryptionPolicies } from './services/storage_service';
import { Uuid } from '@Lib/uuid';
import { BackupFile } from './services/protocol_service';
import { EncryptionIntent } from '@Protocol/intents';
import { SyncOptions } from './services/sync/sync_service';
import { SNSmartTag } from './models/app/smartTag';
import { ItemMutator, MutationType, SNItem } from '@Models/core/item';
import { SNPredicate } from '@Models/core/predicate';
import { PurePayload } from '@Payloads/pure_payload';
import {
  Challenge,
  ChallengePrompt,
  ChallengeReason,
  ChallengeResponse,
  ChallengeValidation,
  ChallengeValue,
} from './challenges';
import { ChallengeObserver } from './services/challenge/challenge_service';
import { Environment, Platform } from './platforms';
import {
  assertUnreachable,
  isNullOrUndefined,
  isString,
  removeFromArray,
  sleep,
  nonSecureRandomIdentifier,
} from '@standardnotes/utils';
import { AnyRecord, ContentType } from '@standardnotes/common';
import {
  CopyPayload,
  CreateMaxPayloadFromAnyObject,
  PayloadContent,
} from '@Payloads/generator';
import { PayloadSource } from '@Payloads/sources';
import { CreateItemFromPayload } from '@Models/generator';
import {
  StoragePersistencePolicies,
  StorageValueModes,
} from '@Services/storage_service';
import {
  ChallengeService,
  ItemManager,
  PayloadManager,
  SNActionsService,
  SNAlertService,
  SNApiService,
  SNComponentManager,
  SNHistoryManager,
  SNHttpService,
  SNMigrationService,
  SNProtectionService,
  SNProtocolService,
  SNSessionManager,
  SNSingletonManager,
  SNStorageService,
  SNSyncService,
  SNFeaturesService,
  SNFileService,
  SyncModes,
} from './services';
import { DeviceInterface, ServiceInterface } from '@standardnotes/services';
import {
  BACKUP_FILE_MORE_RECENT_THAN_ACCOUNT,
  ErrorAlertStrings,
  ProtocolUpgradeStrings,
  UNSUPPORTED_BACKUP_FILE_VERSION,
  SessionStrings,
  ImportStrings,
} from './services/api/messages';
import { SessionEvent } from './services/api/session_manager';
import { PrefKey, PrefValue, SNComponent, SNNote, SNTag } from './models';
import { ProtocolVersion, compareVersions } from './protocol/versions';
import { KeyParamsOrigination } from './protocol/key_params';
import { SNLog } from './log';
import { SNPreferencesService } from './services/preferences_service';
import {
  AvailableSubscriptions,
  GetAvailableSubscriptionsResponse,
  GetSubscriptionResponse,
  HttpResponse,
  ListedAccount,
  ListedAccountInfo,
  SignInResponse,
  User,
} from './services/api/responses';
import { PayloadFormat } from './protocol/payloads';
import { ProtectionEvent } from './services/protection_service';
import { SNWebSocketsService } from './services/api/websockets_service';
import {
  CloudProvider,
  EmailBackupFrequency,
  SettingName,
} from '@standardnotes/settings';
import { SNSettingsService } from './services/settings_service';
import { SNMfaService } from './services/mfa_service';
import { SensitiveSettingName } from './services/settings_service/SensitiveSettingName';
import { Subscription } from '@standardnotes/auth';
import { FeatureDescription, FeatureIdentifier } from '@standardnotes/features';
import {
  FeaturesEvent,
  SetOfflineFeaturesFunctionResponse,
} from '@Services/features_service';
import { TagsToFoldersMigrationApplicator } from './migrations/applicators/tags_to_folders';
import { RemoteSession } from './services/api/session';
import { RoleName } from '.';

/** How often to automatically sync, in milliseconds */
const DEFAULT_AUTO_SYNC_INTERVAL = 30_000;

type LaunchCallback = {
  receiveChallenge: (challenge: Challenge) => void;
};
type ApplicationEventCallback = (
  event: ApplicationEvent,
  data?: unknown
) => Promise<void>;
type ApplicationObserver = {
  singleEvent?: ApplicationEvent;
  callback: ApplicationEventCallback;
};
type ItemStream = (items: SNItem[], source: PayloadSource) => void;
type ObserverRemover = () => void;

/** The main entrypoint of an application. */
export class SNApplication implements ListedInterface {
  private onDeinit?: (app: SNApplication, source: DeinitSource) => void;

  /**
   * A runtime based identifier for each dynamic instantiation of the application instance.
   * This differs from the persistent application.identifier which persists in storage
   * across instantiations.
   */
  public readonly ephemeralIdentifier = nonSecureRandomIdentifier();

  private migrationService!: SNMigrationService;
  private httpService!: SNHttpService;
  private payloadManager!: PayloadManager;
  public protocolService!: SNProtocolService;
  private storageService!: SNStorageService;
  private apiService!: SNApiService;
  private sessionManager!: SNSessionManager;
  private syncService!: SNSyncService;
  private challengeService!: ChallengeService;
  public singletonManager!: SNSingletonManager;
  public componentManager!: SNComponentManager;
  public protectionService!: SNProtectionService;
  public actionsManager!: SNActionsService;
  public historyManager!: SNHistoryManager;
  private itemManager!: ItemManager;
  private keyRecoveryService!: SNKeyRecoveryService;
  private preferencesService!: SNPreferencesService;
  private featuresService!: SNFeaturesService;
  private credentialService!: SNCredentialService;
  private webSocketsService!: SNWebSocketsService;
  private settingsService!: SNSettingsService;
  private mfaService!: SNMfaService;
  private listedService!: ListedService;
  public fileService!: SNFileService;

  private eventHandlers: ApplicationObserver[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private services: ServiceInterface<any, any>[] = [];
  private streamRemovers: ObserverRemover[] = [];
  private serviceObservers: ObserverRemover[] = [];
  private managedSubscribers: ObserverRemover[] = [];
  private autoSyncInterval!: number;

  /** True if the result of deviceInterface.openDatabase yields a new database being created */
  private createdNewDatabase = false;
  /** True if the application has started (but not necessarily launched) */
  private started = false;
  /** True if the application has launched */
  private launched = false;
  /** Whether the application has been destroyed via .deinit() */
  private dealloced = false;
  private revokingSession = false;
  private handledFullSyncStage = false;

  public readonly environment: Environment;
  public readonly platform: Platform;
  public deviceInterface: DeviceInterface;
  public alertService: SNAlertService;
  public readonly identifier: ApplicationIdentifier;
  public readonly options: FullyResolvedApplicationOptions;

  constructor(options: ApplicationOptions) {
    const fullyResovledOptions = {
      ...ApplicationOptionsDefaults,
      ...options,
    } as FullyResolvedApplicationOptions;

    if (!SNLog.onLog) {
      throw Error('SNLog.onLog must be set.');
    }
    if (!SNLog.onError) {
      throw Error('SNLog.onError must be set.');
    }
    const requiredOptions: (keyof ApplicationOptions)[] = [
      'deviceInterface',
      'environment',
      'platform',
      'crypto',
      'alertService',
      'identifier',
      'defaultHost',
      'defaultFilesHost',
      'appVersion',
    ];
    for (const optionName of requiredOptions) {
      if (!fullyResovledOptions[optionName]) {
        throw Error(
          `${optionName} must be supplied when creating an application.`
        );
      }
    }

    this.environment = options.environment;
    this.platform = options.platform;
    this.deviceInterface = options.deviceInterface;
    this.alertService = options.alertService;
    this.identifier = options.identifier;
    this.options = Object.freeze(fullyResovledOptions);

    this.constructServices();
  }

  /**
   * The first thing consumers should call when starting their app.
   * This function will load all services in their correct order.
   */
  async prepareForLaunch(callback: LaunchCallback): Promise<void> {
    await this.options.crypto.initialize();
    this.setLaunchCallback(callback);
    const databaseResult = await this.deviceInterface
      .openDatabase(this.identifier)
      .catch((error) => {
        void this.notifyEvent(ApplicationEvent.LocalDatabaseReadError, error);
        return undefined;
      });
    this.createdNewDatabase = databaseResult?.isNewDatabase || false;
    await this.migrationService.initialize();
    await this.notifyEvent(ApplicationEvent.MigrationsLoaded);
    await this.handleStage(ApplicationStage.PreparingForLaunch_0);
    await this.storageService.initializeFromDisk();
    await this.notifyEvent(ApplicationEvent.StorageReady);
    await this.protocolService.initialize();
    await this.handleStage(ApplicationStage.ReadyForLaunch_05);
    this.started = true;
    await this.notifyEvent(ApplicationEvent.Started);
  }

  private setLaunchCallback(callback: LaunchCallback) {
    this.challengeService.sendChallenge = callback.receiveChallenge;
  }

  /**
   * Handles device authentication, unlocks application, and
   * issues a callback if a device activation requires user input
   * (i.e local passcode or fingerprint).
   * @param awaitDatabaseLoad
   * Option to await database load before marking the app as ready.
   */
  public async launch(awaitDatabaseLoad = false): Promise<void> {
    this.launched = false;
    const launchChallenge = this.getLaunchChallenge();
    if (launchChallenge) {
      const response = await this.challengeService.promptForChallengeResponse(
        launchChallenge
      );
      if (!response) {
        throw Error('Launch challenge was cancelled.');
      }
      await this.handleLaunchChallengeResponse(response);
    }
    if (this.storageService.isStorageWrapped()) {
      try {
        await this.storageService.decryptStorage();
      } catch (_error) {
        void this.alertService.alert(
          ErrorAlertStrings.StorageDecryptErrorBody,
          ErrorAlertStrings.StorageDecryptErrorTitle
        );
      }
    }
    await this.handleStage(ApplicationStage.StorageDecrypted_09);
    await this.apiService.loadHost();
    await this.apiService.loadFilesHost();
    await this.webSocketsService.loadWebSocketUrl();
    await this.sessionManager.initializeFromDisk();
    this.historyManager.initializeFromDisk();
    this.settingsService.initializeFromDisk();
    await this.featuresService.initializeFromDisk();

    this.launched = true;
    await this.notifyEvent(ApplicationEvent.Launched);
    await this.handleStage(ApplicationStage.Launched_10);

    const databasePayloads = await this.syncService.getDatabasePayloads();
    await this.handleStage(ApplicationStage.LoadingDatabase_11);

    if (this.createdNewDatabase) {
      await this.syncService.onNewDatabaseCreated();
    }
    /**
     * We don't want to await this, as we want to begin allowing the app to function
     * before local data has been loaded fully. We await only initial
     * `getDatabasePayloads` to lock in on database state.
     */
    const loadPromise = this.syncService
      .loadDatabasePayloads(databasePayloads)
      .then(async () => {
        if (this.dealloced) {
          throw 'Application has been destroyed.';
        }
        await this.handleStage(ApplicationStage.LoadedDatabase_12);
        this.beginAutoSyncTimer();
        await this.syncService.sync({
          mode: SyncModes.DownloadFirst,
        });
      });
    if (awaitDatabaseLoad) {
      await loadPromise;
    }
  }

  public onStart(): void {
    // optional override
  }

  public onLaunch(): void {
    // optional override
  }

  public getLaunchChallenge(): Challenge | undefined {
    return this.protectionService.createLaunchChallenge();
  }

  private async handleLaunchChallengeResponse(response: ChallengeResponse) {
    if (
      response.challenge.hasPromptForValidationType(
        ChallengeValidation.LocalPasscode
      )
    ) {
      let wrappingKey = response.artifacts?.wrappingKey;
      if (!wrappingKey) {
        const value = response.getValueForType(
          ChallengeValidation.LocalPasscode
        );
        wrappingKey = await this.protocolService.computeWrappingKey(
          value.value as string
        );
      }
      await this.protocolService.unwrapRootKey(wrappingKey);
    }
  }

  private beginAutoSyncTimer() {
    this.autoSyncInterval = this.deviceInterface.interval(() => {
      this.syncService.log('Syncing from autosync');
      void this.sync();
    }, DEFAULT_AUTO_SYNC_INTERVAL);
  }

  private async handleStage(stage: ApplicationStage) {
    for (const service of this.services) {
      await service.handleApplicationStage(stage);
    }
  }

  /**
   * @param singleEvent Whether to only listen for a particular event.
   */
  public addEventObserver(
    callback: ApplicationEventCallback,
    singleEvent?: ApplicationEvent
  ): () => void {
    const observer = { callback, singleEvent };
    this.eventHandlers.push(observer);
    return () => {
      removeFromArray(this.eventHandlers, observer);
    };
  }

  public addSingleEventObserver(
    event: ApplicationEvent,
    callback: ApplicationEventCallback
  ): () => void {
    // eslint-disable-next-line @typescript-eslint/require-await
    const filteredCallback = async (firedEvent: ApplicationEvent) => {
      if (firedEvent === event) {
        void callback(event);
      }
    };
    return this.addEventObserver(filteredCallback, event);
  }

  private async notifyEvent(
    event: ApplicationEvent,
    data?: ApplicationEventPayload
  ) {
    if (event === ApplicationEvent.Started) {
      this.onStart();
    } else if (event === ApplicationEvent.Launched) {
      this.onLaunch();
    }
    for (const observer of this.eventHandlers.slice()) {
      if (observer.singleEvent && observer.singleEvent === event) {
        await observer.callback(event, data || {});
      } else if (!observer.singleEvent) {
        await observer.callback(event, data || {});
      }
    }
    void this.migrationService.handleApplicationEvent(event);
  }

  /**
   * Whether the local database has completed loading local items.
   */
  public isDatabaseLoaded(): boolean {
    return this.syncService.isDatabaseLoaded();
  }

  public async savePayload(payload: PurePayload): Promise<void> {
    const dirtied = CopyPayload(payload, {
      dirty: true,
      dirtiedDate: new Date(),
    });
    await this.payloadManager.emitPayload(dirtied, PayloadSource.LocalChanged);
    await this.syncService.sync();
  }

  /**
   * Finds an item by UUID.
   */
  public findItem(uuid: string): SNItem | undefined {
    return this.itemManager.findItem(uuid);
  }

  /**
   * Returns all items.
   */
  public allItems(): SNItem[] {
    return this.itemManager.items;
  }

  /**
   * Finds an item by predicate.
   */
  public findItems(contentType: ContentType, predicate: SNPredicate): SNItem[] {
    return this.itemManager.itemsMatchingPredicate(contentType, predicate);
  }

  /**
   * Finds an item by predicate.
   */
  public getAll(uuids: UuidString[]): (SNItem | PurePayload | undefined)[] {
    return this.itemManager.findItems(uuids);
  }

  /**
   * Takes the values of the input item and emits it onto global state.
   */
  public async mergeItem(item: SNItem, source: PayloadSource): Promise<SNItem> {
    return this.itemManager.emitItemFromPayload(
      item.payloadRepresentation(),
      source
    );
  }

  /**
   * Creates a managed item.
   * @param needsSync  Whether to mark the item as needing sync. `add` must also be true.
   */
  public async createManagedItem(
    contentType: ContentType,
    content: PayloadContent,
    needsSync = false,
    override?: PayloadOverride
  ): Promise<SNItem> {
    return this.itemManager.createItem(
      contentType,
      content,
      needsSync,
      override
    );
  }

  /**
   * Creates an unmanaged item that can be added later.
   */
  public async createTemplateItem(
    contentType: ContentType,
    content?: PayloadContent
  ): Promise<SNItem> {
    return this.itemManager.createTemplateItem(contentType, content);
  }

  /**
   * @param item item to be checked
   * @returns Whether the item is a template (unmanaged)
   */
  public isTemplateItem(item: SNItem): boolean {
    return this.itemManager.isTemplateItem(item);
  }

  /**
   * Creates an unmanaged item from a payload.
   */
  public createItemFromPayload(payload: PurePayload): SNItem {
    return CreateItemFromPayload(payload);
  }

  /**
   * Creates an unmanaged payload from any object, where the raw object
   * represents the same data a payload would.
   */
  public createPayloadFromObject(object: AnyRecord): PurePayload {
    return CreateMaxPayloadFromAnyObject(object as RawPayload);
  }

  /**
   * @returns The date of last sync
   */
  public getLastSyncDate(): Date | undefined {
    return this.syncService.getLastSyncDate();
  }

  public getSyncStatus(): SyncOpStatus {
    return this.syncService.getStatus();
  }

  public getSessions(): Promise<
    (HttpResponse & { data: RemoteSession[] }) | HttpResponse
  > {
    return this.sessionManager.getSessionsList();
  }

  public async revokeSession(
    sessionId: UuidString
  ): Promise<HttpResponse | undefined> {
    if (await this.protectionService.authorizeSessionRevoking()) {
      return this.sessionManager.revokeSession(sessionId);
    }
  }

  /**
   * Revokes all sessions except the current one.
   */
  public async revokeAllOtherSessions(): Promise<void> {
    return this.sessionManager.revokeAllOtherSessions();
  }

  public async userCanManageSessions(): Promise<boolean> {
    const userVersion = await this.getUserVersion();
    if (isNullOrUndefined(userVersion)) {
      return false;
    }
    return compareVersions(userVersion, ProtocolVersion.V004) >= 0;
  }

  public async getUserSubscription(): Promise<Subscription | undefined> {
    const response = await this.sessionManager.getSubscription();
    if (response.error) {
      throw new Error(response.error.message);
    }
    if (response.data) {
      return (response as GetSubscriptionResponse).data!.subscription;
    }
    return undefined;
  }

  public async getAvailableSubscriptions(): Promise<
    AvailableSubscriptions | undefined
  > {
    const response = await this.apiService.getAvailableSubscriptions();
    if (response.error) {
      throw new Error(response.error.message);
    }
    if (response.data) {
      return (response as GetAvailableSubscriptionsResponse).data!;
    }
    return undefined;
  }

  /**
   * @param isUserModified  Whether to change the modified date the user
   * sees of the item.
   */
  public async setItemNeedsSync(
    item: SNItem,
    isUserModified = false
  ): Promise<SNItem | undefined> {
    return this.itemManager.setItemDirty(item.uuid, isUserModified);
  }

  public async setItemsNeedsSync(
    items: SNItem[]
  ): Promise<(SNItem | undefined)[]> {
    return this.itemManager.setItemsDirty(Uuids(items));
  }

  public async deleteItem(item: SNItem): Promise<void> {
    await this.itemManager.setItemToBeDeleted(item.uuid);
    await this.sync();
  }

  public async emptyTrash(): Promise<void> {
    await this.itemManager.emptyTrash();
    await this.sync();
  }

  public getTrashedItems(): SNNote[] {
    return this.itemManager.trashedItems;
  }

  public setDisplayOptions<T extends SNItem>(
    contentType: ContentType,
    sortBy?: CollectionSort,
    direction?: SortDirection,
    filter?: (element: T) => boolean
  ): void {
    this.itemManager.setDisplayOptions(contentType, sortBy, direction, filter);
  }

  public setNotesDisplayCriteria(criteria: NotesDisplayCriteria): void {
    this.itemManager.setNotesDisplayCriteria(criteria);
  }

  public getDisplayableItems(contentType: ContentType): SNItem[] {
    return this.itemManager.getDisplayableItems(contentType);
  }

  /**
   * Inserts the input item by its payload properties, and marks the item as dirty.
   * A sync is not performed after an item is inserted. This must be handled by the caller.
   */
  public async insertItem(item: SNItem): Promise<SNItem> {
    const mutator = createMutatorForItem(item, MutationType.UserInteraction);
    const dirtiedPayload = mutator.getResult();
    const insertedItem = await this.itemManager.emitItemFromPayload(
      dirtiedPayload
    );
    return insertedItem;
  }

  /**
   * Saves the item by uuid by finding it, setting it as dirty if its not already,
   * and performing a sync request.
   */
  public async saveItem(uuid: UuidString): Promise<void> {
    const item = this.itemManager.findItem(uuid);
    if (!item) {
      throw Error('Attempting to save non-inserted item');
    }
    if (!item.dirty) {
      await this.itemManager.changeItem(uuid, undefined, MutationType.Internal);
    }
    await this.syncService.sync();
  }

  /**
   * Mutates a pre-existing item, marks it as dirty, and syncs it
   */
  public async changeAndSaveItem<M extends ItemMutator = ItemMutator>(
    uuid: UuidString,
    mutate?: (mutator: M) => void,
    isUserModified = true,
    payloadSource?: PayloadSource,
    syncOptions?: SyncOptions
  ): Promise<SNItem | undefined> {
    if (!isString(uuid)) {
      throw Error('Must use uuid to change item');
    }
    await this.itemManager.changeItems(
      [uuid],
      mutate,
      isUserModified ? MutationType.UserInteraction : undefined,
      payloadSource
    );
    await this.syncService.sync(syncOptions);
    return this.findItem(uuid);
  }

  /**
   * Mutates pre-existing items, marks them as dirty, and syncs
   */
  public async changeAndSaveItems<M extends ItemMutator = ItemMutator>(
    uuids: UuidString[],
    mutate?: (mutator: M) => void,
    isUserModified = true,
    payloadSource?: PayloadSource,
    syncOptions?: SyncOptions
  ): Promise<void> {
    await this.itemManager.changeItems(
      uuids,
      mutate,
      isUserModified ? MutationType.UserInteraction : undefined,
      payloadSource
    );
    await this.syncService.sync(syncOptions);
  }

  /**
   * Mutates a pre-existing item and marks it as dirty. Does not sync changes.
   */
  public async changeItem<M extends ItemMutator>(
    uuid: UuidString,
    mutate?: (mutator: M) => void,
    isUserModified = true
  ): Promise<SNItem | undefined> {
    if (!isString(uuid)) {
      throw Error('Must use uuid to change item');
    }
    await this.itemManager.changeItems(
      [uuid],
      mutate,
      isUserModified ? MutationType.UserInteraction : undefined
    );
    return this.findItem(uuid);
  }

  /**
   * Mutates a pre-existing items and marks them as dirty. Does not sync changes.
   */
  public async changeItems<M extends ItemMutator = ItemMutator>(
    uuids: UuidString[],
    mutate?: (mutator: M) => void,
    isUserModified = true
  ): Promise<(SNItem | undefined)[]> {
    return this.itemManager.changeItems(
      uuids,
      mutate,
      isUserModified ? MutationType.UserInteraction : undefined
    );
  }

  /**
   * Run unique mutations per each item in the array, then only propagate all changes
   * once all mutations have been run. This differs from `changeItems` in that changeItems
   * runs the same mutation on all items.
   */
  public async runTransactionalMutations(
    transactions: TransactionalMutation[],
    payloadSource = PayloadSource.LocalChanged,
    payloadSourceKey?: string
  ): Promise<(SNItem | undefined)[]> {
    return this.itemManager.runTransactionalMutations(
      transactions,
      payloadSource,
      payloadSourceKey
    );
  }

  public async runTransactionalMutation(
    transaction: TransactionalMutation,
    payloadSource = PayloadSource.LocalChanged,
    payloadSourceKey?: string
  ): Promise<SNItem | undefined> {
    return this.itemManager.runTransactionalMutation(
      transaction,
      payloadSource,
      payloadSourceKey
    );
  }

  public async protectNote(note: SNNote): Promise<SNNote> {
    const protectedNote = await this.protectionService.protectNote(note);
    void this.syncService.sync();
    return protectedNote;
  }

  public async unprotectNote(note: SNNote): Promise<SNNote | undefined> {
    const unprotectedNote = await this.protectionService.unprotectNote(note);
    if (!isNullOrUndefined(unprotectedNote)) {
      void this.syncService.sync();
    }
    return unprotectedNote;
  }

  public async authorizeProtectedActionForNotes(
    notes: SNNote[],
    challengeReason: ChallengeReason
  ): Promise<SNNote[]> {
    return await this.protectionService.authorizeProtectedActionForNotes(
      notes,
      challengeReason
    );
  }

  public async protectNotes(notes: SNNote[]): Promise<SNNote[]> {
    const protectedNotes = await this.protectionService.protectNotes(notes);
    void this.syncService.sync();
    return protectedNotes;
  }

  public async unprotectNotes(notes: SNNote[]): Promise<SNNote[]> {
    const unprotectedNotes = await this.protectionService.unprotectNotes(notes);
    void this.syncService.sync();
    return unprotectedNotes;
  }

  public getItems<T extends SNItem>(
    contentType: ContentType | ContentType[],
    nonerroredOnly = false
  ): T[] {
    return this.itemManager.getItems<T>(contentType, nonerroredOnly);
  }

  public notesMatchingSmartTag(smartTag: SNSmartTag): SNNote[] {
    return this.itemManager.notesMatchingSmartTag(smartTag);
  }

  public addNoteCountChangeObserver(
    observer: TagNoteCountChangeObserver
  ): () => void {
    return this.itemManager.addNoteCountChangeObserver(observer);
  }

  public allCountableNotesCount(): number {
    return this.itemManager.allCountableNotesCount();
  }

  public countableNotesForTag(tag: SNTag | SNSmartTag): number {
    return this.itemManager.countableNotesForTag(tag);
  }

  /** Returns an item's direct references */
  public referencesForItem(item: SNItem, contentType?: ContentType): SNItem[] {
    let references = this.itemManager.referencesForItem(item.uuid);
    if (contentType) {
      references = references.filter((ref) => {
        return ref?.content_type === contentType;
      });
    }
    return references;
  }

  /** Returns items referencing an item */
  public referencingForItem(item: SNItem, contentType?: ContentType): SNItem[] {
    let references = this.itemManager.itemsReferencingItem(item.uuid);
    if (contentType) {
      references = references.filter((ref) => {
        return ref?.content_type === contentType;
      });
    }
    return references as SNItem[];
  }

  public duplicateItem<T extends SNItem>(
    item: T,
    additionalContent?: Partial<PayloadContent>
  ): Promise<T> {
    const duplicate = this.itemManager.duplicateItem<T>(
      item.uuid,
      false,
      additionalContent
    );
    this.sync();
    return duplicate;
  }

  public findTagByTitle(title: string): SNTag | undefined {
    return this.itemManager.findTagByTitle(title);
  }

  public getTagPrefixTitle(tag: SNTag): string | undefined {
    return this.itemManager.getTagPrefixTitle(tag);
  }

  public getTagLongTitle(tag: SNTag): string {
    return this.itemManager.getTagLongTitle(tag);
  }

  /**
   * Finds tags with title or component starting with a search query and (optionally) not associated with a note
   * @param searchQuery - The query string to match
   * @param note - The note whose tags should be omitted from results
   * @returns Array containing tags matching search query and not associated with note
   */
  public searchTags(searchQuery: string, note?: SNNote): SNTag[] {
    return this.itemManager.searchTags(searchQuery, note);
  }

  public isValidTagParent(
    parentTagUuid: UuidString,
    childTagUuid: UuidString
  ): boolean {
    return this.itemManager.isValidTagParent(parentTagUuid, childTagUuid);
  }

  public hasTagsNeedingFoldersMigration(): boolean {
    return TagsToFoldersMigrationApplicator.isApplicableToCurrentData(
      this.itemManager
    );
  }

  /**
   * Migrates any tags containing a '.' character to sa chema-based heirarchy, removing
   * the dot from the tag's title.
   */
  public async migrateTagsToFolders(): Promise<void> {
    await TagsToFoldersMigrationApplicator.run(this.itemManager);
    return this.sync();
  }

  /**
   * Establishes a hierarchical relationship between two tags.
   */
  public async setTagParent(parentTag: SNTag, childTag: SNTag): Promise<void> {
    await this.itemManager.setTagParent(parentTag, childTag);
  }

  /**
   * Remove the tag parent.
   */
  public async unsetTagParent(childTag: SNTag): Promise<void> {
    await this.itemManager.unsetTagParent(childTag);
  }

  /**
   * Returns the parent for a tag
   * @param tag - The tag for which parents need to be found
   * @returns The current parent or undefined
   */
  public getTagParent(tag: SNTag): SNTag | undefined {
    return this.itemManager.getTagParent(tag.uuid);
  }

  /**
   * Returns the hierarchy of parents for a tag
   * @param tag - The tag for which parents need to be found
   * @returns Array containing all parent tags
   */
  public getTagParentChain(tag: SNTag): SNTag[] {
    return this.itemManager.getTagParentChain(tag.uuid);
  }

  /**
   * Returns all descendants for a tag
   * @param tag - The tag for which descendants need to be found
   * @returns Array containing all descendant tags
   */
  public getTagChildren(tag: SNTag): SNTag[] {
    return this.itemManager.getTagChildren(tag.uuid);
  }

  /**
   * Get tags for a note sorted in natural order
   * @param note - The note whose tags will be returned
   * @returns Array containing tags associated with a note
   */
  public getSortedTagsForNote(note: SNNote): SNTag[] {
    return this.itemManager.getSortedTagsForNote(note);
  }

  /**
   * Add a tag and all its parent to a note.
   *
   * @param note The note assigned to a tag
   * @param tagUuid The tag we'll assign to the note
   */
  public addTagHierarchyToNote(note: SNNote, tag: SNTag): Promise<SNTag[]> {
    return this.itemManager.addTagHierarchyToNote(note, tag);
  }

  public async findOrCreateTag(title: string): Promise<SNTag> {
    return this.itemManager.findOrCreateTagByTitle(title);
  }

  /** Creates and returns the tag but does not run sync. Callers must perform sync. */
  public async createTagOrSmartTag(title: string): Promise<SNTag | SNSmartTag> {
    return this.itemManager.createTagOrSmartTag(title);
  }

  public isSmartTagTitle(title: string): boolean {
    return this.itemManager.isSmartTagTitle(title);
  }

  public getSmartTags(): SNSmartTag[] {
    return this.itemManager.getSmartTags();
  }

  public getNoteCount(): number {
    return this.itemManager.noteCount;
  }

  /**
   * Begin streaming items to display in the UI. The stream callback will be called
   * immediately with the present items that match the constraint, and over time whenever
   * items matching the constraint are added, changed, or deleted.
   */
  public streamItems(
    contentType: ContentType | ContentType[],
    stream: ItemStream
  ): () => void {
    const observer = this.itemManager.addObserver(
      contentType,
      (changed, inserted, discarded, _ignored, source) => {
        const all = changed.concat(inserted).concat(discarded);
        stream(all, source);
      }
    );
    /** Push current values now */
    const matches = this.itemManager.getItems(contentType);
    if (matches.length > 0) {
      stream(matches, PayloadSource.InitialObserverRegistrationPush);
    }
    this.streamRemovers.push(observer);
    return () => {
      observer();
      removeFromArray(this.streamRemovers, observer);
    };
  }

  /**
   * Activates or deactivates a component, depending on its
   * current state, and syncs.
   */
  public async toggleComponent(component: SNComponent): Promise<void> {
    await this.componentManager.toggleComponent(component.uuid);
    await this.syncService.sync();
  }

  public async toggleTheme(theme: SNComponent): Promise<void> {
    await this.componentManager.toggleTheme(theme.uuid);
    await this.syncService.sync();
  }

  /**
   * Set the server's URL
   */
  public async setHost(host: string): Promise<void> {
    return this.apiService.setHost(host);
  }

  public getHost(): string | undefined {
    return this.apiService.getHost();
  }

  public async setFilesHost(filesHost: string): Promise<void> {
    return this.apiService.setFilesHost(filesHost);
  }

  public getFilesHost(): string | undefined {
    return this.apiService.getFilesHost();
  }

  public async setCustomHost(host: string): Promise<void> {
    await this.apiService.setHost(host);
    await this.webSocketsService.setWebSocketUrl(undefined);
  }

  public getUser(): User | undefined {
    if (!this.launched) {
      throw Error('Attempting to access user before application unlocked');
    }
    return this.sessionManager.getUser();
  }

  public getUserPasswordCreationDate(): Date | undefined {
    return this.protocolService.getPasswordCreatedDate();
  }

  public async getProtocolEncryptionDisplayName(): Promise<string | undefined> {
    return this.protocolService.getEncryptionDisplayName();
  }

  public getUserVersion(): Promise<ProtocolVersion | undefined> {
    return this.protocolService.getUserVersion();
  }

  /**
   * Returns true if there is an upgrade available for the account or passcode
   */
  public async protocolUpgradeAvailable(): Promise<boolean> {
    return this.protocolService.upgradeAvailable();
  }

  /**
   * Returns true if there is an encryption source available
   */
  public isEncryptionAvailable(): boolean {
    return this.hasAccount() || this.hasPasscode();
  }

  public async upgradeProtocolVersion(): Promise<{
    success?: true;
    canceled?: true;
    error?: {
      message: string;
    };
  }> {
    const result = await this.credentialService.performProtocolUpgrade();
    if (result.success) {
      if (this.hasAccount()) {
        void this.alertService.alert(ProtocolUpgradeStrings.SuccessAccount);
      } else {
        void this.alertService.alert(
          ProtocolUpgradeStrings.SuccessPasscodeOnly
        );
      }
    } else if (result.error) {
      void this.alertService.alert(ProtocolUpgradeStrings.Fail);
    }
    return result;
  }

  public noAccount(): boolean {
    return !this.hasAccount();
  }

  public hasAccount(): boolean {
    return this.protocolService.hasAccount();
  }

  /**
   * @returns true if the user has a source of protection available, such as a
   * passcode, password, or biometrics.
   */
  public hasProtectionSources(): boolean {
    return this.protectionService.hasProtectionSources();
  }

  public hasUnprotectedAccessSession(): boolean {
    return this.protectionService.hasUnprotectedAccessSession();
  }

  /**
   * When a user specifies a non-zero remember duration on a protection
   * challenge, a session will be started during which protections are disabled.
   */
  public getProtectionSessionExpiryDate(): Date {
    return this.protectionService.getSessionExpiryDate();
  }

  public clearProtectionSession(): Promise<void> {
    return this.protectionService.clearSession();
  }

  /**
   * @returns whether note access has been granted or not
   */
  public authorizeNoteAccess(note: SNNote): Promise<boolean> {
    return this.protectionService.authorizeNoteAccess(note);
  }

  public authorizeAutolockIntervalChange(): Promise<boolean> {
    return this.protectionService.authorizeAutolockIntervalChange();
  }

  public authorizeSearchingProtectedNotesText(): Promise<boolean> {
    return this.protectionService.authorizeSearchingProtectedNotesText();
  }

  public canRegisterNewListedAccount(): boolean {
    return this.listedService.canRegisterNewListedAccount();
  }

  public async requestNewListedAccount(): Promise<ListedAccount | undefined> {
    return this.listedService.requestNewListedAccount();
  }

  public async getListedAccounts(): Promise<ListedAccount[]> {
    return this.listedService.getListedAccounts();
  }

  public getListedAccountInfo(
    account: ListedAccount,
    inContextOfItem?: UuidString
  ): Promise<ListedAccountInfo | undefined> {
    return this.listedService.getListedAccountInfo(account, inContextOfItem);
  }

  /**
   * @returns
   * .affectedItems: Items that were either created or dirtied by this import
   * .errorCount: The number of items that were not imported due to failure to decrypt.
   */
  public async importData(
    data: BackupFile,
    awaitSync = false
  ): Promise<
    | {
        affectedItems: SNItem[];
        errorCount: number;
      }
    | {
        error: string;
      }
    | undefined
  > {
    if (data.version) {
      /**
       * Prior to 003 backup files did not have a version field so we cannot
       * stop importing if there is no backup file version, only if there is
       * an unsupported version.
       */
      const version = data.version as ProtocolVersion;

      const supportedVersions = this.protocolService.supportedVersions();
      if (!supportedVersions.includes(version)) {
        return { error: UNSUPPORTED_BACKUP_FILE_VERSION };
      }

      const userVersion = await this.getUserVersion();
      if (userVersion && compareVersions(version, userVersion) === 1) {
        /** File was made with a greater version than the user's account */
        return { error: BACKUP_FILE_MORE_RECENT_THAN_ACCOUNT };
      }
    }

    let password: string | undefined;

    if (data.auth_params || data.keyParams) {
      /** Get import file password. */
      const challenge = new Challenge(
        [
          new ChallengePrompt(
            ChallengeValidation.None,
            ImportStrings.FileAccountPassword,
            undefined,
            true
          ),
        ],
        ChallengeReason.DecryptEncryptedFile,
        true
      );
      const passwordResponse = await this.challengeService.promptForChallengeResponse(
        challenge
      );
      if (isNullOrUndefined(passwordResponse)) {
        /** Challenge was canceled */
        return;
      }
      this.challengeService.completeChallenge(challenge);
      password = passwordResponse.values[0].value as string;
    }

    if (!(await this.protectionService.authorizeFileImport())) {
      return;
    }
    const decryptedPayloads = await this.protocolService.payloadsByDecryptingBackupFile(
      data,
      password
    );
    const validPayloads = decryptedPayloads
      .filter((payload) => {
        return (
          !payload.errorDecrypting &&
          payload.format !== PayloadFormat.EncryptedString
        );
      })
      .map((payload) => {
        /* Don't want to activate any components during import process in
         * case of exceptions breaking up the import proccess */
        if (
          payload.content_type === ContentType.Component &&
          payload.safeContent.active
        ) {
          return CopyPayload(payload, {
            content: {
              ...payload.safeContent,
              active: false,
            },
          });
        } else {
          return payload;
        }
      });
    const affectedUuids = await this.payloadManager.importPayloads(
      validPayloads
    );
    const promise = this.sync();
    if (awaitSync) {
      await promise;
    }
    const affectedItems = this.getAll(affectedUuids) as SNItem[];
    return {
      affectedItems: affectedItems,
      errorCount: decryptedPayloads.length - validPayloads.length,
    };
  }

  /**
   * Creates a JSON-stringifiable backup object of all items.
   */
  public async createBackupFile(
    intent: EncryptionIntent,
    authorizeEncrypted = false
  ): Promise<BackupFile | undefined> {
    const encrypted = intent === EncryptionIntent.FileEncrypted;
    const decrypted = intent === EncryptionIntent.FileDecrypted;
    const authorize = (encrypted && authorizeEncrypted) || decrypted;

    if (
      authorize &&
      !(await this.protectionService.authorizeBackupCreation(encrypted))
    ) {
      return;
    }

    return this.protocolService.createBackupFile(intent);
  }

  public isEphemeralSession(): boolean {
    return this.storageService.isEphemeralSession();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public sync(options?: SyncOptions): Promise<any> {
    return this.syncService.sync(options);
  }

  public isOutOfSync(): boolean {
    return this.syncService.isOutOfSync();
  }

  public async resolveOutOfSync(): Promise<unknown> {
    return this.syncService.resolveOutOfSync();
  }

  public async setValue(
    key: string,
    value: unknown,
    mode?: StorageValueModes
  ): Promise<void> {
    return this.storageService.setValue(key, value, mode);
  }

  public getValue(key: string, mode?: StorageValueModes): unknown {
    return this.storageService.getValue(key, mode);
  }

  public async removeValue(
    key: string,
    mode?: StorageValueModes
  ): Promise<void> {
    return this.storageService.removeValue(key, mode);
  }

  public getPreference<K extends PrefKey>(key: K): PrefValue[K] | undefined;
  public getPreference<K extends PrefKey>(
    key: K,
    defaultValue: PrefValue[K]
  ): PrefValue[K];
  public getPreference<K extends PrefKey>(
    key: K,
    defaultValue?: PrefValue[K]
  ): PrefValue[K] | undefined {
    return this.preferencesService.getValue(key, defaultValue);
  }

  public async setPreference<K extends PrefKey>(
    key: K,
    value: PrefValue[K]
  ): Promise<void> {
    return this.preferencesService.setValue(key, value);
  }

  /**
   * Gives services a chance to complete any sensitive operations before yielding
   * @param maxWait The maximum number of milliseconds to wait for services
   * to finish tasks. 0 means no limit.
   */
  private async prepareForDeinit(maxWait = 0): Promise<void> {
    const promise = Promise.all(
      this.services.map((service) => service.blockDeinit())
    );
    if (maxWait === 0) {
      await promise;
    } else {
      /** Await up to maxWait. If not resolved by then, return. */
      await Promise.race([promise, sleep(maxWait)]);
    }
  }

  public promptForCustomChallenge(
    challenge: Challenge
  ): Promise<ChallengeResponse | undefined> {
    return this.challengeService?.promptForChallengeResponse(challenge);
  }

  public addChallengeObserver(
    challenge: Challenge,
    observer: ChallengeObserver
  ): () => void {
    return this.challengeService.addChallengeObserver(challenge, observer);
  }

  public submitValuesForChallenge(
    challenge: Challenge,
    values: ChallengeValue[]
  ): Promise<void> {
    return this.challengeService.submitValuesForChallenge(challenge, values);
  }

  public cancelChallenge(challenge: Challenge): void {
    this.challengeService.cancelChallenge(challenge);
  }

  /** Set a function to be called when this application deinits */
  public setOnDeinit(
    onDeinit: (app: SNApplication, source: DeinitSource) => void
  ): void {
    this.onDeinit = onDeinit;
  }

  /**
   * Destroys the application instance.
   */
  public deinit(source: DeinitSource): void {
    this.dealloced = true;

    clearInterval(this.autoSyncInterval);

    for (const uninstallObserver of this.serviceObservers) {
      uninstallObserver();
    }
    for (const uninstallSubscriber of this.managedSubscribers) {
      uninstallSubscriber();
    }
    for (const service of this.services) {
      service.deinit();
    }

    (this.options as unknown) = undefined;
    this.createdNewDatabase = false;
    this.services.length = 0;
    this.serviceObservers.length = 0;
    this.managedSubscribers.length = 0;
    this.streamRemovers.length = 0;
    this.clearServices();
    this.started = false;

    this.onDeinit?.(this, source);
    this.onDeinit = undefined;
  }

  /**
   *  @param mergeLocal  Whether to merge existing offline data into account. If false,
   *                     any pre-existing data will be fully deleted upon success.
   */
  public async register(
    email: string,
    password: string,
    ephemeral = false,
    mergeLocal = true
  ): Promise<AccountServiceResponse> {
    return this.credentialService.register(
      email,
      password,
      ephemeral,
      mergeLocal
    );
  }

  /**
   * @param mergeLocal  Whether to merge existing offline data into account.
   * If false, any pre-existing data will be fully deleted upon success.
   */
  public async signIn(
    email: string,
    password: string,
    strict = false,
    ephemeral = false,
    mergeLocal = true,
    awaitSync = false
  ): Promise<HttpResponse | SignInResponse> {
    return this.credentialService.signIn(
      email,
      password,
      strict,
      ephemeral,
      mergeLocal,
      awaitSync
    );
  }

  public async changeEmail(
    newEmail: string,
    currentPassword: string,
    passcode?: string,
    origination = KeyParamsOrigination.EmailChange
  ): Promise<CredentialsChangeFunctionResponse> {
    return this.credentialService.changeCredentials({
      currentPassword,
      newEmail,
      passcode,
      origination,
      validateNewPasswordStrength: false,
    });
  }

  public async changePassword(
    currentPassword: string,
    newPassword: string,
    passcode?: string,
    origination = KeyParamsOrigination.PasswordChange,
    validateNewPasswordStrength = true
  ): Promise<CredentialsChangeFunctionResponse> {
    return this.credentialService.changeCredentials({
      currentPassword,
      newPassword,
      passcode,
      origination,
      validateNewPasswordStrength,
    });
  }

  public async signOut(force = false): Promise<void> {
    const performSignOut = async () => {
      await this.credentialService.signOut();
      await this.notifyEvent(ApplicationEvent.SignedOut);
      await this.prepareForDeinit();
      this.deinit(DeinitSource.SignOut);
    };

    if (force) {
      await performSignOut();
      return;
    }

    const dirtyItems = this.itemManager.getDirtyItems();
    if (dirtyItems.length > 0) {
      const singular = dirtyItems.length === 1;
      const didConfirm = await this.alertService.confirm(
        `There ${singular ? 'is' : 'are'} ${dirtyItems.length} ${
          singular ? 'item' : 'items'
        } with unsynced changes. If you sign out, these changes will be lost forever. Are you sure you want to sign out?`
      );
      if (didConfirm) {
        await performSignOut();
      }
    } else {
      await performSignOut();
    }
  }

  private async handleRevokedSession(): Promise<void> {
    /**
     * Because multiple API requests can come back at the same time
     * indicating revoked session we only want to do this once.
     */
    if (this.revokingSession) {
      return;
    }
    this.revokingSession = true;
    /** Keep a reference to the soon-to-be-cleared alertService */
    const alertService = this.alertService;
    await this.signOut(true);
    void alertService.alert(SessionStrings.CurrentSessionRevoked);
  }

  public async validateAccountPassword(password: string): Promise<boolean> {
    const { valid } = await this.protocolService.validateAccountPassword(
      password
    );
    return valid;
  }

  public isStarted(): boolean {
    return this.started;
  }

  public isLaunched(): boolean {
    return this.launched;
  }

  public hasBiometrics(): boolean {
    return this.protectionService.hasBiometricsEnabled();
  }

  /**
   * @returns whether the operation was successful or not
   */
  public enableBiometrics(): Promise<boolean> {
    return this.protectionService.enableBiometrics();
  }

  /**
   * @returns whether the operation was successful or not
   */
  public disableBiometrics(): Promise<boolean> {
    return this.protectionService.disableBiometrics();
  }

  public hasPasscode(): boolean {
    return this.protocolService.hasPasscode();
  }

  async isLocked(): Promise<boolean> {
    if (!this.started) {
      return true;
    }
    return this.challengeService.isPasscodeLocked();
  }

  public async lock(): Promise<void> {
    /** Because locking is a critical operation, we want to try to do it safely,
     * but only up to a certain limit. */
    const MaximumWaitTime = 500;
    await this.prepareForDeinit(MaximumWaitTime);
    return this.deinit(DeinitSource.Lock);
  }

  public addPasscode(passcode: string): Promise<boolean> {
    return this.credentialService.addPasscode(passcode);
  }

  /**
   * @returns whether the passcode was successfuly removed
   */
  public async removePasscode(): Promise<boolean> {
    return this.credentialService.removePasscode();
  }

  public async changePasscode(
    newPasscode: string,
    origination = KeyParamsOrigination.PasscodeChange
  ): Promise<boolean> {
    return this.credentialService.changePasscode(newPasscode, origination);
  }

  public getStorageEncryptionPolicy(): StorageEncryptionPolicies {
    return this.storageService.getStorageEncryptionPolicy();
  }

  public async setStorageEncryptionPolicy(
    encryptionPolicy: StorageEncryptionPolicies
  ): Promise<void> {
    await this.storageService.setEncryptionPolicy(encryptionPolicy);
    return this.protocolService.repersistAllItems();
  }

  public enableEphemeralPersistencePolicy(): Promise<void> {
    return this.storageService.setPersistencePolicy(
      StoragePersistencePolicies.Ephemeral
    );
  }

  public hasPendingMigrations(): Promise<boolean> {
    return this.migrationService.hasPendingMigrations();
  }

  public generateUuid(): string {
    return Uuid.GenerateUuid();
  }

  public presentKeyRecoveryWizard(): Promise<void> {
    return this.keyRecoveryService.processPersistedUndecryptables();
  }

  /**
   * Dynamically change the device interface, i.e when Desktop wants to override
   * default web interface.
   */
  public changeDeviceInterface(deviceInterface: DeviceInterface): void {
    this.deviceInterface = deviceInterface;
    for (const service of this.services) {
      if (service.deviceInterface) {
        service.deviceInterface = deviceInterface;
      }
    }
  }

  public async listSettings(): Promise<Partial<Settings>> {
    return this.settingsService.listSettings();
  }

  public async getSetting(name: SettingName): Promise<string | null> {
    return this.settingsService.getSetting(name);
  }

  public async getSensitiveSetting(
    name: SensitiveSettingName
  ): Promise<boolean> {
    return this.settingsService.getSensitiveSetting(name);
  }

  public async updateSetting(
    name: SettingName,
    payload: string,
    sensitive = false
  ): Promise<void> {
    return this.settingsService.updateSetting(name, payload, sensitive);
  }

  public async deleteSetting(name: SettingName): Promise<void> {
    return this.settingsService.deleteSetting(name);
  }

  public getEmailBackupFrequencyOptionLabel(
    frequency: EmailBackupFrequency
  ): string {
    return this.settingsService.getEmailBackupFrequencyOptionLabel(frequency);
  }

  public isMfaFeatureAvailable(): boolean {
    return this.mfaService.isMfaFeatureAvailable();
  }

  public async isMfaActivated(): Promise<boolean> {
    return this.mfaService.isMfaActivated();
  }

  public async generateMfaSecret(): Promise<string> {
    return this.mfaService.generateMfaSecret();
  }

  public async getOtpToken(secret: string): Promise<string> {
    return this.mfaService.getOtpToken(secret);
  }

  public async enableMfa(secret: string, otpToken: string): Promise<void> {
    return this.mfaService.enableMfa(secret, otpToken);
  }

  public async disableMfa(): Promise<void> {
    if (await this.protectionService.authorizeMfaDisable()) {
      return this.mfaService.disableMfa();
    }
  }

  public downloadExternalFeature(
    urlOrCode: string
  ): Promise<SNComponent | undefined> {
    return this.featuresService.validateAndDownloadExternalFeature(urlOrCode);
  }

  public getFeature(
    featureId: FeatureIdentifier
  ): FeatureDescription | undefined {
    return this.featuresService.getFeature(featureId);
  }

  public getFeatureStatus(featureId: FeatureIdentifier): FeatureStatus {
    return this.featuresService.getFeatureStatus(featureId);
  }

  public hasMinimumRole(role: RoleName): boolean {
    return this.featuresService.hasMinimumRole(role);
  }

  public getNewSubscriptionToken(): Promise<string | undefined> {
    return this.apiService.getNewSubscriptionToken();
  }

  public setOfflineFeaturesCode(
    code: string
  ): Promise<SetOfflineFeaturesFunctionResponse> {
    return this.featuresService.setOfflineFeaturesCode(code);
  }

  public hasOfflineRepo(): boolean {
    return this.featuresService.hasOfflineRepo();
  }

  public async deleteOfflineFeatureRepo(): Promise<void> {
    return this.featuresService.deleteOfflineFeatureRepo();
  }

  public isThirdPartyFeature(identifier: string): boolean {
    return this.featuresService.isThirdPartyFeature(identifier);
  }

  public isThirdPartyHostUsed(): boolean {
    return this.apiService.isThirdPartyHostUsed();
  }

  public getCloudProviderIntegrationUrl(
    cloudProviderName: CloudProvider,
    isDevEnvironment: boolean
  ): string {
    return this.settingsService.getCloudProviderIntegrationUrl(
      cloudProviderName,
      isDevEnvironment
    );
  }

  private constructServices() {
    this.createPayloadManager();
    this.createItemManager();
    this.createStorageManager();
    this.createProtocolService();
    const encryptionDelegate = {
      payloadByEncryptingPayload: this.protocolService.payloadByEncryptingPayload.bind(
        this.protocolService
      ),
      payloadByDecryptingPayload: this.protocolService.payloadByDecryptingPayload.bind(
        this.protocolService
      ),
    };
    this.storageService.encryptionDelegate = encryptionDelegate;
    this.createChallengeService();
    this.createHttpManager();
    this.createApiService();
    this.createWebSocketsService();
    this.createSessionManager();
    this.createHistoryManager();
    this.createSyncManager();
    this.createProtectionService();
    this.createCredentialService();
    this.createKeyRecoveryService();
    this.createSingletonManager();
    this.createPreferencesService();
    this.createSettingsService();
    this.createFeaturesService();
    this.createComponentManager();
    this.createMigrationService();
    this.createMfaService();
    this.createListedService();
    this.createActionsManager();
    this.createFileService();
  }

  private clearServices() {
    (this.migrationService as unknown) = undefined;
    (this.alertService as unknown) = undefined;
    (this.httpService as unknown) = undefined;
    (this.payloadManager as unknown) = undefined;
    (this.protocolService as unknown) = undefined;
    (this.storageService as unknown) = undefined;
    (this.apiService as unknown) = undefined;
    (this.sessionManager as unknown) = undefined;
    (this.syncService as unknown) = undefined;
    (this.challengeService as unknown) = undefined;
    (this.singletonManager as unknown) = undefined;
    (this.componentManager as unknown) = undefined;
    (this.protectionService as unknown) = undefined;
    (this.actionsManager as unknown) = undefined;
    (this.historyManager as unknown) = undefined;
    (this.itemManager as unknown) = undefined;
    (this.keyRecoveryService as unknown) = undefined;
    (this.preferencesService as unknown) = undefined;
    (this.featuresService as unknown) = undefined;
    (this.credentialService as unknown) = undefined;
    (this.webSocketsService as unknown) = undefined;
    (this.settingsService as unknown) = undefined;
    (this.mfaService as unknown) = undefined;
    (this.listedService as unknown) = undefined;
    (this.fileService as unknown) = undefined;

    this.services = [];
  }

  private createListedService(): void {
    this.listedService = new ListedService(
      this.apiService,
      this.itemManager,
      this.settingsService,
      this.httpService
    );
    this.services.push(this.listedService);
  }

  private createFileService() {
    this.fileService = new SNFileService(
      this.apiService,
      this.itemManager,
      this.syncService,
      this.alertService,
      this.options.crypto
    );

    this.services.push(this.fileService);
  }

  private createFeaturesService() {
    this.featuresService = new SNFeaturesService(
      this.storageService,
      this.apiService,
      this.itemManager,
      this.webSocketsService,
      this.settingsService,
      this.credentialService,
      this.syncService,
      this.alertService,
      this.sessionManager,
      this.options.crypto,
      this.options.runtime
    );
    this.serviceObservers.push(
      this.featuresService.addEventObserver((event) => {
        switch (event) {
          case FeaturesEvent.UserRolesChanged: {
            void this.notifyEvent(ApplicationEvent.UserRolesChanged);
            break;
          }
          case FeaturesEvent.FeaturesUpdated: {
            void this.notifyEvent(ApplicationEvent.FeaturesUpdated);
            break;
          }
          default: {
            assertUnreachable(event);
          }
        }
      })
    );
    this.services.push(this.featuresService);
  }

  private createWebSocketsService() {
    this.webSocketsService = new SNWebSocketsService(
      this.storageService,
      this.options.webSocketUrl
    );
    this.services.push(this.webSocketsService);
  }

  private createMigrationService() {
    this.migrationService = new SNMigrationService({
      protocolService: this.protocolService,
      deviceInterface: this.deviceInterface,
      storageService: this.storageService,
      sessionManager: this.sessionManager,
      challengeService: this.challengeService,
      itemManager: this.itemManager,
      singletonManager: this.singletonManager,
      featuresService: this.featuresService,
      environment: this.environment,
      identifier: this.identifier,
    });
    this.services.push(this.migrationService);
  }

  private createCredentialService(): void {
    this.credentialService = new SNCredentialService(
      this.sessionManager,
      this.syncService,
      this.storageService,
      this.itemManager,
      this.protocolService,
      this.alertService,
      this.challengeService,
      this.protectionService
    );
    this.serviceObservers.push(
      this.credentialService.addEventObserver((event) => {
        switch (event) {
          case AccountEvent.SignedInOrRegistered: {
            void this.notifyEvent(ApplicationEvent.SignedIn);
            break;
          }
          default: {
            assertUnreachable(event);
          }
        }
      })
    );
    this.services.push(this.credentialService);
  }

  private createApiService() {
    this.apiService = new SNApiService(
      this.httpService,
      this.storageService,
      this.options.defaultHost,
      this.options.defaultFilesHost
    );
    this.services.push(this.apiService);
  }

  private createItemManager() {
    this.itemManager = new ItemManager(this.payloadManager);
    this.services.push(this.itemManager);
  }

  private createComponentManager() {
    const MaybeSwappedComponentManager = this.getClass<
      typeof SNComponentManager
    >(SNComponentManager);
    this.componentManager = new MaybeSwappedComponentManager(
      this.itemManager,
      this.syncService,
      this.featuresService,
      this.preferencesService,
      this.alertService,
      this.environment,
      this.platform,
      this.options.runtime
    );
    this.services.push(this.componentManager);
  }

  private createHttpManager() {
    this.httpService = new SNHttpService(
      this.environment,
      this.options.appVersion
    );
    this.services.push(this.httpService);
  }

  private createPayloadManager() {
    this.payloadManager = new PayloadManager();
    this.services.push(this.payloadManager);
  }

  private createSingletonManager() {
    this.singletonManager = new SNSingletonManager(
      this.itemManager,
      this.syncService
    );
    this.services.push(this.singletonManager);
  }

  private createStorageManager() {
    this.storageService = new SNStorageService(
      this.deviceInterface,
      this.alertService,
      this.identifier,
      this.environment
    );
    this.services.push(this.storageService);
  }

  private createProtocolService() {
    this.protocolService = new SNProtocolService(
      this.itemManager,
      this.payloadManager,
      this.deviceInterface,
      this.storageService,
      this.identifier,
      this.options.crypto
    );
    this.protocolService.onKeyStatusChange(async () => {
      await this.notifyEvent(ApplicationEvent.KeyStatusChanged);
    });
    this.services.push(this.protocolService);
  }

  private createKeyRecoveryService() {
    this.keyRecoveryService = new SNKeyRecoveryService(
      this.itemManager,
      this.payloadManager,
      this.apiService,
      this.protocolService,
      this.challengeService,
      this.alertService,
      this.storageService,
      this.syncService,
      this.credentialService
    );
    this.services.push(this.keyRecoveryService);
  }

  private createSessionManager() {
    this.sessionManager = new SNSessionManager(
      this.storageService,
      this.apiService,
      this.alertService,
      this.protocolService,
      this.challengeService,
      this.webSocketsService
    );
    this.serviceObservers.push(
      this.sessionManager.addEventObserver(async (event) => {
        switch (event) {
          case SessionEvent.Restored: {
            void (async () => {
              await this.sync();
              if (this.protocolService.needsNewRootKeyBasedItemsKey()) {
                void this.protocolService
                  .createNewDefaultItemsKey()
                  .then(() => {
                    void this.sync();
                  });
              }
            })();
            break;
          }
          case SessionEvent.Revoked: {
            await this.handleRevokedSession();
            break;
          }
          default: {
            assertUnreachable(event);
          }
        }
      })
    );
    this.services.push(this.sessionManager);
  }

  private createSyncManager() {
    this.syncService = new SNSyncService(
      this.itemManager,
      this.sessionManager,
      this.protocolService,
      this.storageService,
      this.payloadManager,
      this.apiService,
      this.historyManager,
      {
        loadBatchSize: this.options.loadBatchSize,
      }
    );
    const syncEventCallback = async (eventName: SyncEvent) => {
      const appEvent = applicationEventForSyncEvent(eventName);
      if (appEvent) {
        await this.notifyEvent(appEvent);
        if (appEvent === ApplicationEvent.CompletedFullSync) {
          if (!this.handledFullSyncStage) {
            this.handledFullSyncStage = true;
            await this.handleStage(ApplicationStage.FullSyncCompleted_13);
          }
        }
      }
      await this.protocolService.onSyncEvent(eventName);
    };
    const uninstall = this.syncService.addEventObserver(syncEventCallback);
    this.serviceObservers.push(uninstall);
    this.services.push(this.syncService);
  }

  private createChallengeService() {
    this.challengeService = new ChallengeService(
      this.storageService,
      this.protocolService
    );
    this.services.push(this.challengeService);
  }

  private createProtectionService() {
    this.protectionService = new SNProtectionService(
      this.protocolService,
      this.challengeService,
      this.storageService,
      this.itemManager
    );
    this.serviceObservers.push(
      this.protectionService.addEventObserver((event) => {
        if (event === ProtectionEvent.UnprotectedSessionBegan) {
          void this.notifyEvent(ApplicationEvent.UnprotectedSessionBegan);
        } else if (event === ProtectionEvent.UnprotectedSessionExpired) {
          void this.notifyEvent(ApplicationEvent.UnprotectedSessionExpired);
        }
      })
    );
    this.services.push(this.protectionService);
  }

  private createHistoryManager() {
    this.historyManager = new SNHistoryManager(
      this.itemManager,
      this.storageService,
      this.apiService,
      this.protocolService,
      this.deviceInterface
    );
    this.services.push(this.historyManager);
  }

  private createActionsManager() {
    this.actionsManager = new SNActionsService(
      this.itemManager,
      this.alertService,
      this.deviceInterface,
      this.httpService,
      this.payloadManager,
      this.protocolService,
      this.syncService,
      this.challengeService,
      this.listedService
    );
    this.services.push(this.actionsManager);
  }

  private createPreferencesService() {
    this.preferencesService = new SNPreferencesService(
      this.singletonManager,
      this.itemManager,
      this.syncService
    );
    this.serviceObservers.push(
      this.preferencesService.addEventObserver(() => {
        void this.notifyEvent(ApplicationEvent.PreferencesChanged);
      })
    );
    this.services.push(this.preferencesService);
  }

  private createSettingsService() {
    this.settingsService = new SNSettingsService(
      this.sessionManager,
      this.apiService
    );
    this.services.push(this.settingsService);
  }

  private createMfaService() {
    this.mfaService = new SNMfaService(
      this.settingsService,
      this.options.crypto,
      this.featuresService
    );
    this.services.push(this.mfaService);
  }

  private getClass<T>(base: T) {
    const swapClass = this.options.swapClasses?.find(
      (candidate) => candidate.swap === base
    );
    if (swapClass) {
      return swapClass.with as T;
    } else {
      return base;
    }
  }
}
