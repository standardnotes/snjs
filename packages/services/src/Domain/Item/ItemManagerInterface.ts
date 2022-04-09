import { ContentType } from '@standardnotes/common'
import {
  MutationType,
  ItemsKeyInterface,
  ItemsKeyMutatorInterface,
  DecryptedItemInterface,
  DecryptedItemMutator,
  DecryptedPayloadInterface,
  PayloadSource,
  EncryptedItemInterface,
  DeletedItemInterface,
} from '@standardnotes/models'
import { AbstractService } from '../Service/AbstractService'

export type ItemManagerChangeData = {
  /** The items are pre-existing but have been changed */
  changed: DecryptedItemInterface[]

  /** The items have been newly inserted */
  inserted: DecryptedItemInterface[]

  /** The items should no longer be displayed in the interface, either due to being deleted, or becoming error-encrypted */
  removed: (EncryptedItemInterface | DeletedItemInterface)[]

  /** Items for which encrypted overwrite protection is enabled and enacted */
  ignored: EncryptedItemInterface[]

  /** Items which were previously error decrypting but now successfully decrypted */
  unerrored: DecryptedItemInterface[]

  source: PayloadSource
  sourceKey?: string
}

export type ItemManagerChangeObserverCallback = (data: ItemManagerChangeData) => void

export interface ItemManagerInterface extends AbstractService {
  addObserver(
    contentType: ContentType | ContentType[],
    callback: ItemManagerChangeObserverCallback,
  ): () => void

  /**
   * Marks the item as deleted and needing sync.
   */
  setItemToBeDeleted(
    itemToLookupUuidFor: DecryptedItemInterface,
    source?: PayloadSource,
  ): Promise<void>

  setItemsToBeDeleted(itemsToLookupUuidsFor: DecryptedItemInterface[]): Promise<void>

  setItemsDirty(
    itemsToLookupUuidsFor: DecryptedItemInterface[],
    isUserModified?: boolean,
  ): Promise<DecryptedItemInterface[]>

  allItems(): DecryptedItemInterface[]

  /**
   * Inserts the item as-is by reading its payload value. This function will not
   * modify item in any way (such as marking it as dirty). It is up to the caller
   * to pass in a dirtied item if that is their intention.
   */
  insertItem(item: DecryptedItemInterface): Promise<DecryptedItemInterface>

  emitItemFromPayload(
    payload: DecryptedPayloadInterface,
    source: PayloadSource,
  ): Promise<DecryptedItemInterface>

  /**
   * Returns all non-deleted items keys
   */
  itemsKeys(): ItemsKeyInterface[]

  /**
   * Consumers wanting to modify an item should run it through this block,
   * so that data is properly mapped through our function, and latest state
   * is properly reconciled.
   */
  changeItem<
    M extends DecryptedItemMutator = DecryptedItemMutator,
    I extends DecryptedItemInterface = DecryptedItemInterface,
  >(
    itemToLookupUuidFor: I,
    mutate?: (mutator: M) => void,
    mutationType?: MutationType,
    payloadSource?: PayloadSource,
    payloadSourceKey?: string,
  ): Promise<I>

  changeItemsKey(
    itemToLookupUuidFor: ItemsKeyInterface,
    mutate: (mutator: ItemsKeyMutatorInterface) => void,
    mutationType?: MutationType,
    payloadSource?: PayloadSource,
    payloadSourceKey?: string,
  ): Promise<ItemsKeyInterface>
}
