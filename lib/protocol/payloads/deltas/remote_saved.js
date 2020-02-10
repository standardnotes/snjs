import { PayloadsDelta } from '@Payloads/deltas/delta';
import { PayloadSources } from '@Payloads/sources';
import { PayloadCollection } from '@Payloads/collection';
import { CreateSourcedPayloadFromObject } from '@Payloads/generator';
import { PayloadFields } from '@Payloads/fields';

export class DeltaRemoteSaved extends PayloadsDelta {

  async resultingCollection() {
    const processed = [];

    for(const payload of this.applyCollection.allPayloads) {
      const result = CreateSourcedPayloadFromObject({
        object: payload,
        source: PayloadSources.RemoteSaved,
        override: {
          [PayloadFields.LastSyncEnd]: new Date()
        }
      });
      processed.push(result);
    }

    return new PayloadCollection({
      payloads: processed,
      source: PayloadSources.RemoteSaved
    });
  }
}
