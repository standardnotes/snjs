// A test StorageManager class using LocalStorage

export default class MemoryStorageManager extends SFStorageManager {

  constructor() {
    super();
    this.memory = {};
  }

  getItem(key) {
    return this.memory[key] || null;
  }

  getItemSync(key) {
    return this.getItem(key);
  }

  get length() {
    return Object.keys(this.memory).length;
  }

  setItem(key, value) {
    this.memory[key] = value;
  }

  removeItem(key) {
    delete this.memory[key];
  }

  clear() {
    this.memory = {};
  }

  keys() {
    return Object.keys(this.memory);
  }

  key(index) {
    return Object.keys(this.memory)[index];
  }

  /*
  Model Storage
  */

  async getAllModels() {
    var models = [];
    for(var key of Object.keys(this.memory)) {
      if(key.startsWith("item-")) {
        models.push(JSON.parse(this.memory[key]))
      }
    }
    return models;
  }

  async saveModel(item) {
    return this.saveModels([item]);
  }

  async saveModels(items) {
    return Promise.all(items.map((item) => {
      return this.setItem(`item-${item.uuid}`, JSON.stringify(item));
    }))
  }

  async deleteModel(item,) {
    return this.removeItem(`item-${item.uuid}`);
  }

  async clearAllModels() {
    // clear only models
    for(var key of Object.keys(this.memory)) {
      if(key.startsWith("item-")) {
        this.removeItem(key);
      }
    }
  }

  /* General */

  clearAllData() {
    return Promise.all([
      this.clear(),
      this.clearAllModels()
    ])
  }

}
