import { DeletedPayload } from './../../Abstract/Payload/Implementations/DeletedPayload'
import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import { PayloadSource } from '../../Abstract/Payload/Types/PayloadSource'
import { PayloadsDelta } from './Delta'
import { isDeletedPayload } from '../../Abstract/Payload/Interfaces/TypeCheck'
import {
  ContentlessPayloadInterface,
  DecryptedPayloadInterface,
  DeletedPayloadInterface,
  EncryptedPayloadInterface,
  FullyFormedPayloadInterface,
} from '../../Abstract/Payload'

type Return = EncryptedPayloadInterface | DecryptedPayloadInterface | DeletedPayloadInterface

export class DeltaOfflineSaved extends PayloadsDelta<
  FullyFormedPayloadInterface,
  ContentlessPayloadInterface,
  EncryptedPayloadInterface | DecryptedPayloadInterface | DeletedPayloadInterface
> {
  public async resultingCollection(): Promise<ImmutablePayloadCollection<Return>> {
    const processed: Return[] = []

    for (const apply of this.applyCollection.all()) {
      const base = this.findBasePayload(apply.uuid)

      /**
       * If we save an item, but while in transit it is deleted locally, we want to keep
       * local deletion status, and not old deleted value that was sent to server.
       */
      const deleted = base ? isDeletedPayload(base) : isDeletedPayload(apply)
      if ((base && isDeletedPayload(base)) || isDeletedPayload(apply)) {
        const result = new DeletedPayload(
          {
            ...apply.ejected(),
            deleted: true,
            content: undefined,
          },
          PayloadSource.LocalSaved,
        )
        processed.push(result)
      } else if (base) {
        const result = base.copy(
          {
            ...apply,
            lastSyncEnd: new Date(),
            dirty: deleted,
          },
          PayloadSource.LocalSaved,
        )
        processed.push(result)
      }
    }

    return ImmutablePayloadCollection.WithPayloads(processed, PayloadSource.RemoteSaved)
  }
}
