import {
  ContentlessPayload,
  DeletedPayloadInterface,
  ImmutablePayloadCollection,
  isDeletedPayload,
  OfflineSyncSavedContextualPayload,
  PayloadSource,
} from '@standardnotes/models'
import { deepFreeze } from '@standardnotes/utils'

export class OfflineSyncResponse {
  public readonly discardablePayloads: DeletedPayloadInterface[]
  public readonly responseCollection: ImmutablePayloadCollection

  constructor(saved: OfflineSyncSavedContextualPayload[]) {
    this.responseCollection = ImmutablePayloadCollection.WithPayloads(
      saved.map((p) => new ContentlessPayload(p)),
      PayloadSource.LocalSaved,
    )

    this.discardablePayloads = this.responseCollection.payloads
      .filter(isDeletedPayload)
      .filter((payload) => {
        return !payload.dirty
      })

    deepFreeze(this)
  }
}
