import { getGlobalScope, removeFromArray } from '@Lib/utils';
import { SNAlertManager } from '@Services/alert_manager';
import { SNSessionManager } from '@Services/api/session_manager';
import { SNComponentManager } from '@Services/component_manager';
import { SNDatabaseManager } from '@Services/database_manager';
import { SNHttpManager } from '@Services/http_manager';
import { SNKeyManager } from '@Services/key_manager';
import { SNMigrationService } from '@Services/migration_service';
import { SNModelManager } from '@Services/model_manager';
import { SNSingletonManager } from '@Services/singleton_manager';
import {
  SNStorageManager,
  STORAGE_PERSISTENCE_POLICY_EPHEMERAL,
  STORAGE_PERSISTENCE_POLICY_DEFAULT,
  STORAGE_ENCRYPTION_POLICY_DEFAULT
} from '@Services/storage_manager';
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
   * This function will load all services in their correct order.
   */
  async prepareForLaunch() {
   await this.createServices();
  }

  /**
   * Runs migrations, handles device authentication, unlocks application, and
   * issues a callback if  a device activation requires user input
   * (i.e local passcode or fingerprint).
   * @param callbacks
   *          .authChallengeResponses(challenges)
   *            @param challenges
                  An array of DeviceAuthentication Challenges that require responses.
   */
  async launch({callbacks}) {
    if(!callbacks.authChallengeResponses) {
      throw 'Application.launch callbacks are not properly configured.';
    }

    await this.handleLaunchAuthentication(callbacks);

    const databasePayloads = await this.syncManager.getDatabasePayloads();
    /**
    * We don't want to await this, as we want to begin allowing the app to function
    * before local data has been loaded fully. We await only initial
    * `getDatabasePayloads` to lock in on database state.
    */
    this.syncManager.loadDatabasePayloads(databasePayloads).then(() => {
      this.syncManager.sync({
        mode: SYNC_MODE_INITIAL
      });
    })
  }

  /**
   * @private
   * @param previousResponses Applications may require authetnication earlier than launch
   *                          in the case of migrations. We can reuse their valid responses.
   */
  async handleLaunchAuthentication(callbacks, previousResponses = []) {
    const pendingChallenges = await this.deviceAuthService.getLaunchChallenges();
    subtractFromArray(pendingChallenges, previousResponses);
    while(pendingChallenges.length > 0) {
      const responses = await callbacks.authChallengeResponses(pendingChallenges);
      for(const response of responses) {
        const valid = await this.deviceAuthService.validateChallengeResponse(response);
        if(valid === true) {
          await this.deviceAuthService.handleChallengeResponse(response);
          removeFromArray(pendingChallenges, response.challenge);
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
      await this.storageManager.setPersistencePolicy(
        ephemeral
        ? STORAGE_PERSISTENCE_POLICY_EPHEMERAL
        : STORAGE_PERSISTENCE_POLICY_DEFAULT
      );
      this.notifyEvent(APPLICATION_EVENT_DID_SIGN_IN);
      await this.syncManager.sync({
        mode: SYNC_MODE_INITIAL
      });
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
      await this.storageManager.setPersistencePolicy(
        ephemeral
        ? STORAGE_PERSISTENCE_POLICY_EPHEMERAL
        : STORAGE_PERSISTENCE_POLICY_DEFAULT
      );
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
    const identifier = await this.protocolService.crypto.generateUUID();
    const {key, keyParams} = await this.protocolService.createRootKey({
      identifier: identifier,
      password: passcode
    });

    await this.keyManager.setRootKeyWrapper({
      wrappingKey: key,
      keyParams: keyParams
    });

    const currentItemsKey = await this.keyManager.getDefaultItemsKey();
    if(!currentItemsKey) {
      await this.keyManager.createNewItemsKey();
    }
  }

  async removePasscode() {
    await this.keyManager.removeRootKeyWrapper();
  }

  async changePasscode(passcode) {
    await this.removePasscode();
    return this.setPasscode(passcode);
  }

  async setStorageEncryptionPolicy(encryptionPolicy) {
    await this.storageManager.setEncryptionPolicy(encryptionPolicy);
    return this.syncManager.repersistAllItems();
  }

  /**
   * @private
   */

  async createServices() {
    this.createAlertManager();
    this.createHttpManager();

    this.createDatabaseManager();
    await this.databaseManager.openDatabase();

    this.createModelManager();
    this.createProtocolService();

    this.createStorageManager();
    await this.storageManager.initializeFromDisk();

    this.createApiService();

    this.createSessionManager();
    await this.sessionManager.initializeFromDisk();

    this.createSyncManager();

    this.createKeyManager();
    this.protocolService.setKeyManager(this.keyManager);
    this.storageManager.setKeyManager(this.keyManager);
    this.keyManager.setKeychainDelegate(this.keychainDelegate);
    await this.keyManager.initialize();

    this.createDeviceAuthService();

    this.createSingletonManager();
    // this.createMigrationService();

    this.createComponentManager();

    this.registerSyncCompletionObserver();
  }

  async registerSyncCompletionObserver() {
    this.syncManager.addEventObserver({
      callback: (event, data) => {
        if(event === SYNC_EVENT_FULL_SYNC_COMPLETED) {
          if(!this.keyManager.getDefaultItemsKey()) {
            this.keyManager.createItemsKey();
            if(this.keyManager.keyMode === KEY_MODE_WRAPPER_ONLY) {
              /** Items need to be re-persisted to disk */
              this.syncManager.repersistAllItems();
            }
          }
        }
      }
    })
  }

  clearServices() {
    this.alertManager = null;
    this.httpManager = null;
    this.databaseManager = null;
    this.modelManager = null;
    this.protocolService = null;
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
      protocolService: this.protocolService
    });
  }

  createMigrationService() {
    this.migrationService = new (this.getClass(SNMigrationService))({
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
      protocolService: this.protocolService,
      databaseManager: this.databaseManager,
      namespace: this.namespace
    });
  }

  createProtocolService() {
    this.protocolService = new (this.getClass(SNProtocolService))({
      modelManager: this.modelManager
    });
  }

  createSessionManager() {
    this.sessionManager = new (this.getClass(SNSessionManager))({
      storageManager: this.storageManager,
      alertManager: this.alertManager,
      protocolService: this.protocolService,
      apiService: this.apiService,
      timeout: this.timeout
    });
  }

  createSyncManager() {
    this.syncManager = new (this.getClass(SNSyncManager))({
      modelManager: this.modelManager,
      storageManager: this.storageManager,
      sessionManager: this.sessionManager,
      protocolService: this.protocolService,
      apiService: this.apiService,
      interval: this.interval
    });
  }

  createDeviceAuthService() {
    this.deviceAuthService = new (this.getClass(DeviceAuthService))({
      storageManager: this.storageManager,
      protocolService: this.protocolService,
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
