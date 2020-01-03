import {
  ENCRYPTION_INTENT_LOCAL_STORAGE_ENCRYPTED,
  ENCRYPTION_INTENT_LOCAL_STORAGE_DECRYPTED,
  ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED
 } from '@Protocol/intents';
import { STORAGE_KEY_ENCRYPTED_STORAGE } from '@Protocol/storageKeys';
import { ENCRYPTED_STORAGE_CONTENT_TYPE } from '@Lib/constants';

export class SNStorageManager {

  constructor({protocolManager, databaseManager}) {
    this.protocolManager = protocolManager;
    this.databaseManager = databaseManager;
    this.setLocalStoragePolicy({encrypt: true, ephemeral: false});
    this.setLocalDatabaseStoragePolicy({ephemeral: false});
  }

  /**
   * Platforms must override this method to provide their own read from disk solution.
   * For example, web might load from localStorage, and mobile might load from AsyncStorage.
   * Upon completion, consumer must call setInitialContent.
  */
  async initializeFromDisk() {
    throw 'Must override';
  }

  /**
   * Platforms must override this to persist an arbitrary payload object to disk.
   */
  async persistAsPayloadToDisk(payload) {
    throw 'Must override';
  }

  /**
   * Default persistence key. Platforms can override as needed.
   */
  async getPersistenceKey() {
    if(this.namespace) {
      return `${this.namespace}-${STORAGE_KEY_ENCRYPTED_STORAGE}`;
    } else  {
      return STORAGE_KEY_ENCRYPTED_STORAGE;
    }
  }

  /**
   * Called by platforms with the value they load from disk, after they handle initializeFromDisk
   */
  async setInitialContent(content) {
    if(!content) {
      throw 'Attempting to set null content in storage manager.';
    }
    /**
     * The read content type doesn't matter, so long as we know it responds to content type.
     * This allows a more seamless transition when both web and mobile used different content types for encrypted storage.
     */
    if(content.content_type) {
      const encryptedPayload = CreatePayloadFromAnyObject({
        object: {
          content: content,
          content_type: ENCRYPTED_STORAGE_CONTENT_TYPE
        }
      })
      const decryptedPayload = await this.protocolManager.payloadByDecryptingPayload({
        payload: encryptedPayload
      });
      this.localStorageValues = decryptedPayload.content;
    } else {
      this.localStorageValues = content;
    }
  }

  /**
   * Generates a payload that can be persisted to disk, either as a plain object, or an encrypted item.
  */
  async generatePersistenceContent() {
    const rawContent = Object.assign({}, this.localStorageValues);
    const intent = (
      this.localStorageEncryptionDisabled
      ? ENCRYPTION_INTENT_LOCAL_STORAGE_DECRYPTED
      : ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED
    );
    const decryptedPayload = CreatePayloadFromAnyObject({object: {
      content: rawContent,
      content_type: ENCRYPTED_STORAGE_CONTENT_TYPE
    }})

    const encryptedPayload = await this.protocolManager.payloadByEncryptingPayload({
      payload: decryptedPayload,
      intent: intent
    });
    return encryptedPayload;
  }

  async setLocalStoragePolicy({encrypt, ephemeral}) {
    this.localStorageEncryptionDisabled = !encrypt;
    this.localStorageEphemeral = ephemeral;
  }

  setLocalDatabaseStoragePolicy({ephemeral}) {
    this.localDatabaseEphemeral = ephemeral;
  }

  async repersistToDisk() {
    if(this.localStorageEphemeral === true) {
      return;
    }
    const payload = await this.generatePersistenceContent();
    this.persistAsPayloadToDisk(payload);
  }

  async setValue(key, value) {
    if(!this.localStorageValues) {
      throw 'Attempting to set local storage value without first loading local storage.';
    }
    this.localStorageValues[this.namespacedKeyForKey(key)] = value;
    this.repersistToDisk();
  }

  getValueSync(key) {
    if(!this.localStorageValues) {
      throw 'Attempting to access local storage value without first loading local storage.';
    }
    return this.localStorageValues[this.namespacedKeyForKey(key)];
  }

  async getValue(key) {
    if(!this.localStorageValues) {
      throw 'Attempting to access local storage value without first loading local storage.';
    }
    return this.localStorageValues[this.namespacedKeyForKey(key)];
  }

  async removeValue(key) {
    if(!this.localStorageValues) {
      throw 'Attempting to access local storage value without first loading local storage.';
    }
    delete this.localStorageValues[this.namespacedKeyForKey(key)];
    this.repersistToDisk();
  }

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
    this.localStorageValues = {};
    this.repersistToDisk();
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

  async savePayloads(payloads) {
    if(this.localDatabaseEphemeral) {
      return;
    }
    const deleted = [], nondeleted = [];
    for(const payload of payloads) {
      /** If the payload is deleted and dirty we must hang on to it */
      if(payload.deleted === true && !payload.dirty) {
        deleted.push(payload);
      } else {
        nondeleted.push(payload);
      }
    }

    await this.deletePayloads(deleted);
    await this.databaseManager.savePayloads(payloads);
  }

  async deletePayloads(payloads) {
    for(const paylod of payloads) {
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
