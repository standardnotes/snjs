// A test StorageManager class using Memory storage

export default class MemoryStorageManager extends SNStorageManager {

  async initializeFromDisk() {
    this.setPayload({});
  }

}
