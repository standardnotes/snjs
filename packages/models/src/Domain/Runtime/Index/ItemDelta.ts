import {
  DecryptedItemInterface,
  DeletedItemInterface,
  EncryptedItemInterface,
} from '../../Abstract/Item'

export type DecryptedOrDeletedItem = DecryptedItemInterface | DeletedItemInterface

export interface ItemDelta {
  changed: DecryptedOrDeletedItem[]
  inserted: DecryptedOrDeletedItem[]
  discarded: DeletedItemInterface[]
  ignored: EncryptedItemInterface[]
}
