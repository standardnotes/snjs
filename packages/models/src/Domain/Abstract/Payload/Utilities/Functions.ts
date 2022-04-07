import { Uuid } from '@standardnotes/common'
import { PayloadInterface } from '../Interfaces/PayloadInterface'
import { PayloadSource } from '../Types/PayloadSource'
import {
  isContentlessTransferPayload,
  isDeletedAndContentlessTransferPayload,
  isDeletedTransferPayload,
  isEncryptedTransferPayload,
  TransferPayload,
} from '../../TransferPayload'

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

export function filterDisallowedRemotePayloads<P extends TransferPayload>(payloads: P[]): P[] {
  return payloads.filter(isRemotePayloadAllowed)
}

export function isRemotePayloadAllowed(payload: TransferPayload): boolean {
  if (isDeletedTransferPayload(payload)) {
    return isDeletedAndContentlessTransferPayload(payload)
  }

  return isEncryptedTransferPayload(payload) || isContentlessTransferPayload(payload)
}

export function SureFindPayload<P extends PayloadInterface = PayloadInterface>(
  uuid: Uuid,
  payloads: P[],
): P {
  return payloads.find((payload) => payload.uuid === uuid) as P
}
