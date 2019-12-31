export class SNDatabaseManager {

  constructor({namespace}) {
    this.namespace = namespace;
  }

  async getAllPayloads() {
    throw 'Must override';
  }

  async savePayload(item) {
    return this.savePayloads([item]);
  }

  async savePayloads(items) {
    throw 'Must override';
  }

  async deletePayloadWithId(id) {
    throw 'Must override';
  }

  async clearAllPayloads() {
    throw 'Must override';
  }
}
