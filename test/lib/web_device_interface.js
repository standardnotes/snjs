export class WebDeviceInterface extends DeviceInterface {

  async getStorageValue({key}) {
    return localStorage.getItem(key);
  }

  async getDatabaseValue({key}) {
    return localStorage.getItem(key);
  }

  async getDefaultKeychainValue() {
    return null;
  }

}
