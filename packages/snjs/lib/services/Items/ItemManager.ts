import * as Payloads from '@standardnotes/payloads'
import * as Models from '@Lib/models'
import { ItemCollectionNotesView } from '@Lib/protocol/collection/item_collection_notes_view'
import { NotesDisplayCriteria } from '@Lib/protocol/collection/notes_display_criteria'
import { isString, naturalSort, removeFromArray, UuidGenerator } from '@standardnotes/utils'
import { PayloadsByDuplicating } from '@Payloads/functions'
import { ContentType } from '@standardnotes/common'
import {
  TagNoteCountChangeObserver,
  TagNotesIndex,
} from '../../protocol/collection/tag_notes_index'
import { UuidString } from '../../types'
import { PayloadManager } from '../PayloadManager'
import { AbstractService, InternalEventBusInterface } from '@standardnotes/services'
import { BuildSmartViews } from '@Lib/protocol/collection/smart_view_builder'
import { ItemsClientInterface } from './ClientInterface'

type ObserverCallback = (
  /** The items are pre-existing but have been changed */
  changed: Models.SNItem[],
  /** The items have been newly inserted */
  inserted: Models.SNItem[],
  /** The items have been deleted from local state (and remote state if applicable) */
  discarded: Models.SNItem[],
  /** Items for which encrypted overwrite protection is enabled and enacted */
  ignored: Models.SNItem[],
  source: Payloads.PayloadSource,
  sourceKey?: string,
) => void

type Observer = {
  contentType: ContentType[]
  callback: ObserverCallback
}

export type TransactionalMutation = {
  itemUuid: UuidString
  mutate: (mutator: Models.ItemMutator) => void
  mutationType?: Models.MutationType
}

export const isTagOrNote = (x: Models.SNItem): x is Models.SNNote | Models.SNTag =>
  x.content_type === ContentType.Note || x.content_type === ContentType.Tag

/**
 * The item manager is backed by the Payload Manager. Think of the item manager as a
 * more user-friendly or item-specific interface to creating and updating data.
 * The item manager listens for change events from the global payload manager, and
 * converts any payloads to SNItems, then propagates those items to listeners on the
 * item  manager. When the item manager makes a change to an item, it will modify items
 * using a  mutator, then emit those payloads to the payload manager. The payload manager
 * will then notify  its observers (which is us), we'll convert the payloads to items,
 * and then  we'll propagate them to our listeners.
 */
