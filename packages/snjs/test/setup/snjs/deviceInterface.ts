import { DeviceInterface as SNDeviceInterface } from '@Lib/index';
import { LocalStorage, StorageObject } from './localStorage';

const KEYCHAIN_STORAGE_KEY = 'keychain';

/**
 * The DeviceInterface implementation to handle storage and keychain operations.
 */
export default class DeviceInterface extends SNDeviceInterface {
  private storage: StorageObject = {};
  private localStorage: LocalStorage;

  constructor(timeout: any, interval: any) {
    super(timeout, interval);
    this.localStorage = new LocalStorage(this.storage);
  }

  async getRawStorageValue(key: string) {
    return this.localStorage.getItem(key);
  }

  async getAllRawStorageKeyValues() {
    const results = [];
    for (const key of Object.keys(this.storage)) {
      results.push({
        key: key,
        value: this.storage[key]
      });
    }
    return results;
  }

  async setRawStorageValue(key: string, value: any) {
    this.localStorage.setItem(key, value);
  }

  async removeRawStorageValue(key: string) {
    this.localStorage.removeItem(key);
  }

  async removeAllRawStorageValues() {
    this.localStorage.clear();
  }

  async openDatabase(_identifier: string) {
    return {};
  }

  getDatabaseKeyPrefix(identifier: string) {
    if (identifier) {
      return `${identifier}-item-`;
    } else {
      return 'item-';
    }
  }

  keyForPayloadId(id: string, identifier: string) {
    return `${this.getDatabaseKeyPrefix(identifier)}${id}`;
  }

  async getAllRawDatabasePayloads(identifier: string) {
    const models = [];
    for (const key in this.storage) {
      if (key.startsWith(this.getDatabaseKeyPrefix(identifier))) {
        models.push(JSON.parse(this.storage[key]));
      }
    }
    return models;
  }

  async saveRawDatabasePayload(payload: any, identifier: string) {
    this.localStorage.setItem(
      this.keyForPayloadId(payload.uuid, identifier),
      JSON.stringify(payload)
    );
  }

  async saveRawDatabasePayloads(payloads: any, identifier: string) {
    for (const payload of payloads) {
      await this.saveRawDatabasePayload(payload, identifier);
    }
  }

  async removeRawDatabasePayloadWithId(id: string, identifier: string) {
    this.localStorage.removeItem(this.keyForPayloadId(id, identifier));
  }

  async removeAllRawDatabasePayloads(identifier: string) {
    for (const key in this.storage) {
      if (key.startsWith(this.getDatabaseKeyPrefix(identifier))) {
        delete this.storage[key];
      }
    }
  }

  async getNamespacedKeychainValue(identifier: string) {
    const keychain = await this.getRawKeychainValue();
    if (!keychain) {
      return;
    }
    return keychain[identifier];
  }

  async setNamespacedKeychainValue(value: any, identifier: string) {
    let keychain = await this.getRawKeychainValue();
    if (!keychain) {
      keychain = {};
    }
    this.localStorage.setItem(KEYCHAIN_STORAGE_KEY, JSON.stringify({
      ...keychain,
      [identifier]: value,
    }));
  }

  async clearNamespacedKeychainValue(identifier: string) {
    const keychain = await this.getRawKeychainValue();
    if (!keychain) {
      return;
    }
    delete keychain[identifier];
    this.localStorage.setItem(KEYCHAIN_STORAGE_KEY, JSON.stringify(keychain));
  }

  /** Allows unit tests to set legacy keychain structure as it was <= 003 */
  async legacy_setRawKeychainValue(value: any) {
    this.localStorage.setItem(KEYCHAIN_STORAGE_KEY, JSON.stringify(value));
  }

  async getRawKeychainValue() {
    const keychain = this.localStorage.getItem(KEYCHAIN_STORAGE_KEY);
    return JSON.parse(keychain);
  }

  async clearRawKeychainValue() {
    this.localStorage.removeItem(KEYCHAIN_STORAGE_KEY);
  }

  async openUrl(url: string) {
    window.open(url);
  }
}
