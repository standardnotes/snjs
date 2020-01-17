import { PureService } from '@Lib/services/pure_service';

export class SNDatabaseManager extends PureService {

  constructor({namespace}) {
    super();
    this.namespace = namespace;
  }

  async openDatabase() {
    throw 'Must override SNDatabaseManager.openDatabase';
  }

  async getAllRawPayloads() {
    throw 'Must override SNDatabaseManager.getAllRawPayloads';
  }

  async savePayload(item) {
    return this.savePayloads([item]);
  }

  async savePayloads(items) {
    throw 'Must override SNDatabaseManager.savePayloads';
  }

  async deletePayloadWithId(id) {
    throw 'Must override SNDatabaseManager.deletePayloadWithId';
  }

  async clearAllPayloads() {
    throw 'Must override SNDatabaseManager.clearAllPayloads';
  }
}
