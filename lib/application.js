import { removeFromArray, isNullOrUndefined } from '@Lib/utils';
import { ContentTypes } from '@Models/content_types';
import { CopyPayload, CreateMaxPayloadFromAnyObject } from '@Payloads/generator';
import { PayloadSources } from '@Payloads/sources';
import { CreateItemFromPayload } from '@Models/generator';
import {
  ApplicationEvents,
  ApplicationStages,
  applicationEventForSyncEvent,
  ChallengeType,
  ChallengeReason,
  Challenge
} from '@Lib';
import { StoragePersistencePolicies } from '@Services';
import {
  SNMigrationService,
  SNActionsService,
  SNApiService,
  SNModelManager,
  SNProtocolService,
  SNPrivilegesService,
  SNHistoryManager,
  SNAlertService,
  SNSessionManager,
  SNComponentManager,
  SNHttpService,
  SNSingletonManager,
  SNStorageService,
  SNSyncService,
  ChallengeService,
  SyncModes,
  TIMING_STRATEGY_FORCE_SPAWN_NEW
} from './services';

/** How often to automatically sync, in milliseconds */
const DEFAULT_AUTO_SYNC_INTERVAL = 30000;

/** The main entrypoint of an application. */
export class SNApplication {
  /**
   * @param {object} params
   * @param {Environments} params.environment
      Required - The Environment that identifies your application.
   * @param {Platforms} params.platform
      Required - The Platform that identifies your application.
   * @param {string} params.namespace
      Optional - a unique identifier to namespace storage and
      other persistent properties. Defaults to empty string.
   * @param {DeviceInterface} params.deviceInterface
      A DeviceInterface object.
   * @param {array} params.swapClasses
      Gives consumers the ability to provide their own custom
      subclass for a service. swapClasses should be an array
      of key/value pairs consisting of keys 'swap' and 'with'.
      'swap' is the base class you wish to replace, and 'with'
      is the custom subclass to use.
   * @param {array} params.skipClasses
      An optional array of classes to skip making services for.
   * @param {SNCrypto} params.crypto
      The platform-dependent instance of SNCrypto to use.
      Web uses SNWebCrypto, mobile uses SNReactNativeCrypto.
   */
  constructor({
    environment,
    platform,
    namespace,
    deviceInterface,
    swapClasses,
    skipClasses,
    crypto
  } = {}) {
    if (!deviceInterface) {
      throw 'Device Interface must be supplied.';
    }
    if (!environment) {
      throw 'Environment must be supplied when creating an application.';
    }
    if (!platform) {
      throw 'Platform must be supplied when creating an application.';
    }
    this.environment = environment;
    this.platform = platform;
    this.namespace = namespace || '';
    this.deviceInterface = deviceInterface;
    this.crypto = crypto;
    this.swapClasses = swapClasses;
    this.skipClasses = skipClasses;
    this.eventHandlers = [];
    this.services = [];
    this.streamObservers = [];
    this.serviceObservers = [];
    this.managedSubscribers = [];
    this.constructServices();
  }

  /**
   * The first thing consumers should call when starting their app.
   * This function will load all services in their correct order.
   * @access public
   * @param {object} params
   * @param {object} params.callbacks
   * @param {async|function} params.callbacks.receiveChallenge
   * Return an array of ChallengeResponse for each Challenge.
   * @param {Array.<Challenge>} params.callbacks.receiveChallenge.challenges  
   * An array of challenges that need a ChallengeResponse.
   */
  async prepareForLaunch({ callbacks }) {
    if (!callbacks.receiveChallenge) {
      throw 'Application.launch callbacks are not properly configured.';
    }
    this.setLaunchCallbacks(callbacks);
    const databaseResult = await this.deviceInterface.openDatabase().catch((error) => {
      this.notifyEvent(ApplicationEvents.LocalDatabaseReadError, error);
    });
    this.createdNewDatabase = databaseResult && databaseResult.isNewDatabase;
    await this.migrationService.initialize();
    await this.handleStage(ApplicationStages.PreparingForLaunch_0);
    await this.storageService.initializeFromDisk();
    await this.protocolService.initialize();
    await this.handleStage(ApplicationStages.ReadyForLaunch_05);
    this.started = true;
    await this.notifyEvent(ApplicationEvents.Started);
  }

