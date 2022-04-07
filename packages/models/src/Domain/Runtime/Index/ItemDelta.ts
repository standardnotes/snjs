import {
  DecryptedItemInterface,
  DeletedItemInterface,
  EncryptedItemInterface,
  ItemContent,
} from '../../Abstract/Item'

export interface ItemDelta<C extends ItemContent = ItemContent> {
  changed: (DecryptedItemInterface<C> | DeletedItemInterface)[]
  inserted: (DecryptedItemInterface<C> | DeletedItemInterface)[]
  discarded: DeletedItemInterface[]
  ignored: EncryptedItemInterface[]
}
