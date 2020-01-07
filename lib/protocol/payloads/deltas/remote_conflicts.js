import { PayloadsDelta } from '@Protocol/payloads/deltas/delta';
import { PayloadCollection } from '@Protocol/payloads';
import { ConflictDelta } from '@Protocol/payloads/deltas';
import * as sources from '@Protocol/payloads/sources';
import { PayloadsByAlternatingUuid } from '@Protocol/payloads/functions';

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
      console.log("Handling data conflict", payload);
      const current = this.findBasePayload({
        id: payload.uuid
      });
      /** Could be deleted */
      if(!current) {
        continue;
      }
      const decrypted = this.findRelatedPayload({
        id: payload.uuid,
        source: sources.PAYLOAD_SOURCE_DECRYPTED_TRANSIENT
      });
      console.log("Decrypted", decrypted)
      console.log("Base payload", current);
      if(!decrypted) {
        throw 'Unable to find decrypted counterpart for data conflict.';
      }
      const delta = new ConflictDelta({
        baseCollection: this.baseCollection,
        basePayload: current,
        applyPayload: decrypted
      })
      const deltaCollection = await delta.resultingCollection();
      const payloads = deltaCollection.allPayloads;
      console.log("Resulting payloads", payloads);
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
      const decrypted = this.findRelatedPayload({
        id: payload.uuid,
        source: sources.PAYLOAD_SOURCE_DECRYPTED_TRANSIENT
      });
      const alternateResults = await PayloadsByAlternatingUuid({
        baseCollection: this.baseCollection,
        payload: decrypted
      });
      extendArray(results, alternateResults);
    }

    return new PayloadCollection({
      payloads: results,
      source: sources.PAYLOAD_SOURCE_REMOTE_RETRIEVED
    });
  }
}
