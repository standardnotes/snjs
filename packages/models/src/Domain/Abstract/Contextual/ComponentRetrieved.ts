import { ItemContent } from '../Item/Interfaces/ItemContent'
import { DecryptedPayload, DecryptedPayloadInterface, PayloadSource } from '../Payload'
import { DecryptedTransferPayload } from '../TransferPayload'
import { ContextPayload } from './ContextPayload'

/**
 * Represents a payload with permissible fields for when a
 * payload is retrieved from a component for saving
 */
export interface ComponentRetrievedContextualPayload<C extends ItemContent = ItemContent>
  extends ContextPayload {
  content: C
  created_at?: Date
}

export function createComponentRetrievedPayload(
  fromPayload: DecryptedTransferPayload,
): DecryptedPayloadInterface {
  const params: ComponentRetrievedContextualPayload = {
    content_type: fromPayload.content_type,
    content: fromPayload.content,
    created_at: fromPayload.created_at,
    uuid: fromPayload.uuid,
  }
  return new DecryptedPayload(params, PayloadSource.ComponentRetrieved)
}
