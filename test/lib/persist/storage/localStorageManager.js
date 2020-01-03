export default class LocalStorageManager extends SNStorageManager {

  async initializeFromDisk() {
    const payload = localStorage.getItem(this.getPersistenceKey()) || {};
    this.setInitialContent(payload);
  }

  async persistAsPayloadToDisk(payload) {
    localStorage.setItem(payload, this.getPersistenceKey());
  }
}
