import {
  PayloadCollection, PayloadSources, PayloadsByDuplicating, PayloadsDelta
} from '@Payloads';
import { extendArray } from '@Lib/utils';

export class DeltaRemoteRetrieved extends PayloadsDelta {

  async resultingCollection() {
    const filtered = [];
    const conflicted = [];
    /**
    * If we have retrieved an item that was saved as part of this ongoing sync operation,
    * or if the item is locally dirty, filter it out of retrieved_items, and add to potential conflicts.
    */
    for (const received of this.applyCollection.allPayloads) {
      const savedOrSaving = this.findRelatedPayload({
        id: received.uuid,
        source: PayloadSources.SavedOrSaving
      });
      const decrypted = this.findRelatedPayload({
        id: received.uuid,
        source: PayloadSources.DecryptedTransient
      });
      if (!decrypted) {
        /** Decrypted should only be missing in case of deleted retrieved item */
        if (!received.deleted) {
          throw 'Cannot find decrypted for non-deleted payload.';
        }
        filtered.push(received);
        continue;
      }
      if (savedOrSaving) {
        conflicted.push(decrypted);
        continue;
      }
      const base = this.findBasePayload({
        id: received.uuid
      });
      if (base && base.dirty) {
        conflicted.push(decrypted);
        continue;
      }
      filtered.push(decrypted);
    }

    /**
     * For any potential conflict above, we compare the values with current
     * local values, and if they differ, we create a new payload that is a copy
     * of the server payload.
     */
    const conflictResults = [];
    for (const conflict of conflicted) {
      const decrypted = this.findRelatedPayload({
        id: conflict.uuid,
        source: PayloadSources.DecryptedTransient
      });
      if (!decrypted) {
        continue;
      }
      const current = this.findBasePayload({
        id: conflict.uuid
      });
      if (!current) {
        continue;
      }
      const differs = !current.compareContentFields(decrypted);
      if (differs) {
        const copyResults = await PayloadsByDuplicating({
          payload: decrypted,
          baseCollection: this.baseCollection,
          isConflict: true
        });
        extendArray(conflictResults, copyResults);
      }
    }

    return new PayloadCollection({
      payloads: filtered.concat(conflictResults),
      source: PayloadSources.RemoteRetrieved
    });
  }
}
