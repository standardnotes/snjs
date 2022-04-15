import { PayloadSource } from '../../Abstract/Payload/Types/PayloadSource'
import { PayloadsDelta } from './Abstract/Delta'
import { FullyFormedPayloadInterface, PayloadEmitSource } from '../../Abstract/Payload'
import { DeltaEmit } from './Abstract/DeltaEmit'

export class DeltaRemoteRejected extends PayloadsDelta {
  public result(): DeltaEmit {
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

    return {
      emits: results,
      source: PayloadEmitSource.RemoteSaved,
    }
  }
}
