export default class LocalStorageManager extends SNStorageManager {

  async initializeFromDisk() {
    const payload = localStorage.getItem(this.getPersistenceKey());
    this.setInitialValues(JSON.parse(payload));
  }

  async persistAsValueToDisk(payload) {
    localStorage.setItem(this.getPersistenceKey(), JSON.stringify(payload));
  }

  async clearPersistenceValue() {
    localStorage.removeItem(this.getPersistenceKey());
  }
}
