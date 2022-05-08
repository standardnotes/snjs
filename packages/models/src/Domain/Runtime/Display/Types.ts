import { Uuid } from '@standardnotes/common'
import { DecryptedItemInterface } from '../../Abstract/Item'
import { SortableItem } from '../Collection/CollectionSort'
import { ItemCollection } from '../Collection/Item/ItemCollection'

export type DisplayControllerCustomFilter = (element: SortableItem) => boolean
export type UuidToSortedPositionMap = Record<Uuid, number>
export type DisplayItem = SortableItem & DecryptedItemInterface

export interface ReadonlyItemCollection {
  all: ItemCollection['all']
  has: ItemCollection['has']
}
