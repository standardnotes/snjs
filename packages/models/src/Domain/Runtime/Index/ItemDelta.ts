import { ItemContent } from '../../Abstract/Content/ItemContent'
import {
  DecryptedItemInterface,
  DeletedItemInterface,
  EncryptedItemInterface,
} from '../../Abstract/Item'

export interface ItemDelta<C extends ItemContent = ItemContent> {
  changed: (DecryptedItemInterface<C> | EncryptedItemInterface | DeletedItemInterface)[]
  inserted: (DecryptedItemInterface<C> | EncryptedItemInterface | DeletedItemInterface)[]
  discarded: DeletedItemInterface[]
  ignored: EncryptedItemInterface[]
}