  /** @access public */
  setLaunchCallbacks(callbacks) {
    this.launchCallbacks = callbacks;
    this.challengeService.challengeHandler = callbacks.receiveChallenge;
  }

  /**
   * Runs migrations, handles device authentication, unlocks application, and
   * issues a callback if a device activation requires user input
   * (i.e local passcode or fingerprint).
   * @access public
   * @param {bool} params.awaitDatabaseLoad  Option to await database load before marking the app 
   *                           as ready. Used as far as we know for .restart and unit tests.
   */
  async launch({ awaitDatabaseLoad } = {}) {
    this.launched = false;
    const launchChallenge = await this.challengeService.getLaunchChallenge();
    if (launchChallenge) {
      const response = await this.challengeService.promptForChallengeResponse(launchChallenge);
      await this.handleLaunchChallengeResponse(response);
    }

    if (await this.storageService.isStorageWrapped()) {
      await this.storageService.decryptStorage();
    }
    await this.handleStage(ApplicationStages.StorageDecrypted_09);
    await this.apiService.loadHost();
    await this.sessionManager.initializeFromDisk();
    this.historyManager.initializeFromDisk();

    this.launched = true;
    await this.notifyEvent(ApplicationEvents.Launched);
    await this.handleStage(ApplicationStages.Launched_10);

    const databasePayloads = await this.syncService.getDatabasePayloads();
    await this.handleStage(ApplicationStages.LoadingDatabase_11);

    if (this.createdNewDatabase) {
      await this.syncService.onNewDatabaseCreated();
    }
    /**
    * We don't want to await this, as we want to begin allowing the app to function
    * before local data has been loaded fully. We await only initial
    * `getDatabasePayloads` to lock in on database state.
    */
    const loadPromise = this.syncService.loadDatabasePayloads(databasePayloads)
      .then(async () => {
        if (this.dealloced) {
          throw 'Application has been destroyed.';
        }
        await this.handleStage(ApplicationStages.LoadedDatabase_12);
        this.beginAutoSyncTimer();
        return this.syncService.sync({
          mode: SyncModes.DownloadFirst
        });
      });
    if (awaitDatabaseLoad) {
      await loadPromise;
    }
  }

  async handleLaunchChallengeResponse(response) {
    if (response.challenge.types.includes(ChallengeType.LocalPasscode)) {
      let wrappingKey = response.artifacts.wrappingKey;
      if (!wrappingKey) {
        wrappingKey = await this.protocolService.computeWrappingKey(response.value);
      }
      await this.protocolService.unwrapRootKey(wrappingKey);
    }
  }

  /**
   * @access private
   */
  beginAutoSyncTimer() {
    this.autoSyncInterval = this.deviceInterface.interval(() => {
      this.syncService.log('Syncing from autosync');
      this.sync();
    }, DEFAULT_AUTO_SYNC_INTERVAL);
  }

  /** 
   * The migrations service is initialized with this function, so that it can retrieve
   * raw challenge values as necessary.
   * @access private 
   */
  getMigrationChallengeResponder() {
    return async (challenge, validate, orchestratorFill) => {
      return this.challengeService.promptForChallengeResponse(challenge, validate, orchestratorFill);
    };
  }

  /** @access private */
  async handleStage(stage) {
    for (const service of this.services) {
      await service.handleApplicationStage(stage);
    }
  }

  /** 
   * @access public
   * @param {function} callback
   * @param {ApplicationEvent} [singleEvent]  Whether to only listen for a particular event.
   */
  addEventObserver(callback, singleEvent) {
    const observer = { callback, singleEvent };
    this.eventHandlers.push(observer);
    return () => {
      removeFromArray(this.eventHandlers, observer);
    };
  }

  /**
  * @access public
  * @param {ApplicationEvent} singleEvent  Event to listen for.
  * @param {function} callback
  */
  addSingleEventObserver(event, callback) {
    return this.addEventObserver((firedEvent) => {
      if (firedEvent === event) {
        callback();
      }
    }, event);
  }

