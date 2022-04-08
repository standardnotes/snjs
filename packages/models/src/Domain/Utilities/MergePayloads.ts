import { DecryptedPayloadInterface } from '../Abstract/Payload/Interfaces/DecryptedPayload'
import { isDecryptedPayload, isDeletedPayload, isEncryptedPayload } from '../Abstract/Payload/Interfaces/TypeCheck'
import { DeletedPayloadInterface } from '../Abstract/Payload/Interfaces/DeletedPayload'
import { EncryptedPayloadInterface } from '../Abstract/Payload/Interfaces/EncryptedPayload'
import { EncryptedPayload } from '../Abstract/Payload/Implementations/EncryptedPayload'
import { DeletedPayload } from '../Abstract/Payload/Implementations/DeletedPayload'
import { DecryptedPayload } from '../Abstract/Payload/Implementations/DecryptedPayload'

export function MergePayloads(
  base: DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface,
  apply: DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface,
): DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface {
  if (isDecryptedPayload(base)) {
    return mergeWithDecryptedBase(base, apply)
  } else if (isEncryptedPayload(base)) {
    return mergeWithEncryptedBase(base, apply)
  } else if (isDeletedPayload(base) && isDeletedPayload(apply)) {
    return mergeWithDeletedBase(base, apply)
  }

  throw Error('Unhandled case in MergePayloads')
}

function mergeWithDecryptedBase(
  base: DecryptedPayloadInterface,
  apply: DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface,
): DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface {
  if (isDecryptedPayload(apply)) {
    return base.mergedWith(apply)
  } else if (isEncryptedPayload(apply)) {
    return new EncryptedPayload({
      ...base.ejected(),
      ...apply.ejected(),
    })
  } else if (isDeletedPayload(apply)) {
    return new DeletedPayload({
      ...base.ejected(),
      ...apply.ejected(),
    })
  }

  throw Error('Unhandled case in mergeWithDecryptedBase')
}

function mergeWithEncryptedBase(
  base: EncryptedPayloadInterface,
  apply: DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface,
): DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface {
  if (isDecryptedPayload(apply)) {
    return new DecryptedPayload({
      ...base.ejected(),
      ...apply.ejected(),
    })
  } else if (isEncryptedPayload(apply)) {
    return new EncryptedPayload({
      ...base.ejected(),
      ...apply.ejected(),
    })
  } else if (isDeletedPayload(apply)) {
    return new DeletedPayload({
      ...base.ejected(),
      ...apply.ejected(),
    })
  }

  throw Error('Unhandled case in mergeWithEncryptedBase')
}

function mergeWithDeletedBase(
  base: DeletedPayloadInterface,
  apply: DeletedPayloadInterface,
): EncryptedPayloadInterface | DeletedPayloadInterface {
  if (isDeletedPayload(apply)) {
    return new DeletedPayload({
      ...base.ejected(),
      ...apply.ejected(),
    })
  }

  throw Error('Unhandled case in mergeWithDeletedBase')
}
