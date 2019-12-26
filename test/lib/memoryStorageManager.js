// A test StorageManager class using Memory storage

export default class MemoryStorageManager extends SFStorageManager {

  async initializeFromDisk() {
    this.setPayload({});
  }

}
