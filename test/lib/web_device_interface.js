export default class WebDeviceInterface extends DeviceInterface {

  async getRawStorageValue(key) {
    return localStorage.getItem(key);
  }

  async setRawStorageValue(key, value) {
    localStorage.setItem(key, value);
  }

  async removeRawStorageValue(key) {
    localStorage.removeItem(key);
  }

  async getRawDatabaseValue(key) {
    return localStorage.getItem(key);
  }

  async setRawDatabaseValue(key, value) {
    localStorage.setItem(key, value);
  }

  async getRawKeychainValue() {
    return this.keychainValue;
  }

  async setKeychainValue(value) {
    this.keychainValue = value;
  }

  async clearKeychainValue() {
    this.keychainValue = null;
  }

}
