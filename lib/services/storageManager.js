import { EncryptionIntentLocalStorage } from '@Protocol/intents';

const STORAGE_CONTENT_TYPE = 'SN|Storage';

export class SFStorageManager {

  constructor(keyManager, protocolManager) {
    this.keyManager = keyManager;
    this.protocolManager = protocolManager;
    this.setLocalStoragePolicy({encrypt: true, ephemeral: false});
  }

  /**
   * Platforms must override this method to provide their own read from disk solution.
   * For example, web might load from localStorage, and mobile might load from AsyncStorage.
   * Upon completion, consumer must call setPayload.
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
   * Called by platforms with the value they load from disk, after they handle initializeFromDisk
   */
  async setPayload(payload) {
    if(payload.content_type === STORAGE_CONTENT_TYPE) {
      const item = new SFItem({content: payload, content_type: STORAGE_CONTENT_TYPE});
      const key = await this.keyManager.keyToUseForDecryptionOfItem({item: item});
      await this.protocolManager.decryptItem({item, key});
      this.localStorageValues = item.content;
    } else {
      this.localStorageValues = payload;
    }
  }

  /**
   * Generates a payload that can be persisted to disk, either as a plain object, or an encrypted item.
  */
  async generatePayload() {
    const rawPayload = Object.assign({}, this.localStorageValues);
    if(this.localStorageEncryptionDisabled === true) {
      return rawPayload;
    } else {
      const item = new SFItem({content: rawPayload, content_type: STORAGE_CONTENT_TYPE});
      const key = await this.keyManager.keyToUseForEncryptionOfItem({
        item: item,
        intent: EncryptionIntentLocalStorage
      });
      await this.protocolManager.encryptItem({item, key});
      return item;
    }
  }

  async setLocalStoragePolicy({encrypt, ephemeral}) {
    this.localStorageEncryptionDisabled = !encrypt;
    this.localStorageEphemeral = ephemeral;
  }

  async repersistToDisk() {
    if(this.localStorageEphemeral === true) {
      return;
    }
    const payload = await this.generatePayload();
    this.persistAsPayloadToDisk(payload);
  }

  async setItem(key, value) {
    if(!this.localStorageValues) {
      throw 'Attempting to set local storage item without first loading local storage.';
    }
    this.localStorageValues[key] = value;
    this.repersistToDisk();
  }

  async getItem(key) {
    if(!this.localStorageValues) {
      throw 'Attempting to access local storage item without first loading local storage.';
    }
    return this.localStorageValues[key];
  }

  async removeItem(key) {
    if(!this.localStorageValues) {
      throw 'Attempting to access local storage item without first loading local storage.';
    }
    delete this.localStorageValues[key];
    this.repersistToDisk();
  }

  /**
   *  Clears simple key/value items from storage only. Does not affect models.
   */
  async clear() {
    this.localStorageValues = {};
    this.repersistToDisk();
  }

  /**
   * Model Storage
   */

  async getAllModels() {
    throw 'Must override';
  }

  async saveModel(item) {
    return this.saveModels([item]);
  }

  async saveModels(items) {
    throw 'Must override';
  }

  async deleteModel(item) {
    throw 'Must override';
  }

  async clearAllModels() {
    throw 'Must override';
  }

  /**
   * General
   */

  async clearAllData() {
    return Promise.all([
      this.clear(),
      this.clearAllModels()
    ])
  }
}
