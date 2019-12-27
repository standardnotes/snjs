export default class LocalStorageManager extends SNStorageManager {

  async initializeFromDisk() {
    const payload = localStorage.getItem(this.getPersistenceKey()) || {};
    this.setPayload(payload);
  }

  async persistAsPayloadToDisk(payload) {
    localStorage.setItem(payload, this.getPersistenceKey());
  }
}
