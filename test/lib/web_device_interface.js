/* eslint-disable no-undef */

const KEYCHAIN_STORAGE_KEY = 'keychain';

export default class WebDeviceInterface extends DeviceInterface {

  async getRawStorageValue(key) {
    return localStorage.getItem(key);
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

  async setRawStorageValue(key, value) {
    localStorage.setItem(key, value);
  }

  async removeRawStorageValue(key) {
    localStorage.removeItem(key);
  }

  async removeAllRawStorageValues() {
    localStorage.clear();
  }

  async openDatabase() {
    return {};
  }

  _getDatabaseKeyPrefix() {
    if (this.namespace) {
      return `${this.namespace.identifier}-item-`;
    } else {
      return 'item-';
    }
  }

  _keyForPayloadId(id) {
    return `${this._getDatabaseKeyPrefix()}${id}`;
  }

  async getAllRawDatabasePayloads() {
    const models = [];
    for (const key in localStorage) {
      if (key.startsWith(this._getDatabaseKeyPrefix())) {
        models.push(JSON.parse(localStorage[key]));
      }
    }
    return models;
  }

  async saveRawDatabasePayload(payload) {
    localStorage.setItem(
      this._keyForPayloadId(payload.uuid),
      JSON.stringify(payload)
    );
  }

  async saveRawDatabasePayloads(payloads) {
    for (const payload of payloads) {
      await this.saveRawDatabasePayload(payload);
    }
  }

  async removeRawDatabasePayloadWithId(id) {
    localStorage.removeItem(this._keyForPayloadId(id));
  }

  async removeAllRawDatabasePayloads() {
    for (const key in localStorage) {
      if (key.startsWith(this._getDatabaseKeyPrefix())) {
        delete localStorage[key];
      }
    }
  }

  /** @keychain */
  async getNamespacedKeychainValue() {
    const keychain = await this.getRawKeychainValue();
    return keychain[this.namespace.identifier];
  }

  async setNamespacedKeychainValue(value) {
    let keychain = await this.getRawKeychainValue();
    if (!keychain) {
      keychain = {};
    }
    localStorage.setItem(KEYCHAIN_STORAGE_KEY, JSON.stringify({
      ...keychain,
      [this.namespace.identifier]: value,
    }));
  }

  async clearNamespacedKeychainValue() {
    const keychain = await this.getRawKeychainValue();
    if (!keychain) {
      return;
    }
    delete keychain[this.namespace.identifier];
    localStorage.setItem(KEYCHAIN_STORAGE_KEY, JSON.stringify(keychain));
  }

  async getRawKeychainValue() {
    const keychain = localStorage.getItem(KEYCHAIN_STORAGE_KEY);
    return JSON.parse(keychain);
  }

  async clearRawKeychainValue() {
    localStorage.removeItem(KEYCHAIN_STORAGE_KEY);
  }
}
