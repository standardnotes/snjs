import { DeletedPayload } from './../../Abstract/Payload/Implementations/DeletedPayload'
import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import { PayloadSource } from '../../Abstract/Payload/Types/PayloadSource'
import { PayloadsDelta } from './Delta'
import { isDeletedPayload } from '../../Abstract/Payload/Interfaces/TypeCheck'
import {
  ContentlessPayloadInterface,
  DeletedPayloadInterface,
  PayloadInterface,
} from '../../Abstract/Payload'

export class DeltaRemoteSaved extends PayloadsDelta<
  PayloadInterface,
  ContentlessPayloadInterface | DeletedPayloadInterface
> {
  public async resultingCollection() {
    const processed = []
    for (const payload of this.applyCollection.all()) {
      const current = this.findBasePayload(payload.uuid)

      /**
       * If we save an item, but while in transit it is deleted locally, we want to keep
       * local deletion status, and not old deleted value that was sent to server.
       */
      const deletedState = current ? isDeletedPayload(current) : isDeletedPayload(payload)
      if (deletedState) {
        const result = new DeletedPayload(
          {
            ...payload.ejected(),
            deleted: true,
            content: undefined,
          },
          PayloadSource.RemoteSaved,
        )
        processed.push(result)
      } else {
        const result = payload.copy(
          {
            lastSyncEnd: new Date(),
            dirty: deletedState,
          },
          PayloadSource.RemoteSaved,
        )
        processed.push(result)
      }
    }

    return ImmutablePayloadCollection.WithPayloads(processed, PayloadSource.RemoteSaved)
  }
}
