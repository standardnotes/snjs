import { extendArray } from '@standardnotes/utils'
import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import { ConflictDelta } from './Conflict'
import { PayloadsDelta } from './Abstract/Delta'
import { isDeletedPayload } from '../../Abstract/Payload/Interfaces/TypeCheck'
import {
  DecryptedPayloadInterface,
  FullyFormedPayloadInterface,
  DeletedPayloadInterface,
  EncryptedPayloadInterface,
} from '../../Abstract/Payload'
import { payloadsByRedirtyingBasedOnBaseState } from './Utilities.ts/ApplyDirtyState'

type Return = EncryptedPayloadInterface | DecryptedPayloadInterface | DeletedPayloadInterface

export class DeltaRemoteDataConflicts extends PayloadsDelta<
  FullyFormedPayloadInterface,
  EncryptedPayloadInterface | DeletedPayloadInterface,
  EncryptedPayloadInterface | DecryptedPayloadInterface | DeletedPayloadInterface
> {
  public async resultingCollection(): Promise<ImmutablePayloadCollection<Return>> {
    const results: Return[] = []

    for (const payload of this.applyCollection.all()) {
      const base = this.findBasePayload(payload.uuid)

      /** Could be deleted */
      if (!base) {
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
        base,
        postProcessedCounterpart || payload,
        this.historyMap,
      )

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
