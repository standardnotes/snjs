export default class LocalStorageDatabaseManager extends SNDatabaseManager {

  async openDatabase() {

  }

  getKeyPrefix() {
    if(this.namespace) {
      return `${this.namespace}-item-`;
    } else {
      return `item-`;
    }
  }

  async getAllRawPayloads() {
    const models = [];
    for(var key in localStorage) {
      if(key.startsWith(this.getKeyPrefix())) {
        models.push(JSON.parse(localStorage[key]))
      }
    }
    return models;
  }

  async savePayload(item) {
    return this.savePayloads([item]);
  }

  async savePayloads(items) {
    for(const item of items) {
      localStorage.setItem(`${this.getKeyPrefix()}${item.uuid}`, JSON.stringify(item));
    }
  }

  async deletePayloadWithId(id) {
    return localStorage.removeItem(`${this.getKeyPrefix()}${id}`);
  }

  async clearAllPayloads() {
    for(var key in localStorage) {
      if(key.startsWith(this.getKeyPrefix())) {
        this.deletePayloadWithId(key);
      }
    }
  }
}
