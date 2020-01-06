import { PayloadsDelta } from '@Protocol/payloads/deltas/delta';
import { PayloadCollection } from '@Protocol/payloads';
import { ConflictDelta } from '@Protocol/payloads/deltas/conflict';

export class DeltaFileImport extends PayloadsDelta {

  async resultingCollection() {
    const results = [];
    for(const payload of this.applyCollection.allPayloads) {
      const payloads = await this.payloadsByHandlingPayload({
        payload: payload,
        currentResults: results
      });
      extendArray(results, payloads);
    }
    return new PayloadCollection({
      payloads: results,
      source: PAYLOAD_SOURCE_FILE_IMPORT
    });
  }

  async payloadsByHandlingPayload({payload, currentResults}) {
  /**
   * Check to see if we've already processed a payload for this id.
   * If so, that would be the latest value, and not what's in the BC.
   */
   /*
    * Find the most recently created conflict if available, as that
    * would contain the most recent value.
    */
    let current = currentResults.find((candidate) => {
      return candidate.content.conflict_of === payload.uuid;
    })

    /**
     * If no latest conflict, find by uuid directly.
     */
    if(!current) {
      current = currentResults.find((candidate) => {
        return candidate.uuid === payload.uuid;
      })
    }

    /**
     * If not found in current results, use the base value.
     */
    if(!current) {
      current = this.findBasePayload({id: payload.uuid});
    }

    /**
     * If the current doesn't exist, we're creating a new item from payload.
     */
    if(!current) {
      return [payload];
    }

    const delta = new ConflictDelta({
      baseCollection: this.baseCollection,
      basePayload: current,
      applyPayload: payload
    })
    const deltaCollection = await delta.resultingCollection();
    return deltaCollection.allPayloads;
  }
}
