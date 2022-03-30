import { NotesDisplayCriteria } from '@Lib/Protocol/collection/notes_display_criteria'
import {
  CollectionSort,
  CollectionSortDirection,
  ItemInterface,
  PredicateInterface,
  PurePayload,
} from '@standardnotes/payloads'
import { AnyRecord, ContentType } from '@standardnotes/common'
import { SNNote, SNFile, SNTag, SNItem, SmartView } from '@standardnotes/models'
import { UuidString } from '@Lib/Types'
import { TagNoteCountChangeObserver } from '@Lib/Protocol/collection/tag_notes_index'

export interface ItemsClientInterface {
  associateFileWithNote(file: SNFile, note: SNNote): Promise<SNFile>

  disassociateFileWithNote(file: SNFile, note: SNNote): Promise<SNFile>

  getFilesForNote(note: SNNote): SNFile[]

  renameFile(file: SNFile, name: string): Promise<SNFile>

  addTagToNote(note: SNNote, tag: SNTag, addHierarchy: boolean): Promise<SNTag[]>

  createItemFromPayload(payload: PurePayload): SNItem

  createPayloadFromObject(object: AnyRecord): PurePayload

  get trashedItems(): SNNote[]

  setDisplayOptions(
    contentType: ContentType,
    sortBy?: CollectionSort,
    direction?: CollectionSortDirection,
    filter?: (element: ItemInterface) => boolean,
  ): void

  setNotesDisplayCriteria(criteria: NotesDisplayCriteria): void

  getDisplayableItems<T extends ItemInterface>(contentType: ContentType): T[]

  getItems<T extends SNItem>(
    contentType: ContentType | ContentType[],
    nonerroredOnly?: boolean,
  ): T[]

  notesMatchingSmartView(view: SmartView): SNNote[]

  addNoteCountChangeObserver(observer: TagNoteCountChangeObserver): () => void

  allCountableNotesCount(): number

  countableNotesForTag(tag: SNTag | SmartView): number

  findTagByTitle(title: string): SNTag | undefined

  getTagPrefixTitle(tag: SNTag): string | undefined

  getTagLongTitle(tag: SNTag): string

  hasTagsNeedingFoldersMigration(): boolean

  referencesForItem(uuid: UuidString, contentType?: ContentType): SNItem[]

  itemsReferencingItem(uuid: UuidString, contentType?: ContentType): SNItem[]

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
  findItem(uuid: string): SNItem | undefined

  /**
   * Returns all items.
   */
  allItems(): SNItem[]

  /**
   * Finds an item by predicate.
   */
  itemsMatchingPredicate<T extends SNItem>(
    contentType: ContentType,
    predicate: PredicateInterface<T>,
  ): T[]

  /**
   * Finds an item by predicate.
   */
  findItems(uuids: UuidString[]): (SNItem | PurePayload | undefined)[]

  /**
   * @param item item to be checked
   * @returns Whether the item is a template (unmanaged)
   */
  isTemplateItem(item: SNItem): boolean
}
