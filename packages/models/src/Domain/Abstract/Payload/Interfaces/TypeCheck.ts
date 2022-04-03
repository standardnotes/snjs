import { DecryptedPayloadInterface } from './DecryptedPayload'
import { DeletedPayloadInterface } from './DeletedPayload'
import { EncryptedPayloadInterface } from './EncryptedPayload'
import { PayloadInterface } from './PayloadInterface'

export function isDecryptedPayload(
  payload: PayloadInterface,
): payload is DecryptedPayloadInterface {
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