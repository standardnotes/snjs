import { ConflictDelta } from '@Payloads/deltas/conflict';
import { PayloadsDelta } from '@Payloads/deltas/delta';
import { PayloadSource } from '@Payloads/sources';
import { ImmutablePayloadCollection } from "@Protocol/collection/payload_collection";
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
      const delta = new ConflictDelta(
        this.baseCollection,
        current,
        decrypted,
        PayloadSource.ConflictData
      );
      const deltaCollection = await delta.resultingCollection();
      const payloads = deltaCollection.all();
      extendArray(conflictResults, payloads);
    }

    return ImmutablePayloadCollection.WithPayloads(
      filtered.concat(conflictResults),
      PayloadSource.RemoteRetrieved
    );
  }
}
