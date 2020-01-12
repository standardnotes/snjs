export default class LocalStorageManager extends SNStorageManager {

  async initializeFromDisk() {
    const payload = localStorage.getItem(this.getPersistenceKey());
    this.setInitialValues(JSON.parse(payload));
  }

  async persistAsPayloadToDisk(payload) {
    localStorage.setItem(this.getPersistenceKey(), JSON.stringify(payload));
  }
}
