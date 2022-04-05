import { ContentType } from '@standardnotes/common'
import { naturalSort, removeFromArray, UuidGenerator, Uuids } from '@standardnotes/utils'
import { ItemsKeyMutator, SNItemsKey } from '@standardnotes/encryption'
import { PayloadManager } from '../Payloads/PayloadManager'
import { TagsToFoldersMigrationApplicator } from '../../Migrations/Applicators/TagsToFolders'
import { TransactionalMutation } from './TransactionalMutation'
import { UuidString } from '../../Types/UuidString'
import * as Models from '@standardnotes/models'
import * as Services from '@standardnotes/services'
import {} from '@standardnotes/models'
import { ItemsClientInterface } from './ItemsClientInterface'
import { EmitOutPayloads } from '../Payloads'

type ItemsChangeObserver = {
  contentType: ContentType[]
  callback: Services.ItemManagerChangeObserverCallback
}

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
  extends Services.AbstractService
  implements Services.ItemManagerInterface, ItemsClientInterface
{
  private unsubChangeObserver: () => void
  private observers: ItemsChangeObserver[] = []
  private collection!: Models.ItemCollection
  private notesCollection!: Models.NotesCollection
  private systemSmartViews: Models.SmartView[]
  private tagNotesIndex!: Models.TagNotesIndex

  constructor(
    private payloadManager: PayloadManager,
    protected internalEventBus: Services.InternalEventBusInterface,
  ) {
    super(internalEventBus)
    this.payloadManager = payloadManager
    this.systemSmartViews = this.rebuildSystemSmartViews(Models.NotesDisplayCriteria.Create({}))
    this.createCollection()
    this.unsubChangeObserver = this.payloadManager.addObserver(
      ContentType.Any,
      this.setPayloads.bind(this),
    )
  }

  private rebuildSystemSmartViews(criteria: Models.NotesDisplayCriteria): Models.SmartView[] {
    this.systemSmartViews = Models.BuildSmartViews(criteria)
    return this.systemSmartViews
  }

  private createCollection() {
    this.collection = new Models.ItemCollection()
    this.collection.setDisplayOptions(ContentType.Note, Models.CollectionSort.CreatedAt, 'dsc')
    this.collection.setDisplayOptions(ContentType.Tag, Models.CollectionSort.Title, 'dsc')
    this.collection.setDisplayOptions(ContentType.ItemsKey, Models.CollectionSort.CreatedAt, 'asc')
    this.collection.setDisplayOptions(ContentType.Component, Models.CollectionSort.CreatedAt, 'asc')
    this.collection.setDisplayOptions(ContentType.Theme, Models.CollectionSort.Title, 'asc')
    this.collection.setDisplayOptions(ContentType.SmartView, Models.CollectionSort.Title, 'dsc')
    this.notesCollection = new Models.NotesCollection(this.collection)
    this.tagNotesIndex = new Models.TagNotesIndex(this.collection, this.tagNotesIndex?.observers)
  }

  /**
   * Returns all items.
   */
  allItems(): Models.DecryptedItemInterface[] {
    return this.items
  }

  /**
   * Creates an unmanaged item from a payload.
   */
  public createItemFromPayload(
    payload: Models.DecryptedPayloadInterface,
  ): Models.DecryptedItemInterface {
    return Models.CreateDecryptedItemFromPayload(payload)
  }

  /**
   * Creates an unmanaged payload from any object, where the raw object
   * represents the same data a payload would.
   */
  public createPayloadFromObject(
    object: Models.DecryptedTransferPayload,
  ): Models.DecryptedPayloadInterface {
    return new Models.DecryptedPayload(object)
  }

  setDisplayOptions(
    contentType: ContentType,
    sortBy?: Models.CollectionSortProperty,
    direction?: Models.CollectionSortDirection,
    filter?: (element: Models.DecryptedItemInterface) => boolean,
  ): void {
    if (contentType === ContentType.Note) {
      console.warn(
        'Called setDisplayOptions with ContentType.Note. ' +
          'setModels.NotesDisplayCriteria should be used instead.',
      )
    }
    this.collection.setDisplayOptions(contentType, sortBy, direction, filter)
  }

  public setNotesDisplayCriteria(criteria: Models.NotesDisplayCriteria): void {
    const override: Partial<Models.NotesDisplayCriteria> = {}
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

    this.rebuildSystemSmartViews(Models.NotesDisplayCriteria.Copy(criteria, override))

    const updatedViews = criteria.views.map((tag) => {
      const matchingSystemTag = this.systemSmartViews.find((view) => view.uuid === tag.uuid)
      return matchingSystemTag || tag
    })

    const updatedCriteria = Models.NotesDisplayCriteria.Copy(criteria, {
      views: updatedViews,
      ...override,
    })

    this.notesCollection.setCriteria(updatedCriteria)
  }

  public getDisplayableItems<T extends Models.DecryptedItemInterface>(
    contentType:
      | ContentType.Tag
      | ContentType.SmartView
      | ContentType.Theme
      | ContentType.Component,
  ): T[] {
    return this.collection.displayElements(contentType)
  }

  public getDisplayableNotes(): Models.SNNote[] {
    return this.notesCollection.displayElements()
  }

  public deinit(): void {
    this.unsubChangeObserver()
    ;(this.unsubChangeObserver as unknown) = undefined
    ;(this.payloadManager as unknown) = undefined
    ;(this.collection as unknown) = undefined
    ;(this.notesCollection as unknown) = undefined
  }

  resetState(): void {
    this.createCollection()
  }

  /**
   * Returns an item for a given id
   */
  findItem<T extends Models.DecryptedItemInterface = Models.DecryptedItemInterface>(
    uuid: UuidString,
  ): T | undefined {
    const itemFromCollection = this.collection.findNondeleted<T>(uuid)

    if (itemFromCollection) {
      return itemFromCollection
    }

    const itemFromSmartViews = this.systemSmartViews.find((tag) => tag.uuid === uuid)

    if (itemFromSmartViews) {
      return itemFromSmartViews as unknown as T
    }

    return undefined
  }

  findSureItem<T extends Models.DecryptedItemInterface = Models.DecryptedItemInterface>(
    uuid: UuidString,
  ): T {
    return this.findItem(uuid) as T
  }

  /**
   * Returns all items matching given ids
   */
  findItems<T extends Models.DecryptedItemInterface>(uuids: UuidString[]): T[] {
    return this.collection.findAllNondeleted(uuids)
  }

  /**
   * If item is not found, an `undefined` element
   * will be inserted into the array.
   */
  findItemsIncludingBlanks<T extends Models.DecryptedItemInterface>(
    uuids: UuidString[],
  ): (T | undefined)[] {
    return this.collection.findAllNondeletedIncludingBlanks(uuids)
  }

  /**
   * Returns a detached array of all items
   */
  public get items(): Models.DecryptedItemInterface[] {
    return this.collection.nondeletedElements()
  }

  itemsKeys(): Models.ItemsKeyInterface[] {
    return this.collection.displayElements(ContentType.ItemsKey) as Models.ItemsKeyInterface[]
  }

  /**
   * Returns all non-deleted notes
   */
  get notes() {
    return this.notesCollection.displayElements()
  }

  /**
   * Returns all non-deleted tags
   */
  get tags() {
    return this.collection.displayElements(ContentType.Tag) as Models.SNTag[]
  }

  public hasTagsNeedingFoldersMigration(): boolean {
    return TagsToFoldersMigrationApplicator.isApplicableToCurrentData(this)
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

  public addNoteCountChangeObserver(observer: Models.TagNoteCountChangeObserver): () => void {
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

  public getNoteCount(): number {
    return this.noteCount
  }

  public addObserver(
    contentType: ContentType | ContentType[],
    callback: Services.ItemManagerChangeObserverCallback,
  ): () => void {
    if (!Array.isArray(contentType)) {
      contentType = [contentType]
    }
    const observer: ItemsChangeObserver = {
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
  public itemsReferencingItem(
    itemToLookupUuidFor: Models.DecryptedItemInterface,
    contentType?: ContentType,
  ): Models.DecryptedItemInterface[] {
    const uuids = this.collection.uuidsThatReferenceUuid(itemToLookupUuidFor.uuid)
    let referencing = this.findItems(uuids)
    if (contentType) {
      referencing = referencing.filter((ref) => {
        return ref?.content_type === contentType
      })
    }
    return referencing
  }

  /**
   * Returns all items that an item directly references
   */
  public referencesForItem(
    itemToLookupUuidFor: Models.DecryptedItemInterface,
    contentType?: ContentType,
  ): Models.DecryptedItemInterface[] {
    const item = this.findSureItem(itemToLookupUuidFor.uuid)
    const uuids = item.references.map((ref) => ref.uuid)
    let references = this.findItems(uuids)
    if (contentType) {
      references = references.filter((ref) => {
        return ref?.content_type === contentType
      })
    }
    return references
  }

  private setPayloads(
    changedPayloads: EmitOutPayloads[],
    insertedPayloads: EmitOutPayloads[],
    discardedPayloads: Models.DeletedPayloadInterface[],
    ignoredPayloads: Models.EncryptedPayloadInterface[],
    source: Models.PayloadSource,
    sourceKey?: string,
  ) {
    const createItem = (payload: EmitOutPayloads) => Models.CreateItemFromPayload(payload)

    const changedItems = changedPayloads.map(createItem)

    const insertedItems = insertedPayloads.map(createItem)

    const discardedItems: Models.DeletedItemInterface[] = discardedPayloads.map(
      (p) => new Models.DeletedItem(p),
    )

    const ignoredItems: Models.EncryptedItemInterface[] = ignoredPayloads.map(
      (p) => new Models.EncryptedItem(p),
    )

    const delta: Models.ItemDelta = {
      changed: changedItems,
      inserted: insertedItems,
      discarded: discardedItems,
      ignored: ignoredItems,
    }

    this.collection.onChange(delta)
    this.notesCollection.onChange(delta)
    this.tagNotesIndex.onChange(delta)

    this.notifyObservers(
      delta.changed.filter(Models.isDecryptedItem),
      delta.inserted.filter(Models.isDecryptedItem),
      delta.discarded,
      delta.ignored,
      source,
      sourceKey,
    )
  }

  private notifyObservers(
    changed: Models.DecryptedItemInterface[],
    inserted: Models.DecryptedItemInterface[],
    removed: (Models.DeletedItemInterface | Models.EncryptedItemInterface)[],
    ignored: Models.EncryptedItemInterface[],
    source: Models.PayloadSource,
    sourceKey?: string,
  ) {
    const filter = <I extends Models.ItemInterface>(items: I[], types: ContentType[]) => {
      return items.filter((item) => {
        return types.includes(ContentType.Any) || types.includes(item.content_type)
      })
    }
    const observers = this.observers.slice()
    for (const observer of observers) {
      const filteredChanged = filter(changed, observer.contentType)
      const filteredInserted = filter(inserted, observer.contentType)
      const filteredDiscarded = filter(removed, observer.contentType)
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
   */
  public async changeItem<
    M extends Models.DecryptedItemMutator = Models.DecryptedItemMutator,
    I extends Models.DecryptedItemInterface = Models.DecryptedItemInterface,
  >(
    itemToLookupUuidFor: I,
    mutate?: (mutator: M) => void,
    mutationType: Models.MutationType = Models.MutationType.UpdateUserTimestamps,
    payloadSource = Models.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ): Promise<I> {
    const results = await this.changeItems<M, I>(
      [itemToLookupUuidFor],
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
    M extends Models.DecryptedItemMutator = Models.DecryptedItemMutator,
    I extends Models.DecryptedItemInterface = Models.DecryptedItemInterface,
  >(
    itemsToLookupUuidsFor: I[],
    mutate?: (mutator: M) => void,
    mutationType: Models.MutationType = Models.MutationType.UpdateUserTimestamps,
    payloadSource = Models.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ): Promise<I[]> {
    const items = this.findItemsIncludingBlanks(Uuids(itemsToLookupUuidsFor))
    const payloads = []
    for (const item of items) {
      if (!item) {
        throw Error('Attempting to change non-existant item')
      }
      const mutator = Models.CreateDecryptedMutatorForItem(item, mutationType)
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
    payloadSource = Models.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ): Promise<(Models.DecryptedItemInterface | undefined)[]> {
    const payloads: Models.DecryptedPayloadInterface[] = []
    for (const transaction of transactions) {
      const item = this.findItem(transaction.itemUuid)
      if (!item) {
        continue
      }
      const mutator = Models.CreateDecryptedMutatorForItem(
        item,
        transaction.mutationType || Models.MutationType.UpdateUserTimestamps,
      )
      transaction.mutate(mutator)
      const payload = mutator.getResult()
      payloads.push(payload)
    }

    await this.payloadManager.emitPayloads(payloads, payloadSource, payloadSourceKey)
    const results = this.findItems(payloads.map((p) => p.uuid))
    return results
  }

  public async runTransactionalMutation(
    transaction: TransactionalMutation,
    payloadSource = Models.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ): Promise<Models.DecryptedItemInterface | undefined> {
    const item = this.findSureItem(transaction.itemUuid)
    const mutator = Models.CreateDecryptedMutatorForItem(
      item,
      transaction.mutationType || Models.MutationType.UpdateUserTimestamps,
    )
    transaction.mutate(mutator)
    const payload = mutator.getResult()

    await this.payloadManager.emitPayloads([payload], payloadSource, payloadSourceKey)
    const result = this.findItem(payload.uuid)
    return result
  }

  async changeNote(
    itemToLookupUuidFor: Models.SNNote,
    mutate: (mutator: Models.NoteMutator) => void,
    mutationType: Models.MutationType = Models.MutationType.UpdateUserTimestamps,
    payloadSource = Models.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ): Promise<Models.DecryptedPayloadInterface[]> {
    const note = this.findItem<Models.SNNote>(itemToLookupUuidFor.uuid)
    if (!note) {
      throw Error('Attempting to change non-existant note')
    }
    const mutator = new Models.NoteMutator(note, mutationType)

    return this.applyTransform(mutator, mutate, payloadSource, payloadSourceKey)
  }

  async changeTag(
    itemToLookupUuidFor: Models.SNTag,
    mutate: (mutator: Models.TagMutator) => void,
    mutationType: Models.MutationType = Models.MutationType.UpdateUserTimestamps,
    payloadSource = Models.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ): Promise<Models.SNTag> {
    const tag = this.findItem<Models.SNTag>(itemToLookupUuidFor.uuid)
    if (!tag) {
      throw Error('Attempting to change non-existant tag')
    }
    const mutator = new Models.TagMutator(tag, mutationType)
    await this.applyTransform(mutator, mutate, payloadSource, payloadSourceKey)
    return this.findSureItem<Models.SNTag>(itemToLookupUuidFor.uuid)
  }

  async changeComponent(
    itemToLookupUuidFor: Models.SNComponent,
    mutate: (mutator: Models.ComponentMutator) => void,
    mutationType: Models.MutationType = Models.MutationType.UpdateUserTimestamps,
    payloadSource = Models.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ): Promise<Models.SNComponent> {
    const component = this.findItem<Models.SNComponent>(itemToLookupUuidFor.uuid)
    if (!component) {
      throw Error('Attempting to change non-existant component')
    }
    const mutator = new Models.ComponentMutator(component, mutationType)
    await this.applyTransform(mutator, mutate, payloadSource, payloadSourceKey)
    return this.findSureItem<Models.SNComponent>(itemToLookupUuidFor.uuid)
  }

  async changeFeatureRepo(
    itemToLookupUuidFor: Models.SNFeatureRepo,
    mutate: (mutator: Models.FeatureRepoMutator) => void,
    mutationType: Models.MutationType = Models.MutationType.UpdateUserTimestamps,
    payloadSource = Models.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ): Promise<Models.SNFeatureRepo> {
    const repo = this.findItem(itemToLookupUuidFor.uuid)
    if (!repo) {
      throw Error('Attempting to change non-existant repo')
    }
    const mutator = new Models.FeatureRepoMutator(repo, mutationType)
    await this.applyTransform(mutator, mutate, payloadSource, payloadSourceKey)
    return this.findSureItem<Models.SNFeatureRepo>(itemToLookupUuidFor.uuid)
  }

  async changeActionsExtension(
    itemToLookupUuidFor: Models.SNActionsExtension,
    mutate: (mutator: Models.ActionsExtensionMutator) => void,
    mutationType: Models.MutationType = Models.MutationType.UpdateUserTimestamps,
    payloadSource = Models.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ): Promise<Models.SNActionsExtension> {
    const extension = this.findItem<Models.SNActionsExtension>(itemToLookupUuidFor.uuid)
    if (!extension) {
      throw Error('Attempting to change non-existant extension')
    }
    const mutator = new Models.ActionsExtensionMutator(extension, mutationType)
    await this.applyTransform(mutator, mutate, payloadSource, payloadSourceKey)
    return this.findSureItem<Models.SNActionsExtension>(itemToLookupUuidFor.uuid)
  }

  async changeItemsKey(
    itemToLookupUuidFor: Models.ItemsKeyInterface,
    mutate: (mutator: Models.ItemsKeyMutatorInterface) => void,
    mutationType: Models.MutationType = Models.MutationType.UpdateUserTimestamps,
    payloadSource = Models.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ): Promise<Models.ItemsKeyInterface> {
    const itemsKey = this.findItem<SNItemsKey>(itemToLookupUuidFor.uuid)
    if (!itemsKey) {
      throw Error('Attempting to change non-existant itemsKey')
    }
    const mutator = new ItemsKeyMutator(itemsKey, mutationType)
    await this.applyTransform(mutator, mutate, payloadSource, payloadSourceKey)
    return this.findSureItem<Models.ItemsKeyInterface>(itemToLookupUuidFor.uuid)
  }

  private async applyTransform<T extends Models.DecryptedItemMutator>(
    mutator: T,
    mutate: (mutator: T) => void,
    payloadSource = Models.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ): Promise<Models.DecryptedPayloadInterface[]> {
    mutate(mutator)
    const payload = mutator.getResult()
    return this.payloadManager.emitPayload(payload, payloadSource, payloadSourceKey)
  }

  /**
   * Sets the item as needing sync. The item is then run through the mapping function,
   * and propagated to mapping observers.
   * @param isUserModified - Whether to update the item's "user modified date"
   */
  public async setItemDirty(
    itemToLookupUuidFor: Models.DecryptedItemInterface,
    isUserModified = false,
  ) {
    const result = await this.setItemsDirty([itemToLookupUuidFor], isUserModified)
    return result[0]
  }

  public async setItemsDirty(
    itemsToLookupUuidsFor: Models.DecryptedItemInterface[],
    isUserModified = false,
  ): Promise<Models.DecryptedItemInterface[]> {
    return this.changeItems(
      itemsToLookupUuidsFor,
      undefined,
      isUserModified
        ? Models.MutationType.UpdateUserTimestamps
        : Models.MutationType.NoUpdateUserTimestamps,
    )
  }

  /**
   * Returns an array of items that need to be synced.
   */
  public getDirtyItems(): (Models.DecryptedItemInterface | Models.DeletedItemInterface)[] {
    const dirty = this.collection.dirtyElements()
    return dirty.filter((item) => {
      return item.isSyncable
    })
  }

  /**
   * Duplicates an item and maps it, thus propagating the item to observers.
   * @param isConflict - Whether to mark the duplicate as a conflict of the original.
   */
  public async duplicateItem<T extends Models.DecryptedItemInterface>(
    itemToLookupUuidFor: T,
    isConflict = false,
    additionalContent?: Partial<Models.ItemContent>,
  ) {
    const item = this.findSureItem(itemToLookupUuidFor.uuid)
    const payload = item.payload.copy()
    const resultingPayloads = await Models.PayloadsByDuplicating(
      payload,
      this.payloadManager.getMasterCollection(),
      isConflict,
      additionalContent,
    )
    await this.payloadManager.emitPayloads(resultingPayloads, Models.PayloadSource.LocalChanged)
    const duplicate = this.findSureItem<T>(resultingPayloads[0].uuid)
    return duplicate
  }

  /**
   * Creates an item and conditionally maps it and marks it as dirty.
   * @param needsSync - Whether to mark the item as needing sync
   */
  public async createItem<
    T extends Models.DecryptedItemInterface,
    C extends Models.ItemContent = Models.ItemContent,
  >(contentType: ContentType, content: C, needsSync = false): Promise<T> {
    if (!contentType) {
      throw 'Attempting to create item with no contentType'
    }
    const payload = new Models.DecryptedPayload<C>({
      uuid: UuidGenerator.GenerateUuid(),
      content_type: contentType,
      content: Models.FillItemContent<C>(content),
      dirty: needsSync,
    })
    await this.payloadManager.emitPayload(payload, Models.PayloadSource.Constructor)
    return this.findSureItem<T>(payload.uuid)
  }

  /**
   * Create an unmanaged item that can later be inserted via `insertItem`
   */
  public createTemplateItem<
    C extends Models.ItemContent = Models.ItemContent,
    I extends Models.DecryptedItemInterface<C> = Models.DecryptedItemInterface<C>,
  >(contentType: ContentType, content?: C): I {
    const payload = new Models.DecryptedPayload<C>({
      uuid: UuidGenerator.GenerateUuid(),
      content_type: contentType,
      content: Models.FillItemContent<C>(content || {}),
    })
    const item = Models.CreateDecryptedItemFromPayload<C, I>(payload)
    return item
  }

  /**
   * @param item item to be checked
   * @returns Whether the item is a template (unmanaged)
   */
  public isTemplateItem(item: Models.DecryptedItemInterface): boolean {
    return !this.findItem(item.uuid)
  }

  public async insertItem(
    item: Models.DecryptedItemInterface,
  ): Promise<Models.DecryptedItemInterface> {
    return this.emitItemFromPayload(item.payload)
  }

  public async insertItems(
    items: Models.DecryptedItemInterface[],
  ): Promise<Models.DecryptedItemInterface[]> {
    return this.emitItemsFromPayloads(items.map((item) => item.payload))
  }

  public async emitItemFromPayload(
    payload: Models.DecryptedPayloadInterface,
    source = Models.PayloadSource.Constructor,
  ): Promise<Models.DecryptedItemInterface> {
    await this.payloadManager.emitPayload(payload, source)
    return this.findItem(payload.uuid) as Models.DecryptedItemInterface
  }

  public async emitItemsFromPayloads(
    payloads: Models.DecryptedPayloadInterface[],
    source = Models.PayloadSource.Constructor,
  ): Promise<Models.DecryptedItemInterface[]> {
    await this.payloadManager.emitPayloads(payloads, source)
    const uuids = Uuids(payloads)
    return this.findItems(uuids)
  }

  public async setItemToBeDeleted(
    itemToLookupUuidFor: Models.DecryptedItemInterface,
    source: Models.PayloadSource = Models.PayloadSource.LocalChanged,
  ): Promise<void> {
    /** Capture referencing ids before we delete the item below, otherwise
     * the index may be updated before we get a chance to act on it */
    const referencingIds = this.collection.uuidsThatReferenceUuid(itemToLookupUuidFor.uuid)

    const item = this.findSureItem(itemToLookupUuidFor.uuid)
    const mutator = new Models.DeleteItemMutator(item, Models.MutationType.UpdateUserTimestamps)
    const deletedPayload = mutator.getDeletedResult()

    await this.payloadManager.emitPayload(deletedPayload, source)

    /** Handle indirect relationships.
     * (Direct relationships are cleared by clearing content above) */
    for (const referencingId of referencingIds) {
      const referencingItem = this.findItem(referencingId)
      if (referencingItem) {
        await this.changeItem(referencingItem, (mutator) => {
          mutator.removeItemAsRelationship(item)
        })
      }
    }
  }

  /**
   * Like `setItemToBeDeleted`, but acts on an array of items.
   */
  public async setItemsToBeDeleted(
    itemsToLookupUuidsFor: Models.DecryptedItemInterface[],
  ): Promise<void> {
    await Promise.all(itemsToLookupUuidsFor.map((item) => this.setItemToBeDeleted(item)))
  }

  /**
   * Returns all items of a certain type
   */
  public getItems<T extends Models.DecryptedItemInterface>(
    contentType: ContentType | ContentType[],
  ): T[] {
    return this.collection.allNondeleted<T>(contentType)
  }

  /**
   * Returns all items matching a given predicate
   */
  public itemsMatchingPredicate<T extends Models.DecryptedItemInterface>(
    contentType: ContentType,
    predicate: Models.PredicateInterface<T>,
  ): T[] {
    return this.itemsMatchingPredicates(contentType, [predicate])
  }

  /**
   * Returns all items matching an array of predicates
   */
  public itemsMatchingPredicates<T extends Models.DecryptedItemInterface>(
    contentType: ContentType,
    predicates: Models.PredicateInterface<T>[],
  ): T[] {
    const subItems = this.getItems<T>(contentType)
    return this.subItemsMatchingPredicates(subItems, predicates)
  }

  /**
   * Performs actual predicate filtering for public methods above.
   * Does not return deleted items.
   */
  public subItemsMatchingPredicates<T extends Models.DecryptedItemInterface>(
    items: T[],
    predicates: Models.PredicateInterface<T>[],
  ): T[] {
    const results = items.filter((item) => {
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
    parentItemToLookupUuidFor?: Models.SNTag,
  ): Models.SNTag | undefined {
    const lowerCaseTitle = title.toLowerCase()

    const tags = parentItemToLookupUuidFor
      ? this.getTagChildren(parentItemToLookupUuidFor)
      : this.getRootTags()

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
          ? this.itemsReferencingItem(note).some((item) => item?.uuid === tag.uuid)
          : false
        return matchesQuery && !tagInNote
      }),
      'title',
    )
  }

  getTagParent(itemToLookupUuidFor: Models.SNTag): Models.SNTag | undefined {
    const tag = this.findItem<Models.SNTag>(itemToLookupUuidFor.uuid)
    if (!tag) {
      return undefined
    }
    const parentId = tag.parentId
    if (parentId) {
      return this.findItem(parentId) as Models.SNTag
    }
    return undefined
  }

  public getTagPrefixTitle(tag: Models.SNTag): string | undefined {
    const hierarchy = this.getTagParentChain(tag)

    if (hierarchy.length === 0) {
      return undefined
    }

    const prefixTitle = hierarchy.map((tag) => tag.title).join('/')
    return `${prefixTitle}/`
  }

  public getTagLongTitle(tag: Models.SNTag): string {
    const hierarchy = this.getTagParentChain(tag)
    const tags = [...hierarchy, tag]
    const longTitle = tags.map((tag) => tag.title).join('/')
    return longTitle
  }

  getTagParentChain(itemToLookupUuidFor: Models.SNTag): Models.SNTag[] {
    const tag = this.findItem<Models.SNTag>(itemToLookupUuidFor.uuid)
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
      current = await this.findOrCreateTagByTitle(title, current)
    }

    if (!current) {
      throw new Error('Invalid tag hierarchy')
    }

    return current
  }

  public getTagChildren(itemToLookupUuidFor: Models.SNTag): Models.SNTag[] {
    const tag = this.findItem<Models.SNTag>(itemToLookupUuidFor.uuid)
    if (!tag) {
      return []
    }

    const tags = this.collection.elementsReferencingElement(tag, ContentType.Tag) as Models.SNTag[]

    return tags.filter((tag) => tag.parentId === itemToLookupUuidFor.uuid)
  }

  public isTagAncestor(
    tagToLookUpUuidFor: Models.SNTag,
    childToLookUpUuidFor: Models.SNTag,
  ): boolean {
    const tag = this.findItem<Models.SNTag>(childToLookUpUuidFor.uuid)
    if (!tag) {
      return false
    }

    let parentId = tag.parentId

    while (parentId) {
      if (parentId === tagToLookUpUuidFor.uuid) {
        return true
      }

      const parent = this.findItem<Models.SNTag>(parentId)
      if (!parent) {
        return false
      }

      parentId = parent.parentId
    }

    return false
  }

  public isValidTagParent(
    parentTagToLookUpUuidFor: Models.SNTag,
    childToLookUpUuidFor: Models.SNTag,
  ): boolean {
    if (parentTagToLookUpUuidFor.uuid === childToLookUpUuidFor.uuid) {
      return false
    }

    if (this.isTagAncestor(childToLookUpUuidFor, parentTagToLookUpUuidFor)) {
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

    if (this.isTagAncestor(childTag, parentTag)) {
      throw new Error('Can not set a tag ancestor of itself')
    }

    return this.changeTag(childTag, (m) => {
      m.makeChildOf(parentTag)
    })
  }

  /**
   * @returns The changed child tag
   */
  public unsetTagParent(childTag: Models.SNTag): Promise<Models.SNTag> {
    const parentTag = this.getTagParent(childTag)

    if (!parentTag) {
      return Promise.resolve(childTag)
    }

    return this.changeTag(childTag, (m) => {
      m.unsetParent()
    })
  }

  public async associateFileWithNote(
    file: Models.SNFile,
    note: Models.SNNote,
  ): Promise<Models.SNFile> {
    return this.changeItem<Models.FileMutator, Models.SNFile>(file, (mutator) => {
      mutator.associateWithNote(note)
    })
  }

  public async disassociateFileWithNote(
    file: Models.SNFile,
    note: Models.SNNote,
  ): Promise<Models.SNFile> {
    return this.changeItem<Models.FileMutator, Models.SNFile>(file, (mutator) => {
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
      const parentChainTags = this.getTagParentChain(tag)
      tagsToAdd = [...parentChainTags, tag]
    }
    return Promise.all(
      tagsToAdd.map((tagToAdd) => {
        return this.changeItem(tagToAdd, (mutator) => {
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
      this.itemsReferencingItem(note).filter((ref) => {
        return ref?.content_type === ContentType.Tag
      }) as Models.SNTag[],
      'title',
    )
  }

  public async createTag(
    title: string,
    parentItemToLookupUuidFor?: Models.SNTag,
  ): Promise<Models.SNTag> {
    const newTag = await this.createItem<Models.SNTag>(
      ContentType.Tag,
      Models.FillItemContent<Models.TagContent>({ title }),
      true,
    )

    if (parentItemToLookupUuidFor) {
      const parentTag = this.findItem<Models.SNTag>(parentItemToLookupUuidFor.uuid)
      if (!parentTag) {
        throw new Error('Invalid parent tag')
      }
      return this.changeTag(newTag, (m) => {
        m.makeChildOf(parentTag)
      })
    }

    return newTag
  }

  public async createSmartView<T extends Models.DecryptedItemInterface>(
    title: string,
    predicate: Models.PredicateInterface<T>,
  ): Promise<Models.SmartView> {
    return this.createItem(
      ContentType.SmartView,
      Models.FillItemContent({
        title,
        predicate: predicate.toJson(),
      } as Models.SmartViewContent),
      true,
    ) as Promise<Models.SmartView>
  }

  public async createSmartViewFromDSL<T extends Models.DecryptedItemInterface>(
    dsl: string,
  ): Promise<Models.SmartView> {
    let components = null
    try {
      components = JSON.parse(dsl.substring(1, dsl.length))
    } catch (e) {
      throw Error('Invalid smart view syntax')
    }

    const title = components[0]
    const predicate = Models.predicateFromDSLString<T>(dsl)
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
    parentItemToLookupUuidFor?: Models.SNTag,
  ): Promise<Models.SNTag> {
    const tag = this.findTagByTitleAndParent(title, parentItemToLookupUuidFor)
    return tag || this.createTag(title, parentItemToLookupUuidFor)
  }

  public notesMatchingSmartView(view: Models.SmartView): Models.SNNote[] {
    return this.notesCollection.notesMatchingSmartView(view)
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
    await this.setItemsToBeDeleted(notes)
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
    const uuids = Uuids(this.items)
    const results: Models.DeletedPayloadInterface[] = []

    for (const uuid of uuids) {
      const mutator = new Models.DeleteItemMutator(
        this.findSureItem(uuid),
        /** We don't want to set as dirty, since we want to dispose of immediately. */
        Models.MutationType.NonDirtying,
      )
      results.push(mutator.getDeletedResult())
    }

    await this.payloadManager.emitPayloads(results, Models.PayloadSource.LocalChanged)

    this.resetState()
    this.payloadManager.resetState()
  }

  public removeItemLocally(
    item: Models.DecryptedItemInterface | Models.DeletedItemInterface,
  ): void {
    this.collection.discard([item])
    this.payloadManager.removePayloadLocally(item.payload)
  }

  public getFilesForNote(note: Models.SNNote): Models.SNFile[] {
    return this.itemsReferencingItem(note).filter(
      (ref) => ref.content_type === ContentType.File,
    ) as Models.SNFile[]
  }

  public renameFile(file: Models.SNFile, name: string): Promise<Models.SNFile> {
    return this.changeItem<Models.FileMutator, Models.SNFile>(file, (mutator) => {
      mutator.name = name
    })
  }
}
