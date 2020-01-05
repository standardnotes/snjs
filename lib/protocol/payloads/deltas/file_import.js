import { PayloadsDelta } from '@Protocol/payloads/deltas/delta';
import { PayloadCollection } from '@Protocol/payloads';

export class DeltaFileImport extends PayloadsDelta {

  async resultingCollection() {
    const results = [];
    for(const payload of this.applyCollection.allPayloads) {
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
      if(current && !current.errorDecrypting) {
        const differs = !current.compareContentFields(payload);
        if(differs) {
          const resultingPayloads = await payload.payloadsByCopying({
            isConflict: true,
            masterCollection: this.baseCollection
          })
          extendArray(results, resultingPayloads);
        }
      } else {
        results.push(payload);
      }
    }

    return new PayloadCollection({
      payloads: results,
      source: PAYLOAD_SOURCE_FILE_IMPORT
    });
  }
}
