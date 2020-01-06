import { PayloadsDelta } from '@Protocol/payloads/deltas/delta';
import { PayloadCollection, CopyPayload } from '@Protocol/payloads';
import { PAYLOAD_SOURCE_REMOTE_SAVED } from '@Protocol/payloads/sources';

export class DeltaRemoteSaved extends PayloadsDelta {

  async resultingCollection() {
    const processed = [];

    for(const payload of this.applyCollection.allPayloads) {
      const result = CreateSourcedPayloadFromObject({
        object: payload,
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
