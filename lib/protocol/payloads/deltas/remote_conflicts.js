import { PayloadsDelta } from '@Protocol/payloads/deltas/delta';
import { PayloadCollection } from '@Protocol/payloads';
import { ConflictDelta } from '@Protocol/payloads/deltas';
import * as sources from '@Protocol/payloads/sources';

export class DeltaRemoteConflicts extends PayloadsDelta {

  async resultingCollection() {
    if(this.applyCollection.source === sources.PAYLOAD_SOURCE_CONFLICT_UUID) {
      return this.collectionsByHandlingUuidConflicts();
    } else if(this.applyCollection.source === sources.PAYLOAD_SOURCE_CONFLICT_DATA) {
      return this.collectionsByHandlingDataConflicts();
    } else {
      throw `Unhandled conflict type ${this.applyCollection.source}`;
    }
  }

  async collectionsByHandlingDataConflicts() {
    const results = [];
    for(const payload of this.applyCollection.allPayloads) {
      const current = this.findBasePayload({
        id: payload.uuid
      });
      /*** Could be deleted */
      if(!current) {
        continue;
      }

      const delta = new ConflictDelta({
        baseCollection: this.baseCollection,
        basePayload: current,
        applyPayload: payload
      })

      const deltaCollection = await delta.resultingCollection();
      const payloads = deltaCollection.allPayloads;
      extendArray(results, payloads);
    }

    return new PayloadCollection({
      payloads: results,
      source: sources.PAYLOAD_SOURCE_REMOTE_RETRIEVED
    })
  }

  /**
   * UUID conflicts can occur if a user attmpts to import an old data
   * backup with uuids from the old account into a new account.
   * In uuid_conflict, we receive the value we attmpted to save.
   */
  async collectionsByHandlingUuidConflicts() {
    const results = [];
    for(const payload of this.applyCollection.allPayloads) {
      const alternateResults = PayloadsByAlternatingUuid({
        baseCollection: this.baseCollection,
        payload: payload
      });
      extendArray(results, alternateResults);
    }

    return new PayloadCollection({
      payloads: results,
      source: sources.PAYLOAD_SOURCE_REMOTE_RETRIEVED
    });
  }
}
