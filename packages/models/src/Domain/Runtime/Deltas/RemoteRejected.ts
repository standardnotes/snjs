import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import { CopyPayload } from '../../Abstract/Payload/Utilities/Functions'
import { PayloadSource } from '../../Abstract/Payload/Types/PayloadSource'
import { PayloadsDelta } from './Delta'

export class DeltaRemoteRejected extends PayloadsDelta {
  // eslint-disable-next-line @typescript-eslint/require-await
  public async resultingCollection(): Promise<ImmutablePayloadCollection> {
    const results = []
    for (const payload of this.applyCollection.all()) {
      const decrypted = this.findRelatedDecryptedTransientPayload(payload.uuid)
      if (!decrypted) {
        throw 'Unable to find decrypted counterpart for rejected payload.'
      }
      const result = CopyPayload(
        decrypted,
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
