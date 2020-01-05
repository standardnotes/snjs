import { PayloadsDelta } from '@Protocol/payloads/deltas/delta';
import { PayloadCollection } from '@Protocol/payloads';
import { PayloadsByCopying } from '@Protocol/payloads/functions';

export class DeltaRemoteRetrieved extends PayloadsDelta {

  async resultingCollection() {
    const filtered = [];
    const conflicted = [];
    /**
    * If we have retrieved an item that was saved as part of this ongoing sync operation,
    * or if the item is locally dirty, filter it out of retrieved_items, and add to potential conflicts.
    */
    for(const received of this.applyCollection.allPayloads) {
      const savedOrSaving = this.findRelatedPayload({
        id: received.uuid,
        source: PAYLOAD_SOURCE_SAVED_OR_SAVING
      })
      if(savedOrSaving) {
        conflicted.push(received);
        continue;
      }
      const base = this.findBasePayload({
        id: received.uuid
      });
      if(base && base.dirty) {
        conflicted.push(received);
        continue;
      }
      filtered.push(received);
    }

    /**
     * For any potential conflict above, we compare the values with current
     * local values, and if they differ, we create a new payload that is a copy
     * of the server payload.
     */
    const conflicts = [];
    for(const conflicted of conflicted) {
      const decrypted = this.findRelatedPayload({
        id: conflicted.uuid,
        source: PAYLOAD_SOURCE_DECRYPTED_TRANSIENT
      });
      if(!decrypted) {
        continue;
      }
      const current = this.findBasePayload({
        id: conflicted.uuid
      });
      if(!current) {
        continue;
      }
      const differs = !current.compareContentFields(decrypted);
      if(differs) {
        const copy = await PayloadsByCopying({
          payload: decrypted,
          baseCollection: this.baseCollection,
          isConflict: true
        });
        conflicts.push(copy);
      }
    }

    return new PayloadCollection({
      payloads: filtered.concat(conflicts),
      source: PAYLOAD_SOURCE_REMOTE_RETRIEVED
    })
  }

}
