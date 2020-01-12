import { getGlobalScope, removeFromArray } from '@Lib/utils';
import { SNAlertManager } from '@Services/alertManager';
import { SNSessionManager } from '@Services/api/session_manager';
import { SNComponentManager } from '@Services/componentManager';
import { SNDatabaseManager } from '@Services/database_manager';
import { SNHttpManager } from '@Services/httpManager';
import { SNKeyManager } from '@Services/keyManager';
import { SNMigrationManager } from '@Services/migrationManager';
import { SNModelManager } from '@Services/modelManager';
import { SNSingletonManager } from '@Services/singleton_manager';
import { SNStorageManager } from '@Services/storageManager';
import { DeviceAuthService } from '@Services/device_auth/service';
import {
  SNSyncManager,
  SYNC_MODE_INITIAL
} from '@Services/sync/sync_manager';
import {
  APPLICATION_EVENT_WILL_SIGN_IN,
  APPLICATION_EVENT_DID_SIGN_IN,
  APPLICATION_EVENT_DID_SIGN_OUT
} from '@Lib/events';

const DEFAULT_APP_DOMAIN = 'org.standardnotes.sn';

export class SNApplication {
  /**
   * @param namespace
      Optional - a unique identifier to namespace storage and
      other persistent properties. Defaults to empty string.
   * @param keychainDelegate
      A SNKeychainDelegate object.
   * @param swapClasses
      Gives consumers the ability to provide their own custom
      subclass for a service. swapClasses should be an array
      of key/value pairs consisting of keys 'swap' and 'with'.
      'swap' is the base class you wish to replace, and 'with'
      is the custom subclass to use.
   * @param skipClasses
      An optional array of classes to skip making services for.
   * @param timeout
      A platform-specific function that is fed functions to run
      when other operations have completed. This is similar to
      setImmediate on the web, or setTimeout(fn, 0).
   * @param interval
      A platform-specific function that is fed functions to
      perform repeatedly. Similar to setInterval.
   */
  constructor({
    namespace,
    host,
    keychainDelegate,
    swapClasses,
    skipClasses,
    timeout,
    interval
  } = {}) {
    if(!timeout) {
      throw `'timeout' is required to initialize application.`
    }

    if(!keychainDelegate) {
      throw 'Keychain delegate must be supplied.';
    }

    SFItem.AppDomain = DEFAULT_APP_DOMAIN;
    this.namespace = namespace || '';
    this.host = host;
    this.keychainDelegate = keychainDelegate;
    this.swapClasses = swapClasses;
    this.skipClasses = skipClasses;
    this.timeout = timeout || setTimeout.bind(getGlobalScope());
    this.interval = interval || setInterval.bind(getGlobalScope());
    this.eventHandlers = [];
  }

  /**
   * @public
   */

  /**
   * The first thing consumers should call when starting their app.
   * This function will load all services in their correct order and
   * run migrations.
   */
  async prepareForLaunch() {
   await this.createServices();
  }

  /**
   * Handles device authentication, and issues a callback if a device activation
   * requires user input (i.e local passcode or fingerprint).
   * @param callbacks
   *          .authSourcesResponses(sources)
   *            @param sources
                  An array of DeviceAuthenticationSources that require responses.
   */
  async launch({callbacks}) {
    if(!callbacks.authSourcesResponses) {
      throw 'Application.initialize callbacks are not properly configured.';
    }
    await this.handleLaunchAuthentication(callbacks);

    const databasePayloads = await this.syncManager.getDatabasePayloads();
    /**
    * We don't want to await this, as we want to begin allow the app to function
    * before local data has been loaded fully and mapped. We only await initial
    * `getDatabasePayloads` to lock in on database state.
    */
    this.syncManager.loadDatabasePayloads(databasePayloads);
  }

