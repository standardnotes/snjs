import { ItemContent } from '../../Item'
import { ContentlessPayload } from '../Implementations/ContentlessPayload'
import { DecryptedPayloadInterface } from './DecryptedPayload'
import { DeletedPayloadInterface } from './DeletedPayload'
import { EncryptedPayloadInterface } from './EncryptedPayload'
import { PayloadInterface } from './PayloadInterface'

export function isDecryptedPayload<C extends ItemContent = ItemContent>(
  payload: PayloadInterface,
): payload is DecryptedPayloadInterface<C> {
  return 'references' in payload
}

export function isEncryptedPayload(
  payload: PayloadInterface,
): payload is EncryptedPayloadInterface {
  return 'errorDecrypting' in payload
}

export function isDeletedPayload(payload: PayloadInterface): payload is DeletedPayloadInterface {
  return 'deleted' in payload
}

export function isEncryptedErroredPayload(
  payload: PayloadInterface,
): payload is EncryptedPayloadInterface {
  return isEncryptedPayload(payload) && payload.errorDecrypting === true
}

export function isContentlessPayload(payload: PayloadInterface): payload is ContentlessPayload {
  return !('content' in payload)
}
