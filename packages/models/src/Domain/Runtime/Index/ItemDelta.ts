import {
  DecryptedItemInterface,
  DeletedItemInterface,
  EncryptedItemInterface,
} from '../../Abstract/Item'

export interface ItemDelta {
  changed: DecryptedItemInterface[]
  inserted: DecryptedItemInterface[]
  discarded: DeletedItemInterface[]
  ignored: EncryptedItemInterface[]
}
