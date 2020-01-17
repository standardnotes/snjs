import { PureService } from '@Lib/services/pure_service';
import {
  ENCRYPTION_INTENT_LOCAL_STORAGE_ENCRYPTED,
  ENCRYPTION_INTENT_LOCAL_STORAGE_DECRYPTED,
  ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED
 } from '@Protocol/intents';
import {
  STORAGE_KEY_ENCRYPTED_STORAGE,
  namespacedKey
} from '@Lib/storage_keys';
import { CONTENT_TYPE_ENCRYPTED_STORAGE } from '@Models/content_types';
import { isNullOrUndefined } from '@Lib/utils';
import * as stages from '@Lib/stages';

/** Stored inside wrapped encrpyed storage object */
export const STORAGE_VALUE_MODE_DEFAULT   = 1;
/** Stored outside storage object, unencrypted */
export const STORAGE_VALUE_MODE_UNWRAPPED = 2;

export const STORAGE_PERSISTENCE_POLICY_DEFAULT   = 1;
export const STORAGE_PERSISTENCE_POLICY_EPHEMERAL = 2;

export const STORAGE_ENCRYPTION_POLICY_DEFAULT    = 1;
export const STORAGE_ENCRYPTION_POLICY_DISABLED   = 2;

export class SNStorageManager extends PureService {

  constructor({protocolService, databaseManager, deviceInterface, namespace}) {
    super();
    this.deviceInterface = deviceInterface;
    this.protocolService = protocolService;
    this.databaseManager = databaseManager;
    this.namespace = namespace;
    this.setPersistencePolicy(STORAGE_PERSISTENCE_POLICY_DEFAULT);
    this.setEncryptionPolicy(STORAGE_ENCRYPTION_POLICY_DEFAULT);

    /** Wait until application has been unlocked before trying to persist */
    this.storagePersistable = false;
  }

  /**
   * @protected
   */
  async handleApplicationStage(stage) {
    await super.handleApplicationStage(stage);
    if(stage === stages.APPLICATION_STAGE_AFTER_APP_UNLOCKED) {
      this.storagePersistable = true;
    }
  }


  async setPersistencePolicy(persistencePolicy) {
    this.persistencePolicy = persistencePolicy;
    if(this.persistencePolicy === STORAGE_PERSISTENCE_POLICY_EPHEMERAL) {
      await this.clearPersistenceValue();
      await this.databaseManager.clearAllPayloads();
    }
  }

  async setEncryptionPolicy(encryptionPolicy) {
    this.encryptionPolicy = encryptionPolicy;
  }

  /**
   * To avoid circular dependencies in constructor, applications must create a
   * key manager separately and feed it into the protocolService here.
   * @param keyManager  A fully constructed keyManager
   */
  setKeyManager(keyManager) {
    this.keyManager = keyManager;
    this.keyManager.addKeyChangeObserver({
      name: 'storage-manager',
      callback: (contentType) => {
        if(contentType === CONTENT_TYPE_ROOT_KEY) {
          if(this.isStorageWrapped()) {
            this.decryptStorage();
          }
        }
      }
    });
  }

  async initializeFromDisk() {
    const value = await this.deviceInterface.getRawStorageValue(
      this.getPersistenceKey()
    );
    const payload = value ? JSON.parse(value) : null;
    this.setInitialValues(payload);
  }

  async persistAsValueToDisk(payload) {
    await this.deviceInterface.setRawStorageValue(
      this.getPersistenceKey(),
      JSON.stringify(payload)
    );
  }

  /**
   * Platforms must override this to clear any persisted value on disk.
   */
  async clearPersistenceValue() {
    await this.deviceInterface.removeRawStorageValue(
      this.getPersistenceKey()
    );
  }

  /**
   * @protected
   * Called by platforms with the value they load from disk,
   * after they handle initializeFromDisk
   */
  async setInitialValues(values) {
    if(!values) {
      values = this.defaultValuesObject();
    }
    this.values = values;
  }

  /** @private */
  isStorageWrapped() {
    const value = this.values[
      this.domainKeyForMode(STORAGE_VALUE_MODE_DEFAULT)
    ];
    return !isNullOrUndefined(value.content_type);
  }

  /** @public */
  async canDecryptWithKey(key) {
    const wrappedValue = this.values[
      this.domainKeyForMode(STORAGE_VALUE_MODE_DEFAULT)
    ];
    const decryptedPayload = await this.decryptWrappedValue({
      wrappedValue: wrappedValue,
      key: key,
      throws: false
    });
    return !decryptedPayload.errorDecrypting;
  }

  /** @private */
  async decryptWrappedValue({wrappedValue, key, throws}) {
    /**
    * The read content type doesn't matter, so long as we know it responds
    * to content type. This allows a more seamless transition when both web
    * and mobile used different content types for encrypted storage.
    */
    if(!wrappedValue.content_type) {
      throw 'Attempting to decrypt nonexistent wrapped value';
    }

    const payload = CreateMaxPayloadFromAnyObject({
      object: wrappedValue,
      override: {
        content_type: CONTENT_TYPE_ENCRYPTED_STORAGE
      }
    });

    const decryptedPayload = await this.protocolService
    .payloadByDecryptingPayload({
      payload: payload,
      key: key
    });

    return decryptedPayload;
  }

  /** @private */
  async decryptStorage() {
    const wrappedValue = this.values[
      this.domainKeyForMode(STORAGE_VALUE_MODE_DEFAULT)
    ];
    const decryptedPayload = await this.decryptWrappedValue({
      wrappedValue: wrappedValue,
      key: null,
      throws: true
    });
    this.values[
      this.domainKeyForMode(STORAGE_VALUE_MODE_DEFAULT)
    ] = decryptedPayload.content;
  }


