import { ItemInterface } from '../../Abstract/Item/ItemInterface'

export interface ItemDelta {
  changed: ItemInterface[]
  inserted: ItemInterface[]
  discarded: ItemInterface[]
  ignored: ItemInterface[]
}
