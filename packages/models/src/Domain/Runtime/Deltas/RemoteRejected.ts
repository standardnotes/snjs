import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import { PayloadSource } from '../../Abstract/Payload/Types/PayloadSource'
import { PayloadsDelta } from './Delta'
import {
  ConcretePayload,
  DecryptedPayloadInterface,
  EncryptedPayloadInterface,
} from '../../Abstract/Payload'

type Result = DecryptedPayloadInterface

export class DeltaRemoteRejected extends PayloadsDelta<
  ConcretePayload,
  EncryptedPayloadInterface,
  Result
> {
  public async resultingCollection(): Promise<ImmutablePayloadCollection<Result>> {
    const results: Result[] = []

    for (const payload of this.applyCollection.all()) {
      const decrypted = this.findRelatedDecryptedTransientPayload(payload.uuid)
      if (!decrypted) {
        throw 'Unable to find decrypted counterpart for rejected payload.'
      }

      const result = decrypted.copy(
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
