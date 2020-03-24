import { CreateSourcedPayloadFromObject } from '@Payloads/generator';
import { SIGNAL_TYPE_RESPONSE } from '@Services/sync/signals';
import { PayloadFields } from '@Payloads/fields';
import { PayloadSources } from '@Payloads/sources';
import { SyncResponse } from '@Services/sync/response';
import { Copy } from '@Lib/utils';

export class OfflineSyncOperation {

  /**
   * @param payloads  An array of payloads to sync offline
   * @param receiver  A function that receives callback multiple times during the operation
   *                  and takes two parameters: (payloads, actions)
   */
  constructor({ payloads, receiver }) {
    this.payloads = payloads;
    this.receiver = receiver;
  }

  async run() {
    const responsePayloads = this.payloads.map((payload) => {
      return CreateSourcedPayloadFromObject({
        object: payload,
        source: PayloadSources.LocalSaved,
        override: {
          [PayloadFields.Dirty]: false,
          [PayloadFields.LastSyncEnd]: new Date()
        }
      });
    });
    /* Since we are simulating a server response, they should be pure JS objects */
    const savedItems = Copy(responsePayloads);
    const response = new SyncResponse({ saved_items: savedItems });
    await this.receiver(response, SIGNAL_TYPE_RESPONSE);
  }
}