  /** @access private */
  async notifyEvent(event, data) {
    for (const observer of this.eventHandlers.slice()) {
      if (observer.singleEvent && observer.singleEvent === event) {
        await observer.callback(event, data || {});
      } else if (!observer.singleEvent) {
        await observer.callback(event, data || {});
      }
    }
  }

  /** 
   * Whether the local database has completed loading local items.
   * @access public 
   */
  isDatabaseLoaded() {
    return this.syncService.isDatabaseLoaded();
  }

  /** @access public */
  async savePayload({ payload }) {
    const dirtied = CopyPayload(
      payload,
      {
        dirty: true
      }
    );
    await this.modelManager.mapPayloadToLocalItem(
      dirtied,
      PayloadSources.LocalChanged
    );
    await this.syncService.sync();
  }

  /** 
   * Finds an item by UUID.
   * @access public 
   * @param uuid  The uuid of the item to find.
   */
  findItem({ uuid }) {
    return this.modelManager.findItem(uuid);
  }

  /** 
   * Finds an item by predicate.
  * @access public 
  */
  findItems({ predicate }) {
    return this.modelManager.itemsMatchingPredicate(predicate);
  }

  /** @access public */
  async mergeItem({ item, source }) {
    return this.modelManager.mapItem(item, source);
  }

  /** 
   * Creates a managed item.
   * @access public 
   * @param needsSync  Whether to mark the item as needing sync. `add` must also be true.
   */
  async createManagedItem({ contentType, content, needsSync, override }) {
    const item = await this.modelManager.createItem(
      contentType,
      content,
      true,
      needsSync,
      override
    );
    return item;
  }

  /** 
   * Creates an unmanaged item that can be added later.
   * @access public 
   * @param needsSync  Whether to mark the item as needing sync. `add` must also be true.
   */
  async createTemplateItem({ contentType, content }) {
    const item = await this.modelManager.createItem(
      contentType,
      content,
    );
    return item;
  }

  /** 
   * Creates an unmanaged item from a payload.
   * @access public
   */
  createItemFromPayload(payload) {
    return CreateItemFromPayload(payload);
  }

  /** 
   * Creates an unmanaged payload from any object, where the raw object
   * represents the same data a payload would.
   * @access public
   */
  createPayloadFromObject(object) {
    return CreateMaxPayloadFromAnyObject(object);
  }


  /** @access public */
  async saveItem({ item }) {
    await this.modelManager.setItemDirty(item, true);
    await this.syncService.sync();
  }

  /** 
   * @access public 
   * @param {Array.<SNItem>} params.items
   */
  async saveItems({ items }) {
    await this.modelManager.setItemsDirty(items);
    await this.syncService.sync();
  }

  /** 
   * @access public 
   * @param {SNItem} params.item
   * @param {bool} params.updateUserModifiedDate  Whether to change the modified date the user 
   * sees of the item.
   */
  async setItemNeedsSync({ item, updateUserModifiedDate }) {
    return this.modelManager.setItemDirty(item, true, updateUserModifiedDate);
  }

  /**
   * @access public
   * @returns {Date|null} The date of last sync
   */
  getLastSyncDate() {
    return this.syncService.getLastSyncDate();
  }

  /**
   * @access public
   * @returns {SyncOpStatus}
   */
  getSyncStatus() {
    return this.syncService.getStatus();
  }

  /** 
   * @access public 
   * @param updateUserModifiedDate  
   *  Whether to change the modified date the user sees of the item.
   */
  async setItemsNeedsSync({ items }) {
    return this.modelManager.setItemsDirty(items);
  }

  /** @access public */
  async deleteItem({ item }) {
    await this.modelManager.setItemToBeDeleted(item);
    return this.sync();
  }

  /** @access public */
  async deleteItemLocally({ item }) {
    this.modelManager.removeItemLocally(item);
  }

  /** @access public */
  async emptyTrash() {
    await this.modelManager.emptyTrash();
    return this.sync();
  }

  /** @access public */
  getTrashedItems() {
    return this.modelManager.trashedItems();
  }

  /** 
   * @access public 
   * @param {string|ContentType} contentType  A string, array of strings, or '*'
   */
  getItems({ contentType }) {
    return this.modelManager.getItems(contentType);
  }

