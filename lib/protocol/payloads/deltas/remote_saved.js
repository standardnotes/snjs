import { PayloadsDelta } from '@Protocol/payloads/deltas/delta';
import { PayloadCollection, CreatePayloadFromAnyObject } from '@Protocol/payloads';

export class DeltaRemoteSaved extends PayloadsDelta {

  async resultingCollection() {
    const processed = [];

    for(const payload of this.applyCollection.allPayloads) {
      const decrypted = this.findRelatedPayload({
        id: payload.uuid,
        source: PAYLOAD_SOURCE_DECRYPTED_TRANSIENT
      });

      if(!decrypted) {
        throw 'Unable to find decrypted counterpart for payload.';
      }

      const result = CreatePayloadFromAnyObject({
        object: decrypted,
        source: PAYLOAD_SOURCE_REMOTE_SAVED
      });

      processed.push(result);
    }

    return new PayloadCollection({
      payloads: processed,
      source: PAYLOAD_SOURCE_REMOTE_SAVED
    })
  }
}
