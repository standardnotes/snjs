const SYNC_URL_PATH = '/items/sync';

export class SyncServerRequest {
  constructor({serverUrl}) {
    this.syncPath = serverUrl + SYNC_URL_PATH;
  }

  async run() {
    const response = new AccountSyncResponse();
  }
}
