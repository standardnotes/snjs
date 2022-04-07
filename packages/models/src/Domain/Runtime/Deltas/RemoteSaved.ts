import { ServerSyncSavedContextualPayload } from './../../Abstract/Contextual/ServerSyncSaved'
import { DeletedPayload } from './../../Abstract/Payload/Implementations/DeletedPayload'
import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import { PayloadSource } from '../../Abstract/Payload/Types/PayloadSource'
import { isDeletedPayload } from '../../Abstract/Payload/Interfaces/TypeCheck'
import { FullyFormedPayloadInterface } from '../../Abstract/Payload'
import { CustomApplyDelta } from './CustomApplyDelta'

type Return = FullyFormedPayloadInterface

export class DeltaRemoteSaved extends CustomApplyDelta {
  constructor(
    baseCollection: ImmutablePayloadCollection<FullyFormedPayloadInterface>,
    private readonly applyContextualPayloads: ServerSyncSavedContextualPayload[],
  ) {
    super(baseCollection)
  }

  public async resultingCollection(): Promise<ImmutablePayloadCollection<Return>> {
    const processed: Return[] = []

    for (const apply of this.applyContextualPayloads) {
      const base = this.findBasePayload(apply.uuid)

      /**
       * If we save an item, but while in transit it is deleted locally, we want to keep
       * local deletion status, and not old deleted value that was sent to server.
       */
      const deleted = base ? isDeletedPayload(base) : apply.deleted
      if ((base && isDeletedPayload(base)) || apply.deleted) {
        const result = new DeletedPayload(
          {
            ...apply,
            deleted: true,
            content: undefined,
          },
          PayloadSource.RemoteSaved,
        )
        processed.push(result)
      } else if (base) {
        const result = base.copy(
          {
            ...apply,
            deleted: false,
            lastSyncEnd: new Date(),
            dirty: deleted,
          },
          PayloadSource.RemoteSaved,
        )
        processed.push(result)
      }
    }

    return ImmutablePayloadCollection.WithPayloads(processed, PayloadSource.RemoteSaved)
  }
}
