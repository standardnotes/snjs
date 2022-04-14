import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import {
  DecryptedPayloadInterface,
  DeletedPayloadInterface,
  EncryptedPayloadInterface,
  FullyFormedPayloadInterface,
} from '../../Abstract/Payload'
import { CustomApplyDelta } from './Abstract/CustomApplyDelta'
import { OfflineSyncSavedContextualPayload } from '../../Abstract/Contextual/OfflineSyncSaved'
import { CreatePayload } from '../../Utilities/Payload/CreatePayload'
import { payloadByRedirtyingBasedOnBaseState } from './Utilities.ts/ApplyDirtyState'

type Return = EncryptedPayloadInterface | DecryptedPayloadInterface | DeletedPayloadInterface

export class DeltaOfflineSaved extends CustomApplyDelta {
  constructor(
    baseCollection: ImmutablePayloadCollection<FullyFormedPayloadInterface>,
    private readonly applyContextualPayloads: OfflineSyncSavedContextualPayload[],
  ) {
    super(baseCollection)
  }

  public async resultingCollection(): Promise<ImmutablePayloadCollection<Return>> {
    const processed: Return[] = []

    for (const apply of this.applyContextualPayloads) {
      const base = this.findBasePayload(apply.uuid)
      if (!base) {
        continue
      }

      processed.push(
        payloadByRedirtyingBasedOnBaseState(CreatePayload(base, base.source), this.baseCollection),
      )
    }

    return ImmutablePayloadCollection.WithPayloads(processed)
  }
}
