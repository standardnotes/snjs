import { PayloadsDelta } from '@Payloads/deltas/delta';
import { PayloadCollection, CreateSourcedPayloadFromObject } from '@Payloads';
import { PayloadSources } from '@Payloads/sources';

export class DeltaRemoteSaved extends PayloadsDelta {

  async resultingCollection() {
    const processed = [];

    for(const payload of this.applyCollection.allPayloads) {
      const result = CreateSourcedPayloadFromObject({
        object: payload,
        source: PayloadSources.RemoteSaved
      });
      processed.push(result);
    }

    return new PayloadCollection({
      payloads: processed,
      source: PayloadSources.RemoteSaved
    });
  }
}
