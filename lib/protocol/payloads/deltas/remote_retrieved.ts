import { PayloadsDelta } from '@Payloads/deltas/delta';
import { PayloadSource } from '@Payloads/sources';
import { ImmutablePayloadCollection } from '@Payloads/collection';
import { PayloadsByDuplicating } from '@Payloads/functions';

import { extendArray } from '@Lib/utils';
import { PurePayload } from '../pure_payload';

export class DeltaRemoteRetrieved extends PayloadsDelta {

  public async resultingCollection() {
    const filtered = [];
    const conflicted = [];
    /**
    * If we have retrieved an item that was saved as part of this ongoing sync operation,
    * or if the item is locally dirty, filter it out of retrieved_items, and add to potential conflicts.
    */
    for (const received of this.applyCollection.all()) {
      const savedOrSaving = this.findRelatedPayload(
        received.uuid!,
        PayloadSource.SavedOrSaving
      );
      const decrypted = this.findRelatedPayload(
        received.uuid!,
        PayloadSource.DecryptedTransient
      );
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
      const base = this.findBasePayload(received.uuid!);
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
    const conflictResults: Array<PurePayload> = [];
    for (const conflict of conflicted) {
      const decrypted = this.findRelatedPayload(
        conflict.uuid!,
        PayloadSource.DecryptedTransient
      );
      if (!decrypted) {
        continue;
      }
      const current = this.findBasePayload(conflict.uuid!);
      if (!current) {
        continue;
      }
      const differs = !current.compareContentFields(decrypted);
      if (differs) {
        /**
         * Ensure no conflict has already been created with the incoming content.
         * This can occur in a multi-page sync request where in the middle of the request,
         * we make changes to many items, including duplicating, but since we are still not
         * uploading the changes until after the multi-page request completes, we may have
         * already conflicted this item.
         */
        const existingConflict = this.findConflictOf(conflict.uuid!);
        if (existingConflict && existingConflict.compareContentFields(decrypted)) {
          /** Conflict exists and its contents are the same as incoming value, do not make duplicate */
          continue;
        }

        const copyResults = await PayloadsByDuplicating(
          decrypted,
          this.baseCollection,
          true
        );
        extendArray(conflictResults, copyResults);
      }
    }

    return new ImmutablePayloadCollection(
      filtered.concat(conflictResults),
      PayloadSource.RemoteRetrieved
    );
  }

  private findConflictOf(uuid: string) {
    const conflictsOf = this.baseCollection.conflictsOf(uuid);
    return conflictsOf[0];
  }
}
