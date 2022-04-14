import { extendArray } from '@standardnotes/utils'
import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import { ConflictDelta } from './Conflict'
import { PayloadsDelta } from './Abstract/Delta'
import { FullyFormedPayloadInterface } from '../../Abstract/Payload'
import { payloadsByRedirtyingBasedOnBaseState } from './Utilities.ts/ApplyDirtyState'

export class DeltaRemoteDataConflicts extends PayloadsDelta {
  public async resultingCollection(): Promise<ImmutablePayloadCollection> {
    const results: FullyFormedPayloadInterface[] = []

    for (const apply of this.applyCollection.all()) {
      const base = this.findBasePayload(apply.uuid)

      const isBaseDeleted = base == undefined

      if (isBaseDeleted) {
        results.push(apply)

        continue
      }

      const delta = new ConflictDelta(this.baseCollection, base, apply, this.historyMap)

      const deltaCollection = await delta.resultingCollection()

      const payloads = payloadsByRedirtyingBasedOnBaseState(
        deltaCollection.all(),
        this.baseCollection,
      )

      extendArray(results, payloads)
    }

    return ImmutablePayloadCollection.WithPayloads(results)
  }
}
