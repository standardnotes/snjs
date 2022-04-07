import {
  ApiEndpointParam,
  ConflictParams,
  ConflictType,
  Error,
  RawSyncResponse,
  ServerItemResponse,
} from '@standardnotes/responses'
import {
  filterDisallowedRemotePayloads,
  CreateServerSyncSavedPayload,
  ServerSyncSavedContextualPayload,
} from '@standardnotes/models'
import { deepFreeze, isNullOrUndefined } from '@standardnotes/utils'

export class ServerSyncResponse {
  public readonly rawResponse: RawSyncResponse
  public readonly savedPayloads: ServerSyncSavedContextualPayload[]
  public readonly retrievedPayloads: ServerItemResponse[]
  public readonly uuidConflictPayloads: ServerItemResponse[]
  public readonly dataConflictPayloads: ServerItemResponse[]
  public readonly rejectedPayloads: ServerItemResponse[]

  constructor(rawResponse: RawSyncResponse) {
    this.rawResponse = rawResponse

    this.savedPayloads = filterDisallowedRemotePayloads(rawResponse.data?.saved_items || []).map(
      (rawItem) => {
        return CreateServerSyncSavedPayload(rawItem as ServerItemResponse)
      },
    )

    this.retrievedPayloads = filterDisallowedRemotePayloads(rawResponse.data?.retrieved_items || [])

    this.dataConflictPayloads = filterDisallowedRemotePayloads(this.rawDataConflictItems)

    this.uuidConflictPayloads = filterDisallowedRemotePayloads(this.rawUuidConflictItems)

    this.rejectedPayloads = filterDisallowedRemotePayloads(this.rawRejectedPayloads)

    deepFreeze(this)
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
    return this.allFullyFormedPayloads.length
  }

  public get allFullyFormedPayloads(): ServerItemResponse[] {
    return [
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
