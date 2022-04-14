import { ServerSyncSavedContextualPayload } from './../../Abstract/Contextual/ServerSyncSaved'
import { DeletedPayload } from './../../Abstract/Payload/Implementations/DeletedPayload'
import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import { PayloadSource } from '../../Abstract/Payload/Types/PayloadSource'
import { isDeletedPayload } from '../../Abstract/Payload/Interfaces/TypeCheck'
import { FullyFormedPayloadInterface } from '../../Abstract/Payload'
import { CustomApplyDelta } from './Abstract/CustomApplyDelta'
import { payloadByRedirtyingBasedOnBaseState } from './Utilities.ts/ApplyDirtyState'

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

      if (!base) {
        const result = new DeletedPayload(
          {
            ...apply,
            deleted: true,
            content: undefined,
            dirty: false,
          },
          PayloadSource.RemoteSaved,
        )
        processed.push(result)
        continue
      }

      /**
       * If we save an item, but while in transit it is deleted locally, we want to keep
       * local deletion status, and not old (false) deleted value that was sent to server.
       */

      if (isDeletedPayload(base)) {
        const baseWasDeletedAfterThisRequest = !apply.deleted
        const regularDeletedPayload = apply.deleted
        if (baseWasDeletedAfterThisRequest) {
          const result = new DeletedPayload(
            {
              ...apply,
              deleted: true,
              content: undefined,
              dirty: true,
              dirtiedDate: new Date(),
            },
            PayloadSource.RemoteSaved,
          )
          processed.push(result)
        } else if (regularDeletedPayload) {
          const result = base.copy(
            {
              ...apply,
              deleted: true,
              dirty: false,
            },
            PayloadSource.RemoteSaved,
          )
          processed.push(result)
        }
      } else {
        const result = payloadByRedirtyingBasedOnBaseState(
          base.copy(
            {
              ...apply,
              deleted: false,
            },
            PayloadSource.RemoteSaved,
          ),
          this.baseCollection,
        )
        processed.push(result)
      }
    }

    return ImmutablePayloadCollection.WithPayloads(processed)
  }
}