  async handleLaunchAuthentication(callbacks) {
    const pendingSources = await this.deviceAuthService.getRequiredLaunchSources();
    while(pendingSources.length > 0) {
      const responses = await callbacks.authSourcesResponses(pendingSources);
      for(const response of responses) {
        const success = await this.deviceAuthService.handleResponse(response);
        if(success === true) {
          removeFromArray(pendingSources, response.source);
        }
      }
    }
  }

  /**
   * Destroys the application instance.
   */
  async deinit() {
    this.clearServices();
  }

  addEventObserver(observer) {
    this.eventHandlers.push(observer);
    return observer;
  }

  removeEventObserver(observer) {
    pull(this.eventHandlers, observer);
  }

  notifyEvent(event, data) {
    for(var observer of this.eventHandlers) {
      observer.callback(event, data || {});
    }
  }

  async saveItem({item}) {
    await this.modelManager.setItemDirty(item, true);
    await this.modelManager.mapItem({item: item});
    await this.syncManager.sync();
  }

  async setHost(host) {
    this.apiService.setHost(host);
  }

  async register({email, password, ephemeral}) {
    const result = await this.sessionManager.register({
      email, password
    });
    if(!result.response.error) {
      await this.keyManager.setRootKey({
        key: result.rootKey,
        keyParams: result.keyParams
      });
      await this.keyManager.createNewItemsKey();
      await this.storageManager.setLocalStoragePolicy({
        encrypt: true,
        ephemeral: ephemeral
      });
      await this.storageManager.setLocalDatabaseStoragePolicy({
        ephemeral: ephemeral
      });
      this.notifyEvent(APPLICATION_EVENT_DID_SIGN_IN);
      await this.syncManager.sync();
    }
    return result.response;
  }

  async signIn({email, password, strict, ephemeral, mfaKeyPath, mfaCode}) {
    this.notifyEvent(APPLICATION_EVENT_WILL_SIGN_IN);

    const result = await this.sessionManager.signIn({
      email, password, strict, mfaKeyPath, mfaCode
    });

    if(!result.response.error) {
      await this.keyManager.setRootKey({
        key: result.rootKey,
        keyParams: result.keyParams
      });
      this.notifyEvent(APPLICATION_EVENT_DID_SIGN_IN);
      await this.syncManager.sync({
        mode: SYNC_MODE_INITIAL
      });
    }

    return result.response;
  }

  async changePassword({email, currentPassword, currentKeyParams, newPassword}) {
    const result = await this.sessionManager.changePassword({
      url: await this.sessionManager.getServerUrl(),
      email, currentPassword, currentKeyParams, newPassword
    });

    if(!result.response.error) {
      await this.keyManager.setRootKey({
        key: result.rootKey,
        keyParams: result.keyParams
      });
      await this.keyManager.createNewItemsKey();
      await this.syncManager.sync();
    }

    return result.response;
  }

  async signOut({dontClearData} = {}) {
    await this.sessionManager.signOut();
    await this.syncManager.handleSignOut();
    await this.modelManager.handleSignOut();
    await this.keyManager.clearLocalKeyState();

    if(!dontClearData) {
      await this.storageManager.clearAllData();
    }

    this.notifyEvent(APPLICATION_EVENT_DID_SIGN_OUT);
  }

  async setPasscode(passcode) {
    const identifier = await this.protocolManager.crypto.generateUUID();
    const {key, keyParams} = await this.protocolManager.createRootKey({
      identifier: identifier,
      password: passcode
    });

    await this.keyManager.setRootKeyWrapper({
      wrappingKey: key,
      keyParams: keyParams
    });
  }

  async removePasscode() {
    await this.keyManager.removeRootKeyWrapper();
  }

  async changePasscode(passcode) {
    await this.removePasscode();
    return this.setPasscode(passcode);
  }



  /**
   @private
   */

