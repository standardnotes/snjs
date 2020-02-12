import { removeFromArray, isNullOrUndefined } from '@Lib/utils';
import { ContentTypes } from '@Models/content_types';
import { CopyPayload } from '@Payloads/generator';
import { ApplicationEvents, ApplicationStages, SyncEvents } from '@Lib';
import { StoragePersistencePolicies } from '@Services';
import {
  SNMigrationService,
  SNActionsManager,
  SNApiService,
  SNModelManager,
  SNProtocolService,
  SNPrivilegesManager,
  SNHistoryManager,
  SNAlertManager,
  SNSessionManager,
  SNComponentManager,
  SNHttpManager,
  SNSingletonManager,
  SNKeyManager,
  ItemsKeyManager,
  SNStorageManager,
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
    await this.storageManager.initializeFromDisk();
    await this.keyManager.initialize();
    await this.handleStage(ApplicationStages.ReadyForLaunch_05);
    this.started = true;
    this.notifyEvent(ApplicationEvents.ApplicationStarted);
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
    if (await this.storageManager.isStorageWrapped()) {
      await this.storageManager.decryptStorage();
    }
    await this.sessionManager.initializeFromDisk();
    this.historyManager.initializeFromDisk();
    
    this.unlocked = true;
    this.notifyEvent(ApplicationEvents.ApplicationUnlocked);

    await this.handleStage(ApplicationStages.StorageDecrypted_09);
    await this.handleStage(ApplicationStages.Launched_10);

    const databasePayloads = await this.syncManager.getDatabasePayloads();
    await this.handleStage(ApplicationStages.LoadingDatabase_11);
    /**
    * We don't want to await this, as we want to begin allowing the app to function
    * before local data has been loaded fully. We await only initial
    * `getDatabasePayloads` to lock in on database state.
    */
    const loadPromise = this.syncManager.loadDatabasePayloads(databasePayloads)
      .then(async () => {
        if (this.dealloced) {
          throw 'Application has been destroyed.';
        }
        await this.handleStage(ApplicationStages.LoadedDatabase_12);
        this.beginAutoSyncTimer();
        return this.syncManager.sync({
          mode: SyncModes.DownloadFirst
        });
      });
    if (awaitDatabaseLoad) {
      await loadPromise;
    }
  }

  beginAutoSyncTimer() {
    this.autoSyncInterval = this.deviceInterface.interval(() => {
      this.syncManager.log('Syncing from autosync');
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
  addEventObserver(callback, singleEvent, singleUse, autoUnsubscribe) {
    const observer = { callback, singleEvent, singleUse, autoUnsubscribe };
    this.eventHandlers.push(observer);
    return () => {
      removeFromArray(this.eventHandlers, observer);
    };
  }

  /** @public */
  onSync(callback) {
    const event = ApplicationEvents.CompletedSync;
    const singleUse = false;
    const autoUnsubscribe = true;
    return this.addEventObserver((firedEvent) => {
      if (firedEvent === event) {
        callback();
      }
    }, event, singleUse, autoUnsubscribe);
  }

  /** 
   * @public 
   * When the root key or root key wrapper changes. Includes events like account state
   * changes (registering, signing in, changing pw, logging out) and passcode state 
   * changes (adding, removing, changing).
   */
  onCredentialChange(callback) {
    const uninstall = this.keyManager.onStatusChange(callback);
    this.managedSubscribers.push(uninstall);
  }

  /** 
   * @public 
   * Called when the application has initialized and is ready for launch, but before
   * the application has been unlocked, if applicable. Use this to do pre-launch
   * configuration, but do not attempt to access user data like notes or tags.
   */
  onStart(callback) {
    if (this.started) {
      callback();
    } else {
      this.addSingleUseObserver(
        ApplicationEvents.ApplicationStarted,
        callback,
      );
    }
  }

  /**
   * @public
   * Called when the application has been fully decrypted and unlocked. Use this to
   * to begin streaming data like notes and tags.
   */
  onUnlock(callback) {
    if (this.unlocked) {
      callback();
    } else {
      this.addSingleUseObserver(
        ApplicationEvents.ApplicationUnlocked,
        callback
      );
    }
  }

  addSingleUseObserver(eventName, callback) {
    const singleUse = true;
    this.addEventObserver((firedEvent) => {
      if (firedEvent === eventName) {
        callback();
      }
    }, eventName, singleUse);
  }

  /** @private */
  async notifyEvent(event, data) {
    for (const observer of this.eventHandlers.slice()) {
      if (observer.singleEvent && observer.singleEvent === event) {
        await observer.callback(event, data || {});
        if(observer.singleUse) {
          removeFromArray(this.eventHandlers, observer);
        }
      } else if(!observer.singleEvent) {
        await observer.callback(event, data || {});
      }
    }
  }

  /** @public */
  isDatabaseLoaded() {
    return this.syncManager.isDatabaseLoaded();
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
    await this.syncManager.sync();
  }

  /** 
   * @public 
   * Finds an item by UUID.
   */
  findItem({ uuid }) {
    return this.modelManager.findItem(uuid);
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
    await this.syncManager.sync();

    if (item.content_type === ContentTypes.Tag) {
      this.modelManager.reorderTagLocation(item);
    }
  }

  /** @public */
  async saveItems({ items }) {
    await this.modelManager.setItemsDirty(items);
    await this.syncManager.sync();
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
  async importData({ data, password }) {
    const decryptedPayloads = await this.protocolService.payloadsByDecryptingBackupFile({
      data: data,
      password: password
    });
    const validPayloads = decryptedPayloads.filter((payload) => {
      return !payload.errorDecrypting;
    });
    const affectedItems = await this.modelManager.importPayloads(validPayloads);
    this.sync();
    return {
      affectedItems: affectedItems,
      errorCount: decryptedPayloads.length - validPayloads.length
    };
  }

  /** @public */
  isEphemeralSession() {
    return this.storageManager.isEphemeralSession();
  }

  /** @private */
  lockSyncing() {
    this.syncManager.lockSyncing();
  }

  /** @private */
  unlockSyncing() {
    this.syncManager.unlockSyncing();
  }

  /** @public */
  async getSyncStatus() {
    return this.syncManager.status;
  }

  /** @public */
  async sync(options) {
    return this.syncManager.sync(options);
  }

  /** @public */
  async resolveOutOfSync() {
    return this.syncManager.resolveOutOfSync();
  }

  /** @public */
  async setValue(key, value, mode) {
    return this.storageManager.setValue(key, value, mode);
  }

  /** @public */
  async getValue(key, mode) {
    return this.storageManager.getValue(key, mode);
  }

  /** @public */
  async removeValue(key, mode) {
    return this.storageManager.removeValue(key, mode);
  }

  /** 
   * @public 
   * Deletes all payloads from storage.
   */
  async clearDatabase() {
    return this.storageManager.clearAllPayloads();
  }

  /** 
   * @public 
   * Allows database to be rewritten on local credential status change,
   * such as if passcode is added, changed, or removed.
   */
  async rewriteDatabase() {
    await this.storageManager.clearAllPayloads();
    return this.syncManager.repersistAllItems();

  }

  /** @public */
  async restart() {
    await this.deinit();
    this.dealloced = false;
    this.constructServices();
    await this.prepareForLaunch({ callbacks: this.launchCallbacks });
    await this.launch({ awaitDatabaseLoad: true});
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
    for(const observer of this.eventHandlers.slice()) {
      if (observer.autoUnsubscribe) {
        removeFromArray(this.eventHandlers, observer);
      }
    }
    for (const uninstallSubscriber of this.managedSubscribers) {
      uninstallSubscriber();
    }
    for (const service of this.services) {
      if (service.deinit) {
        await service.deinit();
      }
    }
    this.clearServices();
    this.dealloced = true;
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
      await this.storageManager.setPersistencePolicy(
        ephemeral
          ? StoragePersistencePolicies.Ephemeral
          : StoragePersistencePolicies.Default
      );
      if (mergeLocal) {
        await this.storageManager.clearDesktopDatabase();
        await this.syncManager.markAllItemsAsNeedingSync({
          alternateUuids: true
        });
      } else {
        this.modelManager.removeAllItemsFromMemory();
        await this.clearDatabase();
      }
      this.notifyEvent(ApplicationEvents.SignedIn);
      await this.syncManager.sync({
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
    this.notifyEvent(ApplicationEvents.WillSignIn);
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
      await this.storageManager.setPersistencePolicy(
        ephemeral
          ? StoragePersistencePolicies.Ephemeral
          : StoragePersistencePolicies.Default
      );
      if(mergeLocal) {
        await this.storageManager.clearDesktopDatabase();
        await this.syncManager.markAllItemsAsNeedingSync({ 
          alternateUuids: true 
        });
      } else {
        this.modelManager.removeAllItemsFromMemory();
        await this.clearDatabase();
      }
      this.notifyEvent(ApplicationEvents.SignedIn);
      await this.syncManager.sync({
        mode: SyncModes.DownloadFirst
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
      await this.syncManager.sync();
    }
    return result.response;
  }

  /** @public */
  async signOut() {
    await this.sessionManager.signOut();
    
    // await this.syncManager.handleSignOut();
    // await this.modelManager.handleSignOut();
    
    await this.keyManager.clearLocalKeyState();
    await this.storageManager.clearAllData();
    await this.restart();

    /** Allows items key to be created after sync completion */
    // await this.syncManager.sync();
    // this.notifyEvent(ApplicationEvents.SignedOut);
  }

  /** @public */
  async validateAccountPassword({ password }) {
    return this.keyManager.validateAccountPassword(password);
  }

  /** @public */
  async hasPasscode() {
    return this.keyManager.hasRootKeyWrapper();
  }

  /** @public */
  async isPasscodeLocked() {
    return this.keyManager.rootKeyNeedsUnwrapping();
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

    await this.rewriteDatabase();

    await this.syncManager.sync();
  }

  /** @public */
  async removePasscode() {
    await this.keyManager.removeRootKeyWrapper();
    await this.rewriteDatabase();
  }

  /** @public */
  async changePasscode(passcode) {
    await this.removePasscode();
    return this.setPasscode(passcode);
  }

  /** @public */
  async setStorageEncryptionPolicy(encryptionPolicy) {
    await this.storageManager.setEncryptionPolicy(encryptionPolicy);
    return this.syncManager.repersistAllItems();
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
    this.alertManager = null;
    this.httpManager = null;
    this.modelManager = null;
    this.protocolService = null;
    this.storageManager = null;
    this.apiService = null;
    this.sessionManager = null;
    this.syncManager = null;
    this.keyManager = null;
    this.itemsKeyManager = null;
    this.deviceAuthService = null;
    this.singletonManager = null;
    this.componentManager = null;
    this.privilegesManager = null;
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
    if (this.shouldSkipClass(SNAlertManager)) {
      return;
    }
    this.alertManager = new (this.getClass(SNAlertManager))({
      deviceInterface: this.deviceInterface
    });
    this.services.push(this.alertManager);
  }

  createApiService() {
    this.apiService = new (this.getClass(SNApiService))({
      storageManager: this.storageManager,
      httpManager: this.httpManager,
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
      syncManager: this.syncManager,
      alertManager: this.alertManager,
      timeout: this.deviceInterface.timeout,
      environment: this.environment,
      platform: this.platform
    });
    this.services.push(this.componentManager);
  }

  createHttpManager() {
    this.httpManager = new (this.getClass(SNHttpManager))();
    this.services.push(this.httpManager);
  }

  createKeyManager() {
    this.keyManager = new (this.getClass(SNKeyManager))({
      modelManager: this.modelManager,
      storageManager: this.storageManager,
      protocolService: this.protocolService,
      itemsKeyManager: this.itemsKeyManager
    });
    this.services.push(this.keyManager);
  }

  createItemsKeyManager() {
    this.itemsKeyManager = new (this.getClass(ItemsKeyManager))({
      modelManager: this.modelManager,
      syncManager: this.syncManager,
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
      syncManager: this.syncManager
    });
    this.services.push(this.singletonManager);
  }

  createStorageManager() {
    this.storageManager = new (this.getClass(SNStorageManager))({
      protocolService: this.protocolService,
      namespace: this.namespace,
      deviceInterface: this.deviceInterface
    });
    this.services.push(this.storageManager);
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
      storageManager: this.storageManager,
      alertManager: this.alertManager,
      protocolService: this.protocolService,
      apiService: this.apiService,
      timeout: this.deviceInterface.timeout
    });
    this.services.push(this.sessionManager);
  }

  createSyncManager() {
    this.syncManager = new (this.getClass(SNSyncManager))({
      modelManager: this.modelManager,
      storageManager: this.storageManager,
      sessionManager: this.sessionManager,
      protocolService: this.protocolService,
      apiService: this.apiService,
      interval: this.deviceInterface.interval
    });
    const uninstall = this.syncManager.addEventObserver(async (eventName) => {
      if (eventName === SyncEvents.FullSyncCompleted) {
        await this.notifyEvent(ApplicationEvents.CompletedSync);
      } else if (eventName === SyncEvents.SyncTakingTooLong) {
        await this.notifyEvent(ApplicationEvents.HighLatencySync);
      } else if (eventName === SyncEvents.SyncError) {
        await this.notifyEvent(ApplicationEvents.FailedSync);
      }
    });
    this.serviceObservers.push(uninstall);
    this.services.push(this.syncManager);
  }

  createDeviceAuthService() {
    this.deviceAuthService = new (this.getClass(DeviceAuthService))({
      storageManager: this.storageManager,
      protocolService: this.protocolService,
      keyManager: this.keyManager
    });
    this.services.push(this.deviceAuthService);
  }

  createPrivilegesManager() {
    this.privilegesManager = new (this.getClass(SNPrivilegesManager))({
      storageManager: this.storageManager,
      keyManager: this.keyManager,
      modelManager: this.modelManager,
      syncManager: this.syncManager,
      sessionManager: this.sessionManager,
      singletonManager: this.singletonManager
    });
    this.services.push(this.privilegesManager);
  }

  createHistoryManager() {
    this.historyManager = new (this.getClass(SNHistoryManager))({
      storageManager: this.storageManager,
      modelManager: this.modelManager,
      contentTypes: [ContentTypes.Note],
      timeout: this.deviceInterface.timeout
    });
    this.services.push(this.historyManager);
  }

  createActionsManager() {
    this.actionsManager = new (this.getClass(SNActionsManager))({
      httpManager: this.httpManager,
      modelManager: this.modelManager,
      syncManager: this.syncManager,
      deviceInterface: this.deviceInterface
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
