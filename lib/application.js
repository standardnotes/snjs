import { removeFromArray, isNullOrUndefined } from '@Lib/utils';
import { ContentTypes } from '@Models/content_types';
import { CopyPayload } from '@Payloads/generator';
import { ApplicationEvents, ApplicationStages, applicationEventForSyncEvent } from '@Lib';
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
  SNKeyManager,
  ItemsKeyManager,
  SNStorageService,
  SNSyncManager,
  DeviceAuthService,
  SyncModes
} from './services';

/** How often to automatically sync, in milliseconds */
const DEFAULT_AUTO_SYNC_INTERVAL = 30000;

export class SNApplication {
  /**
   * @param environment
      Required - The Environment that identifies your application.
   * @param platform
      Required - The Platform that identifies your application.
   * @param namespace
      Optional - a unique identifier to namespace storage and
      other persistent properties. Defaults to empty string.
   * @param deviceInterface
      A DeviceInterface object.
   * @param swapClasses
      Gives consumers the ability to provide their own custom
      subclass for a service. swapClasses should be an array
      of key/value pairs consisting of keys 'swap' and 'with'.
      'swap' is the base class you wish to replace, and 'with'
      is the custom subclass to use.
   * @param skipClasses
      An optional array of classes to skip making services for.
   * @param crypto
      The platform-dependent instance of SNCrypto to use.
      Web uses SNWebCrypto, mobile uses SNReactNativeCrypto.
   */
  constructor({
    environment,
    platform,
    namespace,
    host,
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
    this.host = host;
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
   * @publilc
   * The first thing consumers should call when starting their app.
   * This function will load all services in their correct order.
   * @param callbacks
   *          async .requiresChallengeResponses(challenges)
   *            @param challenges
   *          .handleChallengeFailures
   *          
   An array of DeviceAuthentication Challenges that require responses.
   */
  async prepareForLaunch({ callbacks }) {
    if (!callbacks.requiresChallengeResponses) {
      throw 'Application.launch callbacks are not properly configured.';
    }
    this.launchCallbacks = callbacks;
    await this.deviceInterface.openDatabase();
    await this.migrationService.initialize();
    await this.handleStage(ApplicationStages.PreparingForLaunch_0);
    await this.storageService.initializeFromDisk();
    await this.keyManager.initialize();
    await this.handleStage(ApplicationStages.ReadyForLaunch_05);
    this.started = true;
    await this.notifyEvent(ApplicationEvents.Started);
  }

  /**
   * @publilc
   * Runs migrations, handles device authentication, unlocks application, and
   * issues a callback if a device activation requires user input
   * (i.e local passcode or fingerprint).
   * @param awaitDatabaseLoad  Option to await database load before marking the app 
   *                           as ready. Used as far as we know for .restart and unit tests.
   */
  async launch({ awaitDatabaseLoad } = {}) {
    await this.handleLaunchAuthentication();
    if (await this.storageService.isStorageWrapped()) {
      await this.storageService.decryptStorage();
    }
    await this.sessionManager.initializeFromDisk();
    this.historyManager.initializeFromDisk();

    this.unlocked = true;
    await this.notifyEvent(ApplicationEvents.Launched);
    await this.handleStage(ApplicationStages.StorageDecrypted_09);
    await this.handleStage(ApplicationStages.Launched_10);

    const databasePayloads = await this.syncService.getDatabasePayloads();
    await this.handleStage(ApplicationStages.LoadingDatabase_11);
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

  beginAutoSyncTimer() {
    this.autoSyncInterval = this.deviceInterface.interval(() => {
      this.syncService.log('Syncing from autosync');
      this.sync();
    }, DEFAULT_AUTO_SYNC_INTERVAL);
  }

  /**
   * @private
   * @param previousResponses Applications may require authetnication earlier than launch
   *                          in the case of migrations. We can reuse their valid responses.
   */
  async handleLaunchAuthentication() {
    const pendingChallenges = await this.deviceAuthService.getLaunchChallenges();
    await this.handleLaunchChallenge(pendingChallenges);
  }

  /** @private */
  async handleLaunchChallenge(challenges) {
    const pendingChallenges = challenges.slice();
    while (pendingChallenges.length > 0) {
      const response = await this.launchCallbacks.requiresChallengeResponses(pendingChallenges);
      const responses = Array.isArray(response) ? response : [response];
      for (const response of responses) {
        const valid = await this.deviceAuthService.validateChallengeResponse(response);
        if (valid) {
          await this.deviceAuthService.handleChallengeResponse(response);
          removeFromArray(pendingChallenges, response.challenge);
        } else {
          await this.launchCallbacks.handleChallengeFailures([response]);
        }
      }
    }
  }

  /** @private */
  getMigrationChallengeResponder() {
    return async (challenge) => {
      const responses = await this.launchCallbacks.requiresChallengeResponses([challenge]);
      return responses[0];
    };
  }

  /** @private */
  async handleStage(stage) {
    for (const service of this.services) {
      await service.handleApplicationStage(stage);
    }
  }

  /** 
   * @public 
   * @param singleEvent  A private param used to destroy observer after it is called once
   *                     for this event.
   */
  addEventObserver(callback, singleEvent) {
    const observer = { callback, singleEvent };
    this.eventHandlers.push(observer);
    return () => {
      removeFromArray(this.eventHandlers, observer);
    };
  }

  addSingleEventObserver(event, callback) {
    return this.addEventObserver((firedEvent) => {
      if (firedEvent === event) {
        callback();
      }
    }, event);
  }

  /** @private */
  async notifyEvent(event, data) {
    for (const observer of this.eventHandlers.slice()) {
      if (observer.singleEvent && observer.singleEvent === event) {
        await observer.callback(event, data || {});
      } else if (!observer.singleEvent) {
        await observer.callback(event, data || {});
      }
    }
  }

  /** @public */
  isDatabaseLoaded() {
    return this.syncService.isDatabaseLoaded();
  }

  /** @public */
  async savePayload({ payload }) {
    const dirtied = CopyPayload({
      payload: payload,
      override: {
        dirty: true
      }
    });
    await this.modelManager.mapPayloadToLocalItem({ payload: dirtied });
    await this.syncService.sync();
  }

  /** 
   * @public 
   * Finds an item by UUID.
   */
  findItem({ uuid }) {
    return this.modelManager.findItem(uuid);
  }

  /** 
 * @public 
 * Finds an item by predicate.
 */
  findItems({ predicate }) {
    return this.modelManager.itemsMatchingPredicate(predicate);
  }

  /** @public */
  async mergeItem({ item, source }) {
    return this.modelManager.mapItem({ item, source });
  }

  /** 
   * @public 
   * @param add  Whether to add the item to application state.
   * @param needsSync  Whether to mark the item as needing sync. `add` must also be true.
   */
  async createItem({ contentType, content, add, needsSync }) {
    const item = await this.modelManager.createItem({
      contentType,
      content,
      add,
      needsSync
    });
    return item;
  }

  /** @public */
  async saveItem({ item }) {
    await this.modelManager.setItemDirty(item, true);
    await this.syncService.sync();

    if (item.content_type === ContentTypes.Tag) {
      this.modelManager.reorderTagLocation(item);
    }
  }

  /** @public */
  async saveItems({ items }) {
    await this.modelManager.setItemsDirty(items);
    await this.syncService.sync();
  }

  /** 
   * @public 
   * @param updateUserModifiedDate  
   *  Whether to change the modified date the user sees of the item.
   */
  async setItemNeedsSync({ item, updateUserModifiedDate }) {
    return this.modelManager.setItemDirty(item, true, updateUserModifiedDate);
  }

  /** 
   * @public 
   * @param updateUserModifiedDate  
   *  Whether to change the modified date the user sees of the item.
   */
  async setItemsNeedsSync({ items }) {
    return this.modelManager.setItemsDirty(items);
  }

  /** @public */
  async deleteItem({ item }) {
    this.modelManager.setItemToBeDeleted(item);
    this.sync();
  }

  /** @public */
  async deleteItemLocally({ item }) {
    this.modelManager.removeItemLocally(item);
  }

  /** @public */
  async emptyTrash() {
    return this.modelManager.emptyTrash();
  }

  /** @public */
  getTrashedItems() {
    return this.modelManager.trashedItems();
  }

  /** 
   * @public 
   * @param contentType  A string, array of strings, or '*'
   */
  getItems({ contentType }) {
    return this.modelManager.getItems(contentType);
  }

  /** @public */
  getDisplayableItems({ contentType }) {
    return this.modelManager.validItemsForContentType(contentType);
  }

  /** @public */
  getNotesMatchingSmartTag({ smartTag }) {
    return this.modelManager.notesMatchingSmartTag(smartTag);
  }

  /** @public */
  findTag({ title }) {
    return this.modelManager.findTag({ title });
  }

  /** @public */
  async findOrCreateTag({ title }) {
    return this.modelManager.findOrCreateTag({ title });
  }

  /** @public */
  getSmartTags() {
    return this.modelManager.getSmartTags();
  }

  /** @public */
  getNoteCount() {
    return this.modelManager.noteCount();
  }


  /** 
   * @public 
   * Begin streaming items to display in the UI.
   * @param contentType  Can be string, '*', or array of types.
   */
  streamItems({ contentType, stream }) {
    const observer = this.modelManager.addMappingObserver(
      contentType,
      (allItems, validItems, deletedItems, source, sourceKey) => {
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
      removeFromArray(this.streamObservers, observer);
    };
  }

  /** @public */
  async setHost(host) {
    return this.apiService.setHost(host);
  }

  /** @public */
  async getHost() {
    return this.apiService.getHost();
  }

  /** @public */
  getUser() {
    if (!this.unlocked) {
      throw 'Attempting to access user before application unlocked';
    }
    return this.sessionManager.getUser();
  }

  /** @public */
  async getUserVersion() {
    return this.protocolService.getUserVersion();
  }

  /** @public */
  noAccount() {
    const user = this.getUser();
    return isNullOrUndefined(user);
  }

  /** 
   * @public 
   * @return  A dictionary with `affectedItems` as the items that were either created 
   *          or dirtied by this import and `errorCount`, which is the number of items
   *          that were not imported due to failure to decrypt.
   */
  async importData({ data, password, awaitSync }) {
    const decryptedPayloads = await this.protocolService.payloadsByDecryptingBackupFile({
      data: data,
      password: password
    });
    const validPayloads = decryptedPayloads.filter((payload) => {
      return !payload.errorDecrypting;
    });
    const affectedItems = await this.modelManager.importPayloads(validPayloads);
    const promise = this.sync();
    if(awaitSync) {
      await promise;
    }
    return {
      affectedItems: affectedItems,
      errorCount: decryptedPayloads.length - validPayloads.length
    };
  }

  /** @public */
  isEphemeralSession() {
    return this.storageService.isEphemeralSession();
  }

  /** @private */
  lockSyncing() {
    this.syncService.lockSyncing();
  }

  /** @private */
  unlockSyncing() {
    this.syncService.unlockSyncing();
  }

  /** @public */
  async getSyncStatus() {
    return this.syncService.status;
  }

  /** @public */
  async sync(options) {
    return this.syncService.sync(options);
  }

  /** @public */
  async resolveOutOfSync() {
    return this.syncService.resolveOutOfSync();
  }

  /** @public */
  async setValue(key, value, mode) {
    return this.storageService.setValue(key, value, mode);
  }

  /** @public */
  async getValue(key, mode) {
    return this.storageService.getValue(key, mode);
  }

  /** @public */
  async removeValue(key, mode) {
    return this.storageService.removeValue(key, mode);
  }

  /** 
   * @public 
   * Deletes all payloads from storage.
   */
  async clearDatabase() {
    return this.storageService.clearAllPayloads();
  }

  /** 
   * @private 
   * Allows items keys to be rewritten to local db on local credential status change,
   * such as if passcode is added, changed, or removed.
   * This allows IndexedDB unencrypted logs to be deleted
   * `deletePayloads` will remove data from backing store,
   * but not from working memory See:
   * https://github.com/standardnotes/desktop/issues/131
   */
  async rewriteItemsKeys() {
    const itemsKeys = this.itemsKeyManager.allItemsKeys;
    const payloads = itemsKeys.map((key) => key.payloadRepresentation());
    await this.storageService.deletePayloads(payloads);
    await this.syncService.persistPayloads({
      decryptedPayloads: payloads
    });
  }

  /** @public */
  async restart() {
    await this.deinit();
    this.dealloced = false;
    this.constructServices();
    await this.prepareForLaunch({ callbacks: this.launchCallbacks });
    await this.launch({ awaitDatabaseLoad: true });
  }

  /**
   * @public
   * Destroys the application instance.
   */
  async deinit() {
    clearInterval(this.autoSyncInterval);
    for (const uninstallObserver of this.serviceObservers) {
      uninstallObserver();
    }
    for (const uninstallSubscriber of this.managedSubscribers) {
      uninstallSubscriber();
    }
    for (const service of this.services) {
      if (service.deinit) {
        await service.deinit();
      }
    }
    this.streamObservers = [];
    this.clearServices();
    this.dealloced = true;
    this.started = false;
  }

  /**
   * @public
   * Allows your PureService subclass to receive `deinit` event to unload observers.
   */
  registerService(service) {
    this.services.push(service);
  }

  /**
   *  @public
   *  @param mergeLocal  Whether to merge existing offline data into account. If false,
   *                     any pre-existing data will be fully deleted upon success.
   */
  async register({ email, password, ephemeral, mergeLocal }) {
    this.lockSyncing();
    const result = await this.sessionManager.register({
      email, password
    });
    this.unlockSyncing();
    if (!result.response.error) {
      await this.keyManager.setNewRootKey({
        key: result.rootKey,
        keyParams: result.keyParams
      });
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
      await this.syncService.sync({
        mode: SyncModes.DownloadFirst
      });
      this.protocolService.decryptErroredItems();
    }
    return result.response;
  }

  /**
   *  @public 
   *  @param mergeLocal  Whether to merge existing offline data into account. If false, 
   *                     any pre-existing data will be fully deleted upon success.
   */
  async signIn({ email, password, strict, ephemeral, mfaKeyPath, mfaCode, mergeLocal = true }) {
    /** Prevent a timed sync from occuring while signing in. */
    this.lockSyncing();
    const result = await this.sessionManager.signIn({
      email, password, strict, mfaKeyPath, mfaCode
    });
    this.unlockSyncing();
    if (!result.response.error) {
      await this.keyManager.setNewRootKey({
        key: result.rootKey,
        keyParams: result.keyParams
      });
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
      await this.syncService.sync({
        mode: SyncModes.DownloadFirst,
        checkIntegrity: true
      });
      this.protocolService.decryptErroredItems();
    }
    return result.response;
  }

  /** @public */
  async changePassword({ email, currentPassword, newPassword, rotateItemsKey }) {
    const currentKeyParams = await this.keyManager.getRootKeyParams();
    this.lockSyncing();
    const result = await this.sessionManager.changePassword({
      email, currentPassword, currentKeyParams, newPassword
    });
    this.unlockSyncing();
    if (!result.response.error) {
      await this.keyManager.setNewRootKey({
        key: result.rootKey,
        keyParams: result.keyParams
      });
      const newKeyParams = result.keyParams;
      const versionUpgraded = newKeyParams.version !== currentKeyParams.version;
      if (rotateItemsKey || versionUpgraded) {
        await this.itemsKeyManager.createNewDefaultItemsKey();
      }
      await this.syncService.sync();
    }
    return result.response;
  }

  /** @public */
  async signOut() {
    await this.sessionManager.signOut();
    await this.keyManager.clearLocalKeyState();
    await this.storageService.clearAllData();
    await this.notifyEvent(ApplicationEvents.SignedOut);
    await this.restart();
  }

  /** @public */
  async validateAccountPassword({ password }) {
    return this.keyManager.validateAccountPassword(password);
  }

  /** @public */
  isStarted() {
    return this.started;
  }

  /** @public */
  hasPasscode() {
    return this.keyManager.hasPasscode();
  }

  /** @public */
  async isLocked() {
    if (!this.started) {
      return true;
    }
    return this.deviceAuthService.isPasscodeLocked();
  }

  /** @public */
  async lock() {
    return this.restart();
  }

  /** @public */
  async setPasscode(passcode) {
    const identifier = await this.protocolService.crypto.generateUUID();
    const { key, keyParams } = await this.protocolService.createRootKey({
      identifier: identifier,
      password: passcode
    });
    await this.keyManager.setNewRootKeyWrapper({
      wrappingKey: key,
      keyParams: keyParams
    });
    await this.rewriteItemsKeys();
    await this.syncService.sync();
  }

  /** @public */
  async removePasscode() {
    await this.keyManager.removeRootKeyWrapper();
    await this.rewriteItemsKeys();
  }

  /** @public */
  async changePasscode(passcode) {
    await this.removePasscode();
    return this.setPasscode(passcode);
  }

  /** @public */
  async setStorageEncryptionPolicy(encryptionPolicy) {
    await this.storageService.setEncryptionPolicy(encryptionPolicy);
    return this.syncService.repersistAllItems();
  }


  /** @public */
  async generateUuid() {
    return this.protocolService.crypto.generateUUID();
  }

  /**
   * @public
   * Dynamically change the device interface, i.e when Desktop wants to override
   * default web interface.
   */
  async changeDeviceInterface(deviceInterface) {
    this.deviceInterface = deviceInterface;
    this.keyManager.setDeviceInterface(this.deviceInterface);
  }

  /**
   * @private
   */

  /** @private */
  constructServices() {
    this.createModelManager();
    this.createProtocolService(this.modelManager);
    this.createMigrationService();
    this.createAlertManager();
    this.createHttpManager();
    this.createStorageManager();
    this.createApiService();
    this.createSessionManager();
    this.createSyncManager();
    this.createItemsKeyManager();
    this.createKeyManager();
    this.protocolService.setKeyManager(this.keyManager);
    this.protocolService.setItemsKeyManager(this.itemsKeyManager);
    this.itemsKeyManager.setKeyManager(this.keyManager);
    this.keyManager.setDeviceInterface(this.deviceInterface);
    this.createDeviceAuthService();
    this.createSingletonManager();
    this.createComponentManager();
    this.createPrivilegesManager();
    this.createHistoryManager();
    this.createActionsManager();
  }

  /** @private */
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
    this.keyManager = null;
    this.itemsKeyManager = null;
    this.deviceAuthService = null;
    this.singletonManager = null;
    this.componentManager = null;
    this.privilegesService = null;
    this.actionsManager = null;

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
    this.alertService = new (this.getClass(SNAlertService))({
      deviceInterface: this.deviceInterface
    });
    this.services.push(this.alertService);
  }

  createApiService() {
    this.apiService = new (this.getClass(SNApiService))({
      storageService: this.storageService,
      httpService: this.httpService,
      host: this.host
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

  createKeyManager() {
    this.keyManager = new (this.getClass(SNKeyManager))({
      modelManager: this.modelManager,
      storageService: this.storageService,
      protocolService: this.protocolService,
      itemsKeyManager: this.itemsKeyManager
    });
    this.keyManager.onStatusChange(async () => {
      await this.notifyEvent(ApplicationEvents.KeyStatusChanged);
    });
    this.services.push(this.keyManager);
  }

  createItemsKeyManager() {
    this.itemsKeyManager = new (this.getClass(ItemsKeyManager))({
      modelManager: this.modelManager,
      syncService: this.syncService,
      protocolService: this.protocolService
    });
    this.services.push(this.itemsKeyManager);
  }

  createModelManager() {
    this.modelManager = new (this.getClass(SNModelManager))({
      timeout: this.deviceInterface.timeout
    });
    this.services.push(this.modelManager);
  }

  createSingletonManager() {
    this.singletonManager = new (this.getClass(SNSingletonManager))({
      modelManager: this.modelManager,
      syncService: this.syncService
    });
    this.services.push(this.singletonManager);
  }

  createStorageManager() {
    this.storageService = new (this.getClass(SNStorageService))({
      protocolService: this.protocolService,
      namespace: this.namespace,
      deviceInterface: this.deviceInterface
    });
    this.services.push(this.storageService);
  }

  createProtocolService(modelManager) {
    this.protocolService = new (this.getClass(SNProtocolService))({
      modelManager: modelManager,
      crypto: this.crypto
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

  createSyncManager() {
    this.syncService = new (this.getClass(SNSyncManager))({
      modelManager: this.modelManager,
      storageService: this.storageService,
      sessionManager: this.sessionManager,
      protocolService: this.protocolService,
      apiService: this.apiService,
      interval: this.deviceInterface.interval
    });
    const uninstall = this.syncService.addEventObserver(async (eventName) => {
      const appEvent = applicationEventForSyncEvent(eventName);
      if(appEvent) {
        await this.notifyEvent(appEvent);
      }
    });
    this.serviceObservers.push(uninstall);
    this.services.push(this.syncService);
  }

  createDeviceAuthService() {
    this.deviceAuthService = new (this.getClass(DeviceAuthService))({
      storageService: this.storageService,
      protocolService: this.protocolService,
      keyManager: this.keyManager
    });
    this.services.push(this.deviceAuthService);
  }

  createPrivilegesManager() {
    this.privilegesService = new (this.getClass(SNPrivilegesService))({
      storageService: this.storageService,
      keyManager: this.keyManager,
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
