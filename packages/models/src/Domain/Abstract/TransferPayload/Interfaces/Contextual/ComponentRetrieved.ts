import { ItemContent } from '../../../Item/Interfaces/ItemContent'
import { TransferPayload } from './../TransferPayload'

/**
 * Represents a payload with permissible fields for when a
 * payload is retrieved from a component for saving
 */
export interface ComponentRetrievedTransferPayload<C extends ItemContent = ItemContent>
  extends TransferPayload {
  content: C
  created_at: Date
}
