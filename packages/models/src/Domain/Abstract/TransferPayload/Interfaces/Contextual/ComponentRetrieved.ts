import { ItemContent } from '../../../Item/Interfaces/ItemContent'
import { PayloadField, ValidPayloadKey } from '../../../Payload'
import { TransferPayload } from './../TransferPayload'

export const ComponentRetrievedPayloadFields: Readonly<ValidPayloadKey[]> = Object.freeze([
  PayloadField.Uuid,
  PayloadField.Content,
  PayloadField.ContentType,
  PayloadField.CreatedAt,
])

/**
 * Represents a payload with permissible fields for when a
 * payload is retrieved from a component for saving
 */
export interface ComponentRetrievedTransferPayload<C extends ItemContent = ItemContent>
  extends TransferPayload {
  content: C
  created_at: Date
}