export class ItemManager
  extends AbstractService
  implements Payloads.ItemManagerInterface, ItemsClientInterface
{
  private unsubChangeObserver: () => void
  private observers: Observer[] = []
  private collection!: Payloads.ItemCollection
  private notesView!: ItemCollectionNotesView
  private systemSmartViews: Models.SmartView[]
  private tagNotesIndex!: TagNotesIndex

  constructor(
    private payloadManager: PayloadManager,
    protected internalEventBus: InternalEventBusInterface,
  ) {
    super(internalEventBus)
    this.payloadManager = payloadManager
    this.systemSmartViews = this.rebuildSystemSmartViews(NotesDisplayCriteria.Create({}))
    this.createCollection()
    this.unsubChangeObserver = this.payloadManager.addObserver(
      ContentType.Any,
      this.setPayloads.bind(this),
    )
  }

  private rebuildSystemSmartViews(criteria: NotesDisplayCriteria): Models.SmartView[] {
    this.systemSmartViews = BuildSmartViews(criteria)
    return this.systemSmartViews
  }

  private createCollection() {
    this.collection = new Payloads.ItemCollection()
    this.collection.setDisplayOptions(ContentType.Note, Payloads.CollectionSort.CreatedAt, 'dsc')
    this.collection.setDisplayOptions(ContentType.Tag, Payloads.CollectionSort.Title, 'dsc')
    this.collection.setDisplayOptions(
      ContentType.ItemsKey,
      Payloads.CollectionSort.CreatedAt,
      'asc',
    )
    this.collection.setDisplayOptions(
      ContentType.Component,
      Payloads.CollectionSort.CreatedAt,
      'asc',
    )
    this.collection.setDisplayOptions(ContentType.Theme, Payloads.CollectionSort.Title, 'asc')
    this.collection.setDisplayOptions(ContentType.SmartView, Payloads.CollectionSort.Title, 'dsc')
    this.notesView = new ItemCollectionNotesView(this.collection)
    this.tagNotesIndex = new TagNotesIndex(this.collection, this.tagNotesIndex?.observers)
  }

  public setDisplayOptions(
    contentType: ContentType,
    sortBy?: Payloads.CollectionSort,
    direction?: Payloads.CollectionSortDirection,
    filter?: (element: any) => boolean,
  ): void {
    if (contentType === ContentType.Note) {
      console.warn(
        'Called setDisplayOptions with ContentType.Note. ' +
          'setNotesDisplayCriteria should be used instead.',
      )
    }
    this.collection.setDisplayOptions(contentType, sortBy, direction, filter)
  }

  public setNotesDisplayCriteria(criteria: NotesDisplayCriteria): void {
    const override: Partial<NotesDisplayCriteria> = {}
    if (criteria.views.find((view) => view.uuid === Models.SystemViewId.AllNotes)) {
      if (criteria.includeArchived == undefined) {
        override.includeArchived = false
      }
      if (criteria.includeTrashed == undefined) {
        override.includeTrashed = false
      }
    }
    if (criteria.views.find((view) => view.uuid === Models.SystemViewId.ArchivedNotes)) {
      if (criteria.includeTrashed == undefined) {
        override.includeTrashed = false
      }
    }
    if (criteria.views.find((view) => view.uuid === Models.SystemViewId.TrashedNotes)) {
      if (criteria.includeArchived == undefined) {
        override.includeArchived = true
      }
    }

    this.rebuildSystemSmartViews(NotesDisplayCriteria.Copy(criteria, override))

    const updatedViews = criteria.views.map((tag) => {
      const matchingSystemTag = this.systemSmartViews.find((view) => view.uuid === tag.uuid)
      return matchingSystemTag || tag
    })

    const updatedCriteria = NotesDisplayCriteria.Copy(criteria, {
      views: updatedViews,
      ...override,
    })

    this.notesView.setCriteria(updatedCriteria)
  }

  public getDisplayableItems<T extends Models.SNItem>(contentType: ContentType): T[] {
    if (contentType === ContentType.Note) {
      return this.notesView.displayElements() as unknown as T[]
    }
    return this.collection.displayElements(contentType) as unknown as T[]
  }

  public deinit(): void {
    this.unsubChangeObserver()
    ;(this.unsubChangeObserver as unknown) = undefined
    ;(this.payloadManager as unknown) = undefined
    ;(this.collection as unknown) = undefined
    ;(this.notesView as unknown) = undefined
  }

  resetState(): void {
    this.createCollection()
  }

  /**
   * Returns an item for a given id
   */
  findItem<T extends Models.SNItem = Models.SNItem>(uuid: UuidString): T | undefined {
    const itemFromCollection = this.collection.find(uuid)

    if (itemFromCollection) {
      return itemFromCollection as T
    }

    const itemFromSmartViews = this.systemSmartViews.find((tag) => tag.uuid === uuid)

    if (itemFromSmartViews) {
      return itemFromSmartViews as unknown as T
    }

    return undefined
  }

  /**
   * Returns all items matching given ids
   * @param includeBlanks If true and an item is not found, an `undefined` element
   * will be inserted into the array.
   */
  findItems(uuids: UuidString[], includeBlanks = false): Models.SNItem[] {
    return this.collection.findAll(uuids, includeBlanks)
  }

  /**
   * Returns a detached array of all items
   */
  public get items(): Models.SNItem[] {
    return this.collection.all()
  }

  /**
   * Returns a detached array of all items which are not deleted
   */
  public get nonDeletedItems() {
    return this.collection.nondeletedElements()
  }

  /**
   * Returns all items that have not been able to decrypt.
   */
  public get invalidItems() {
    return this.collection.invalidElements()
  }

  public get integrityPayloads(): Payloads.IntegrityPayload[] {
    return this.collection.integrityPayloads()
  }

  /**
   * Returns all non-deleted items keys
   */
  itemsKeys() {
    return this.collection.displayElements(ContentType.ItemsKey) as Models.SNItemsKey[]
  }

  /**
   * Returns all non-deleted notes
   */
  get notes() {
    return this.notesView.displayElements()
  }

  /**
   * Returns all non-deleted tags
   */
  get tags() {
    return this.collection.displayElements(ContentType.Tag) as Models.SNTag[]
  }

  /**
   * Returns all non-deleted components
   */
  get components(): Models.SNComponent[] {
    const components = this.collection.displayElements(
      ContentType.Component,
    ) as Models.SNComponent[]
    const themes = this.collection.displayElements(ContentType.Theme) as Models.SNComponent[]
    return components.concat(themes)
  }

  public addNoteCountChangeObserver(observer: TagNoteCountChangeObserver): () => void {
    return this.tagNotesIndex.addCountChangeObserver(observer)
  }

  public allCountableNotesCount(): number {
    return this.tagNotesIndex.allCountableNotesCount()
  }

  public countableNotesForTag(tag: Models.SNTag | Models.SmartView): number {
    if (tag instanceof Models.SmartView) {
      if (tag.uuid === Models.SystemViewId.AllNotes) {
        return this.tagNotesIndex.allCountableNotesCount()
      }

      throw Error('countableNotesForTag is not meant to be used for smart views.')
    }
    return this.tagNotesIndex.countableNotesForTag(tag)
  }

  public addObserver(
    contentType: ContentType | ContentType[],
    callback: ObserverCallback,
  ): () => void {
    if (!Array.isArray(contentType)) {
      contentType = [contentType]
    }
    const observer: Observer = {
      contentType,
      callback,
    }
    this.observers.push(observer)
    return () => {
      removeFromArray(this.observers, observer)
    }
  }

  /**
   * Returns the items that reference the given item, or an empty array if no results.
   */
  public itemsReferencingItem(uuid: UuidString) {
    if (!isString(uuid)) {
      throw Error('Must use uuid string')
    }
    const uuids = this.collection.uuidsThatReferenceUuid(uuid)
    return this.findItems(uuids)
  }

  /**
   * Returns all items that an item directly references
   */
  public referencesForItem(uuid: UuidString) {
    if (!isString(uuid)) {
      throw Error('Must use uuid string')
    }
    const item = this.findItem(uuid)!
    const uuids = item.references.map((ref) => ref.uuid)
    return this.findItems(uuids) as Models.SNItem[]
  }

  private setPayloads(
    changed: Payloads.PurePayload[],
    inserted: Payloads.PurePayload[],
    discarded: Payloads.PurePayload[],
    ignored: Payloads.PurePayload[],
    source: Payloads.PayloadSource,
    sourceKey?: string,
  ) {
    const createItems = (items: Payloads.PurePayload[]) =>
      items.map((item) => Models.CreateItemFromPayload(item))

    const delta: Payloads.ItemDelta = {
      changed: createItems(changed),
      inserted: createItems(inserted),
      discarded: createItems(discarded),
      ignored: createItems(ignored),
    }

    this.collection.onChange(delta)
    this.notesView.onChange(delta)
    this.tagNotesIndex.onChange(delta)

    this.notifyObservers(
      delta.changed,
      delta.inserted,
      delta.discarded,
      delta.ignored,
      source,
      sourceKey,
    )
  }

  private notifyObservers(
    changed: Models.SNItem[],
    inserted: Models.SNItem[],
    discarded: Models.SNItem[],
    ignored: Models.SNItem[],
    source: Payloads.PayloadSource,
    sourceKey?: string,
  ) {
    const filter = (items: Models.SNItem[], types: ContentType[]) => {
      return items.filter((item) => {
        return types.includes(ContentType.Any) || types.includes(item.content_type)
      })
    }
    const observers = this.observers.slice()
    for (const observer of observers) {
      const filteredChanged = filter(changed, observer.contentType)
      const filteredInserted = filter(inserted, observer.contentType)
      const filteredDiscarded = filter(discarded, observer.contentType)
      const filteredIgnored = filter(ignored, observer.contentType)
      if (
        filteredChanged.length === 0 &&
        filteredInserted.length === 0 &&
        filteredDiscarded.length === 0 &&
        filteredIgnored.length === 0
      ) {
        continue
      }
      observer.callback(
        filteredChanged,
        filteredInserted,
        filteredDiscarded,
        filteredIgnored,
        source,
        sourceKey,
      )
    }
  }

  /**
   * Consumers wanting to modify an item should run it through this block,
   * so that data is properly mapped through our function, and latest state
   * is properly reconciled.
   * @param itemOrUuid If an item is passed, the values of that item will be directly used,
   * and the mutation will be applied on that item and propagated. This means that if you pass
   * an old item reference and mutate that, the new value will be outdated. In this case, always
   * pass the uuid of the item if you want to mutate the latest version of the item.
   */
  async changeItem<
    M extends Models.ItemMutator = Models.ItemMutator,
    I extends Payloads.ItemInterface = Models.SNItem,
  >(
    uuid: UuidString,
    mutate?: (mutator: M) => void,
    mutationType: Models.MutationType = Models.MutationType.UserInteraction,
    payloadSource = Payloads.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ): Promise<I> {
    if (!isString(uuid)) {
      throw Error('Invalid uuid for changeItem')
    }
    const results = await this.changeItems<M, I>(
      [uuid],
      mutate,
      mutationType,
      payloadSource,
      payloadSourceKey,
    )
    return results[0]
  }

  /**
   * @param mutate If not supplied, the intention would simply be to mark the item as dirty.
   */
  public async changeItems<
    M extends Models.ItemMutator = Models.ItemMutator,
    I extends Payloads.ItemInterface = Models.SNItem,
  >(
    uuids: UuidString[],
    mutate?: (mutator: M) => void,
    mutationType: Models.MutationType = Models.MutationType.UserInteraction,
    payloadSource = Payloads.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ): Promise<I[]> {
    const items = this.findItems(uuids as UuidString[], true)
    const payloads = []
    for (const item of items) {
      if (!item) {
        throw Error('Attempting to change non-existant item')
      }
      const mutator = Models.createMutatorForItem(item, mutationType)
      if (mutate) {
        mutate(mutator as M)
      }
      const payload = mutator.getResult()
      payloads.push(payload)
    }
    await this.payloadManager.emitPayloads(payloads, payloadSource, payloadSourceKey)
    const results = this.findItems(payloads.map((p) => p.uuid)) as I[]
    return results
  }

  /**
   * Run unique mutations per each item in the array, then only propagate all changes
   * once all mutations have been run. This differs from `changeItems` in that changeItems
   * runs the same mutation on all items.
   */
  public async runTransactionalMutations(
    transactions: TransactionalMutation[],
    payloadSource = Payloads.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ): Promise<(Models.SNItem | undefined)[]> {
    const payloads: Payloads.PurePayload[] = []
    for (const transaction of transactions) {
      const item = this.findItem(transaction.itemUuid)
      if (!item) {
        continue
      }
      const mutator = Models.createMutatorForItem(
        item,
        transaction.mutationType || Models.MutationType.UserInteraction,
      )
      transaction.mutate(mutator)
      const payload = mutator.getResult()
      payloads.push(payload)
    }

    await this.payloadManager.emitPayloads(payloads, payloadSource, payloadSourceKey)
    const results = this.findItems(payloads.map((p) => p.uuid!))
    return results
  }

  public async runTransactionalMutation(
    transaction: TransactionalMutation,
    payloadSource = Payloads.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ): Promise<Models.SNItem | undefined> {
    const item = this.findItem(transaction.itemUuid)
    const mutator = Models.createMutatorForItem(
      item!,
      transaction.mutationType || Models.MutationType.UserInteraction,
    )
    transaction.mutate(mutator)
    const payload = mutator.getResult()

    await this.payloadManager.emitPayloads([payload], payloadSource, payloadSourceKey)
    const result = this.findItem(payload.uuid)
    return result
  }

  async changeNote(
    uuid: UuidString,
    mutate: (mutator: Models.NoteMutator) => void,
    mutationType: Models.MutationType = Models.MutationType.UserInteraction,
    payloadSource = Payloads.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ): Promise<Payloads.PurePayload[]> {
    const note = this.findItem(uuid)
    if (!note) {
      throw Error('Attempting to change non-existant note')
    }
    const mutator = new Models.NoteMutator(note, mutationType)
    return this.applyTransform(mutator, mutate, payloadSource, payloadSourceKey)
  }

  async changeTag(
    uuid: UuidString,
    mutate: (mutator: Models.TagMutator) => void,
    mutationType: Models.MutationType = Models.MutationType.UserInteraction,
    payloadSource = Payloads.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ): Promise<Models.SNTag> {
    const tag = this.findItem(uuid)
    if (!tag) {
      throw Error('Attempting to change non-existant tag')
    }
    const mutator = new Models.TagMutator(tag, mutationType)
    await this.applyTransform(mutator, mutate, payloadSource, payloadSourceKey)
    return this.findItem(uuid) as Models.SNTag
  }

  async changeComponent(
    uuid: UuidString,
    mutate: (mutator: Models.ComponentMutator) => void,
    mutationType: Models.MutationType = Models.MutationType.UserInteraction,
    payloadSource = Payloads.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ): Promise<Models.SNComponent> {
    const component = this.findItem(uuid)
    if (!component) {
      throw Error('Attempting to change non-existant component')
    }
    const mutator = new Models.ComponentMutator(component, mutationType)
    await this.applyTransform(mutator, mutate, payloadSource, payloadSourceKey)
    return this.findItem<Models.SNComponent>(uuid)!
  }

  async changeFeatureRepo(
    uuid: UuidString,
    mutate: (mutator: Models.FeatureRepoMutator) => void,
    mutationType: Models.MutationType = Models.MutationType.UserInteraction,
    payloadSource = Payloads.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ): Promise<Models.SNFeatureRepo> {
    const repo = this.findItem(uuid)
    if (!repo) {
      throw Error('Attempting to change non-existant repo')
    }
    const mutator = new Models.FeatureRepoMutator(repo, mutationType)
    await this.applyTransform(mutator, mutate, payloadSource, payloadSourceKey)
    return this.findItem(uuid) as Models.SNFeatureRepo
  }

  async changeActionsExtension(
    uuid: UuidString,
    mutate: (mutator: Models.ActionsExtensionMutator) => void,
    mutationType: Models.MutationType = Models.MutationType.UserInteraction,
    payloadSource = Payloads.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ): Promise<Models.SNActionsExtension> {
    const extension = this.findItem(uuid)
    if (!extension) {
      throw Error('Attempting to change non-existant extension')
    }
    const mutator = new Models.ActionsExtensionMutator(extension, mutationType)
    await this.applyTransform(mutator, mutate, payloadSource, payloadSourceKey)
    return this.findItem(uuid) as Models.SNActionsExtension
  }

  async changeItemsKey(
    uuid: UuidString,
    mutate: (mutator: Models.ItemsKeyMutator) => void,
    mutationType: Models.MutationType = Models.MutationType.UserInteraction,
    payloadSource = Payloads.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ): Promise<Models.SNItemsKey> {
    const itemsKey = this.findItem(uuid)
    if (!itemsKey) {
      throw Error('Attempting to change non-existant itemsKey')
    }
    const mutator = new Models.ItemsKeyMutator(itemsKey, mutationType)
    await this.applyTransform(mutator, mutate, payloadSource, payloadSourceKey)
    return this.findItem(uuid) as Models.SNItemsKey
  }

  private async applyTransform<T extends Models.ItemMutator>(
    mutator: T,
    mutate: (mutator: T) => void,
    payloadSource = Payloads.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ) {
    mutate(mutator)
    const payload = mutator.getResult()
    return this.payloadManager.emitPayload(payload, payloadSource, payloadSourceKey)
  }

  /**
   * Sets the item as needing sync. The item is then run through the mapping function,
   * and propagated to mapping observers.
   * @param updateClientDate - Whether to update the item's "user modified date"
   */
  public async setItemDirty(uuid: UuidString, isUserModified = false) {
    if (!isString(uuid)) {
      throw Error('Must use uuid when setting item dirty')
    }
    const result = await this.setItemsDirty([uuid], isUserModified)
    return result[0]
  }

  /**
   * Similar to `setItemDirty`, but acts on an array of items as the first param.
   */
  public async setItemsDirty(uuids: UuidString[], isUserModified = false) {
    if (!isString(uuids[0])) {
      throw Error('Must use uuid when setting item dirty')
    }
    return this.changeItems(
      uuids,
      undefined,
      isUserModified ? Models.MutationType.UserInteraction : Models.MutationType.Internal,
    )
  }

  /**
   * Returns an array of items that need to be synced.
   */
  public getDirtyItems(): Models.SNItem[] {
    const dirty = this.collection.dirtyElements()
    return dirty.filter((item) => {
      return item.isSyncable
    })
  }

  /**
   * Duplicates an item and maps it, thus propagating the item to observers.
   * @param isConflict - Whether to mark the duplicate as a conflict of the original.
   */
  public async duplicateItem<T extends Models.SNItem>(
    uuid: UuidString,
    isConflict = false,
    additionalContent?: Partial<Payloads.PayloadContent>,
  ) {
    const item = this.findItem(uuid)!
    const payload = Payloads.CreateMaxPayloadFromAnyObject(item)
    const resultingPayloads = await PayloadsByDuplicating(
      payload,
      this.payloadManager.getMasterCollection(),
      isConflict,
      additionalContent,
    )
    await this.payloadManager.emitPayloads(resultingPayloads, Payloads.PayloadSource.LocalChanged)
    const duplicate = this.findItem(resultingPayloads[0].uuid!)
    return duplicate! as T
  }

  /**
   * Creates an item and conditionally maps it and marks it as dirty.
   * @param needsSync - Whether to mark the item as needing sync
   */
  public async createItem<T extends Models.SNItem>(
    contentType: ContentType,
    content?: Payloads.PayloadContent,
    needsSync = false,
    override?: Payloads.PayloadOverride,
  ): Promise<T> {
    if (!contentType) {
      throw 'Attempting to create item with no contentType'
    }
    const payload = Payloads.CreateMaxPayloadFromAnyObject(
      {
        uuid: UuidGenerator.GenerateUuid(),
        content_type: contentType,
        content: content ? Payloads.FillItemContent(content) : undefined,
        dirty: needsSync,
      },
      override,
    )
    await this.payloadManager.emitPayload(payload, Payloads.PayloadSource.Constructor)
    return this.findItem(payload.uuid!) as T
  }

  /**
   * Create an unmanaged item that can later be inserted via `insertItem`
   */
  public async createTemplateItem(
    contentType: ContentType,
    content?: Payloads.PayloadContent,
  ): Promise<Models.SNItem> {
    const payload = Payloads.CreateMaxPayloadFromAnyObject({
      uuid: await UuidGenerator.GenerateUuid(),
      content_type: contentType,
      content: Payloads.FillItemContent(content || {}),
    })
    return Models.CreateItemFromPayload(payload)
  }

  /**
   * @param item item to be checked
   * @returns Whether the item is a template (unmanaged)
   */
  public isTemplateItem(item: Models.SNItem): boolean {
    return !this.findItem(item.uuid)
  }

  /**
   * Inserts the item as-is by reading its payload value. This function will not
   * modify item in any way (such as marking it as dirty). It is up to the caller
   * to pass in a dirtied item if that is their intention.
   */
  public async insertItem(item: Models.SNItem): Promise<Models.SNItem> {
    return this.emitItemFromPayload(item.payload)
  }

  public async insertItems(items: Models.SNItem[]): Promise<Models.SNItem[]> {
    return this.emitItemsFromPayloads(items.map((item) => item.payload))
  }

  public async emitItemFromPayload(
    payload: Payloads.PurePayload,
    source = Payloads.PayloadSource.Constructor,
  ): Promise<Models.SNItem> {
    await this.payloadManager.emitPayload(payload, source)
    return this.findItem(payload.uuid) as Models.SNItem
  }

  public async emitItemsFromPayloads(
    payloads: Payloads.PurePayload[],
    source = Payloads.PayloadSource.Constructor,
  ): Promise<Models.SNItem[]> {
    await this.payloadManager.emitPayloads(payloads, source)
    const uuids = Models.Uuids(payloads)
    return this.findItems(uuids)
  }

  /**
   * Marks the item as deleted and needing sync.
   */
  public async setItemToBeDeleted(
    uuid: UuidString,
    source?: Payloads.PayloadSource,
  ): Promise<Models.SNItem | undefined> {
    /** Capture referencing ids before we delete the item below, otherwise
     * the index may be updated before we get a chance to act on it */
    const referencingIds = this.collection.uuidsThatReferenceUuid(uuid)

    const item = this.findItem(uuid)
    const changedItem = await this.changeItem(
      uuid,
      (mutator) => {
        mutator.setDeleted()
      },
      undefined,
      source,
    )

    /** Handle indirect relationships.
     * (Direct relationships are cleared by clearing content above) */
    for (const referencingId of referencingIds) {
      const referencingItem = this.findItem(referencingId)
      if (referencingItem) {
        await this.changeItem(referencingItem.uuid, (mutator) => {
          mutator.removeItemAsRelationship(item!)
        })
      }
    }
    return changedItem
  }

  /**
   * Like `setItemToBeDeleted`, but acts on an array of items.
   */
  public async setItemsToBeDeleted(uuids: UuidString[]): Promise<(Models.SNItem | undefined)[]> {
    return Promise.all(uuids.map((uuid) => this.setItemToBeDeleted(uuid)))
  }

  /**
   * Returns all items of a certain type
   * @param contentType - A string or array of strings representing
   *    content types.
   */
  public getItems<T extends Models.SNItem>(
    contentType: ContentType | ContentType[],
    nonerroredOnly = false,
  ): T[] {
    const items = this.collection.all(contentType)
    if (nonerroredOnly) {
      return items.filter((item) => !item.errorDecrypting && !item.waitingForKey) as T[]
    } else {
      return items as T[]
    }
  }

  /**
   * Returns all items which are properly decrypted
   */
  nonErroredItemsForContentType<T extends Models.SNItem>(contentType: ContentType): T[] {
    const items = this.collection.all(contentType)
    return items.filter((item) => !item.errorDecrypting && !item.waitingForKey) as T[]
  }

  /**
   * Returns all items matching a given predicate
   */
  public itemsMatchingPredicate<T extends Models.SNItem>(
    contentType: ContentType,
    predicate: Payloads.PredicateInterface<T>,
  ): Models.SNItem[] {
    return this.itemsMatchingPredicates(contentType, [predicate])
  }

  /**
   * Returns all items matching an array of predicates
   */
  public itemsMatchingPredicates<T extends Models.SNItem>(
    contentType: ContentType,
    predicates: Payloads.PredicateInterface<T>[],
  ): Models.SNItem[] {
    const subItems = this.getItems<T>(contentType)
    return this.subItemsMatchingPredicates(subItems, predicates)
  }

  /**
   * Performs actual predicate filtering for public methods above.
   * Does not return deleted items.
   */
  public subItemsMatchingPredicates<T extends Models.SNItem>(
    items: T[],
    predicates: Payloads.PredicateInterface<T>[],
  ): T[] {
    const results = items.filter((item) => {
      if (item.deleted) {
        return false
      }
      for (const predicate of predicates) {
        if (!item.satisfiesPredicate(predicate)) {
          return false
        }
      }
      return true
    })
    return results
  }

  public getRootTags(): Models.SNTag[] {
    return this.tags.filter((tag) => tag.parentId === undefined)
  }

  /**
   * Finds the first tag matching a given title
   */
  public findTagByTitle(title: string): Models.SNTag | undefined {
    const lowerCaseTitle = title.toLowerCase()
    return this.tags.find((tag) => tag.title?.toLowerCase() === lowerCaseTitle)
  }

  public findTagByTitleAndParent(
    title: string,
    parentUuid: UuidString | undefined,
  ): Models.SNTag | undefined {
    const lowerCaseTitle = title.toLowerCase()

    const tags = parentUuid ? this.getTagChildren(parentUuid) : this.getRootTags()

    return tags.find((tag) => tag.title?.toLowerCase() === lowerCaseTitle)
  }

  /**
   * Finds tags with title or component starting with a search query and (optionally) not associated with a note
   * @param searchQuery - The query string to match
   * @param note - The note whose tags should be omitted from results
   * @returns Array containing tags matching search query and not associated with note
   */
  public searchTags(searchQuery: string, note?: Models.SNNote): Models.SNTag[] {
    return naturalSort(
      this.tags.filter((tag) => {
        const expandedTitle = this.getTagLongTitle(tag)
        const matchesQuery = expandedTitle.toLowerCase().includes(searchQuery.toLowerCase())
        const tagInNote = note
          ? this.itemsReferencingItem(note.uuid).some((item) => item?.uuid === tag.uuid)
          : false
        return matchesQuery && !tagInNote
      }),
      'title',
    )
  }

  getTagParent(tagUuid: UuidString): Models.SNTag | undefined {
    const tag = this.findItem(tagUuid) as Models.SNTag
    const parentId = tag.parentId
    if (parentId) {
      return this.findItem(parentId) as Models.SNTag
    }
  }

  public getTagPrefixTitle(tag: Models.SNTag): string | undefined {
    const hierarchy = this.getTagParentChain(tag.uuid)

    if (hierarchy.length === 0) {
      return undefined
    }

    const prefixTitle = hierarchy.map((tag) => tag.title).join('/')
    return `${prefixTitle}/`
  }

  public getTagLongTitle(tag: Models.SNTag): string {
    const hierarchy = this.getTagParentChain(tag.uuid)
    const tags = [...hierarchy, tag]
    const longTitle = tags.map((tag) => tag.title).join('/')
    return longTitle
  }

  /**
   * @returns Array of tags where the front of the array represents the top of the tree.
   */
  getTagParentChain(tagUuid: UuidString): Models.SNTag[] {
    const tag = this.findItem<Models.SNTag>(tagUuid)
    if (!tag) {
      return []
    }

    let parentId = tag.parentId
    const chain: Models.SNTag[] = []

    while (parentId) {
      const parent = this.findItem<Models.SNTag>(parentId)
      if (!parent) {
        return chain
      }
      chain.unshift(parent)
      parentId = parent.parentId
    }

    return chain
  }

  public async findOrCreateTagParentChain(titlesHierarchy: string[]): Promise<Models.SNTag> {
    let current: Models.SNTag | undefined = undefined

    for (const title of titlesHierarchy) {
      const currentUuid: string | undefined = current ? current.uuid : undefined

      current = await this.findOrCreateTagByTitle(title, currentUuid)
    }

    if (!current) {
      throw new Error('Invalid tag hierarchy')
    }

    return current
  }

  public getTagChildren(tagUuid: UuidString): Models.SNTag[] {
    const tag = this.findItem(tagUuid) as Models.SNTag
    const tags = this.collection.elementsReferencingElement(tag, ContentType.Tag) as Models.SNTag[]

    return tags.filter((tag) => tag.parentId === tagUuid)
  }

  public isTagAncestor(tagUuid: UuidString, childUuid: UuidString): boolean {
    const tag = this.findItem(childUuid) as Models.SNTag
    let parentId = tag.parentId

    while (parentId) {
      if (parentId === tagUuid) {
        return true
      }

      const parent = this.findItem(parentId) as Models.SNTag
      parentId = parent.parentId
    }

    return false
  }

  public isValidTagParent(parentTagUuid: UuidString, childTagUuid: UuidString): boolean {
    if (parentTagUuid === childTagUuid) {
      return false
    }

    if (this.isTagAncestor(childTagUuid, parentTagUuid)) {
      return false
    }

    return true
  }

  /**
   * @returns The changed child tag
   */
  public setTagParent(parentTag: Models.SNTag, childTag: Models.SNTag): Promise<Models.SNTag> {
    if (parentTag.uuid === childTag.uuid) {
      throw new Error('Can not set a tag parent of itself')
    }

    if (this.isTagAncestor(childTag.uuid, parentTag.uuid)) {
      throw new Error('Can not set a tag ancestor of itself')
    }

    return this.changeTag(childTag.uuid, (m) => {
      m.makeChildOf(parentTag)
    })
  }

  /**
   * @returns The changed child tag
   */
  public unsetTagParent(childTag: Models.SNTag): Promise<Models.SNTag> {
    const parentTag = this.getTagParent(childTag.uuid)

    if (!parentTag) {
      return Promise.resolve(childTag)
    }

    return this.changeTag(childTag.uuid, (m) => {
      m.unsetParent()
    })
  }

  public async associateFileWithNote(
    file: Models.SNFile,
    note: Models.SNNote,
  ): Promise<Models.SNFile> {
    return this.changeItem<Models.FileMutator, Models.SNFile>(file.uuid, (mutator) => {
      mutator.associateWithNote(note)
    })
  }

  public async disassociateFileWithNote(
    file: Models.SNFile,
    note: Models.SNNote,
  ): Promise<Models.SNFile> {
    return this.changeItem<Models.FileMutator, Models.SNFile>(file.uuid, (mutator) => {
      mutator.disassociateWithNote(note)
    })
  }

  public async addTagToNote(
    note: Models.SNNote,
    tag: Models.SNTag,
    addHierarchy: boolean,
  ): Promise<Models.SNTag[]> {
    let tagsToAdd = [tag]
    if (addHierarchy) {
      const parentChainTags = this.getTagParentChain(tag.uuid)
      tagsToAdd = [...parentChainTags, tag]
    }
    return Promise.all(
      tagsToAdd.map((tagToAdd) => {
        return this.changeItem(tagToAdd.uuid, (mutator) => {
          mutator.addItemAsRelationship(note)
        }) as Promise<Models.SNTag>
      }),
    )
  }

  /**
   * Get tags for a note sorted in natural order
   * @param note - The note whose tags will be returned
   * @returns Array containing tags associated with a note
   */
  public getSortedTagsForNote(note: Models.SNNote): Models.SNTag[] {
    return naturalSort(
      this.itemsReferencingItem(note.uuid).filter((ref) => {
        return ref?.content_type === ContentType.Tag
      }) as Models.SNTag[],
      'title',
    )
  }

  public async createTag(title: string, parentUuid?: UuidString): Promise<Models.SNTag> {
    const newTag = (await this.createItem(
      ContentType.Tag,
      Payloads.FillItemContent({ title }),
      true,
    )) as Models.SNTag

    if (parentUuid) {
      const parentTag = this.findItem(parentUuid)
      if (!parentTag || !Models.isTag(parentTag)) {
        throw new Error('Invalid parent tag')
      }
      return this.changeTag(newTag.uuid, (m) => {
        m.makeChildOf(parentTag)
      })
    }

    return newTag
  }

  public async createSmartView<T extends Payloads.ItemInterface>(
    title: string,
    predicate: Payloads.PredicateInterface<T>,
  ): Promise<Models.SmartView> {
    return this.createItem(
      ContentType.SmartView,
      Payloads.FillItemContent({
        title,
        predicate: predicate.toJson(),
      } as Models.SmartViewContent),
      true,
    ) as Promise<Models.SmartView>
  }

  public async createSmartViewFromDSL<T extends Payloads.ItemInterface>(
    dsl: string,
  ): Promise<Models.SmartView> {
    let components = null
    try {
      components = JSON.parse(dsl.substring(1, dsl.length))
    } catch (e) {
      throw Error('Invalid smart view syntax')
    }

    const title = components[0]
    const predicate = Payloads.predicateFromDSLString<T>(dsl)
    return this.createSmartView(title, predicate)
  }

  public async createTagOrSmartView(title: string): Promise<Models.SNTag | Models.SmartView> {
    if (this.isSmartViewTitle(title)) {
      return this.createSmartViewFromDSL(title)
    } else {
      return this.createTag(title)
    }
  }

  public isSmartViewTitle(title: string): boolean {
    return title.startsWith(Models.SMART_TAG_DSL_PREFIX)
  }

  /**
   * Finds or creates a tag with a given title
   */
  public async findOrCreateTagByTitle(
    title: string,
    parentUuid?: UuidString,
  ): Promise<Models.SNTag> {
    const tag = this.findTagByTitleAndParent(title, parentUuid)
    return tag || this.createTag(title, parentUuid)
  }

  public notesMatchingSmartView(view: Models.SmartView): Models.SNNote[] {
    return this.notesView.notesMatchingSmartView(view)
  }

  public get allNotesSmartView(): Models.SmartView {
    return this.systemSmartViews.find(
      (tag) => tag.uuid === Models.SystemViewId.AllNotes,
    ) as Models.SmartView
  }

  public get archivedSmartView(): Models.SmartView {
    return this.systemSmartViews.find(
      (tag) => tag.uuid === Models.SystemViewId.ArchivedNotes,
    ) as Models.SmartView
  }

  public get trashSmartView(): Models.SmartView {
    return this.systemSmartViews.find(
      (tag) => tag.uuid === Models.SystemViewId.TrashedNotes,
    ) as Models.SmartView
  }

  public get untaggedNotesSmartView(): Models.SmartView {
    return this.systemSmartViews.find(
      (tag) => tag.uuid === Models.SystemViewId.UntaggedNotes,
    ) as Models.SmartView
  }

  public get trashedItems(): Models.SNNote[] {
    return this.notesMatchingSmartView(this.trashSmartView)
  }

  /**
   * Permanently deletes any items currently in the trash. Consumer must manually call sync.
   */
  public async emptyTrash(): Promise<void> {
    const notes = this.trashedItems
    await this.setItemsToBeDeleted(Models.Uuids(notes))
  }

  /**
   * Returns all smart views, sorted by title.
   */
  public getSmartViews(): Models.SmartView[] {
    const userTags = this.collection.displayElements(ContentType.SmartView) as Models.SmartView[]
    return this.systemSmartViews.concat(userTags)
  }

  /**
   * The number of notes currently managed
   */
  public get noteCount(): number {
    return this.collection.all(ContentType.Note).length
  }

  /**
   * Immediately removes all items from mapping state and notifies observers
   * Used primarily when signing into an account and wanting to discard any current
   * local data.
   */
  public async removeAllItemsFromMemory(): Promise<void> {
    const uuids = Models.Uuids(this.items)
    /** We don't want to set as dirty, since we want to dispose of immediately. */
    await this.changeItems(
      uuids,
      (mutator) => {
        mutator.setDeleted()
      },
      Models.MutationType.NonDirtying,
    )
    this.resetState()
    this.payloadManager.resetState()
  }

  public removeItemLocally(item: Models.SNItem): void {
    this.collection.discard(item)
    this.payloadManager.removePayloadLocally(item.payload)
  }

  public getFilesForNote(note: Models.SNNote): Models.SNFile[] {
    return this.itemsReferencingItem(note.uuid).filter(
      (ref) => ref.content_type === ContentType.File,
    ) as Models.SNFile[]
  }

  public renameFile(file: Models.SNFile, name: string): Promise<Models.SNFile> {
    return this.changeItem<Models.FileMutator, Models.SNFile>(file.uuid, (mutator) => {
      mutator.name = name
    })
  }
}
