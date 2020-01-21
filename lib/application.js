import { removeFromArray } from '@Lib/utils';
import { SNAlertManager } from '@Services/alert_manager';
import { SNSessionManager } from '@Services/api/session_manager';
import { SNComponentManager } from '@Services/component_manager';
import { SNHttpManager } from '@Services/http_manager';
import { CONTENT_TYPE_NOTE } from '@Models/content_types'
import {
  SNKeyManager,
  KEY_MODE_ROOT_KEY_NONE
} from '@Services/key_manager';
import { MigrationService } from '@Lib/migration/service';
import { SNModelManager } from '@Services/model_manager';
import { SNSingletonManager } from '@Services/singleton_manager';
import { CopyPayload } from '@Payloads/generator';
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
import * as stages from '@Lib/stages';

const DEFAULT_APP_DOMAIN = 'org.standardnotes.sn';

export class SNApplication {
  /**
   * @param platform
      Required - The PLATFORM that identifies your application.
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
   */
  constructor({
    platform,
    namespace,
    host,
    deviceInterface,
    swapClasses,
    skipClasses
  } = {}) {
    if(!deviceInterface) {
      throw 'Device Interface must be supplied.';
    }
    if(!platform) {
      throw 'Platform must be supplied when creating an application.';
    }
    SFItem.AppDomain = DEFAULT_APP_DOMAIN;
    this.platform = platform;
    this.namespace = namespace || '';
    this.host = host;
    this.deviceInterface = deviceInterface;
    this.swapClasses = swapClasses;
    this.skipClasses = skipClasses;
    this.eventHandlers = [];
    this.services = [];
  }

  /**
   * @public
   */

  /**
   * The first thing consumers should call when starting their app.
   * This function will load all services in their correct order.
   * @param callbacks
   *          .authChallengeResponses(challenges)
   *            @param challenges
   An array of DeviceAuthentication Challenges that require responses.
   */
  async prepareForLaunch({callbacks}) {
    if(!callbacks.authChallengeResponses) {
      throw 'Application.launch callbacks are not properly configured.';
    }
    this.launchCallbacks = callbacks;
    this.constructServices();
    await this.migrationService.initialize();
    await this.handleStage(stages.APPLICATION_STAGE_0_PREPARING_FOR_LAUNCH);
    await this.storageManager.initializeFromDisk();
    await this.sessionManager.initializeFromDisk();
    await this.keyManager.initialize();
    this.historyManager.initialize();
    await this.handleStage(stages.APPLICATION_STAGE_05_READY_FOR_LAUNCH);
  }

