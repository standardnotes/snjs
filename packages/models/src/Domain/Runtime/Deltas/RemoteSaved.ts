import { DeletedPayload } from './../../Abstract/Payload/Implementations/DeletedPayload'
import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import { PayloadSource } from '../../Abstract/Payload/Types/PayloadSource'
import { PayloadsDelta } from './Delta'
import { isDeletedPayload } from '../../Abstract/Payload/Interfaces/TypeCheck'
import { CopyPayload } from '../../Abstract/Payload'

export class DeltaRemoteSaved extends PayloadsDelta {
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
            ...payload,
            deleted: true,
            content: undefined,
          },
          PayloadSource.RemoteSaved,
        )
        processed.push(result)
      } else {
        const result = CopyPayload(
          payload,
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