  /** @access public */
  getDisplayableItems({ contentType }) {
    return this.modelManager.validItemsForContentType(contentType);
  }

  /** @access public */
  getNotesMatchingSmartTag({ smartTag }) {
    return this.modelManager.notesMatchingSmartTag(smartTag);
  }

  /** @access public */
  findTag({ title }) {
    return this.modelManager.findTagByTitle(title);
  }

  /** @access public */
  async findOrCreateTag({ title }) {
    return this.modelManager.findOrCreateTagByTitle(title);
  }

  /** @access public */
  getSmartTags() {
    return this.modelManager.getSmartTags();
  }

  /** @access public */
  getNoteCount() {
    return this.modelManager.noteCount();
  }


  /** 
   * Begin streaming items to display in the UI.
   * @access public 
   * @param contentType  Can be string, '*', or array of types.
   */
  streamItems({ contentType, stream }) {
    const observer = this.modelManager.addMappingObserver(
      contentType,
      (allItems, _, __, source, sourceKey) => {
        const includedContentTypes = allItems.map((item) => item.content_type);
        stream({
          items: allItems,
          contentTypes: includedContentTypes,
          source: source,
          sourceKey: sourceKey
        });
      }
    );
    this.streamObservers.push(observer);
    return () => {
      observer();
      removeFromArray(this.streamObservers, observer);
    };
  }

  /** 
   * Set the server's URL
   * @access public 
   */
  async setHost(host) {
    return this.apiService.setHost(host);
  }

  /** @access public */
  async getHost() {
    return this.apiService.getHost();
  }

  /** @access public */
  getUser() {
    if (!this.launched) {
      throw 'Attempting to access user before application unlocked';
    }
    return this.sessionManager.getUser();
  }

  /** @access public */
  async getUserVersion() {
    return this.protocolService.getUserVersion();
  }

  /**
   * Returns true if there is an upgrade available for the account or passcode
   * @access public
   */
  async protocolUpgradeAvailable() {
    return this.protocolService.upgradeAvailable();
  }

  /**
   * Returns true if there is an encryption source available
   * @access public
   * @returns {boolean}
   */
  async isEncryptionAvailable() {
    return !isNullOrUndefined(this.getUser()) || this.hasPasscode();
  }

  /** 
   * @access public 
   * @returns {Array.<object>} An array of errors, if any.
   */
  async upgradeProtocolVersion() {
    const hasPasscode = this.hasPasscode();
    const hasAccount = !this.noAccount();
    const types = [];
    if (hasPasscode) {
      types.push(ChallengeType.LocalPasscode);
    }
    if (hasAccount) {
      types.push(ChallengeType.AccountPassword);
    }
    const challenge = new Challenge(types, ChallengeReason.ProtocolUpgrade);
    const response = await this.challengeService.promptForChallengeResponse(challenge);
    if (!response) {
      return;
    }
    const errors = [];
    let passcode;
    if (hasPasscode) {
      /* Upgrade passcode version */
      const value = response.getValueForType(ChallengeType.LocalPasscode);
      passcode = value.value;
      await this.changePasscode(passcode);
    }
    if (hasAccount) {
      /* Upgrade account version */
      const value = response.getValueForType(ChallengeType.AccountPassword);
      const password = value.value;
      const changeResponse = await this.changePassword({
        currentPassword: password,
        newPassword: password,
        passcode: passcode
      });
      if (changeResponse.error) {
        errors.push(changeResponse.error);
      }
    }
    return errors;
  }

  /** @access public */
  noAccount() {
    const user = this.getUser();
    return isNullOrUndefined(user);
  }

  /** 
   * @access public 
   * @param {object} params.data
   * @param {string} params.password
   * @param {bool} [params.awaitSync = false]
   * @returns {Object}  result
   * @returns {Array.<SNItem>} result.affectedItems  Items that were either created
   *          or dirtied by this import
   * @returns {int} result.errorCount  The number of items
   *          that were not imported due to failure to decrypt.
   */
  async importData({ data, password, awaitSync }) {
    const decryptedPayloads = await this.protocolService.payloadsByDecryptingBackupFile(
      data,
      password
    );
    const validPayloads = decryptedPayloads.filter((payload) => {
      return !payload.errorDecrypting;
    });
    const affectedItems = await this.modelManager.importPayloads(validPayloads);
    const promise = this.sync();
    if (awaitSync) {
      await promise;
    }
    return {
      affectedItems: affectedItems,
      errorCount: decryptedPayloads.length - validPayloads.length
    };
  }

