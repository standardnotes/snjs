import { DeviceInterface as SNDeviceInterface } from '@Lib/index';

const KEYCHAIN_STORAGE_KEY = 'keychain';

/**
 * The DeviceInterface implementation to handle storage and keychain operations.
 */
export default class DeviceInterface extends SNDeviceInterface {
  constructor(timeout: any, interval: any) {
    super(timeout, interval);
  }

  async getRawStorageValue(key: string) {
    return localStorage.getItem(key) || undefined;
  }

  async getAllRawStorageKeyValues() {
    const results = [];
    for (const key of Object.keys(localStorage)) {
      results.push({
        key: key,
        value: localStorage[key]
      });
    }
    return results;
  }

  async setRawStorageValue(key: string, value: any) {
    localStorage.setItem(key, value);
  }

  async removeRawStorageValue(key: string) {
    localStorage.removeItem(key);
  }

  async removeAllRawStorageValues() {
    localStorage.clear();
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
    for (const key in localStorage) {
      if (key.startsWith(this.getDatabaseKeyPrefix(identifier))) {
        models.push(JSON.parse(localStorage[key]));
      }
    }
    return models;
  }

  async saveRawDatabasePayload(payload: any, identifier: string) {
    localStorage.setItem(
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
    localStorage.removeItem(this.keyForPayloadId(id, identifier));
  }

  async removeAllRawDatabasePayloads(identifier: string) {
    for (const key in localStorage) {
      if (key.startsWith(this.getDatabaseKeyPrefix(identifier))) {
        delete localStorage[key];
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
    localStorage.setItem(KEYCHAIN_STORAGE_KEY, JSON.stringify({
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
    localStorage.setItem(KEYCHAIN_STORAGE_KEY, JSON.stringify(keychain));
  }

  /** Allows unit tests to set legacy keychain structure as it was <= 003 */
  async legacy_setRawKeychainValue(value: any) {
    localStorage.setItem(KEYCHAIN_STORAGE_KEY, JSON.stringify(value));
  }

  async getRawKeychainValue() {
    const keychain = localStorage.getItem(KEYCHAIN_STORAGE_KEY);
    if (keychain) {
      return JSON.parse(keychain);
    }
  }

  async clearRawKeychainValue() {
    localStorage.removeItem(KEYCHAIN_STORAGE_KEY);
  }

  async openUrl(url: string) {
    window.open(url);
  }
}
