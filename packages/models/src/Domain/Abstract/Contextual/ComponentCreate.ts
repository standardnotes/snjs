import { ItemContent } from '../Item/Interfaces/ItemContent'
import { DecryptedPayload, DecryptedPayloadInterface, PayloadSource } from '../Payload'
import { DecryptedTransferPayload } from '../TransferPayload'
import { ContextPayload } from './ContextPayload'

/**
 * Represents a payload with permissible fields for when a
 * component wants to create a new item
 */
export interface ComponentCreateContextualPayload<C extends ItemContent = ItemContent>
  extends ContextPayload {
  content: C
  created_at?: Date
}

export function createComponentCreatedPayload(
  fromPayload: DecryptedTransferPayload,
): DecryptedPayloadInterface {
  const params: ComponentCreateContextualPayload = {
    content_type: fromPayload.content_type,
    content: fromPayload.content,
    created_at: fromPayload.created_at,
    uuid: fromPayload.uuid,
  }
  return new DecryptedPayload(params, PayloadSource.ComponentCreated)
}
