import { ContentType } from '@standardnotes/common'
import {
  SNNote,
  SNFile,
  SNTag,
  SmartView,
  TagNoteCountChangeObserver,
  NotesDisplayCriteria,
  DecryptedPayloadInterface,
  CollectionSortProperty,
  CollectionSortDirection,
  DecryptedTransferPayload,
  ItemInterface,
  PredicateInterface,
  DecryptedItemInterface,
} from '@standardnotes/models'
import { UuidString } from '@Lib/Types'

export interface ItemsClientInterface {
  associateFileWithNote(file: SNFile, note: SNNote): Promise<SNFile>

  disassociateFileWithNote(file: SNFile, note: SNNote): Promise<SNFile>

  getFilesForNote(note: SNNote): SNFile[]

  renameFile(file: SNFile, name: string): Promise<SNFile>

  addTagToNote(note: SNNote, tag: SNTag, addHierarchy: boolean): Promise<SNTag[]>

  createItemFromPayload(payload: DecryptedPayloadInterface): DecryptedItemInterface

  createPayloadFromObject(object: DecryptedTransferPayload): DecryptedPayloadInterface

  get trashedItems(): SNNote[]

  setDisplayOptions(
    contentType: ContentType,
    sortBy?: CollectionSortProperty,
    direction?: CollectionSortDirection,
    filter?: (element: ItemInterface) => boolean,
  ): void

  setNotesDisplayCriteria(criteria: NotesDisplayCriteria): void

  getDisplayableItems<T extends DecryptedItemInterface>(contentType: ContentType): T[]

  getItems<T extends DecryptedItemInterface>(contentType: ContentType | ContentType[]): T[]

  notesMatchingSmartView(view: SmartView): SNNote[]

  addNoteCountChangeObserver(observer: TagNoteCountChangeObserver): () => void

  allCountableNotesCount(): number

  countableNotesForTag(tag: SNTag | SmartView): number

  findTagByTitle(title: string): SNTag | undefined

  getTagPrefixTitle(tag: SNTag): string | undefined

  getTagLongTitle(tag: SNTag): string

  hasTagsNeedingFoldersMigration(): boolean

  referencesForItem(uuid: UuidString, contentType?: ContentType): DecryptedItemInterface[]

  itemsReferencingItem(uuid: UuidString, contentType?: ContentType): DecryptedItemInterface[]

  /**
   * Finds tags with title or component starting with a search query and (optionally) not associated with a note
   * @param searchQuery - The query string to match
   * @param note - The note whose tags should be omitted from results
   * @returns Array containing tags matching search query and not associated with note
   */
  searchTags(searchQuery: string, note?: SNNote): SNTag[]

  isValidTagParent(parentTagUuid: UuidString, childTagUuid: UuidString): boolean

  /**
   * Returns the parent for a tag
   * @param tagUuid - The tag for which parents need to be found
   * @returns The current parent or undefined
   */
  getTagParent(tagUuid: UuidString): SNTag | undefined

  /**
   * Returns the hierarchy of parents for a tag
   * @param tagUuid - The tag for which parents need to be found
   * @returns Array containing all parent tags
   */
  getTagParentChain(tagUuid: UuidString): SNTag[]

  /**
   * Returns all descendants for a tag
   * @param tagUuid - The tag for which descendants need to be found
   * @returns Array containing all descendant tags
   */
  getTagChildren(tagUuid: UuidString): SNTag[]

  /**
   * Get tags for a note sorted in natural order
   * @param note - The note whose tags will be returned
   * @returns Array containing tags associated with a note
   */
  getSortedTagsForNote(note: SNNote): SNTag[]

  isSmartViewTitle(title: string): boolean

  getSmartViews(): SmartView[]

  getNoteCount(): number

  /**
   * Finds an item by UUID.
   */
  findItem<T extends DecryptedItemInterface = DecryptedItemInterface>(
    uuid: UuidString,
  ): T | undefined

  /**
   * Finds an item by predicate.
   */
  findItems<T extends DecryptedItemInterface>(uuids: UuidString[]): T[]

  findSureItem<T extends DecryptedItemInterface = DecryptedItemInterface>(uuid: UuidString): T

  /**
   * Returns all items.
   */
  allItems(): DecryptedItemInterface[]

  /**
   * Finds an item by predicate.
   */
  itemsMatchingPredicate<T extends DecryptedItemInterface>(
    contentType: ContentType,
    predicate: PredicateInterface<T>,
  ): T[]

  /**
   * @param item item to be checked
   * @returns Whether the item is a template (unmanaged)
   */
  isTemplateItem(item: DecryptedItemInterface): boolean
}
