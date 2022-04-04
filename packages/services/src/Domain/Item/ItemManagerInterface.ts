import { ContentType, Uuid } from '@standardnotes/common'
import {
  MutationType,
  ItemsKeyInterface,
  ItemsKeyMutatorInterface,
  DecryptedItemInterface,
  DecryptedItemMutator,
} from '@standardnotes/models'
import {
  ItemInterface,
  PayloadInterface,
  PayloadSource,
  EncryptedItemInterface,
  DeletedItemInterface,
} from '@standardnotes/models'
import { AbstractService } from '../Service/AbstractService'

export type ItemManagerChangeObserverCallback = (
  /** The items are pre-existing but have been changed */
  changed: DecryptedItemInterface[],

  /** The items have been newly inserted */
  inserted: DecryptedItemInterface[],

  /** The items should no longer be displayed in the interface, either due to being deleted, or becoming error-encrypted */
  removed: (EncryptedItemInterface | DeletedItemInterface)[],

  /** Items for which encrypted overwrite protection is enabled and enacted */
  ignored: EncryptedItemInterface[],

  source: PayloadSource,
  sourceKey?: string,
) => void

export interface ItemManagerInterface extends AbstractService {
  addObserver(
    contentType: ContentType | ContentType[],
    callback: ItemManagerChangeObserverCallback,
  ): () => void

  /**
   * Marks the item as deleted and needing sync.
   */
  setItemToBeDeleted(uuid: Uuid, source?: PayloadSource): Promise<ItemInterface | undefined>

  setItemsToBeDeleted(uuids: Uuid[]): Promise<(ItemInterface | undefined)[]>

  setItemsDirty(uuids: Uuid[], isUserModified?: boolean): Promise<ItemInterface[]>

  allItems(): ItemInterface[]

  /**
   * Inserts the item as-is by reading its payload value. This function will not
   * modify item in any way (such as marking it as dirty). It is up to the caller
   * to pass in a dirtied item if that is their intention.
   */
  insertItem(item: DecryptedItemInterface): Promise<DecryptedItemInterface>

  emitItemFromPayload(payload: PayloadInterface, source: PayloadSource): Promise<ItemInterface>

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
    uuid: Uuid,
    mutate?: (mutator: M) => void,
    mutationType?: MutationType,
    payloadSource?: PayloadSource,
    payloadSourceKey?: string,
  ): Promise<I>

  changeItemsKey(
    uuid: Uuid,
    mutate: (mutator: ItemsKeyMutatorInterface) => void,
    mutationType?: MutationType,
    payloadSource?: PayloadSource,
    payloadSourceKey?: string,
  ): Promise<ItemsKeyInterface>
}
