import { ServerItemResponse } from '@standardnotes/responses'
import { isCorrupTransferPayload, isEncryptedTransferPayload } from '../TransferPayload'

export interface FilteredServerItem extends ServerItemResponse {
  __passed_filter__: true
}

export function CreateFilteredServerItem(item: ServerItemResponse): FilteredServerItem {
  return {
    ...item,
    __passed_filter__: true,
  }
}

export function filterDisallowedRemotePayloads(
  payloads: ServerItemResponse[],
): FilteredServerItem[] {
  return payloads.filter(isRemotePayloadAllowed).map(CreateFilteredServerItem)
}

export function isRemotePayloadAllowed(payload: ServerItemResponse): boolean {
  if (isCorrupTransferPayload(payload)) {
    return false
  }

  return isEncryptedTransferPayload(payload) || payload.content == undefined
}
