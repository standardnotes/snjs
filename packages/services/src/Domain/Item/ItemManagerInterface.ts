import { ContentType, Uuid } from '@standardnotes/common'
import {
  SNItem,
  SNItemsKey,
  ItemsKeyMutator,
  MutationType,
  ItemMutator,
} from '@standardnotes/models'
import {
  ItemInterface,
  PayloadInterface,
  IntegrityPayload,
  PayloadSource,
  PurePayload,
} from '@standardnotes/payloads'
import { AbstractService } from '../Service/AbstractService'

export type ItemManagerChangeObserverCallback<T extends SNItem | PurePayload> = (
  /** The items are pre-existing but have been changed */
  changed: T[],

  /** The items have been newly inserted */
  inserted: T[],

  /** The items have been deleted from local state (and remote state if applicable) */
  discarded: T[],

  /** Items for which encrypted overwrite protection is enabled and enacted */
  ignored: T[],

  source: PayloadSource,
  sourceKey?: string,
) => void

export interface ItemManagerInterface extends AbstractService {
  addObserver(
    contentType: ContentType | ContentType[],
    callback: ItemManagerChangeObserverCallback<SNItem>,
  ): () => void

  /**
   * Marks the item as deleted and needing sync.
   */
  setItemToBeDeleted(uuid: Uuid, source?: PayloadSource): Promise<SNItem | undefined>

  setItemsToBeDeleted(uuids: Uuid[]): Promise<(ItemInterface | undefined)[]>

  setItemsDirty(uuids: Uuid[], isUserModified?: boolean): Promise<ItemInterface[]>

  allItems(): ItemInterface[]

  integrityPayloads: IntegrityPayload[]

  /**
   * Inserts the item as-is by reading its payload value. This function will not
   * modify item in any way (such as marking it as dirty). It is up to the caller
   * to pass in a dirtied item if that is their intention.
   */
  insertItem(item: SNItem): Promise<SNItem>

  emitItemFromPayload(payload: PayloadInterface, source: PayloadSource): Promise<ItemInterface>

  /**
   * Returns all non-deleted items keys
   */
  itemsKeys(): SNItemsKey[]

  /**
   * Returns all items that have not been able to decrypt.
   */
  get invalidItems(): ItemInterface[]

  /**
   * Consumers wanting to modify an item should run it through this block,
   * so that data is properly mapped through our function, and latest state
   * is properly reconciled.
   */
  changeItem<M extends ItemMutator = ItemMutator, I extends ItemInterface = SNItem>(
    uuid: Uuid,
    mutate?: (mutator: M) => void,
    mutationType?: MutationType,
    payloadSource?: PayloadSource,
    payloadSourceKey?: string,
  ): Promise<I>

  changeItemsKey(
    uuid: Uuid,
    mutate: (mutator: ItemsKeyMutator) => void,
    mutationType?: MutationType,
    payloadSource?: PayloadSource,
    payloadSourceKey?: string,
  ): Promise<SNItemsKey>
}
