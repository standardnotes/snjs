import { ConflictType, RawSyncResponse } from '@standardnotes/responses'
import * as Payloads from '@standardnotes/payloads'
import { deepFreeze, isNullOrUndefined } from '@standardnotes/utils'

export class SyncResponse {
  public readonly rawResponse: RawSyncResponse
  public readonly savedPayloads: Payloads.PurePayload[]
  public readonly retrievedPayloads: Payloads.PurePayload[]
  public readonly uuidConflictPayloads: Payloads.PurePayload[]
  public readonly dataConflictPayloads: Payloads.PurePayload[]
  public readonly rejectedPayloads: Payloads.PurePayload[]
  public readonly deletedPayloads: Payloads.PurePayload[]

  constructor(rawResponse: RawSyncResponse) {
    this.rawResponse = rawResponse
    this.savedPayloads = this.filterRawItemArray(rawResponse.data?.saved_items).map((rawItem) => {
      return Payloads.CreateSourcedPayloadFromObject(rawItem, Payloads.PayloadSource.RemoteSaved)
    })
    this.retrievedPayloads = this.filterRawItemArray(rawResponse.data?.retrieved_items).map(
      (rawItem) => {
        return Payloads.CreateSourcedPayloadFromObject(
          rawItem,
          Payloads.PayloadSource.RemoteRetrieved,
        )
      },
    )
    this.dataConflictPayloads = this.filterRawItemArray(this.rawDataConflictItems).map(
      (rawItem) => {
        return Payloads.CreateSourcedPayloadFromObject(rawItem, Payloads.PayloadSource.ConflictData)
      },
    )
    this.uuidConflictPayloads = this.filterRawItemArray(this.rawUuidConflictItems).map(
      (rawItem) => {
        return Payloads.CreateSourcedPayloadFromObject(rawItem, Payloads.PayloadSource.ConflictUuid)
      },
    )
    this.rejectedPayloads = this.filterRawItemArray(this.rawRejectedPayloads).map((rawItem) => {
      return Payloads.CreateSourcedPayloadFromObject(rawItem, Payloads.PayloadSource.RemoteRejected)
    })
    /**
     * Items may be deleted from a combination of sources, such as from RemoteSaved,
     * or if a conflict handler decides to delete a payload.
     */
    this.deletedPayloads = this.allProcessedPayloads.filter((payload) => {
      return payload.discardable
    })
    deepFreeze(this)
  }

  /**
   * Filter out and exclude any items that do not have a uuid. These are useless to us.
   */
  private filterRawItemArray(rawItems: Payloads.RawPayload[] = []) {
    return rawItems.filter((rawItem) => {
      if (!rawItem.uuid) {
        return false
      } else {
        return true
      }
    })
  }

  public get error() {
    return this.rawResponse.error || this.rawResponse.data?.error
  }

  /**
   * Returns the HTTP status code for invalid requests
   */
  public get status(): number {
    return this.rawResponse.status!
  }

  public get lastSyncToken() {
    return this.rawResponse.data?.[Payloads.ApiEndpointParam.LastSyncToken]
  }

  public get paginationToken() {
    return this.rawResponse.data?.[Payloads.ApiEndpointParam.PaginationToken]
  }

  public get numberOfItemsInvolved() {
    return this.allProcessedPayloads.length
  }

  public get allProcessedPayloads() {
    const allPayloads = this.savedPayloads
      .concat(this.retrievedPayloads)
      .concat(this.dataConflictPayloads)
      .concat(this.uuidConflictPayloads)
      .concat(this.rejectedPayloads)
    return allPayloads
  }

  private get rawUuidConflictItems() {
    return this.rawConflictObjects
      .filter((conflict) => {
        return conflict.type === ConflictType.UuidConflict
      })
      .map((conflict) => {
        return conflict.unsaved_item! || conflict.item!
      })
  }

  private get rawDataConflictItems() {
    return this.rawConflictObjects
      .filter((conflict) => {
        return conflict.type === ConflictType.ConflictingData
      })
      .map((conflict) => {
        return conflict.server_item! || conflict.item!
      })
  }

  private get rawRejectedPayloads() {
    return this.rawConflictObjects
      .filter((conflict) => {
        return (
          conflict.type === ConflictType.ContentTypeError ||
          conflict.type === ConflictType.ContentError ||
          conflict.type === ConflictType.ReadOnlyError
        )
      })
      .map((conflict) => {
        return conflict.unsaved_item!
      })
  }

  private get rawConflictObjects() {
    const conflicts = this.rawResponse.data?.conflicts || []
    const legacyConflicts = this.rawResponse.data?.unsaved || []
    return conflicts.concat(legacyConflicts)
  }

  public get hasError() {
    return !isNullOrUndefined(this.rawResponse.error)
  }
}
