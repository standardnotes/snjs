export default class LocalStorageManager extends SNStorageManager {

  async initializeFromDisk() {
    const payload = localStorage.getValue(this.getPersistenceKey()) || {};
    this.setInitialContent(payload);
  }

  async persistAsPayloadToDisk(payload) {
    localStorage.setValue(payload, this.getPersistenceKey());
  }
}
