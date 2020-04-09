import { PayloadsDelta } from '@Payloads/deltas/delta';
import { ConflictDelta } from '@Payloads/deltas/conflict';
import { PayloadSource } from '@Payloads/sources';
import { ImmutablePayloadCollection } from '@Payloads/collection';
import { PayloadsByAlternatingUuid } from '@Payloads/functions';
import { extendArray } from '@Lib/utils';
import { PurePayload } from '../pure_payload';

export class DeltaRemoteConflicts extends PayloadsDelta {

  public async resultingCollection() {
    if (this.applyCollection.source === PayloadSource.ConflictUuid) {
      return this.collectionsByHandlingUuidConflicts();
    } else if (this.applyCollection.source === PayloadSource.ConflictData) {
      return this.collectionsByHandlingDataConflicts();
    } else {
      throw `Unhandled conflict type ${this.applyCollection.source}`;
    }
  }

  private async collectionsByHandlingDataConflicts() {
    const results = [];
    for (const payload of this.applyCollection.all()) {
      const current = this.findBasePayload(payload.uuid!);
      /** Could be deleted */
      if (!current) {
        results.push(payload);
        continue;
      }
      const decrypted = this.findRelatedPayload(
        payload.uuid!,
        PayloadSource.DecryptedTransient
      );
      if (!decrypted) {
        /** Decrypted should only be missing in case of deleted payload */
        if (!payload.deleted) {
          throw 'Unable to find decrypted counterpart for data conflict.';
        }
        results.push(payload);
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
      extendArray(results, payloads);
    }
    return new ImmutablePayloadCollection(results, PayloadSource.RemoteRetrieved);
  }

  /**
   * UUID conflicts can occur if a user attmpts to import an old data
   * backup with uuids from the old account into a new account.
   * In uuid_conflict, we receive the value we attmpted to save.
   */
  private async collectionsByHandlingUuidConflicts() {
    const results: Array<PurePayload> = [];
    for (const payload of this.applyCollection.all()) {
      const decrypted = this.findRelatedPayload(
        payload.uuid!,
        PayloadSource.DecryptedTransient
      );
      const alternateResults = await PayloadsByAlternatingUuid(
        decrypted!,
        this.baseCollection
      );
      extendArray(results, alternateResults);
    }

    return new ImmutablePayloadCollection(results, PayloadSource.RemoteRetrieved);
  }
}
