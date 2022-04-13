import { ItemContent } from '../../Abstract/Content/ItemContent'
import {
  DecryptedItemInterface,
  DeletedItemInterface,
  EncryptedItemInterface,
} from '../../Abstract/Item'

export interface ItemDelta<C extends ItemContent = ItemContent> {
  changed: (DecryptedItemInterface<C> | EncryptedItemInterface | DeletedItemInterface)[]
  inserted: (DecryptedItemInterface<C> | EncryptedItemInterface | DeletedItemInterface)[]
  /** Items that were deleted and finished sync */
  discarded: DeletedItemInterface[]
  /** Items which have encrypted overwrite protection enabled */
  ignored: EncryptedItemInterface[]
  /** Items which were previously error decrypting which have now been successfully decrypted */
  unerrored: DecryptedItemInterface<C>[]
}
