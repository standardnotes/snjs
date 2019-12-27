import { SNAlertManager } from '@Services/alertManager';
import { SNAuthManager } from '@Services/authManager';
import { SNComponentManager } from '@Services/componentManager';
import { SNDatabaseManager } from '@Services/databaseManager';
import { SNHttpManager } from '@Services/httpManager';
import { SNKeyManager } from '@Services/keyManager';
import { SNMigrationManager } from '@Services/migrationManager';
import { SNModelManager } from '@Services/modelManager';
import { SNSingletonManager } from '@Services/singletonManager';
import { SNStorageManager } from '@Services/storageManager';
import { SNSyncManager } from '@Services/syncManager';

export class SNApplication {

  /**
   * @param namespace  Optional - a unique identifier to namespace storage and other persistent properties.
   *                   Defaults to empty string.
   */
  constructor({namespace} = {}) {
    this.namespace = namespace || '';
  }

  /**
   * The first thing consumers should call when starting their app.
   * This function will load all services in their correct order and run migrations.
   * It will also handle device authentication, and issue a callback if a device activation
   * requires user input (i.e local passcode or fingerprint).
   * @param keychainDelegate  A SNKeychainDelegate object.
   * @param swapClasses  Gives consumers the ability to provide their own custom subclass for a service.
   *                     swapClasses should be an array of key/value pairs consisting of keys 'swap' and 'with'.
   *                     'swap' is the base class you wish to replace, and 'with' is the custom subclass to use.
   *
   * @param timeout  A platform-specific function that is fed functions to run when other operations have completed.
   *                 This is similar to setImmediate on the web, or setTimeout(fn, 0).
   *
   * @param interval  A platform-specific function that is fed functions to perform repeatedly. Similar to setInterval.
   * @param callbacks
   *          .onRequiresAuthentication(sources, handleResponses)
   *            @param sources  An array of DeviceAuthenticationSources that require responses.
   *            @param handleResponses  Once the consumer has valid responses for all sources, they must
   *                                    call handleResponses with an array of DeviceAuthenticationResponses.
   */

  async initialize({keychainDelegate, swapClasses, callbacks, timeout, interval}) {
    if(!callbacks.onRequiresAuthentication) {
      throw 'Application.initialize callbacks are not properly configured.';
    }

    if(!timeout) {
      throw `'timeout' is required to initialize application.`
    }

    if(!keychainDelegate) {
      throw 'Keychain delegate must be supplied.';
    }

    SFItem.AppDomain = 'org.standardnotes.sn';

    this.timeout = timeout;
    this.interval = interval;

    this.createAlertManager();

    this.createHttpManager();
    this.httpManager.setJWTRequestHandler(async () => {
      return this.storageManager.getItem("jwt");;
    })

    this.createDatabaseManager();
    this.createModelManager();
    this.createProtocolManager();

    this.createStorageManager();
    await this.storageManager.initializeFromDisk();

    this.createKeyManager();
    this.protocolManager.setKeyManager(this.keyManager);
    this.keyManager.setKeychainDelegate(keychainDelegate);

    this.createAuthManager();
    this.createSyncManager();

    this.createSingletonManager();
    this.createMigrationManager();

    this.createComponentManager();
  }

  createAlertManager() {
    this.alertManager = new (this.getClass(SNAlertManager, swapClasses))()
  }

  createAuthManager() {
    this.authManager = new (this.getClass(SNAuthManager, swapClasses))({
      storageManager: this.storageManager,
      httpManager: this.httpManager,
      alertManager: this.alertManager,
      keyManager: this.keyManager,
      protocolManager: this.protocolManager,
      timeout: timeout
    })
  }

  createComponentManager() {
    throw 'Must override';
  }

  createDatabaseManager() {
    this.databaseManager = new (this.getClass(SNDatabaseManager, swapClasses))({
      namespace: this.namespace
    });
  }

  createHttpManager() {
    this.httpManager = new (this.getClass(SNHttpManager, swapClasses))(
      this.timeout
    );
  }

  createKeyManager() {
    this.keyManager = new (this.getClass(SNDatabaseManager, swapClasses))({
      modelManager: this.modelManager,
      storageManager: this.storageManager,
      protocolManager: this.protocolManager
    });
  }

  createMigrationManager() {
    this.migrationManager = new (this.getClass(SNMigrationManager, swapClasses))({
      modelManager: this.modelManager,
      storageManager: this.storageManager,
      authManager: this.authManager,
      syncManager: this.syncManager
    });
  }

  createModelManager() {
    this.modelManager = new (this.getClass(SNModelManager, swapClasses))(
      this.timeout
    );
  }

  createSingletonManager() {
    this.singletonManager = new (this.getClass(SNSingletonManager, swapClasses))({
      modelManager: this.modelManager,
      syncManager: this.syncManager
    });
  }

  createStorageManager() {
    this.storageManager = new (this.getClass(SNStorageManager, swapClasses))({
      protocolManager: this.protocolManager,
      databaseManager: this.databaseManager,
      namespace: this.namespace
    });
  }

  createProtocolManager() {
    this.protocolManager = new (this.getClass(SNProtocolManager, swapClasses))({
      modelManager: this.modelManager
    });
  }

  createSyncManager() {
    this.syncManager = new (this.getClass(SNSyncManager, swapClasses))({
      modelManager: this.modelManager,
      storageManager: this.storageManager,
      authManager: this.authManager,
      protocolManager: this.protocolManager,
      httpManager: this.httpManager,
      timeout: this.timeout,
      interval: this.interval
    });
  }

  getClass(base, swapClasses) {
    const swapClass = swapClasses && swapClasses.find((candidate) => candidate.swap === base);
    if(swapClass) {
      return swapClass.with;
    } else {
      return base;
    }
  }

}
