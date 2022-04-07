import { extendArray, filterFromArray, Uuids } from '@standardnotes/utils'
import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import { PayloadsByAlternatingUuid } from '../../Abstract/Payload/Utilities/PayloadsByAlternatingUuid'
import { PayloadSource } from '../../Abstract/Payload/Types/PayloadSource'
import { ConflictDelta } from './Conflict'
import { PayloadsDelta } from './Delta'
import { isDecryptedPayload, isDeletedPayload } from '../../Abstract/Payload/Interfaces/TypeCheck'
import {
  DecryptedPayloadInterface,
  FullyFormedPayloadInterface,
  DeletedPayloadInterface,
  EncryptedPayloadInterface,
} from '../../Abstract/Payload'

type Return = EncryptedPayloadInterface | DecryptedPayloadInterface | DeletedPayloadInterface

export class DeltaRemoteConflicts extends PayloadsDelta<
  FullyFormedPayloadInterface,
  EncryptedPayloadInterface | DeletedPayloadInterface,
  EncryptedPayloadInterface | DecryptedPayloadInterface | DeletedPayloadInterface
> {
  public async resultingCollection(): Promise<ImmutablePayloadCollection<Return>> {
    if (this.applyCollection.source === PayloadSource.ConflictUuid) {
      return this.collectionsByHandlingUuidConflicts()
    } else if (this.applyCollection.source === PayloadSource.ConflictData) {
      return this.collectionsByHandlingDataConflicts()
    } else {
      throw `Unhandled conflict type ${this.applyCollection.source}`
    }
  }

  private async collectionsByHandlingDataConflicts(): Promise<ImmutablePayloadCollection<Return>> {
    const results: Return[] = []
    for (const payload of this.applyCollection.all()) {
      const current = this.findBasePayload(payload.uuid)

      /** Could be deleted */
      if (!current) {
        results.push(payload)
        continue
      }

      const postProcessedCounterpart = this.findRelatedPostProcessedPayload(payload.uuid)
      if (!postProcessedCounterpart && !isDeletedPayload(payload)) {
        /** Decrypted should only be missing in case of deleted payload */
        throw 'Unable to find decrypted counterpart for data conflict.'
      }

      const delta = new ConflictDelta(
        this.baseCollection,
        current,
        postProcessedCounterpart || payload,
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
  private async collectionsByHandlingUuidConflicts(): Promise<ImmutablePayloadCollection<Return>> {
    const results: Return[] = []
    const baseCollectionCopy = this.baseCollection.mutableCopy()

    for (const payload of this.applyCollection.all()) {
      /**
       * The payload in question may have been modified as part of alternating a uuid for
       * another item. For example, alternating a uuid for a note will also affect the
       * referencing tag, which would be added to `results`, but could also be inside
       * of this.applyCollection. In this case we'd prefer the most recently modified value.
       */
      const moreRecent = results.find((r) => r.uuid === payload.uuid)
      const decrypted = moreRecent || this.findRelatedPostProcessedPayload(payload.uuid)

      if (!decrypted || !isDecryptedPayload(decrypted)) {
        console.error('Unable to find decrypted counterpart for payload', payload)
        continue
      }

      const alternateResults = await PayloadsByAlternatingUuid(
        decrypted,
        ImmutablePayloadCollection.FromCollection(baseCollectionCopy),
      )

      baseCollectionCopy.set(alternateResults)

      filterFromArray(results, (r) => Uuids(alternateResults).includes(r.uuid))

      extendArray(results, alternateResults)
    }

    return ImmutablePayloadCollection.WithPayloads(results, PayloadSource.RemoteRetrieved)
  }
}
