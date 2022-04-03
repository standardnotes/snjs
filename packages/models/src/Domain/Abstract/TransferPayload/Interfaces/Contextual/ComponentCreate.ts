import { ItemContent } from '../../../Item/Interfaces/ItemContent'
import { PayloadField, ValidPayloadKey } from '../../../Payload'
import { TransferPayload } from '../TransferPayload'

export const ComponentCreatedPayloadFields: Readonly<ValidPayloadKey[]> = Object.freeze([
  PayloadField.Uuid,
  PayloadField.Content,
  PayloadField.ContentType,
  PayloadField.CreatedAt,
])

/**
 * Represents a payload with permissible fields for when a
 * component wants to create a new item
 */
export interface ComponentCreateTransferPayload<C extends ItemContent = ItemContent>
  extends TransferPayload {
  content: C
  created_at: Date
}
