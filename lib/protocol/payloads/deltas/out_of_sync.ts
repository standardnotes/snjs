import { PayloadsDelta } from '@Payloads/deltas/delta';
import { PayloadSources } from '@Payloads/sources';
import { PayloadCollection } from '@Payloads/collection';
import { PayloadsByDuplicating, PayloadContentsEqual } from '@Payloads/functions';

import { extendArray } from '@Lib/utils';

export class DeltaOutOfSync extends PayloadsDelta {

  public async resultingCollection() {
    const results = [];
    for (const payload of this.applyCollection.getAllPayloads()) {
      /**
       * Map the server payload as authoritive content. If client copy differs,
       * we will create a duplicate of it below.
       * This is also neccessary to map the updated_at value from the server
       */
      results.push(payload);
      const current = this.findBasePayload(payload.uuid);
      if (!current) {
        continue;
      }
      const equal = PayloadContentsEqual(payload, current);
      if (equal) {
        continue;
      }
      /**
       * We create a copy of the local existing item and sync that up.
       * It will be a 'conflict' of itself
       */
      const copyResults = await PayloadsByDuplicating(
        current,
        this.baseCollection,
        true
      );
      extendArray(results, copyResults);
    }
    return new PayloadCollection(results, PayloadSources.RemoteRetrieved);
  }
}
