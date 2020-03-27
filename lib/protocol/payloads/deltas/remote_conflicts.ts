import { PayloadsDelta } from '@Payloads/deltas/delta';
import { ConflictDelta } from '@Payloads/deltas/conflict';
import { PayloadSources } from '@Payloads/sources';
import { PayloadCollection } from '@Payloads/collection';
import { PayloadsByAlternatingUuid } from '@Payloads/functions';
import { extendArray } from '@Lib/utils';
import { PurePayload } from '../pure_payload';

export class DeltaRemoteConflicts extends PayloadsDelta {

  public async resultingCollection() {
    if (this.applyCollection.source === PayloadSources.ConflictUuid) {
      return this.collectionsByHandlingUuidConflicts();
    } else if (this.applyCollection.source === PayloadSources.ConflictData) {
      return this.collectionsByHandlingDataConflicts();
    } else {
      throw `Unhandled conflict type ${this.applyCollection.source}`;
    }
  }

  private async collectionsByHandlingDataConflicts() {
    const results = [];
    for (const payload of this.applyCollection.getAllPayloads()) {
      const current = this.findBasePayload(payload.uuid);
      /** Could be deleted */
      if (!current) {
        results.push(payload);
        continue;
      }
      const decrypted = this.findRelatedPayload(
        payload.uuid,
        PayloadSources.DecryptedTransient
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
        PayloadSources.ConflictData
      );
      const deltaCollection = await delta.resultingCollection();
      const payloads = deltaCollection.getAllPayloads();
      extendArray(results, payloads);
    }
    return new PayloadCollection(results, PayloadSources.RemoteRetrieved);
  }

  /**
   * UUID conflicts can occur if a user attmpts to import an old data
   * backup with uuids from the old account into a new account.
   * In uuid_conflict, we receive the value we attmpted to save.
   */
  private async collectionsByHandlingUuidConflicts() {
    const results: Array<PurePayload> = [];
    for (const payload of this.applyCollection.getAllPayloads()) {
      const decrypted = this.findRelatedPayload(
        payload.uuid,
        PayloadSources.DecryptedTransient
      );
      const alternateResults = await PayloadsByAlternatingUuid(
        decrypted!,
        this.baseCollection
      );
      extendArray(results, alternateResults);
    }

    return new PayloadCollection(results, PayloadSources.RemoteRetrieved);
  }
}