  /**
   * Runs migrations, handles device authentication, unlocks application, and
   * issues a callback if a device activation requires user input
   * (i.e local passcode or fingerprint).
   * @param ut_awaitDatabaseLoad  For unit tests to await database load.
   */
  async launch({ut_awaitDatabaseLoad} = {}) {
    await this.handleLaunchAuthentication();
    if(await this.storageManager.isStorageWrapped()) {
      await this.storageManager.decryptStorage();
    }
    await this.handleStage(stages.APPLICATION_STAGE_09_STORAGE_DECRYPTED);
    await this.handleStage(stages.APPLICATION_STAGE_10_LAUNCHED);

    const databasePayloads = await this.syncManager.getDatabasePayloads();
    await this.handleStage(stages.APPLICATION_STAGE_11_LOADING_DATABASE);
    /**
    * We don't want to await this, as we want to begin allowing the app to function
    * before local data has been loaded fully. We await only initial
    * `getDatabasePayloads` to lock in on database state.
    */
    const loadPromise = this.syncManager.loadDatabasePayloads(databasePayloads)
    .then(async () => {
      await this.handleStage(stages.APPLICATION_STAGE_12_LOADED_DATABASE);
      return this.syncManager.sync({
        mode: SYNC_MODE_INITIAL
      }).then(async () => {
        const currentItemsKey = this.keyManager.getDefaultItemsKey();
        if(!currentItemsKey) {
          await this.keyManager.createNewItemsKey();
          if(this.keyManager.keyMode === KEY_MODE_WRAPPER_ONLY) {
            return this.syncManager.repersistAllItems();
          }
        }
      })
    })
    if(ut_awaitDatabaseLoad) {
      await loadPromise;
    }
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

  async handleLaunchChallenge(challenges) {
    const pendingChallenges = challenges.slice();
    while(pendingChallenges.length > 0) {
      const responses = await this.launchCallbacks.authChallengeResponses(pendingChallenges);
      for(const response of responses) {
        const valid = await this.deviceAuthService.validateChallengeResponse(response);
        if(valid) {
          await this.deviceAuthService.handleChallengeResponse(response);
          removeFromArray(pendingChallenges, response.challenge);
        }
      }
    }
  }

  getMigrationChallengeResponder() {
    return async (challenge) => {
      const responses = await this.launchCallbacks.authChallengeResponses([challenge]);
      return responses[0];
    }
  }

  async handleStage(stage) {
    for(const service of this.services) {
      await service.handleApplicationStage(stage);
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

  async notifyEvent(event, data) {
    for(const observer of this.eventHandlers) {
      await observer(event, data || {});
    }
  }

  async savePayload({payload}) {
    const dirtied = CopyPayload({
      payload: payload,
      override: {
        dirty: true
      }
    });
    await this.modelManager.mapPayloadToLocalItem({payload: dirtied})
    await this.syncManager.sync();
  }

  async saveItem({item}) {
    await this.modelManager.setItemDirty(item, true);
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
      await this.keyManager.setNewRootKey({
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

  async signIn({email, password, strict, ephemeral, mfaKeyPath, mfaCode}) {
    this.notifyEvent(APPLICATION_EVENT_WILL_SIGN_IN);

    const result = await this.sessionManager.signIn({
      email, password, strict, mfaKeyPath, mfaCode
    });

    if(!result.response.error) {
      await this.keyManager.setNewRootKey({
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

  async changePassword({
    email, currentPassword, currentKeyParams, newPassword, rotateItemsKey
  }) {
    const result = await this.sessionManager.changePassword({
      email, currentPassword, currentKeyParams, newPassword
    });
    if(!result.response.error) {
      await this.keyManager.setNewRootKey({
        key: result.rootKey,
        keyParams: result.keyParams
      });
      const newKeyParams = result.keyParams;
      const versionUpgraded = newKeyParams !== currentKeyParams.version;
      if(rotateItemsKey || versionUpgraded) {
        await this.keyManager.createNewItemsKey();
      }
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

    await this.keyManager.setNewRootKeyWrapper({
      wrappingKey: key,
      keyParams: keyParams
    });

    await this.syncManager.sync();
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
    this.createKeyManager();
    this.protocolService.setKeyManager(this.keyManager);
    this.keyManager.setDeviceInterface(this.deviceInterface);
    this.createDeviceAuthService();
    this.createSingletonManager();
    this.createComponentManager();
    this.createPrivilegesManager();
    this.createHistoryManager();
  }

  /**
   * Dynamically change the device interface, i.e when Desktop wants to override
   * default web interface.
   */
  async changeDeviceInterface(deviceInterface) {
    this.deviceInterface = deviceInterface;
    this.keyManager.setDeviceInterface(this.deviceInterface);
  }

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
    this.deviceAuthService = null;
    this.singletonManager = null;
    this.componentManager = null;
    this.privilegesManager = null;
  }

  createMigrationService() {
    this.migrationService = new (this.getClass(MigrationService))({
      application: this,
      challengeResponder: this.getMigrationChallengeResponder()
    });
    this.services.push(this.migrationService);
  }

  createAlertManager() {
    if(this.shouldSkipClass(SNAlertManager)) {
      return;
    }
    this.alertManager = new (this.getClass(SNAlertManager))()
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
    if(this.shouldSkipClass(SNComponentManager)) {
      return;
    }
    throw 'SNApplication.createComponentManager must be overriden';
  }

  createHttpManager() {
    this.httpManager = new (this.getClass(SNHttpManager))();
    this.services.push(this.httpManager);
  }

  createKeyManager() {
    this.keyManager = new (this.getClass(SNKeyManager))({
      modelManager: this.modelManager,
      storageManager: this.storageManager,
      protocolService: this.protocolService
    });
    this.services.push(this.keyManager);
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
      modelManager: modelManager
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
    this.privilegesManager = new (this.getClass(PrivilegesManager))({
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
    this.historyManager = new (this.getClass(HistoryManager))({
      storageManager: this.storageManager,
      modelManager: this.modelManager,
      contentTypes: [CONTENT_TYPE_NOTE],
      timeout: this.deviceInterface.timeout
    });
    this.services.push(this.historyManager);
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
