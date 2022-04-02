import { ItemInterface } from '../../Abstract/Item/Interfaces/ItemInterface'

export interface ItemDelta {
  changed: ItemInterface[]
  inserted: ItemInterface[]
  discarded: ItemInterface[]
  ignored: ItemInterface[]
}
