import { isObject, isString } from '@standardnotes/utils'
import { ContentlessTransferPayload } from './ContentlessTransferPayload'
import { DecryptedTransferPayload } from './DecryptedTransferPayload'
import { DeletedTransferPayload } from './DeletedTransferPayload'
import { EncryptedTransferPayload } from './EncryptedTransferPayload'
import { TransferPayload } from './TransferPayload'

export type FullyFormedTransferPayload =
  | DecryptedTransferPayload
  | EncryptedTransferPayload
  | DeletedTransferPayload

export type AnyTransferPayload =
  | DecryptedTransferPayload
  | EncryptedTransferPayload
  | DeletedTransferPayload
  | ContentlessTransferPayload

export function isDecryptedTransferPayload(
  payload: TransferPayload,
): payload is DecryptedTransferPayload {
  const content = (payload as DecryptedTransferPayload).content

  return isObject(content)
}

export function isEncryptedTransferPayload(
  payload: TransferPayload,
): payload is EncryptedTransferPayload {
  return 'content' in payload && isString((payload as EncryptedTransferPayload).content)
}

export function isDeletedTransferPayload(
  payload: TransferPayload,
): payload is DeletedTransferPayload {
  return 'deleted' in payload && (payload as DeletedTransferPayload).deleted === true
}

export function isDeletedAndContentlessTransferPayload(
  payload: TransferPayload,
): payload is DeletedTransferPayload {
  return !('content' in payload) && isDeletedTransferPayload(payload)
}

export function isContentlessTransferPayload(
  payload: TransferPayload,
): payload is ContentlessTransferPayload {
  return !('content' in payload) && !isDeletedTransferPayload(payload)
}
