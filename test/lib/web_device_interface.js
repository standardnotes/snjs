/* eslint-disable no-undef */
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
    /** no-op */
  }

  _getDatabaseKeyPrefix() {
    if (this.namespace) {
      return `${this.namespace}-item-`;
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

  /** @keychian */
  async getKeychainValue() {
    return this.keychainValue;
  }

  async setKeychainValue(value) {
    this.keychainValue = value;
  }

  async clearKeychainValue() {
    this.keychainValue = null;
  }
}
