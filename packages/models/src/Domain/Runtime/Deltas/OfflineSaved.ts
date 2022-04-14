import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import { FullyFormedPayloadInterface } from '../../Abstract/Payload'
import { CustomApplyDelta } from './Abstract/CustomApplyDelta'
import { OfflineSyncSavedContextualPayload } from '../../Abstract/Contextual/OfflineSyncSaved'
import { payloadByRedirtyingBasedOnBaseState } from './Utilities.ts/ApplyDirtyState'

export class DeltaOfflineSaved extends CustomApplyDelta {
  constructor(
    baseCollection: ImmutablePayloadCollection<FullyFormedPayloadInterface>,
    private readonly applyContextualPayloads: OfflineSyncSavedContextualPayload[],
  ) {
    super(baseCollection)
  }

  public async resultingCollection(): Promise<ImmutablePayloadCollection> {
    const processed: FullyFormedPayloadInterface[] = []

    for (const apply of this.applyContextualPayloads) {
      const base = this.findBasePayload(apply.uuid)
      if (!base) {
        continue
      }

      processed.push(payloadByRedirtyingBasedOnBaseState(base, this.baseCollection))
    }

    return ImmutablePayloadCollection.WithPayloads(processed)
  }
}
