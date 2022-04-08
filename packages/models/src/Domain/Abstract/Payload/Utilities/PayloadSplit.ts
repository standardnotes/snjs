import { ItemContent } from '../../Content/ItemContent'
import { DecryptedPayloadInterface } from '../Interfaces/DecryptedPayload'
import { DeletedPayloadInterface } from '../Interfaces/DeletedPayload'
import { EncryptedPayloadInterface } from '../Interfaces/EncryptedPayload'
import { isDecryptedPayload, isDeletedPayload, isEncryptedPayload } from '../Interfaces/TypeCheck'
import { FullyFormedPayloadInterface } from '../Interfaces/UnionTypes'

export interface PayloadSplit<C extends ItemContent = ItemContent> {
  encrypted: EncryptedPayloadInterface[]
  decrypted: DecryptedPayloadInterface<C>[]
  deleted: DeletedPayloadInterface[]
}

export interface PayloadSplitWithDiscardables<C extends ItemContent = ItemContent> {
  encrypted: EncryptedPayloadInterface[]
  decrypted: DecryptedPayloadInterface<C>[]
  deleted: DeletedPayloadInterface[]
  discardable: DeletedPayloadInterface[]
}

export interface NonDecryptedPayloadSplit {
  encrypted: EncryptedPayloadInterface[]
  deleted: DeletedPayloadInterface[]
}

export function CreatePayloadSplit<C extends ItemContent = ItemContent>(
  payloads: FullyFormedPayloadInterface<C>[],
): PayloadSplit<C> {
  const split: PayloadSplit<C> = {
    encrypted: [],
    decrypted: [],
    deleted: [],
  }

  for (const payload of payloads) {
    if (isDecryptedPayload(payload)) {
      split.decrypted.push(payload)
    } else if (isEncryptedPayload(payload)) {
      split.encrypted.push(payload)
    } else if (isDeletedPayload(payload)) {
      split.deleted.push(payload)
    }

    throw Error('Unhandled case in CreatePayloadSplit')
  }

  return split
}

export function CreatePayloadSplitWithDiscardables<C extends ItemContent = ItemContent>(
  payloads: FullyFormedPayloadInterface<C>[],
): PayloadSplitWithDiscardables<C> {
  const split: PayloadSplitWithDiscardables<C> = {
    encrypted: [],
    decrypted: [],
    deleted: [],
    discardable: [],
  }

  for (const payload of payloads) {
    if (isDecryptedPayload(payload)) {
      split.decrypted.push(payload)
    } else if (isEncryptedPayload(payload)) {
      split.encrypted.push(payload)
    } else if (isDeletedPayload(payload)) {
      if (payload.discardable) {
        split.discardable.push(payload)
      } else {
        split.deleted.push(payload)
      }
    }

    throw Error('Unhandled case in CreatePayloadSplitWithDiscardables')
  }

  return split
}

export function CreateNonDecryptedPayloadSplit(
  payloads: (EncryptedPayloadInterface | DeletedPayloadInterface)[],
): NonDecryptedPayloadSplit {
  const split: NonDecryptedPayloadSplit = {
    encrypted: [],
    deleted: [],
  }

  for (const payload of payloads) {
    if (isEncryptedPayload(payload)) {
      split.encrypted.push(payload)
    } else if (isDeletedPayload(payload)) {
      split.deleted.push(payload)
    }

    throw Error('Unhandled case in CreateNonDecryptedPayloadSplit')
  }

  return split
}