  /**
   * Creates a JSON string representing the backup format of all items, or just subItems
   * if supplied.
   * @access public
   */
  async createBackupFile({ subItems, intent, returnIfEmpty } = {}) {
    return this.protocolService.createBackupFile(subItems, intent, returnIfEmpty);
  }

  /** @access public */
  isEphemeralSession() {
    return this.storageService.isEphemeralSession();
  }

  /** @access private */
  lockSyncing() {
    this.syncService.lockSyncing();
  }

  /** @access private */
  unlockSyncing() {
    this.syncService.unlockSyncing();
  }

  /** @access public */
  async sync(options) {
    return this.syncService.sync(options);
  }

  /** @access public */
  async resolveOutOfSync() {
    return this.syncService.resolveOutOfSync();
  }

  /** @access public */
  async setValue(key, value, mode) {
    return this.storageService.setValue(key, value, mode);
  }

  /** @access public */
  async getValue(key, mode) {
    return this.storageService.getValue(key, mode);
  }

  /** @access public */
  async removeValue(key, mode) {
    return this.storageService.removeValue(key, mode);
  }

  /** 
   * Deletes all payloads from storage.
   * @access public 
   */
  async clearDatabase() {
    return this.storageService.clearAllPayloads();
  }

  /** 
   * Allows items keys to be rewritten to local db on local credential status change,
   * such as if passcode is added, changed, or removed.
   * This allows IndexedDB unencrypted logs to be deleted
   * `deletePayloads` will remove data from backing store,
   * but not from working memory See:
   * https://github.com/standardnotes/desktop/issues/131
   * @access private 
   */
  async rewriteItemsKeys() {
    const itemsKeys = this.protocolService.allItemsKeys;
    const payloads = itemsKeys.map((key) => key.payloadRepresentation());
    await this.storageService.deletePayloads(payloads);
    await this.syncService.persistPayloads({
      decryptedPayloads: payloads
    });
  }

  /**
   * Destroys the application instance.
   * @access public
   */
  deinit() {
    clearInterval(this.autoSyncInterval);
    for (const uninstallObserver of this.serviceObservers) {
      uninstallObserver();
    }
    for (const uninstallSubscriber of this.managedSubscribers) {
      uninstallSubscriber();
    }
    for (const service of this.services) {
      if (service.deinit) {
        service.deinit();
        service.application = null;
      }
    }
    this.deviceInterface.deinit();
    this.deviceInterface = null;
    this.launchCallbacks = null;
    this.crypto = null;
    this.createdNewDatabase = null;
    this.services.length = 0;
    this.serviceObservers.length = 0;
    this.managedSubscribers.length = 0;
    this.streamObservers.length = 0;
    this.deviceInterface = null;
    this.clearServices();
    this.dealloced = true;
    this.started = false;
  }

  /**
   * Returns the wrapping key for operations that require resaving the root key
   * (changing the account password, signing in, registering, or upgrading protocol)
   * Returns empty object if no passcode is configured.
   * Otherwise returns {cancled: true} if the operation is canceled, or 
   * {wrappingKey} with the result.
   * @param {string} [passcode] - If the consumer already has access to the passcode,
   * they can pass it here so that the user is not prompted again. 
   * @access private
   */
  async getWrappingKeyIfNecessary(passcode) {
    if (!this.hasPasscode()) {
      return {};
    }
    if (!passcode) {
      const challenge = new Challenge([ChallengeType.LocalPasscode], ChallengeReason.ResaveRootKey);
      const response = await this.challengeService.promptForChallengeResponse(challenge);
      if (!response) {
        return { canceled: true };
      }
      const value = response.getValueForType(ChallengeType.LocalPasscode);
      passcode = value.value;
    }
    const wrappingKey = await this.protocolService.computeWrappingKey(passcode);
    return { wrappingKey };
  }