  async createServices() {
    this.createAlertManager();
    this.createHttpManager();

    this.createDatabaseManager();
    await this.databaseManager.openDatabase();

    this.createModelManager();
    this.createProtocolManager();

    this.createStorageManager();
    await this.storageManager.initializeFromDisk();

    this.createApiService();

    this.createSessionManager();
    await this.sessionManager.initializeFromDisk();

    this.createSyncManager();

    this.createKeyManager();
    this.protocolManager.setKeyManager(this.keyManager);
    this.storageManager.setKeyManager(this.keyManager);
    this.keyManager.setKeychainDelegate(this.keychainDelegate);
    await this.keyManager.initialize();

    this.createDeviceAuthService();

    this.createSingletonManager();
    // this.createMigrationManager();

    this.createComponentManager();
  }

  clearServices() {
    this.alertManager = null;
    this.httpManager = null;
    this.databaseManager = null;
    this.modelManager = null;
    this.protocolManager = null;
    this.storageManager = null;
    this.apiService = null;
    this.sessionManager = null;
    this.syncManager = null;
    this.keyManager = null;
    this.deviceAuthService = null;
    this.singletonManager = null;
    this.componentManager = null;
  }

  createAlertManager() {
    if(this.shouldSkipClass(SNAlertManager)) {
      return;
    }
    this.alertManager = new (this.getClass(SNAlertManager))()
  }

  createApiService() {
    this.apiService = new (this.getClass(SNApiService))({
      storageManager: this.storageManager,
      httpManager: this.httpManager,
      host: this.host
    });
  }

  createComponentManager() {
    if(this.shouldSkipClass(SNComponentManager)) {
      return;
    }
    throw 'SNApplication.createComponentManager must be overriden';
  }

  createDatabaseManager() {
    this.databaseManager = new (this.getClass(SNDatabaseManager))({
      namespace: this.namespace
    });
  }

  createHttpManager() {
    this.httpManager = new (this.getClass(SNHttpManager))(
      this.timeout
    );
  }

  createKeyManager() {
    this.keyManager = new (this.getClass(SNKeyManager))({
      modelManager: this.modelManager,
      storageManager: this.storageManager,
      protocolManager: this.protocolManager,
      syncManager: this.syncManager
    });
  }

  createMigrationManager() {
    this.migrationManager = new (this.getClass(SNMigrationManager))({
      modelManager: this.modelManager,
      storageManager: this.storageManager,
      sessionManager: this.sessionManager,
      syncManager: this.syncManager
    });
  }

  createModelManager() {
    this.modelManager = new (this.getClass(SNModelManager))(
      this.timeout
    );
  }

  createSingletonManager() {
    this.singletonManager = new (this.getClass(SNSingletonManager))({
      modelManager: this.modelManager,
      syncManager: this.syncManager
    });
  }

  createStorageManager() {
    this.storageManager = new (this.getClass(SNStorageManager))({
      protocolManager: this.protocolManager,
      databaseManager: this.databaseManager,
      namespace: this.namespace
    });
  }

  createProtocolManager() {
    this.protocolManager = new (this.getClass(SNProtocolManager))({
      modelManager: this.modelManager
    });
  }

  createSessionManager() {
    this.sessionManager = new (this.getClass(SNSessionManager))({
      storageManager: this.storageManager,
      alertManager: this.alertManager,
      protocolManager: this.protocolManager,
      apiService: this.apiService,
      timeout: this.timeout
    });
  }

  createSyncManager() {
    this.syncManager = new (this.getClass(SNSyncManager))({
      modelManager: this.modelManager,
      storageManager: this.storageManager,
      sessionManager: this.sessionManager,
      protocolManager: this.protocolManager,
      apiService: this.apiService,
      interval: this.interval
    });
  }

  createDeviceAuthService() {
    this.deviceAuthService = new (this.getClass(DeviceAuthService))({
      storageManager: this.storageManager,
      protocolManager: this.protocolManager,
      keyManager: this.keyManager
    });
  }

  shouldSkipClass(classCandidate) {
    return this.skipClasses && this.skipClasses.includes(classCandidate);
  }

  getClass(base) {
    const swapClass = this.swapClasses && this.swapClasses.find((candidate) => candidate.swap === base);
    if(swapClass) {
      return swapClass.with;
    } else {
      return base;
    }
  }

}
