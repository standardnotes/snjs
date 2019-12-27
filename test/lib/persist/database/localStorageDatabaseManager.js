export default class LocalStorageDatabaseManager extends SNDatabaseManager {

  getKeyPrefix() {
    if(this.namespace) {
      return `${this.namespace}-item-`;
    } else {
      return `item-`;
    }
  }

  async getAllModels() {
    const models = [];
    for(var key in localStorage) {
      if(key.startsWith(this.getKeyPrefix())) {
        models.push(JSON.parse(localStorage[key]))
      }
    }
    return models;
  }

  async saveModel(item) {
    return this.saveModels([item]);
  }

  async saveModels(items) {
    for(const item of items) {
      localStorage.setItem(`${this.getKeyPrefix()}${item.uuid}`, JSON.stringify(item));
    }
  }

  async deleteModel(item) {
    return localStorage.removeItem(`${this.getKeyPrefix()}${item.uuid}`);
  }

  async clearAllModels() {
    for(var key in localStorage) {
      if(key.startsWith(this.getKeyPrefix())) {
        this.deleteModel(key);
      }
    }
  }
}
