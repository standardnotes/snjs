import { extendArray, filterFromArray, Uuids } from '@standardnotes/utils'
import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import { PayloadsByAlternatingUuid } from '../../Utilities/Payload/PayloadsByAlternatingUuid'
import { PayloadsDelta } from './Abstract/Delta'
import { isDecryptedPayload } from '../../Abstract/Payload/Interfaces/TypeCheck'
import { FullyFormedPayloadInterface } from '../../Abstract/Payload'
import { payloadsByRedirtyingBasedOnBaseState } from './Utilities.ts/ApplyDirtyState'

/**
 * UUID conflicts can occur if a user attmpts to import an old data
 * backup with uuids from the old account into a new account.
 * In uuid_conflict, we receive the value we attmpted to save.
 */
export class DeltaRemoteUuidConflicts extends PayloadsDelta {
  public async resultingCollection(): Promise<ImmutablePayloadCollection> {
    const results: FullyFormedPayloadInterface[] = []
    const baseCollectionCopy = this.baseCollection.mutableCopy()

    for (const apply of this.applyCollection.all()) {
      /**
       * The payload in question may have been modified as part of alternating a uuid for
       * another item. For example, alternating a uuid for a note will also affect the
       * referencing tag, which would be added to `results`, but could also be inside
       * of this.applyCollection. In this case we'd prefer the most recently modified value.
       */
      const moreRecent = results.find((r) => r.uuid === apply.uuid)
      const useApply = moreRecent || apply

      if (!isDecryptedPayload(useApply)) {
        continue
      }

      const alternateResults = await PayloadsByAlternatingUuid(
        useApply,
        ImmutablePayloadCollection.FromCollection(baseCollectionCopy),
      )

      baseCollectionCopy.set(alternateResults)

      filterFromArray(results, (r) => Uuids(alternateResults).includes(r.uuid))

      extendArray(
        results,
        payloadsByRedirtyingBasedOnBaseState(alternateResults, this.baseCollection),
      )
    }

    return ImmutablePayloadCollection.WithPayloads(results)
  }
}
