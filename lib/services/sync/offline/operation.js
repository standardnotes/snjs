import { CreateSourcedPayloadFromObject } from '@Payloads/generator';
import { SIGNAL_TYPE_RESPONSE } from '@Services/sync/signals';
import { PayloadFields } from '@Payloads/fields';
import { PayloadSources } from '@Payloads/sources';

export class OfflineSyncOperation {

  /**
   * @param payloads  An array of payloads to sync offline
   * @param receiver  A function that recieves callback multiple times during the operation
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
    const response = { payloads: responsePayloads };
    await this.receiver(response, SIGNAL_TYPE_RESPONSE);
  }
}
