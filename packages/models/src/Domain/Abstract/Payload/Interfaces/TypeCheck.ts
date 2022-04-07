import { ItemContent } from '../../Item'
import {
  isContentlessTransferPayload,
  isDecryptedTransferPayload,
  isDeletedTransferPayload,
  isEncryptedTransferPayload,
} from '../../TransferPayload'
import { ContentlessPayloadInterface } from './ContentLessPayload'
import { DecryptedPayloadInterface } from './DecryptedPayload'
import { DeletedPayloadInterface } from './DeletedPayload'
import { EncryptedPayloadInterface } from './EncryptedPayload'
import { PayloadInterface } from './PayloadInterface'

export function isDecryptedPayload<C extends ItemContent = ItemContent>(
  payload: PayloadInterface,
): payload is DecryptedPayloadInterface<C> {
  return isDecryptedTransferPayload(payload)
}

export function isEncryptedPayload(
  payload: PayloadInterface,
): payload is EncryptedPayloadInterface {
  return isEncryptedTransferPayload(payload)
}

export function isDeletedPayload(payload: PayloadInterface): payload is DeletedPayloadInterface {
  return isDeletedTransferPayload(payload)
}

export function isErrorDecryptingPayload(
  payload: PayloadInterface,
): payload is EncryptedPayloadInterface {
  return isEncryptedPayload(payload) && payload.errorDecrypting === true
}

export function isContentlessPayload(
  payload: PayloadInterface,
): payload is ContentlessPayloadInterface {
  return isContentlessTransferPayload(payload)
}
