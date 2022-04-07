import { ContentlessPayloadInterface } from './../Interfaces/ContentlessPayload'
import { ItemContent } from '../../Item'
import { DecryptedPayloadInterface } from '../Interfaces/DecryptedPayload'
import { DeletedPayloadInterface } from '../Interfaces/DeletedPayload'
import { EncryptedPayloadInterface } from '../Interfaces/EncryptedPayload'
import {
  isContentlessPayload,
  isDecryptedPayload,
  isDeletedPayload,
  isEncryptedPayload,
} from '../Interfaces/TypeCheck'
import { AnyPayloadInterface } from '../Interfaces/UnionTypes'

export interface PayloadSplit<C extends ItemContent = ItemContent> {
  encrypted: EncryptedPayloadInterface[]
  decrypted: DecryptedPayloadInterface<C>[]
  deleted: DeletedPayloadInterface[]
  contentless: ContentlessPayloadInterface[]
}

export interface NonDecryptedPayloadSplit {
  encrypted: EncryptedPayloadInterface[]
  deleted: DeletedPayloadInterface[]
  contentless: ContentlessPayloadInterface[]
}

export function CreatePayloadSplit<C extends ItemContent = ItemContent>(
  payloads: AnyPayloadInterface<C>[],
): PayloadSplit<C> {
  const split: PayloadSplit<C> = {
    encrypted: [],
    decrypted: [],
    deleted: [],
    contentless: [],
  }

  for (const payload of payloads) {
    if (isDecryptedPayload(payload)) {
      split.decrypted.push(payload)
    } else if (isEncryptedPayload(payload)) {
      split.encrypted.push(payload)
    } else if (isDeletedPayload(payload)) {
      split.deleted.push(payload)
    } else if (isContentlessPayload(payload)) {
      split.contentless.push(payload)
    }

    throw Error('Unhandled case in CreatePayloadSplit')
  }

  return split
}

export function CreateNonDecryptedPayloadSplit(
  payloads: (EncryptedPayloadInterface | DeletedPayloadInterface | ContentlessPayloadInterface)[],
): NonDecryptedPayloadSplit {
  const split: NonDecryptedPayloadSplit = {
    encrypted: [],
    deleted: [],
    contentless: [],
  }

  for (const payload of payloads) {
    if (isEncryptedPayload(payload)) {
      split.encrypted.push(payload)
    } else if (isDeletedPayload(payload)) {
      split.deleted.push(payload)
    } else if (isContentlessPayload(payload)) {
      split.contentless.push(payload)
    }

    throw Error('Unhandled case in CreateNonDecryptedPayloadSplit')
  }

  return split
}
