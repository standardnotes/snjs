import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import { PayloadSource } from '../../Abstract/Payload/Types/PayloadSource'
import { PayloadsDelta } from './Abstract/Delta'
import {
  FullyFormedPayloadInterface,
  DeletedPayloadInterface,
  EncryptedPayloadInterface,
} from '../../Abstract/Payload'
import { payloadByRedirtyingBasedOnBaseState } from './Utilities.ts/ApplyDirtyState'

type Return = FullyFormedPayloadInterface

export class DeltaRemoteRejected extends PayloadsDelta<
  FullyFormedPayloadInterface,
  EncryptedPayloadInterface | DeletedPayloadInterface,
  FullyFormedPayloadInterface
> {
  public async resultingCollection(): Promise<ImmutablePayloadCollection<Return>> {
    const results: Return[] = []

    for (const apply of this.applyCollection.all()) {
      const postProcessedCounterpart = this.findRelatedPostProcessedPayload(apply.uuid)

      if (!postProcessedCounterpart) {
        throw 'Unable to find postprocessed counterpart for rejected payload.'
      }

      const result = payloadByRedirtyingBasedOnBaseState(
        postProcessedCounterpart.copy({}, PayloadSource.RemoteRetrieved),
        this.baseCollection,
      )

      results.push(result)
    }

    return ImmutablePayloadCollection.WithPayloads(results)
  }
}
