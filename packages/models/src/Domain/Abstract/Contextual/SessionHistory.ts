import { ItemContent } from '../Item/Interfaces/ItemContent'
import { ContextPayload } from './ContextPayload'

export interface SessionHistoryContextualPayload<C extends ItemContent = ItemContent>
  extends ContextPayload {
  content: C
  updated_at: Date
}
