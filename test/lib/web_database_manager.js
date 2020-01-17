export default class WebDatabaseManager extends SNDatabaseManager {

  async openDatabase() {

  }

  getKeyPrefix() {
    if(this.namespace) {
      return `${this.namespace}-item-`;
    } else {
      return `item-`;
    }
  }

  keyForItem(item) {
    return this.keyForId(item.uuid);
  }

  keyForId(id) {
    return `${this.getKeyPrefix()}${id}`;
  }

  async getAllRawPayloads() {
    const models = [];
    for(const key in localStorage) {
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
      localStorage.setItem(this.keyForItem(item), JSON.stringify(item));
    }
  }

  async deletePayloadWithId(id) {
    localStorage.removeItem(this.keyForId(id));
  }

  async clearAllPayloads() {
    for(const key in localStorage) {
      if(key.startsWith(this.getKeyPrefix())) {
        localStorage.removeItem(key);
      }
    }
  }
}
