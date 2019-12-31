export default class MemoryDatabaseManager extends SNDatabaseManager {

  constructor({namespace}) {
    super({namespace});
    this.payloads = [];
  }

  getKeyPrefix() {
    if(this.namespace) {
      return `${this.namespace}-item-`;
    } else {
      return `item-`;
    }
  }

  async getAllPayloads() {
    return this.payloads;
  }

  async savePayloads(items) {
    for(const item of items) {
      if(!this.payloads.includes(item)) {
        this.payloads.push(item);
      }
    }
  }

  async deletePayloadWithId(id) {
    const index = this.payloads.indexOf((payload) => payload.uuid === id);
    this.payloads.splice(index, 1);
  }

  async clearAllPayloads() {
    this.payloads = [];
  }
}
