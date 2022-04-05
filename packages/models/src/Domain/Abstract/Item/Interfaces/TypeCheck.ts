import { EncryptedItemInterface } from './EncryptedItem'
import { DeletedItemInterface } from './DeletedItem'
import { ItemInterface } from './ItemInterface'
import { DecryptedItemInterface } from './DecryptedItem'

export function isDecryptedItem(item: ItemInterface): item is DecryptedItemInterface {
  return 'references' in item
}

export function isEncryptedItem(item: ItemInterface): item is EncryptedItemInterface {
  return 'errorDecrypting' in item
}

export function isNotEncryptedItem(
  item: DecryptedItemInterface | DeletedItemInterface | EncryptedItemInterface,
): item is DecryptedItemInterface | DeletedItemInterface {
  return !isEncryptedItem(item)
}

export function isDeletedItem(item: ItemInterface): item is DeletedItemInterface {
  return 'deleted' in item
}

export function isEncryptedErroredItem(item: ItemInterface): boolean {
  return isEncryptedItem(item) && item.errorDecrypting === true
}