  /**
   *  @access public
   *  @param mergeLocal  Whether to merge existing offline data into account. If false,
   *                     any pre-existing data will be fully deleted upon success.
   */
  async register({ email, password, ephemeral, mergeLocal }) {
    const { wrappingKey, canceled } = await this.getWrappingKeyIfNecessary();
    if (canceled) {
      return;
    }
    this.lockSyncing();
    const result = await this.sessionManager.register({
      email, password
    });
    if (!result.response.error) {
      await this.protocolService.setNewRootKey(
        result.rootKey,
        result.keyParams,
        wrappingKey
      );
      this.syncService.resetSyncState();
      await this.storageService.setPersistencePolicy(
        ephemeral
          ? StoragePersistencePolicies.Ephemeral
          : StoragePersistencePolicies.Default
      );
      if (mergeLocal) {
        await this.syncService.markAllItemsAsNeedingSync({
          alternateUuids: true
        });
      } else {
        this.modelManager.removeAllItemsFromMemory();
        await this.clearDatabase();
      }
      await this.notifyEvent(ApplicationEvents.SignedIn);
      this.unlockSyncing();
      await this.syncService.sync({
        mode: SyncModes.DownloadFirst,
        timingStrategy: TIMING_STRATEGY_FORCE_SPAWN_NEW
      });
      this.protocolService.decryptErroredItems();
    } else {
      this.unlockSyncing();
    }
    return result.response;
  }

  /**
   *  @access public 
   *  @param {boolean} [params.awaitSync = false]
   *  @param {boolean} params.mergeLocal  Whether to merge existing offline data into account. If false, 
   *                     any pre-existing data will be fully deleted upon success.
   */
  async signIn({ email, password, strict, ephemeral, mfaKeyPath, mfaCode, mergeLocal = true, awaitSync }) {
    const { wrappingKey, canceled } = await this.getWrappingKeyIfNecessary();
    if (canceled) {
      return;
    }
    /** Prevent a timed sync from occuring while signing in. */
    this.lockSyncing();
    const result = await this.sessionManager.signIn({
      email, password, strict, mfaKeyPath, mfaCode
    });
    if (!result.response.error) {
      await this.protocolService.setNewRootKey(
        result.rootKey,
        result.keyParams,
        wrappingKey
      );
      this.syncService.resetSyncState();
      await this.storageService.setPersistencePolicy(
        ephemeral
          ? StoragePersistencePolicies.Ephemeral
          : StoragePersistencePolicies.Default
      );
      if (mergeLocal) {
        await this.syncService.markAllItemsAsNeedingSync({
          alternateUuids: true
        });
      } else {
        this.modelManager.removeAllItemsFromMemory();
        await this.clearDatabase();
      }
      await this.notifyEvent(ApplicationEvents.SignedIn);
      this.unlockSyncing();
      const syncPromise = this.syncService.sync({
        mode: SyncModes.DownloadFirst,
        checkIntegrity: true,
        timingStrategy: TIMING_STRATEGY_FORCE_SPAWN_NEW
      });
      if (awaitSync) {
        await syncPromise;
      }
      this.protocolService.decryptErroredItems();
    } else {
      this.unlockSyncing();
    }
    return result.response;
  }

  /** 
   * @access public
   * @param {string} [passcode] - Changing the account password requires the local
   * passcode if configured (to rewrap the account key with passcode). If the passcode
   * is not passed in, the user will be prompted for the passcode. However if the consumer
   * already has referene to the passcode, they can pass it in here so that the user
   * is not prompted again.
   */
  async changePassword({ currentPassword, newPassword, passcode }) {
    const { wrappingKey, canceled } = await this.getWrappingKeyIfNecessary(passcode);
    if (canceled) {
      return;
    }
    const currentKeyParams = await this.protocolService.getRootKeyParams();
    this.lockSyncing();
    const result = await this.sessionManager.changePassword({
      currentPassword,
      currentKeyParams,
      newPassword
    });
    if (!result.response.error) {
      await this.protocolService.setNewRootKey(
        result.rootKey,
        result.keyParams,
        wrappingKey
      );
      await this.protocolService.createNewDefaultItemsKey();
      this.unlockSyncing();
      await this.syncService.sync();
    } else {
      this.unlockSyncing();
    }
    return result.response;
  }

