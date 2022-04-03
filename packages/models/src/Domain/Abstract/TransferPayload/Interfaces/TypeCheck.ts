import { isString } from '@standardnotes/utils'
import { ContentlessTransferPayload } from './ContentlessTransferPayload'
import { DecryptedTransferPayload } from './DecryptedTransferPayload'
import { DeletedTransferPayload } from './DeletedTransferPayload'
import { EncryptedTransferPayload } from './EncryptedTransferPayload'
import { TransferPayload } from './TransferPayload'

export function isDecryptedTransferPayload(
  payload: TransferPayload,
): payload is DecryptedTransferPayload {
  const content = (payload as DecryptedTransferPayload).content
  if (content == undefined) {
    return false
  }
  if (isString(content)) {
    return false
  }

  return true
}

export function isEncryptedTransferPayload(
  payload: TransferPayload,
): payload is EncryptedTransferPayload {
  return 'enc_item_key' in payload
}

export function isDeletedTransferPayload(
  payload: TransferPayload,
): payload is DeletedTransferPayload {
  return 'deleted' in payload
}

export function isContentlessTransferPayload(
  payload: TransferPayload,
): payload is ContentlessTransferPayload {
  return !('content' in payload) && !isDeletedTransferPayload(payload)
}
