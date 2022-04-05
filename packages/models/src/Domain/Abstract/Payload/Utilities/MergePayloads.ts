import { ContentlessPayloadInterface } from './../Interfaces/ContentlessPayload'
import { DecryptedPayloadInterface } from './../Interfaces/DecryptedPayload'
import {
  isContentlessPayload,
  isDecryptedPayload,
  isDeletedPayload,
  isEncryptedPayload,
} from '../Interfaces/TypeCheck'
import { DeletedPayloadInterface } from '../Interfaces/DeletedPayload'
import { EncryptedPayloadInterface } from '../Interfaces/EncryptedPayload'
import { EncryptedPayload } from '../Implementations/EncryptedPayload'
import { DeletedPayload } from '../Implementations/DeletedPayload'
import { DecryptedPayload } from '../Implementations/DecryptedPayload'

export function MergePayloads(
  base: DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface,
  apply:
    | DecryptedPayloadInterface
    | EncryptedPayloadInterface
    | DeletedPayloadInterface
    | ContentlessPayloadInterface,
): DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface {
  if (isDecryptedPayload(base)) {
    return mergeWithDecryptedBase(base, apply)
  } else if (isEncryptedPayload(base)) {
    return mergeWithEncryptedBase(base, apply)
  } else if (isDeletedPayload(base)) {
    return mergeWithDeletedBase(base, apply)
  }

  throw Error('Unhandled case in MergePayloads')
}

function mergeWithDecryptedBase(
  base: DecryptedPayloadInterface,
  apply:
    | DecryptedPayloadInterface
    | EncryptedPayloadInterface
    | DeletedPayloadInterface
    | ContentlessPayloadInterface,
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
  } else if (isContentlessPayload(apply)) {
    return new DecryptedPayload({
      ...base.ejected(),
      ...apply.ejected(),
    })
  }

  throw Error('Unhandled case in mergeWithDecryptedBase')
}

function mergeWithEncryptedBase(
  base: EncryptedPayloadInterface,
  apply:
    | DecryptedPayloadInterface
    | EncryptedPayloadInterface
    | DeletedPayloadInterface
    | ContentlessPayloadInterface,
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
  } else if (isContentlessPayload(apply)) {
    return new EncryptedPayload({
      ...base.ejected(),
      ...apply.ejected(),
    })
  }

  throw Error('Unhandled case in mergeWithEncryptedBase')
}

function mergeWithDeletedBase(
  base: DeletedPayloadInterface,
  apply: DeletedPayloadInterface | ContentlessPayloadInterface,
): EncryptedPayloadInterface | DeletedPayloadInterface {
  if (isDeletedPayload(apply)) {
    return new DeletedPayload({
      ...base.ejected(),
      ...apply.ejected(),
    })
  } else if (isContentlessPayload(apply)) {
    return new DeletedPayload({
      ...base.ejected(),
      ...apply.ejected(),
    })
  }

  throw Error('Unhandled case in mergeWithDeletedBase')
}
