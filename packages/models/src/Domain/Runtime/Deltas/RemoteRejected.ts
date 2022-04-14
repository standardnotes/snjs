import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import { PayloadSource } from '../../Abstract/Payload/Types/PayloadSource'
import { PayloadsDelta } from './Abstract/Delta'
import { FullyFormedPayloadInterface } from '../../Abstract/Payload'

export class DeltaRemoteRejected extends PayloadsDelta {
  public async resultingCollection(): Promise<ImmutablePayloadCollection> {
    const results: FullyFormedPayloadInterface[] = []

    for (const apply of this.applyCollection.all()) {
      const base = this.findBasePayload(apply.uuid)

      if (!base) {
        continue
      }

      const result = base.copy(
        {
          dirty: false,
        },
        PayloadSource.RemoteSaved,
      )

      results.push(result)
    }

    return ImmutablePayloadCollection.WithPayloads(results)
  }
}
