export default class MemoryDatabaseManager extends SNDatabaseManager {

  constructor({namespace}) {
    super({namespace});
    this.models = [];
  }

  getKeyPrefix() {
    if(this.namespace) {
      return `${this.namespace}-item-`;
    } else {
      return `item-`;
    }
  }

  async getAllModels() {
    return this.models;
  }

  async saveModels(items) {
    for(const item of items) {
      if(!this.models.includes(item)) {
        this.models.push(item);
      }
    }
  }

  async deleteModel(item) {
    this.models.splice(this.models.indexOf(item), 1);
  }

  async clearAllModels() {
    this.models = [];
  }
}
