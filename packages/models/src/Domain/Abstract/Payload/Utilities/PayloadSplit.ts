import { ItemContent } from '../../Item'
import { DecryptedPayloadInterface } from '../Interfaces/DecryptedPayload'
import { DeletedPayloadInterface } from '../Interfaces/DeletedPayload'
import { EncryptedPayloadInterface } from '../Interfaces/EncryptedPayload'
import {
  ConcretePayload,
  isDecryptedPayload,
  isDeletedPayload,
  isEncryptedPayload,
} from '../Interfaces/TypeCheck'

export interface PayloadSplit<C extends ItemContent = ItemContent> {
  encrypted: EncryptedPayloadInterface[]
  decrypted: DecryptedPayloadInterface<C>[]
  deleted: DeletedPayloadInterface[]
}

export function CreatePayloadSplit<C extends ItemContent = ItemContent>(
  payloads: ConcretePayload<C>[],
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
