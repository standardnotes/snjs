import { Uuid } from '@standardnotes/common'
import { PayloadInterface } from '../Interfaces/PayloadInterface'
import { PayloadSource } from '../Types/PayloadSource'
import {
  isCorrupTransferPayload,
  isEncryptedTransferPayload,
  TransferPayload,
} from '../../TransferPayload'
import { ContextPayload } from '../../Contextual/ContextPayload'
import { ServerItemResponse } from '@standardnotes/responses'

/**
 * Whether the changed payload represents only an internal change that shouldn't
 * require a UI refresh
 */
export function isPayloadSourceInternalChange(source: PayloadSource): boolean {
  return [PayloadSource.RemoteSaved, PayloadSource.PreSyncSave].includes(source)
}

export function isPayloadSourceRetrieved(source: PayloadSource): boolean {
  return [
    PayloadSource.RemoteRetrieved,
    PayloadSource.ComponentRetrieved,
    PayloadSource.RemoteActionRetrieved,
  ].includes(source)
}

export function filterDisallowedRemotePayloads<
  P extends TransferPayload | ContextPayload | ServerItemResponse,
>(payloads: P[]): P[] {
  return payloads.filter(isRemotePayloadAllowed)
}

export function isRemotePayloadAllowed(
  payload: TransferPayload | ContextPayload | ServerItemResponse,
): boolean {
  if (isCorrupTransferPayload(payload)) {
    return false
  }

  return isEncryptedTransferPayload(payload) || payload.content == undefined
}

export function SureFindPayload<P extends PayloadInterface = PayloadInterface>(
  uuid: Uuid,
  payloads: P[],
): P {
  return payloads.find((payload) => payload.uuid === uuid) as P
}
