import { ItemContent } from '../../Item'
import { TransferPayload } from './TransferPayload'

export interface DecryptedTransferPayload<C extends ItemContent = ItemContent>
  extends TransferPayload {
  readonly content: C
}
