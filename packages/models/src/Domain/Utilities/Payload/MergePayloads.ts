import { DecryptedPayloadInterface } from '../../Abstract/Payload/Interfaces/DecryptedPayload'
import {
  isDecryptedPayload,
  isDeletedPayload,
  isEncryptedPayload,
} from '../../Abstract/Payload/Interfaces/TypeCheck'
import { DeletedPayloadInterface } from '../../Abstract/Payload/Interfaces/DeletedPayload'
import { EncryptedPayloadInterface } from '../../Abstract/Payload/Interfaces/EncryptedPayload'
import { EncryptedPayload } from '../../Abstract/Payload/Implementations/EncryptedPayload'
import { DeletedPayload } from '../../Abstract/Payload/Implementations/DeletedPayload'
import { DecryptedPayload } from '../../Abstract/Payload/Implementations/DecryptedPayload'
import { isCorruptTransferPayload } from '../../Abstract/TransferPayload'

export function MergePayloads(
  base: DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface,
  apply: DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface,
): DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface {
  if (isCorruptTransferPayload(base) || isCorruptTransferPayload(apply)) {
    throw Error('Attempting to merge corrupted payloads in MergePayloads')
  }

  if (isDecryptedPayload(base)) {
    return mergeWithDecryptedBase(base, apply)
  } else if (isEncryptedPayload(base)) {
    return mergeWithEncryptedBase(base, apply)
  } else if (isDeletedPayload(base)) {
    return mergeWithDeletedBase(base, apply)
  } else {
    throw Error('Unhandled case in MergePayloads')
  }
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
  } else {
    throw Error('Unhandled case in mergeWithDecryptedBase')
  }
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
  } else {
    throw Error('Unhandled case in mergeWithEncryptedBase')
  }
}

function mergeWithDeletedBase(
  base: DeletedPayloadInterface,
  apply: DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface,
): DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface {
  if (isDeletedPayload(apply)) {
    return new DeletedPayload({
      ...base.ejected(),
      ...apply.ejected(),
    })
  } else if (isDecryptedPayload(apply)) {
    return new DecryptedPayload({
      ...base.ejected(),
      ...apply.ejected(),
    })
  } else if (isEncryptedPayload(apply)) {
    return new EncryptedPayload({
      ...base.ejected(),
      ...apply.ejected(),
    })
  } else {
    throw Error('Unhandled case in mergeWithDeletedBase')
  }
}
