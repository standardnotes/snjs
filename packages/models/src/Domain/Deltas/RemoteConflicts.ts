import { extendArray, filterFromArray } from '@standardnotes/utils'
import { ImmutablePayloadCollection } from '../Collection/ImmutablePayloadCollection'
import { Uuids } from '../Functions'
import { PayloadsByAlternatingUuid } from '../Payload/Functions'
import { PayloadSource } from '../Payload/PayloadSource'
import { PurePayload } from '../Payload/PurePayload'
import { ConflictDelta } from './Conflict'
import { PayloadsDelta } from './Delta'

export class DeltaRemoteConflicts extends PayloadsDelta {
  public async resultingCollection(): Promise<ImmutablePayloadCollection> {
    if (this.applyCollection.source === PayloadSource.ConflictUuid) {
      return this.collectionsByHandlingUuidConflicts()
    } else if (this.applyCollection.source === PayloadSource.ConflictData) {
      return this.collectionsByHandlingDataConflicts()
    } else {
      throw `Unhandled conflict type ${this.applyCollection.source}`
    }
  }

  private async collectionsByHandlingDataConflicts() {
    const results = []
    for (const payload of this.applyCollection.all()) {
      const current = this.findBasePayload(payload.uuid)
      /** Could be deleted */
      if (!current) {
        results.push(payload)
        continue
      }
      const decrypted = this.findRelatedPayload(payload.uuid, PayloadSource.DecryptedTransient)
      if (!decrypted && !payload.deleted) {
        /** Decrypted should only be missing in case of deleted payload */
        throw 'Unable to find decrypted counterpart for data conflict.'
      }
      const delta = new ConflictDelta(
        this.baseCollection,
        current,
        decrypted || payload,
        PayloadSource.ConflictData,
        this.historyMap,
      )
      const deltaCollection = await delta.resultingCollection()
      const payloads = deltaCollection.all()
      extendArray(results, payloads)
    }
    return ImmutablePayloadCollection.WithPayloads(results, PayloadSource.RemoteRetrieved)
  }

  /**
   * UUID conflicts can occur if a user attmpts to import an old data
   * backup with uuids from the old account into a new account.
   * In uuid_conflict, we receive the value we attmpted to save.
   */
  private async collectionsByHandlingUuidConflicts() {
    const results: Array<PurePayload> = []
    const collection = this.baseCollection.mutableCopy()
    for (const payload of this.applyCollection.all()) {
      /**
       * The payload in question may have been modified as part of alternating a uuid for
       * another item. For example, alternating a uuid for a note will also affect the
       * referencing tag, which would be added to `results`, but could also be inside
       * of this.applyCollection. In this case we'd prefer the most recently modified value.
       */
      const moreRecent = results.find((r) => r.uuid === payload.uuid)
      const decrypted =
        moreRecent || this.findRelatedPayload(payload.uuid, PayloadSource.DecryptedTransient)
      if (!decrypted) {
        console.error('Unable to find decrypted counterpart for payload', payload)
        continue
      }
      const alternateResults = await PayloadsByAlternatingUuid(
        decrypted,
        ImmutablePayloadCollection.FromCollection(collection),
      )
      collection.set(alternateResults)
      filterFromArray(results, (r) => Uuids(alternateResults).includes(r.uuid))
      extendArray(results, alternateResults)
    }

    return ImmutablePayloadCollection.WithPayloads(results, PayloadSource.RemoteRetrieved)
  }
}
