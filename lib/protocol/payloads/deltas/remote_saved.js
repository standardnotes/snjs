import { PayloadsDelta } from '@Protocol/payloads/deltas/delta';
import { PayloadCollection, CopyPayload } from '@Protocol/payloads';
import * as sources from '@Protocol/payloads/sources';

export class DeltaRemoteSaved extends PayloadsDelta {

  async resultingCollection() {
    const processed = [];

    for(const payload of this.applyCollection.allPayloads) {
      const decrypted = this.findRelatedPayload({
        id: payload.uuid,
        source: sources.PAYLOAD_SOURCE_DECRYPTED_TRANSIENT
      });

      if(!decrypted) {
        throw 'Unable to find decrypted counterpart for payload.';
      }

      const result = CopyPayload({
        payload: decrypted
      });

      processed.push(result);
    }

    return new PayloadCollection({
      payloads: processed,
      source: sources.PAYLOAD_SOURCE_REMOTE_SAVED
    })
  }
}
