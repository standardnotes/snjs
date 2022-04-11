import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import { PayloadSource } from '../../Abstract/Payload/Types/PayloadSource'
import { PayloadsDelta } from './Delta'
import {
  FullyFormedPayloadInterface,
  DeletedPayloadInterface,
  EncryptedPayloadInterface,
} from '../../Abstract/Payload'

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

      const result = postProcessedCounterpart.copy(
        {
          lastSyncEnd: new Date(),
          dirty: false,
        },
        PayloadSource.RemoteRejected,
      )

      results.push(result)
    }

    return ImmutablePayloadCollection.WithPayloads(results, PayloadSource.RemoteRejected)
  }
}
