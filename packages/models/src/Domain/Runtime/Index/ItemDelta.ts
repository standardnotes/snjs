import { ItemInterface } from '../../Abstract/Item/Interfaces/ItemInterface'

export interface ItemDelta<I extends ItemInterface = ItemInterface> {
  changed: I[]
  inserted: I[]
  discarded: I[]
  ignored: I[]
}
