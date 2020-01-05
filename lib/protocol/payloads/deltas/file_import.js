import { PayloadsDelta } from '@Protocol/payloads/deltas/delta';
import { PayloadCollection } from '@Protocol/payloads';
import { ConflictDelta } from '@Protocol/payloads/deltas/conflict';

export class DeltaFileImport extends PayloadsDelta {

  async resultingCollection() {
    const results = [];
    for(const payload of this.applyCollection.allPayloads) {
      const payloads = await this.handlePayloadInCollection({
        payload: payload
      });
      extendArray(results, payloads);
    }
    return new PayloadCollection({
      payloads: results,
      source: PAYLOAD_SOURCE_FILE_IMPORT
    });
  }

  async handlePayloadInCollection({payload}) {
    /**
     * Check to see if we've already processed a payload for this id.
     * If so, that would be the latest value, and not what's in the BC.
     */
    let current = results.find((candidate) => {
      return (
        candidate.uuid === payload.uuid ||
        candidate.content.conflict_of === payload.uuid
      );
    })
    if(!current) {
      current = this.findBasePayload({id: payload.uuid});
    }
    if(!current || current.errorDecrypting) {
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
