import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import {
  EncryptedPayloadInterface,
  FullyFormedPayloadInterface,
  isDecryptedPayload,
  isEncryptedPayload,
} from '../../Abstract/Payload'
import { DeltaEmit } from './Abstract/DeltaEmit'

export class ItemsKeyDelta {
  constructor(
    private baseCollection: ImmutablePayloadCollection,
    private readonly applyPayloads: FullyFormedPayloadInterface[],
  ) {}

  public result(): Partial<DeltaEmit> {
    const changed: FullyFormedPayloadInterface[] = []
    const ignored: EncryptedPayloadInterface[] = []

    for (const apply of this.applyPayloads) {
      const base = this.baseCollection.find(apply.uuid)

      if (!base) {
        changed.push(apply)

        continue
      }

      if (isEncryptedPayload(apply) && isDecryptedPayload(base)) {
        const keepBaseWithApplyTimestamps = base.copy({
          updated_at_timestamp: apply.updated_at_timestamp,
          updated_at: apply.updated_at,
          dirty: false,
        })

        changed.push(keepBaseWithApplyTimestamps)

        ignored.push(apply)
      } else {
        changed.push(apply)
      }
    }

    return {
      changed,
      ignored,
    }
  }
}
