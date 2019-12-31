export default class LocalStorageDatabaseManager extends SNDatabaseManager {

  getKeyPrefix() {
    if(this.namespace) {
      return `${this.namespace}-item-`;
    } else {
      return `item-`;
    }
  }

  async getAllPayloads() {
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
      localStorage.setValue(`${this.getKeyPrefix()}${item.uuid}`, JSON.stringify(item));
    }
  }

  async deletePayloadWithId(id) {
    return localStorage.removeValue(`${this.getKeyPrefix()}${id}`);
  }

  async clearAllPayloads() {
    for(var key in localStorage) {
      if(key.startsWith(this.getKeyPrefix())) {
        this.deletePayloadWithId(key);
      }
    }
  }
}
