import { ItemContent } from '../../../Item/Interfaces/ItemContent'
import { ContextPayload } from './ContextPayload'

/**
 * Represents a payload with permissible fields for when a
 * payload is retrieved from a component for saving
 */
export interface ComponentRetrievedContextualPayload<C extends ItemContent = ItemContent>
  extends ContextPayload {
  content: C
  created_at: Date
}
