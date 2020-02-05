
import {
  PayloadCollection, 
  PayloadsByDuplicating, 
  PayloadsDelta, 
  PayloadContentsEqual,
  PayloadSoures
} from '@Payloads';
import { extendArray } from '@Lib/utils';

export class DeltaOutOfSync extends PayloadsDelta {

  async resultingCollection() {
    const results = [];
    for (const payload of this.applyCollection.allPayloads) {
      /**
       * Map the server payload as authoritive content. If client copy differs,
       * we will create a duplicate of it below.
       * This is also neccessary to map the updated_at value from the server
       */
      results.push(payload);
      const current = this.findBasePayload({
        id: payload.uuid
      });
      if (!current) {
        continue;
      }
      const equal = PayloadContentsEqual(payload, current);
      if (equal) {
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
      });
      extendArray(results, copyResults);
    }
    return new PayloadCollection({
      payloads: results,
      source: PayloadSoures.RemoteRetrieved
    });
  }
}
