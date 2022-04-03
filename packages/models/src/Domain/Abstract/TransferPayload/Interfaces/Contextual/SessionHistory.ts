import { ItemContent } from '../../../Item/Interfaces/ItemContent'
import { TransferPayload } from '../TransferPayload'

export interface SessionHistoryTransferPayload<C extends ItemContent = ItemContent>
  extends TransferPayload {
  content: C
  updated_at: Date
}
