import { ItemContent } from '../../../Item/Interfaces/ItemContent'
import { ContextPayload } from './ContextPayload'

/**
 * Represents a payload with permissible fields for when a
 * component wants to create a new item
 */
export interface ComponentCreateContextualPayload<C extends ItemContent = ItemContent>
  extends ContextPayload {
  content: C
  created_at: Date
}
