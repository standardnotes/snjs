import { BackupFile } from '../Protocol/BackupFile'
import { ContentType } from '@standardnotes/common'
import { SyncOptions } from '../Sync'
import { TransactionalMutation } from '../Items'
import { UuidString } from '@Lib/Types/UuidString'
import * as Models from '../../Models'
import * as Payloads from '@standardnotes/payloads'
import { ClientDisplayableError } from '@Lib/ClientError'

export interface MutatorClientInterface {
  savePayload(payload: Payloads.PurePayload): Promise<void>

  /**
   * Inserts the input item by its payload properties, and marks the item as dirty.
   * A sync is not performed after an item is inserted. This must be handled by the caller.
   */
  insertItem(item: Models.SNItem): Promise<Models.SNItem>

  /**
   * Saves the item by uuid by finding it, setting it as dirty if its not already,
   * and performing a sync request.
   */
  saveItem(uuid: UuidString): Promise<void>

  /**
   * Mutates a pre-existing item, marks it as dirty, and syncs it
   */
  changeAndSaveItem<M extends Models.ItemMutator = Models.ItemMutator>(
    uuid: UuidString,
    mutate: (mutator: M) => void,
    updateTimestamps?: boolean,
    payloadSource?: Payloads.PayloadSource,
    syncOptions?: SyncOptions,
  ): Promise<Models.SNItem | undefined>

  /**
   * Mutates pre-existing items, marks them as dirty, and syncs
   */
  changeAndSaveItems<M extends Models.ItemMutator = Models.ItemMutator>(
    uuids: UuidString[],
    mutate: (mutator: M) => void,
    updateTimestamps?: boolean,
    payloadSource?: Payloads.PayloadSource,
    syncOptions?: SyncOptions,
  ): Promise<void>

  /**
   * Mutates a pre-existing item and marks it as dirty. Does not sync changes.
   */
  changeItem<M extends Models.ItemMutator>(
    uuid: UuidString,
    mutate: (mutator: M) => void,
    updateTimestamps?: boolean,
  ): Promise<Models.SNItem | undefined>

  /**
   * Mutates a pre-existing items and marks them as dirty. Does not sync changes.
   */
  changeItems<M extends Models.ItemMutator = Models.ItemMutator>(
    uuids: UuidString[],
    mutate: (mutator: M) => void,
    updateTimestamps?: boolean,
  ): Promise<(Models.SNItem | undefined)[]>

  /**
   * Run unique mutations per each item in the array, then only propagate all changes
   * once all mutations have been run. This differs from `changeItems` in that changeItems
   * runs the same mutation on all items.
   */
  runTransactionalMutations(
    transactions: TransactionalMutation[],
    payloadSource?: Payloads.PayloadSource,
    payloadSourceKey?: string,
  ): Promise<(Models.SNItem | undefined)[]>

  runTransactionalMutation(
    transaction: TransactionalMutation,
    payloadSource?: Payloads.PayloadSource,
    payloadSourceKey?: string,
  ): Promise<Models.SNItem | undefined>

  protectNote(note: Models.SNNote): Promise<Models.SNNote>

  unprotectNote(note: Models.SNNote): Promise<Models.SNNote | undefined>

  protectNotes(notes: Models.SNNote[]): Promise<Models.SNNote[]>

  unprotectNotes(notes: Models.SNNote[]): Promise<Models.SNNote[]>

  /**
   * Takes the values of the input item and emits it onto global state.
   */
  mergeItem(item: Models.SNItem, source: Payloads.PayloadSource): Promise<Models.SNItem>

  /**
   * Creates a managed item.
   * @param needsSync  Whether to mark the item as needing sync. `add` must also be true.
   */
  createManagedItem(
    contentType: ContentType,
    content: Payloads.PayloadContent,
    needsSync?: boolean,
    override?: Payloads.PayloadOverride,
  ): Promise<Models.SNItem>

  /**
   * Creates an unmanaged item that can be added later.
   */
  createTemplateItem(
    contentType: ContentType,
    content?: Payloads.PayloadContent,
  ): Promise<Models.SNItem>

  /**
   * @param isUserModified  Whether to change the modified date the user
   * sees of the item.
   */
  setItemNeedsSync(
    item: Models.SNItem,
    isUserModified?: boolean,
  ): Promise<Models.SNItem | undefined>

  setItemsNeedsSync(items: Models.SNItem[]): Promise<(Models.SNItem | undefined)[]>

  deleteItem(item: Models.SNItem): Promise<void>

  emptyTrash(): Promise<void>

  duplicateItem<T extends Models.SNItem>(
    item: T,
    additionalContent?: Partial<Payloads.PayloadContent>,
  ): Promise<T>

  /**
   * Migrates any tags containing a '.' character to sa chema-based heirarchy, removing
   * the dot from the tag's title.
   */
  migrateTagsToFolders(): Promise<unknown>

  /**
   * Establishes a hierarchical relationship between two tags.
   */
  setTagParent(parentTag: Models.SNTag, childTag: Models.SNTag): Promise<void>

  /**
   * Remove the tag parent.
   */
  unsetTagParent(childTag: Models.SNTag): Promise<void>

  findOrCreateTag(title: string): Promise<Models.SNTag>

  /** Creates and returns the tag but does not run sync. Callers must perform sync. */
  createTagOrSmartView(title: string): Promise<Models.SNTag | Models.SmartView>

  /**
   * Activates or deactivates a component, depending on its
   * current state, and syncs.
   */
  toggleComponent(component: Models.SNComponent): Promise<void>

  toggleTheme(theme: Models.SNComponent): Promise<void>

  /**
   * @returns
   * .affectedItems: Items that were either created or dirtied by this import
   * .errorCount: The number of items that were not imported due to failure to decrypt.
   */
  importData(
    data: BackupFile,
    awaitSync?: boolean,
  ): Promise<
    | {
        affectedItems: Models.SNItem[]
        errorCount: number
      }
    | {
        error: ClientDisplayableError
      }
  >
}
