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

  async getJsonParsedStorageValue(key) {
    const value = await this.getRawStorageValue(key);
    return value ? JSON.parse(value) : value;
  }

  async setRawStorageValue(key, value) {
    throw 'Must override DeviceInterface.setRawStorageValue';
  }

  async removeRawStorageValue(key) {
    throw 'Must override DeviceInterface.removeRawStorageValue';
  }

  async getRawDatabasePayloadWithId(id) {
    throw 'Must override DeviceInterface.getRawDatabasePayloadWithId';
  }

  async getAllRawDatabasePayloads() {
    throw 'Must override DeviceInterface.getAllRawDatabasePayloads';
  }

  async saveRawDatabasePayload(payload) {
    throw 'Must override DeviceInterface.saveRawDatabasePayload';
  }

  async saveRawDatabasePayloads(payloads) {
    throw 'Must override DeviceInterface.saveRawDatabasePayloads';
  }

  async removeRawDatabasePayloadWithId(id) {
    throw 'Must override DeviceInterface.removeRawDatabasePayloadWithId';
  }

  async removeAllRawDatabasePayloads() {
    throw 'Must override DeviceInterface.removeAllRawDatabasePayloads';
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
