import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import { FullyFormedPayloadInterface, PayloadEmitSource } from '../../Abstract/Payload'
import { CustomApplyDelta } from './Abstract/CustomApplyDelta'
import { OfflineSyncSavedContextualPayload } from '../../Abstract/Contextual/OfflineSyncSaved'
import { payloadByRedirtyingBasedOnBaseState } from './Utilities.ts/ApplyDirtyState'
import { DeltaEmit } from './Abstract/DeltaEmit'

export class DeltaOfflineSaved extends CustomApplyDelta {
  constructor(
    baseCollection: ImmutablePayloadCollection<FullyFormedPayloadInterface>,
    private readonly applyContextualPayloads: OfflineSyncSavedContextualPayload[],
  ) {
    super(baseCollection)
  }

  public result(): DeltaEmit {
    const processed: FullyFormedPayloadInterface[] = []

    for (const apply of this.applyContextualPayloads) {
      const base = this.findBasePayload(apply.uuid)
      if (!base) {
        continue
      }

      processed.push(payloadByRedirtyingBasedOnBaseState(base, this.baseCollection))
    }
    return {
      emits: processed,
      source: PayloadEmitSource.OfflineSyncSaved,
    }
  }
}
