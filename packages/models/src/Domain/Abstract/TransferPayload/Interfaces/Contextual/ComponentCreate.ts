import { ItemContent } from '../../../Item/Interfaces/ItemContent'
import { TransferPayload } from '../TransferPayload'

/**
 * Represents a payload with permissible fields for when a
 * component wants to create a new item
 */
export interface ComponentCreateTransferPayload<C extends ItemContent = ItemContent>
  extends TransferPayload {
  content: C
  created_at: Date
}
