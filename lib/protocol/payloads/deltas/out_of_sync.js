import { PayloadsDelta, PayloadContentsEqual } from '@Protocol/payloads/deltas/delta';
import { PayloadCollection } from '@Protocol/payloads';
import { PayloadsByDuplicating } from '@Protocol/payloads/functions';

export class DeltaOutOfSync extends PayloadsDelta {

  async resultingCollection() {
    const results = [];
    for(const payload of this.applyCollection.allPayloads) {
      /**
       * Map the server payload as authoritive content. If client copy at all differed,
       * we would have created a duplicate of it above and synced it.
       * This is also neccessary to map the updated_at value from the server
       */
      results.push(payload);

      const current = this.findBasePayload({
        id: payload.uuid
      });
      if(!current) {
        continue;
      }

      const differs = !PayloadContentsEqual(payload, current);
      if(!differs) {
        continue;
      }
      /**
       * We create a copy of the local existing item and sync that up.
       * It will be a "conflict" of itself
       */
      const copyResults = await PayloadsByDuplicating({
        payload: current,
        baseCollection: this.baseCollection,
        isConflict: true
      })
      extendArray(results, copyResults);
    }

    return new PayloadCollection({
      payloads: results,
      source: PAYLOAD_SOURCE_REMOTE_RETRIEVED
    })
  }
}
