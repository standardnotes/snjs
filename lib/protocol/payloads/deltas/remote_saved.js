import { PayloadsDelta } from '@Payloads/deltas/delta';
import { PayloadSources } from '@Payloads/sources';
import { PayloadCollection } from '@Payloads/collection';
import { CreateSourcedPayloadFromObject } from '@Payloads/generator';
import { PayloadFields } from '@Payloads/fields';

export class DeltaRemoteSaved extends PayloadsDelta {

  async resultingCollection() {
    const processed = [];

    for(const payload of this.applyCollection.allPayloads) {
      const current = this.findBasePayload({
        id: payload.uuid
      });
      /** If we save an item, but while in transit it is deleted locally, we want to keep 
       * local deletion status, and not old deleted value that was sent to server.
       */
      const deletedState = current ? current.deleted : payload.deleted;
      const result = CreateSourcedPayloadFromObject({
        object: payload,
        source: PayloadSources.RemoteSaved,
        override: {
          [PayloadFields.LastSyncEnd]: new Date(),
          [PayloadFields.Deleted]: deletedState
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
