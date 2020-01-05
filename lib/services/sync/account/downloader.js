import { CreateItemFromPayload } from '@Services/modelManager';
import { PAYLOAD_SOURCE_REMOTE_RETRIEVED } from '@Lib/protocol/payloads/sources';

export class AccountDownloader {
  /**
   * Executes a sync request with a blank sync token and high download limit. It will download all items,
   * but won't do anything with them other than decrypting and creating respective objects.
   */
  static async downloadAllPayloads({
    apiService,
    protocolManager,
    contentType,
    customEvent,
    progress,
    limit,
  }) {
    const response = await apiService.sync({
      lastSyncToken: syncToken,
      paginationToken: paginationToken,
      limit: limit || 500,
      contentType: contentType,
      customEvent: customEvent
    }).then(async (response) => {
      if(!progress) {
        progress = {
          retrievedPayloads: []
        }
      }
      const encryptedPayloads = response.retrieved_items.map((retrievedPayload) => {
        return CreatePayloadFromAnyObject({
          object: retrievedPayload,
          source: PAYLOAD_SOURCE_REMOTE_RETRIEVED
        });
      })
      const decryptedPayloads = await protocolManager.payloadsByDecryptingPayloads({
        payloads: encryptedPayloads
      });

      progress.retrievedPayloads = progress.retrievedPayloads.concat(decryptedPayloads);
      progress.syncToken = response.sync_token;
      progress.cursorToken = response.cursor_token;

      if(cursorToken) {
        return this.stateless_downloadAllItems({
          apiService,
          protocolManager,
          contentType,
          customEvent,
          progress,
          limit,
        });
      } else {
        return retrievedPayloads;
      }
    })
  }
}