  /** @access public */
  async signOut() {
    await this.sessionManager.signOut();
    await this.protocolService.clearLocalKeyState();
    await this.storageService.clearAllData();
    await this.notifyEvent(ApplicationEvents.SignedOut);
    this.deinit();
  }

  /** @access public */
  async validateAccountPassword({ password }) {
    const { valid } = await this.protocolService.validateAccountPassword(password);
    return valid;
  }

  /** @access public */
  isStarted() {
    return this.started;
  }

  /** @access public */
  isLaunched() {
    return this.launched;
  }

  /** @access public */
  hasPasscode() {
    return this.protocolService.hasPasscode();
  }

  /** @access public */
  async isLocked() {
    if (!this.started) {
      return true;
    }
    return this.challengeService.isPasscodeLocked();
  }

  /** @access public */
  async lock() {
    return this.deinit();
  }

  /** @access public */
  async setPasscode(passcode) {
    const identifier = await this.protocolService.crypto.generateUUID();
    const { key, keyParams } = await this.protocolService.createRootKey(
      identifier,
      passcode
    );
    await this.protocolService.setNewRootKeyWrapper(key, keyParams);
    await this.rewriteItemsKeys();
    await this.syncService.sync();
  }

  /** @access public */
  async removePasscode() {
    await this.protocolService.removeRootKeyWrapper();
    await this.rewriteItemsKeys();
  }

  /** @access public */
  async changePasscode(passcode) {
    await this.removePasscode();
    return this.setPasscode(passcode);
  }

  /** @access public */
  async setStorageEncryptionPolicy(encryptionPolicy) {
    await this.storageService.setEncryptionPolicy(encryptionPolicy);
    return this.protocolService.repersistAllItems();
  }


  /** @access public */
  async generateUuid() {
    return this.protocolService.crypto.generateUUID();
  }

  /**
   * Dynamically change the device interface, i.e when Desktop wants to override
   * default web interface.
   * @access public
   */
  async changeDeviceInterface(deviceInterface) {
    this.deviceInterface = deviceInterface;
    for (const service of this.services) {
      if (service.deviceInterface) {
        service.deviceInterface = deviceInterface;
      }
    }
  }

  /** @access private */
  constructServices() {
    this.createModelManager();
    this.createStorageManager();
    this.createProtocolService(this.modelManager);
    
    const encryptionDelegate = {
      payloadByEncryptingPayload: this.protocolService.payloadByEncryptingPayload.bind(this.protocolService),
      payloadByDecryptingPayload: this.protocolService.payloadByDecryptingPayload.bind(this.protocolService)
    };
    this.storageService.encryptionDelegate = encryptionDelegate;

    this.createMigrationService();
    this.createAlertManager();
    this.createHttpManager();
    this.createApiService();
    this.createSessionManager();
    this.createSyncManager();
    this.createChallengeService();
    this.createSingletonManager();
    this.createComponentManager();
    this.createPrivilegesManager();
    this.createHistoryManager();
    this.createActionsManager();
  }

  /** @access private */
  clearServices() {
    this.migrationService = null;
    this.alertService = null;
    this.httpService = null;
    this.modelManager = null;
    this.protocolService = null;
    this.storageService = null;
    this.apiService = null;
    this.sessionManager = null;
    this.syncService = null;
    this.challengeService = null;
    this.singletonManager = null;
    this.componentManager = null;
    this.privilegesService = null;
    this.actionsManager = null;
    this.historyManager = null;

    this.services = [];
  }

  createMigrationService() {
    this.migrationService = new (this.getClass(SNMigrationService))({
      application: this,
      challengeResponder: this.getMigrationChallengeResponder()
    });
    this.services.push(this.migrationService);
  }

  createAlertManager() {
    if (this.shouldSkipClass(SNAlertService)) {
      return;
    }
    this.alertService = new (this.getClass(SNAlertService))(
      this.deviceInterface
    );
    this.services.push(this.alertService);
  }

