import { TransactionalMutation } from './services/item_manager';
import { FeatureStatus } from './services/features_service';
import { Settings } from './services/settings_service';
import { SyncOpStatus } from './services/sync/sync_op_status';
import { CredentialsChangeFunctionResponse, AccountServiceResponse } from './services/credential_service';
import { NotesDisplayCriteria } from './protocol/collection/notes_display_criteria';
import { CollectionSort, SortDirection } from './protocol/collection/item_collection';
import { PayloadOverride } from './protocol/payloads/generator';
import { ApplicationIdentifier, DeinitSource, UuidString, AnyRecord } from './types';
import { ApplicationEvent } from './events';
import { StorageEncryptionPolicies } from './services/storage_service';
import { BackupFile } from './services/protocol_service';
import { EncryptionIntent } from './protocol/intents';
import { SyncOptions } from './services/sync/sync_service';
import { SNSmartTag } from './models/app/smartTag';
import { ItemMutator, SNItem } from './models/core/item';
import { SNPredicate } from './models/core/predicate';
import { PurePayload } from './protocol/payloads/pure_payload';
import { Challenge, ChallengeReason, ChallengeResponse, ChallengeValue } from './challenges';
import { ChallengeObserver } from './services/challenge/challenge_service';
import { SNPureCrypto } from '@standardnotes/sncrypto-common';
import { Environment, Platform } from './platforms';
import { ContentType } from './models/content_types';
import { PayloadContent } from './protocol/payloads/generator';
import { PayloadSource } from './protocol/payloads/sources';
import { StorageValueModes } from './services/storage_service';
import { SNActionsService, SNAlertService, SNComponentManager, SNHistoryManager, SNProtectionService, SNProtocolService, SNSingletonManager } from './services';
import { DeviceInterface } from './device_interface';
import { PrefKey, PrefValue, SNComponent, SNNote, SNTag } from './models';
import { ProtocolVersion } from './protocol/versions';
import { KeyParamsOrigination } from './protocol/key_params';
import { AvailableSubscriptions, HttpResponse, SignInResponse, User } from './services/api/responses';
import { RemoteSession } from '.';
import { EmailBackupFrequency, SettingName } from '@standardnotes/settings';
import { SensitiveSettingName } from './services/settings_service/SensitiveSettingName';
import { Subscription } from '@standardnotes/auth';
import { FeatureDescription, FeatureIdentifier } from '@standardnotes/features';
import { SetOfflineFeaturesFunctionResponse } from './services/features_service';
declare type LaunchCallback = {
    receiveChallenge: (challenge: Challenge) => void;
};
declare type ApplicationEventCallback = (event: ApplicationEvent, data?: unknown) => Promise<void>;
declare type ItemStream = (items: SNItem[], source: PayloadSource) => void;
/** The main entrypoint of an application. */
export declare class SNApplication {
    environment: Environment;
    platform: Platform;
    deviceInterface: DeviceInterface;
    private crypto;
    alertService: SNAlertService;
    identifier: ApplicationIdentifier;
    private swapClasses;
    private defaultHost;
    private appVersion;
    private enableV4;
    private webSocketUrl?;
    private onDeinit?;
    private migrationService;
    private httpService;
    private payloadManager;
    protocolService: SNProtocolService;
    private storageService;
    private apiService;
    private sessionManager;
    private syncService;
    private challengeService;
    singletonManager: SNSingletonManager;
    componentManager: SNComponentManager;
    protectionService: SNProtectionService;
    actionsManager: SNActionsService;
    historyManager: SNHistoryManager;
    private itemManager;
    private keyRecoveryService;
    private preferencesService;
    private featuresService;
    private credentialService;
    private webSocketsService;
    private settingsService;
    private mfaService;
    private eventHandlers;
    private services;
    private streamRemovers;
    private serviceObservers;
    private managedSubscribers;
    private autoSyncInterval;
    /** True if the result of deviceInterface.openDatabase yields a new database being created */
    private createdNewDatabase;
    /** True if the application has started (but not necessarily launched) */
    private started;
    /** True if the application has launched */
    private launched;
    /** Whether the application has been destroyed via .deinit() */
    private dealloced;
    private revokingSession;
    private handledFullSyncStage;
    /**
     * @param environment The Environment that identifies your application.
     * @param platform The Platform that identifies your application.
     * @param deviceInterface The device interface that provides platform specific
     * utilities that are used to read/write raw values from/to the database or value storage.
     * @param crypto The platform-dependent implementation of SNPureCrypto to use.
     * Web uses SNWebCrypto, mobile uses SNReactNativeCrypto.
     * @param alertService The platform-dependent implementation of alert service.
     * @param identifier A unique identifier to namespace storage and other
     * persistent properties. This parameter is kept for backward compatibility and/or in case
     * you don't want SNNamespaceService to assign a dynamic namespace for you.
     * @param swapClasses Gives consumers the ability to provide their own custom
     * subclass for a service. swapClasses should be an array of key/value pairs
     * consisting of keys 'swap' and 'with'. 'swap' is the base class you wish to replace,
     * and 'with' is the custom subclass to use.
     * @param skipClasses An array of classes to skip making services for.
     * @param defaultHost Default host to use in ApiService.
     * @param appVersion Version of client application.
     * @param enableV4 Flag indicating whether V4 features should be enabled.
     * @param webSocketUrl URL for WebSocket providing permissions and roles information.
     */
    constructor(environment: Environment, platform: Platform, deviceInterface: DeviceInterface, crypto: SNPureCrypto, alertService: SNAlertService, identifier: ApplicationIdentifier, swapClasses: {
        swap: any;
        with: any;
    }[], defaultHost: string, appVersion: string, enableV4?: boolean, webSocketUrl?: string | undefined);
    /**
     * The first thing consumers should call when starting their app.
     * This function will load all services in their correct order.
     */
    prepareForLaunch(callback: LaunchCallback): Promise<void>;
    private setLaunchCallback;
    /**
     * Handles device authentication, unlocks application, and
     * issues a callback if a device activation requires user input
     * (i.e local passcode or fingerprint).
     * @param awaitDatabaseLoad
     * Option to await database load before marking the app as ready.
     */
    launch(awaitDatabaseLoad?: boolean): Promise<void>;
    onStart(): void;
    onLaunch(): void;
    getLaunchChallenge(): Challenge | undefined;
    private handleLaunchChallengeResponse;
    private beginAutoSyncTimer;
    private handleStage;
    /**
     * @param singleEvent Whether to only listen for a particular event.
     */
    addEventObserver(callback: ApplicationEventCallback, singleEvent?: ApplicationEvent): () => void;
    addSingleEventObserver(event: ApplicationEvent, callback: ApplicationEventCallback): () => void;
    private notifyEvent;
    /**
     * Whether the local database has completed loading local items.
     */
    isDatabaseLoaded(): boolean;
    savePayload(payload: PurePayload): Promise<void>;
    /**
     * Finds an item by UUID.
     */
    findItem(uuid: string): SNItem | undefined;
    /**
     * Returns all items.
     */
    allItems(): SNItem[];
    /**
     * Finds an item by predicate.
     */
    findItems(predicate: SNPredicate): SNItem[];
    /**
     * Finds an item by predicate.
     */
    getAll(uuids: UuidString[]): (SNItem | PurePayload | undefined)[];
    /**
     * Takes the values of the input item and emits it onto global state.
     */
    mergeItem(item: SNItem, source: PayloadSource): Promise<SNItem>;
    /**
     * Creates a managed item.
     * @param needsSync  Whether to mark the item as needing sync. `add` must also be true.
     */
    createManagedItem(contentType: ContentType, content: PayloadContent, needsSync?: boolean, override?: PayloadOverride): Promise<SNItem>;
    /**
     * Creates an unmanaged item that can be added later.
     */
    createTemplateItem(contentType: ContentType, content?: PayloadContent): Promise<SNItem>;
    /**
     * @param item item to be checked
     * @returns Whether the item is a template (unmanaged)
     */
    isTemplateItem(item: SNItem): boolean;
    /**
     * Creates an unmanaged item from a payload.
     */
    createItemFromPayload(payload: PurePayload): SNItem;
    /**
     * Creates an unmanaged payload from any object, where the raw object
     * represents the same data a payload would.
     */
    createPayloadFromObject(object: AnyRecord): PurePayload;
    /**
     * @returns The date of last sync
     */
    getLastSyncDate(): Date | undefined;
    getSyncStatus(): SyncOpStatus;
    getSessions(): Promise<(HttpResponse & {
        data: RemoteSession[];
    }) | HttpResponse>;
    revokeSession(sessionId: UuidString): Promise<HttpResponse | undefined>;
    /**
     * Revokes all sessions except the current one.
     */
    revokeAllOtherSessions(): Promise<void>;
    userCanManageSessions(): Promise<boolean>;
    getUserSubscription(): Promise<Subscription | undefined>;
    getAvailableSubscriptions(): Promise<AvailableSubscriptions | undefined>;
    /**
     * @param isUserModified  Whether to change the modified date the user
     * sees of the item.
     */
    setItemNeedsSync(item: SNItem, isUserModified?: boolean): Promise<SNItem | undefined>;
    setItemsNeedsSync(items: SNItem[]): Promise<(SNItem | undefined)[]>;
    deleteItem(item: SNItem): Promise<void>;
    emptyTrash(): Promise<void>;
    getTrashedItems(): SNNote[];
    setDisplayOptions<T extends SNItem>(contentType: ContentType, sortBy?: CollectionSort, direction?: SortDirection, filter?: (element: T) => boolean): void;
    setNotesDisplayCriteria(criteria: NotesDisplayCriteria): void;
    getDisplayableItems(contentType: ContentType): SNItem[];
    /**
     * Inserts the input item by its payload properties, and marks the item as dirty.
     * A sync is not performed after an item is inserted. This must be handled by the caller.
     */
    insertItem(item: SNItem): Promise<SNItem>;
    /**
     * Saves the item by uuid by finding it, setting it as dirty if its not already,
     * and performing a sync request.
     */
    saveItem(uuid: UuidString): Promise<void>;
    /**
     * Mutates a pre-existing item, marks it as dirty, and syncs it
     */
    changeAndSaveItem<M extends ItemMutator = ItemMutator>(uuid: UuidString, mutate?: (mutator: M) => void, isUserModified?: boolean, payloadSource?: PayloadSource, syncOptions?: SyncOptions): Promise<SNItem | undefined>;
    /**
     * Mutates pre-existing items, marks them as dirty, and syncs
     */
    changeAndSaveItems<M extends ItemMutator = ItemMutator>(uuids: UuidString[], mutate?: (mutator: M) => void, isUserModified?: boolean, payloadSource?: PayloadSource, syncOptions?: SyncOptions): Promise<void>;
    /**
     * Mutates a pre-existing item and marks it as dirty. Does not sync changes.
     */
    changeItem<M extends ItemMutator>(uuid: UuidString, mutate?: (mutator: M) => void, isUserModified?: boolean): Promise<SNItem | undefined>;
    /**
     * Mutates a pre-existing items and marks them as dirty. Does not sync changes.
     */
    changeItems<M extends ItemMutator = ItemMutator>(uuids: UuidString[], mutate?: (mutator: M) => void, isUserModified?: boolean): Promise<(SNItem | undefined)[]>;
    /**
     * Run unique mutations per each item in the array, then only propagate all changes
     * once all mutations have been run. This differs from `changeItems` in that changeItems
     * runs the same mutation on all items.
     */
    runTransactionalMutations(transactions: TransactionalMutation[], payloadSource?: PayloadSource, payloadSourceKey?: string): Promise<(SNItem | undefined)[]>;
    runTransactionalMutation(transaction: TransactionalMutation, payloadSource?: PayloadSource, payloadSourceKey?: string): Promise<SNItem | undefined>;
    protectNote(note: SNNote): Promise<SNNote>;
    unprotectNote(note: SNNote): Promise<SNNote | undefined>;
    authorizeProtectedActionForNotes(notes: SNNote[], challengeReason: ChallengeReason): Promise<SNNote[]>;
    protectNotes(notes: SNNote[]): Promise<SNNote[]>;
    unprotectNotes(notes: SNNote[]): Promise<SNNote[]>;
    getItems(contentType: ContentType | ContentType[], nonerroredOnly?: boolean): SNItem[];
    notesMatchingSmartTag(smartTag: SNSmartTag): SNNote[];
    /** Returns an item's direct references */
    referencesForItem(item: SNItem, contentType?: ContentType): SNItem[];
    /** Returns items referencing an item */
    referencingForItem(item: SNItem, contentType?: ContentType): SNItem[];
    duplicateItem<T extends SNItem>(item: T, additionalContent?: Partial<PayloadContent>): Promise<T>;
    findTagByTitle(title: string): SNTag | undefined;
    /**
     * Finds tags with title or component starting with a search query and (optionally) not associated with a note
     * @param searchQuery - The query string to match
     * @param note - The note whose tags should be omitted from results
     * @returns Array containing tags matching search query and not associated with note
     */
    searchTags(searchQuery: string, note?: SNNote): SNTag[];
    isValidTagParent(parentTagUuid: UuidString, childTagUuid: UuidString): boolean;
    /**
     * Establishes a hierarchical relationship between two tags.
     */
    setTagParent(parentTag: SNTag, childTag: SNTag): Promise<void>;
    /**
     * Remove the tag parent.
     */
    unsetTagParent(childTag: SNTag): Promise<void>;
    /**
     * Returns the parent for a tag
     * @param tag - The tag for which parents need to be found
     * @returns The current parent or undefined
     */
    getTagParent(tag: SNTag): SNTag | undefined;
    /**
     * Returns the hierarchy of parents for a tag
     * @param tag - The tag for which parents need to be found
     * @returns Array containing all parent tags
     */
    getTagParentChain(tag: SNTag): SNTag[];
    /**
     * Returns all descendants for a tag
     * @param tag - The tag for which descendants need to be found
     * @returns Array containing all descendant tags
     */
    getTagChildren(tag: SNTag): SNTag[];
    /**
     * Get tags for a note sorted in natural order
     * @param note - The note whose tags will be returned
     * @returns Array containing tags associated with a note
     */
    getSortedTagsForNote(note: SNNote): SNTag[];
    /**
     * Add a tag and all its parent to a note.
     *
     * @param note The note assigned to a tag
     * @param tagUuid The tag we'll assign to the note
     */
    addTagHierarchyToNote(note: SNNote, tag: SNTag): Promise<SNTag[]>;
    findOrCreateTag(title: string): Promise<SNTag>;
    createTagOrSmartTag(title: string): Promise<SNTag | SNSmartTag>;
    isSmartTagTitle(title: string): boolean;
    getSmartTags(): SNSmartTag[];
    getNoteCount(): number;
    /**
     * Begin streaming items to display in the UI. The stream callback will be called
     * immediately with the present items that match the constraint, and over time whenever
     * items matching the constraint are added, changed, or deleted.
     */
    streamItems(contentType: ContentType | ContentType[], stream: ItemStream): () => void;
    /**
     * Activates or deactivates a component, depending on its
     * current state, and syncs.
     */
    toggleComponent(component: SNComponent): Promise<void>;
    toggleTheme(theme: SNComponent): Promise<void>;
    /**
     * Set the server's URL
     */
    setHost(host: string): Promise<void>;
    getHost(): string | undefined;
    setCustomHost(host: string): Promise<void>;
    getUser(): User | undefined;
    getUserPasswordCreationDate(): Date | undefined;
    getProtocolEncryptionDisplayName(): Promise<string | undefined>;
    getUserVersion(): Promise<ProtocolVersion | undefined>;
    /**
     * Returns true if there is an upgrade available for the account or passcode
     */
    protocolUpgradeAvailable(): Promise<boolean>;
    /**
     * Returns true if there is an encryption source available
     */
    isEncryptionAvailable(): boolean;
    upgradeProtocolVersion(): Promise<{
        success?: true;
        canceled?: true;
        error?: {
            message: string;
        };
    }>;
    noAccount(): boolean;
    hasAccount(): boolean;
    /**
     * @returns true if the user has a source of protection available, such as a
     * passcode, password, or biometrics.
     */
    hasProtectionSources(): boolean;
    hasUnprotectedAccessSession(): boolean;
    /**
     * When a user specifies a non-zero remember duration on a protection
     * challenge, a session will be started during which protections are disabled.
     */
    getProtectionSessionExpiryDate(): Date;
    clearProtectionSession(): Promise<void>;
    /**
     * @returns whether note access has been granted or not
     */
    authorizeNoteAccess(note: SNNote): Promise<boolean>;
    authorizeAutolockIntervalChange(): Promise<boolean>;
    authorizeCloudLinkAccess(): Promise<boolean>;
    authorizeSearchingProtectedNotesText(): Promise<boolean>;
    /**
     * @returns
     * .affectedItems: Items that were either created or dirtied by this import
     * .errorCount: The number of items that were not imported due to failure to decrypt.
     */
    importData(data: BackupFile, awaitSync?: boolean): Promise<{
        affectedItems: SNItem[];
        errorCount: number;
    } | {
        error: string;
    } | undefined>;
    /**
     * Creates a JSON-stringifiable backup object of all items.
     */
    createBackupFile(intent: EncryptionIntent, authorizeEncrypted?: boolean): Promise<BackupFile | undefined>;
    isEphemeralSession(): boolean;
    sync(options?: SyncOptions): Promise<any>;
    isOutOfSync(): boolean;
    resolveOutOfSync(): Promise<unknown>;
    setValue(key: string, value: unknown, mode?: StorageValueModes): Promise<void>;
    getValue(key: string, mode?: StorageValueModes): unknown;
    removeValue(key: string, mode?: StorageValueModes): Promise<void>;
    getPreference<K extends PrefKey>(key: K): PrefValue[K] | undefined;
    getPreference<K extends PrefKey>(key: K, defaultValue: PrefValue[K]): PrefValue[K];
    setPreference<K extends PrefKey>(key: K, value: PrefValue[K]): Promise<void>;
    /**
     * Gives services a chance to complete any sensitive operations before yielding
     * @param maxWait The maximum number of milliseconds to wait for services
     * to finish tasks. 0 means no limit.
     */
    prepareForDeinit(maxWait?: number): Promise<void>;
    promptForCustomChallenge(challenge: Challenge): Promise<ChallengeResponse | undefined>;
    addChallengeObserver(challenge: Challenge, observer: ChallengeObserver): () => void;
    submitValuesForChallenge(challenge: Challenge, values: ChallengeValue[]): Promise<void>;
    cancelChallenge(challenge: Challenge): void;
    /** Set a function to be called when this application deinits */
    setOnDeinit(onDeinit: (app: SNApplication, source: DeinitSource) => void): void;
    /**
     * Destroys the application instance.
     */
    deinit(source: DeinitSource): void;
    /**
     *  @param mergeLocal  Whether to merge existing offline data into account. If false,
     *                     any pre-existing data will be fully deleted upon success.
     */
    register(email: string, password: string, ephemeral?: boolean, mergeLocal?: boolean): Promise<AccountServiceResponse>;
    /**
     * @param mergeLocal  Whether to merge existing offline data into account.
     * If false, any pre-existing data will be fully deleted upon success.
     */
    signIn(email: string, password: string, strict?: boolean, ephemeral?: boolean, mergeLocal?: boolean, awaitSync?: boolean): Promise<HttpResponse | SignInResponse>;
    changeEmail(newEmail: string, currentPassword: string, passcode?: string, origination?: KeyParamsOrigination): Promise<CredentialsChangeFunctionResponse>;
    changePassword(currentPassword: string, newPassword: string, passcode?: string, origination?: KeyParamsOrigination, validateNewPasswordStrength?: boolean): Promise<CredentialsChangeFunctionResponse>;
    signOut(force?: boolean): Promise<void>;
    private handleRevokedSession;
    validateAccountPassword(password: string): Promise<boolean>;
    isStarted(): boolean;
    isLaunched(): boolean;
    hasBiometrics(): boolean;
    /**
     * @returns whether the operation was successful or not
     */
    enableBiometrics(): Promise<boolean>;
    /**
     * @returns whether the operation was successful or not
     */
    disableBiometrics(): Promise<boolean>;
    hasPasscode(): boolean;
    isLocked(): Promise<boolean>;
    lock(): Promise<void>;
    addPasscode(passcode: string): Promise<boolean>;
    /**
     * @returns whether the passcode was successfuly removed
     */
    removePasscode(): Promise<boolean>;
    changePasscode(newPasscode: string, origination?: KeyParamsOrigination): Promise<boolean>;
    getStorageEncryptionPolicy(): StorageEncryptionPolicies;
    setStorageEncryptionPolicy(encryptionPolicy: StorageEncryptionPolicies): Promise<void>;
    enableEphemeralPersistencePolicy(): Promise<void>;
    hasPendingMigrations(): Promise<boolean>;
    generateUuid(): Promise<string>;
    presentKeyRecoveryWizard(): Promise<void>;
    /**
     * Dynamically change the device interface, i.e when Desktop wants to override
     * default web interface.
     */
    changeDeviceInterface(deviceInterface: DeviceInterface): void;
    listSettings(): Promise<Partial<Settings>>;
    getSetting(name: SettingName): Promise<string | null>;
    getSensitiveSetting(name: SensitiveSettingName): Promise<boolean>;
    updateSetting(name: SettingName, payload: string, sensitive?: boolean): Promise<void>;
    deleteSetting(name: SettingName): Promise<void>;
    getEmailBackupFrequencyOptionLabel(frequency: EmailBackupFrequency): string;
    isMfaFeatureAvailable(): boolean;
    isMfaActivated(): Promise<boolean>;
    generateMfaSecret(): Promise<string>;
    getOtpToken(secret: string): Promise<string>;
    enableMfa(secret: string, otpToken: string): Promise<void>;
    disableMfa(): Promise<void>;
    downloadExternalFeature(urlOrCode: string): Promise<SNComponent | undefined>;
    getFeature(featureId: FeatureIdentifier): FeatureDescription | undefined;
    getFeatureStatus(featureId: FeatureIdentifier): FeatureStatus;
    getNewSubscriptionToken(): Promise<string | undefined>;
    setOfflineFeaturesCode(code: string): Promise<SetOfflineFeaturesFunctionResponse>;
    hasOfflineRepo(): boolean;
    deleteOfflineFeatureRepo(): Promise<void>;
    isThirdPartyHostUsed(): boolean;
    private constructServices;
    private clearServices;
    private createFeaturesService;
    private createWebSocketsService;
    private createMigrationService;
    private createCredentialService;
    private createApiService;
    private createItemManager;
    private createComponentManager;
    private createHttpManager;
    private createPayloadManager;
    private createSingletonManager;
    private createStorageManager;
    private createProtocolService;
    private createKeyRecoveryService;
    private createSessionManager;
    private createSyncManager;
    private createChallengeService;
    private createProtectionService;
    private createHistoryManager;
    private createActionsManager;
    private createPreferencesService;
    private createSettingsService;
    private createMfaService;
    private getClass;
}
export {};
