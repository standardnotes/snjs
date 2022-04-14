import { extendArray } from '@standardnotes/utils'
import { ConflictDelta } from './Conflict'
import { PayloadsDelta } from './Abstract/Delta'
import { FullyFormedPayloadInterface, PayloadEmitSource } from '../../Abstract/Payload'
import { payloadsByRedirtyingBasedOnBaseState } from './Utilities.ts/ApplyDirtyState'
import { DeltaEmit } from './Abstract/DeltaEmit'

export class DeltaRemoteDataConflicts extends PayloadsDelta {
  public async result(): Promise<DeltaEmit> {
    const results: FullyFormedPayloadInterface[] = []

    for (const apply of this.applyCollection.all()) {
      const base = this.findBasePayload(apply.uuid)

      const isBaseDeleted = base == undefined

      if (isBaseDeleted) {
        results.push(apply)

        continue
      }

      const delta = new ConflictDelta(this.baseCollection, base, apply, this.historyMap)

      const deltaResults = await delta.result()

      const payloads = payloadsByRedirtyingBasedOnBaseState(deltaResults, this.baseCollection)

      extendArray(results, payloads)
    }

    return {
      changed: results,
      source: PayloadEmitSource.RemoteRetrieved,
    }
  }
}
