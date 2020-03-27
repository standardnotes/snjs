import { CreateSourcedPayloadFromObject } from '@Payloads/generator';
import { PayloadSources } from '@Lib/protocol/payloads/sources';

export class AccountDownloader {

  constructor({
    apiService,
    protocolService,
    contentType,
    customEvent,
    limit
  }) {
    this.apiService = apiService;
    this.protocolService = protocolService;
    this.contentType = contentType;
    this.customEvent = customEvent;
    this.limit = limit;
    this.progressObj = {
      retrievedPayloads: []
    };
  }

  /**
   * Executes a sync request with a blank sync token and high download limit. It will download all items,
   * but won't do anything with them other than decrypting and creating respective objects.
   */
  async run() {
    const response = await this.apiService.sync({
      lastSyncToken: this.progressObj.lastSyncToken,
      paginationToken: this.progressObj.paginationToken,
      limit: this.limit || 500,
      contentType: this.contentType,
      customEvent: this.customEvent
    });
    const encryptedPayloads = response.retrieved_items.map((rawRetrievedPayload) => {
      return CreateSourcedPayloadFromObject(
        rawRetrievedPayload,
        PayloadSources.RemoteRetrieved
      );
    });
    const decryptedPayloads = await this.protocolService.payloadsByDecryptingPayloads({
      payloads: encryptedPayloads
    });

    this.progressObj.retrievedPayloads = this.progressObj.retrievedPayloads.concat(
      decryptedPayloads
    );
    this.progressObj.lastSyncToken = response.sync_token;
    this.progressObj.paginationToken = response.cursor_token;

    if (response.cursor_token) {
      return this.run();
    } else {
      return this.progressObj.retrievedPayloads;
    }
  }

}
