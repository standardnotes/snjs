import {
  ApiEndpointParam,
  ConflictParams,
  ConflictType,
  Error,
  RawSyncResponse,
  ServerItemResponse,
} from '@standardnotes/responses'
import {
  EncryptedPayloadInterface,
  DeletedPayloadInterface,
  TransferPayload,
  PayloadSource,
  ContentlessPayload,
  ContentlessPayloadInterface,
  isDeletedPayload,
} from '@standardnotes/models'
import { deepFreeze, isNullOrUndefined } from '@standardnotes/utils'
import { CreatePayloadFromRawServerItem } from './Utilities'

export class ServerSyncResponse {
  public readonly rawResponse: RawSyncResponse
  public readonly savedPayloads: ContentlessPayloadInterface[]
  public readonly retrievedPayloads: (EncryptedPayloadInterface | DeletedPayloadInterface)[]
  public readonly uuidConflictPayloads: (EncryptedPayloadInterface | DeletedPayloadInterface)[]
  public readonly dataConflictPayloads: (EncryptedPayloadInterface | DeletedPayloadInterface)[]
  public readonly rejectedPayloads: (EncryptedPayloadInterface | DeletedPayloadInterface)[]
  public readonly deletedPayloads: DeletedPayloadInterface[]

  constructor(rawResponse: RawSyncResponse) {
    this.rawResponse = rawResponse

    this.savedPayloads = this.filterRejectedItems(rawResponse.data?.saved_items).map((rawItem) => {
      return new ContentlessPayload(rawItem, PayloadSource.RemoteSaved)
    })

    this.retrievedPayloads = this.filterRejectedItems(rawResponse.data?.retrieved_items).map(
      (rawItem) => {
        return CreatePayloadFromRawServerItem(rawItem, PayloadSource.RemoteRetrieved)
      },
    )

    this.dataConflictPayloads = this.filterRejectedItems(this.rawDataConflictItems).map(
      (rawItem) => {
        return CreatePayloadFromRawServerItem(rawItem, PayloadSource.ConflictData)
      },
    )

    this.uuidConflictPayloads = this.filterRejectedItems(this.rawUuidConflictItems).map(
      (rawItem) => {
        return CreatePayloadFromRawServerItem(rawItem, PayloadSource.ConflictUuid)
      },
    )

    this.rejectedPayloads = this.filterRejectedItems(this.rawRejectedPayloads).map((rawItem) => {
      return CreatePayloadFromRawServerItem(rawItem, PayloadSource.RemoteRejected)
    })

    /**
     * Items may be deleted from a combination of sources, such as from RemoteSaved,
     * or if a conflict handler decides to delete a payload.
     */
    this.deletedPayloads = this.allProcessedPayloads.filter(isDeletedPayload).filter((payload) => {
      return payload.discardable
    })

    deepFreeze(this)
  }

  private filterRejectedItems<T extends TransferPayload>(rawItems: T[] = []): T[] {
    return rawItems.filter((rawItem) => rawItem.uuid != undefined)
  }

  public get error(): Error | undefined {
    return this.rawResponse.error || this.rawResponse.data?.error
  }

  public get status(): number {
    return this.rawResponse.status as number
  }

  public get lastSyncToken(): string | undefined {
    return this.rawResponse.data?.[ApiEndpointParam.LastSyncToken]
  }

  public get paginationToken(): string | undefined {
    return this.rawResponse.data?.[ApiEndpointParam.PaginationToken]
  }

  public get numberOfItemsInvolved(): number {
    return this.allProcessedPayloads.length
  }

  public get allProcessedPayloads(): (
    | ContentlessPayloadInterface
    | EncryptedPayloadInterface
    | DeletedPayloadInterface
  )[] {
    return [
      ...this.savedPayloads,
      ...this.retrievedPayloads,
      ...this.dataConflictPayloads,
      ...this.uuidConflictPayloads,
      ...this.rejectedPayloads,
    ]
  }

  private get rawUuidConflictItems(): ServerItemResponse[] {
    return this.rawConflictObjects
      .filter((conflict) => {
        return conflict.type === ConflictType.UuidConflict
      })
      .map((conflict) => {
        return conflict.unsaved_item || (conflict.item as ServerItemResponse)
      })
  }

  private get rawDataConflictItems(): ServerItemResponse[] {
    return this.rawConflictObjects
      .filter((conflict) => {
        return conflict.type === ConflictType.ConflictingData
      })
      .map((conflict) => {
        return conflict.server_item || (conflict.item as ServerItemResponse)
      })
  }

  private get rawRejectedPayloads(): ServerItemResponse[] {
    return this.rawConflictObjects
      .filter((conflict) => {
        return (
          conflict.type === ConflictType.ContentTypeError ||
          conflict.type === ConflictType.ContentError ||
          conflict.type === ConflictType.ReadOnlyError
        )
      })
      .map((conflict) => {
        return conflict.unsaved_item as ServerItemResponse
      })
  }

  private get rawConflictObjects(): ConflictParams[] {
    const conflicts = this.rawResponse.data?.conflicts || []
    const legacyConflicts = this.rawResponse.data?.unsaved || []
    return conflicts.concat(legacyConflicts)
  }

  public get hasError(): boolean {
    return !isNullOrUndefined(this.rawResponse.error)
  }
}
