/**
 * Platforms must override this class to provide platform specific utilities
 * and access to the migration service, such as exposing an interface to read
 * raw values from the database or value storage.

 * This avoids the need for platforms to override migrations directly.
 */

export class DeviceInterface {

  async getRawStorageValue(key) {
    throw 'Must override DeviceInterface.getRawStorageValue';
  }

  async setRawStorageValue(key, value) {
    throw 'Must override DeviceInterface.setRawStorageValue';
  }

  async getRawDatabaseValue(key) {
    throw 'Must override DeviceInterface.getRawDatabaseValue';
  }

  async getRawKeychainValue() {
    throw 'Must override DeviceInterface.getRawKeychainValue';
  }

  async setKeychainValue(value) {
    throw 'Must override DeviceInterface.setKeychainValue';
  }

  async clearKeychainValue() {
    throw 'Must override DeviceInterface.clearKeychainValue';
  }

}