  /**
   * Generates a payload that can be persisted to disk,
   * either as a plain object, or an encrypted item.
   */
  async generatePersistenceValue() {
    const rawContent = Object.assign(
      {},
      this.values
    );
    const intent = (
      this.encryptionPolicy === STORAGE_ENCRYPTION_POLICY_DISABLED
      ? ENCRYPTION_INTENT_LOCAL_STORAGE_DECRYPTED
      : ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED
    );
    const wrappedValue = rawContent[this.domainKeyForMode(STORAGE_VALUE_MODE_DEFAULT)];
    const payload = CreateMaxPayloadFromAnyObject({
      object: {
        uuid: await SFItem.GenerateUuid(),
        content: wrappedValue,
        content_type: CONTENT_TYPE_ENCRYPTED_STORAGE
      }
    })
    const encryptedPayload = await this.protocolService.payloadByEncryptingPayload({
      payload: payload,
      intent: intent
    });
    rawContent[this.domainKeyForMode(STORAGE_VALUE_MODE_DEFAULT)] = encryptedPayload;
    return rawContent;
  }

  async repersistToDisk() {
    if(!this.storagePersistable) {
      return;
    }
    if(this.persistencePolicy === STORAGE_PERSISTENCE_POLICY_EPHEMERAL) {
      return;
    }
    const value = await this.generatePersistenceValue();
    return this.persistAsValueToDisk(value);
  }

  async setValue(key, value, mode = STORAGE_VALUE_MODE_DEFAULT) {
    if(!this.values) {
      throw 'Attempting to set storage value before loading local storage.';
    }
    this.values[this.domainKeyForMode(mode)][this.namespacedKeyForKey(key)] = value;
    return this.repersistToDisk();
  }

  async getValue(key, mode = STORAGE_VALUE_MODE_DEFAULT) {
    if(!this.values) {
      throw 'Attempting to access storage value before loading local storage.';
    }
    return this.values[this.domainKeyForMode(mode)][this.namespacedKeyForKey(key)];
  }

  async removeValue(key, mode = STORAGE_VALUE_MODE_DEFAULT) {
    if(!this.values) {
      throw 'Attempting to access storage value before loading local storage.';
    }
    delete this.values[this.domainKeyForMode(mode)][this.namespacedKeyForKey(key)];
    return this.repersistToDisk();
  }

  /**
   * Default persistence key. Platforms can override as needed.
   */
  getPersistenceKey() {
    return namespacedKey(this.namespace, STORAGE_KEY_ENCRYPTED_STORAGE);
  }

  defaultValuesObject({defaultModeSeed = {}} = {}) {
    return this.constructor.defaultValuesObject({defaultModeSeed});
  }

  static defaultValuesObject({defaultModeSeed = {}} = {}) {
    return {
      [this.domainKeyForMode(STORAGE_VALUE_MODE_DEFAULT)]: defaultModeSeed,
      [this.domainKeyForMode(STORAGE_VALUE_MODE_UNWRAPPED)]: {}
    }
  }

  /** @private */
  static domainKeyForMode(mode) {
    if(mode === STORAGE_VALUE_MODE_DEFAULT) {
      return 'wrapped';
    } else {
      return 'unwrapped';
    }
  }

  /** @private */
  domainKeyForMode(mode) {
    return this.constructor.domainKeyForMode(mode);
  }

  /** @private */
  namespacedKeyForKey(key) {
    if(this.namespace && this.namespace.length > 0) {
      return `${this.namespace}-${key}`;
    } else {
      return key;
    }
  }

  /**
   *  Clears simple values from storage only. Does not affect items.
   */
  async clear() {
    this.values = this.defaultValuesObject();
    await this.repersistToDisk();
  }

  /**
   * Payload Storage
   */

  async getAllRawPayloads() {
    return this.databaseManager.getAllRawPayloads();
  }

  async savePayload(payload) {
    return this.savePayloads([payload]);
  }

  async savePayloads(decryptedPayloads) {
    if(this.persistencePolicy === STORAGE_PERSISTENCE_POLICY_EPHEMERAL) {
      return;
    }

    const deleted = [], nondeleted = [];
    for(const payload of decryptedPayloads) {
      if(payload.discardable) {
        /** If the payload is deleted and not dirty, remove it from db. */
        deleted.push(payload);
      } else {
        const encrypted = await this.protocolService.payloadByEncryptingPayload({
          payload: payload,
          intent:
            this.encryptionPolicy === STORAGE_ENCRYPTION_POLICY_DEFAULT
            ? ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED
            : ENCRYPTION_INTENT_LOCAL_STORAGE_DECRYPTED
        })
        nondeleted.push(encrypted);
      }
    }

    if(deleted.length > 0)  {
      await this.deletePayloads(deleted);
    }
    await this.databaseManager.savePayloads(nondeleted);
  }

  async deletePayloads(payloads) {
    for(const payload of payloads) {
      await this.deletePayloadWithId(payload.uuid);
    }
  }

  async deletePayloadWithId(id) {
    return this.databaseManager.deletePayloadWithId(id);
  }

  async clearAllPayloads() {
    return this.databaseManager.clearAllPayloads();
  }

  /**
   * General
   */

  async clearAllData() {
    return Promise.all([
      this.clear(),
      this.clearAllPayloads()
    ])
  }
}