  createApiService() {
    this.apiService = new (this.getClass(SNApiService))({
      storageService: this.storageService,
      httpService: this.httpService
    });
    this.services.push(this.apiService);
  }

  createComponentManager() {
    if (this.shouldSkipClass(SNComponentManager)) {
      return;
    }
    this.componentManager = new (this.getClass(SNComponentManager))({
      modelManager: this.modelManager,
      syncService: this.syncService,
      alertService: this.alertService,
      timeout: this.deviceInterface.timeout,
      environment: this.environment,
      platform: this.platform
    });
    this.services.push(this.componentManager);
  }

  createHttpManager() {
    this.httpService = new (this.getClass(SNHttpService))();
    this.services.push(this.httpService);
  }

  createModelManager() {
    this.modelManager = new (this.getClass(SNModelManager))();
    this.services.push(this.modelManager);
  }

  createSingletonManager() {
    this.singletonManager = new (this.getClass(SNSingletonManager))(
      this.modelManager,
      this.syncService
    );
    this.services.push(this.singletonManager);
  }

  createStorageManager() {
    this.storageService = new (this.getClass(SNStorageService))(
      this.deviceInterface,
      this.namespace,
    );
    this.services.push(this.storageService);
  }

  createProtocolService(modelManager) {
    this.protocolService = new (this.getClass(SNProtocolService))(
      modelManager,
      this.deviceInterface,
      this.storageService,
      this.crypto
    );
    this.protocolService.onKeyStatusChange(async () => {
      await this.notifyEvent(ApplicationEvents.KeyStatusChanged);
    });
    this.services.push(this.protocolService);
  }

  createSessionManager() {
    this.sessionManager = new (this.getClass(SNSessionManager))({
      storageService: this.storageService,
      alertService: this.alertService,
      protocolService: this.protocolService,
      apiService: this.apiService,
      timeout: this.deviceInterface.timeout
    });
    this.services.push(this.sessionManager);
  }

  async onSyncEvent(eventName) {
    const appEvent = applicationEventForSyncEvent(eventName);
    if (appEvent) {
      await this.notifyEvent(appEvent);
    }
    this.protocolService.onSyncEvent(eventName);
  }

  createSyncManager() {
    this.syncService = new (this.getClass(SNSyncService))({
      modelManager: this.modelManager,
      storageService: this.storageService,
      sessionManager: this.sessionManager,
      protocolService: this.protocolService,
      apiService: this.apiService,
      interval: this.deviceInterface.interval
    });
    const uninstall = this.syncService.addEventObserver(async (eventName) => {
      await this.onSyncEvent(eventName);
    });
    this.serviceObservers.push(uninstall);
    this.services.push(this.syncService);
  }

  createChallengeService() {
    this.challengeService = new (this.getClass(ChallengeService))(
      this.storageService,
      this.protocolService
    );
    this.services.push(this.challengeService);
  }

  createPrivilegesManager() {
    this.privilegesService = new (this.getClass(SNPrivilegesService))({
      storageService: this.storageService,
      protocolService: this.protocolService,
      modelManager: this.modelManager,
      syncService: this.syncService,
      sessionManager: this.sessionManager,
      singletonManager: this.singletonManager
    });
    this.services.push(this.privilegesService);
  }

  createHistoryManager() {
    this.historyManager = new (this.getClass(SNHistoryManager))({
      storageService: this.storageService,
      modelManager: this.modelManager,
      contentTypes: [ContentTypes.Note],
      timeout: this.deviceInterface.timeout
    });
    this.services.push(this.historyManager);
  }

  createActionsManager() {
    this.actionsManager = new (this.getClass(SNActionsService))({
      alertService: this.alertService,
      deviceInterface: this.deviceInterface,
      httpService: this.httpService,
      modelManager: this.modelManager,
      protocolService: this.protocolService,
      syncService: this.syncService,
    });
    this.services.push(this.actionsManager);
  }

  shouldSkipClass(classCandidate) {
    return this.skipClasses && this.skipClasses.includes(classCandidate);
  }

  getClass(base) {
    const swapClass = this.swapClasses && this.swapClasses.find((candidate) => candidate.swap === base);
    if (swapClass) {
      return swapClass.with;
    } else {
      return base;
    }
  }
}
