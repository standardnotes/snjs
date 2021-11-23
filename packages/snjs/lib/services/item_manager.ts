import { TagMutator } from './../models/app/tag';
import {
  FeatureRepoMutator,
  SNFeatureRepo,
} from './../models/app/feature_repo';
import {
  CollectionSort,
  ItemCollection,
  SortDirection,
} from '@Protocol/collection/item_collection';
import { SNItemsKey } from '@Models/app/items_key';
import { ItemsKeyMutator } from './../models/app/items_key';
import { SNTag } from '@Models/app/tag';
import { NoteMutator, SNNote } from './../models/app/note';
import {
  ActionsExtensionMutator,
  SNActionsExtension,
} from './../models/app/extension';
import { SNSmartTag } from './../models/app/smartTag';
import { SNPredicate } from './../models/core/predicate';
import { Uuid } from './../uuid';
import { PayloadsByDuplicating } from '@Payloads/functions';
import { UuidString } from './../types';
import { CreateItemFromPayload } from '@Models/generator';
import { FillItemContent, Uuids } from '@Models/functions';
import { PureService } from '@Lib/services/pure_service';
import { ComponentMutator } from './../models/app/component';
import { SNComponent } from '@Models/app/component';
import { isString, naturalSort, removeFromArray } from '@Lib/utils';
import { CreateMaxPayloadFromAnyObject } from '@Payloads/generator';
import {
  PayloadContent,
  PayloadOverride,
} from './../protocol/payloads/generator';
import { ItemMutator, MutationType, SNItem } from './../models/core/item';
import { PayloadSource } from './../protocol/payloads/sources';
import { PurePayload } from './../protocol/payloads/pure_payload';
import { PayloadManager } from './payload_manager';
import { ContentType } from '../models/content_types';
import { ItemCollectionNotesView } from '@Lib/protocol/collection/item_collection_notes_view';
import { NotesDisplayCriteria } from '@Lib/protocol/collection/notes_display_criteria';
import { createMutatorForItem } from '@Lib/models/mutator';

type ObserverCallback = (
  /** The items are pre-existing but have been changed */
  changed: SNItem[],
  /** The items have been newly inserted */
  inserted: SNItem[],
  /** The items have been deleted from local state (and remote state if applicable) */
  discarded: SNItem[],
  /** Items for which encrypted overwrite protection is enabled and enacted */
  ignored: SNItem[],
  source?: PayloadSource,
  sourceKey?: string
) => void;

type Observer = {
  contentType: ContentType[];
  callback: ObserverCallback;
};

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
export class ItemManager extends PureService {
  private unsubChangeObserver: () => void;
  private observers: Observer[] = [];
  private collection!: ItemCollection;
  private notesView!: ItemCollectionNotesView;
  private systemSmartTags: SNSmartTag[];

  constructor(private payloadManager: PayloadManager) {
    super();
    this.payloadManager = payloadManager;
    this.systemSmartTags = BuildSmartTags();
    this.createCollection();
    this.unsubChangeObserver = this.payloadManager.addObserver(
      ContentType.Any,
      this.setPayloads.bind(this)
    );
  }

  private createCollection() {
    this.collection = new ItemCollection();
    this.collection.setDisplayOptions(
      ContentType.Note,
      CollectionSort.CreatedAt,
      'dsc'
    );
    this.collection.setDisplayOptions(
      ContentType.Tag,
      CollectionSort.Title,
      'dsc'
    );
    this.collection.setDisplayOptions(
      ContentType.ItemsKey,
      CollectionSort.CreatedAt,
      'asc'
    );
    this.collection.setDisplayOptions(
      ContentType.Component,
      CollectionSort.CreatedAt,
      'asc'
    );
    this.collection.setDisplayOptions(
      ContentType.Theme,
      CollectionSort.Title,
      'asc'
    );
    this.collection.setDisplayOptions(
      ContentType.SmartTag,
      CollectionSort.Title,
      'asc'
    );
    this.notesView = new ItemCollectionNotesView(this.collection);
  }

  public setDisplayOptions(
    contentType: ContentType,
    sortBy?: CollectionSort,
    direction?: SortDirection,
    filter?: (element: SNItem) => boolean
  ): void {
    if (contentType === ContentType.Note) {
      console.warn(
        'Called setDisplayOptions with ContentType.Note. ' +
          'setNotesDisplayCriteria should be used instead.'
      );
    }
    this.collection.setDisplayOptions(contentType, sortBy, direction, filter);
  }

  public setNotesDisplayCriteria(criteria: NotesDisplayCriteria): void {
    this.notesView.setCriteria(criteria);
  }

  public getDisplayableItems(contentType: ContentType): SNItem[] {
    if (contentType === ContentType.Note) {
      return this.notesView.displayElements();
    }
    return this.collection.displayElements(contentType);
  }

  public deinit(): void {
    this.unsubChangeObserver();
    (this.unsubChangeObserver as unknown) = undefined;
    (this.payloadManager as unknown) = undefined;
    (this.collection as unknown) = undefined;
    (this.notesView as unknown) = undefined;
  }

  resetState(): void {
    this.createCollection();
  }

  /**
   * Returns an item for a given id
   */
  findItem<T extends SNItem = SNItem>(uuid: UuidString): T | undefined {
    return this.collection.find(uuid) as T | undefined;
  }

  /**
   * Returns all items matching given ids
   * @param includeBlanks If true and an item is not found, an `undefined` element
   * will be inserted into the array.
   */
  findItems(uuids: UuidString[], includeBlanks = false) {
    return this.collection.findAll(uuids, includeBlanks);
  }

  /**
   * Returns a detached array of all items
   */
  public get items(): SNItem[] {
    return this.collection.all();
  }

  /**
   * Returns a detached array of all items which are not deleted
   */
  public get nonDeletedItems() {
    return this.collection.nondeletedElements();
  }

  /**
   * Returns all items that have not been able to decrypt.
   */
  public get invalidItems() {
    return this.collection.invalidElements();
  }

  /**
   * Returns all non-deleted items keys
   */
  itemsKeys() {
    return this.collection.displayElements(
      ContentType.ItemsKey
    ) as SNItemsKey[];
  }

  /**
   * Returns all non-deleted notes
   */
  get notes() {
    return this.notesView.displayElements();
  }

  /**
   * Returns all non-deleted tags
   */
  get tags() {
    return this.collection.displayElements(ContentType.Tag) as SNTag[];
  }

  /**
   * Returns all non-deleted components
   */
  get components() {
    return this.collection.displayElements(
      ContentType.Component
    ) as SNComponent[];
  }

  public addObserver(
    contentType: ContentType | ContentType[],
    callback: ObserverCallback
  ) {
    if (!Array.isArray(contentType)) {
      contentType = [contentType];
    }
    const observer: Observer = {
      contentType,
      callback,
    };
    this.observers.push(observer);
    return () => {
      removeFromArray(this.observers, observer);
    };
  }

  /**
   * Returns the items that reference the given item, or an empty array if no results.
   */
  public itemsReferencingItem(uuid: UuidString) {
    if (!isString(uuid)) {
      throw Error('Must use uuid string');
    }
    const uuids = this.collection.uuidsThatReferenceUuid(uuid);
    return this.findItems(uuids);
  }

  /**
   * Returns all items that an item directly references
   */
  public referencesForItem(uuid: UuidString) {
    if (!isString(uuid)) {
      throw Error('Must use uuid string');
    }
    const item = this.findItem(uuid)!;
    const uuids = item.references.map((ref) => ref.uuid);
    return this.findItems(uuids) as SNItem[];
  }

  private setPayloads(
    changed: PurePayload[],
    inserted: PurePayload[],
    discarded: PurePayload[],
    ignored: PurePayload[],
    source?: PayloadSource,
    sourceKey?: string
  ) {
    const changedItems = changed.map((p) => CreateItemFromPayload(p));
    const insertedItems = inserted.map((p) => CreateItemFromPayload(p));
    const ignoredItems = ignored.map((p) => CreateItemFromPayload(p));
    const changedOrInserted = changedItems.concat(insertedItems);
    if (changedOrInserted.length > 0) {
      this.collection.set(changedOrInserted);
    }
    const discardedItems = discarded.map((p) => CreateItemFromPayload(p));
    for (const item of discardedItems) {
      this.collection.discard(item);
    }
    this.notesView.setNeedsRebuilding();
    this.notifyObservers(
      changedItems,
      insertedItems,
      discardedItems,
      ignoredItems,
      source,
      sourceKey
    );
  }

  private notifyObservers(
    changed: SNItem[],
    inserted: SNItem[],
    discarded: SNItem[],
    ignored: SNItem[],
    source?: PayloadSource,
    sourceKey?: string
  ) {
    const filter = (items: SNItem[], types: ContentType[]) => {
      return items.filter((item) => {
        return (
          types.includes(ContentType.Any) || types.includes(item.content_type)
        );
      });
    };
    const observers = this.observers.slice();
    for (const observer of observers) {
      const filteredChanged = filter(changed, observer.contentType);
      const filteredInserted = filter(inserted, observer.contentType);
      const filteredDiscarded = filter(discarded, observer.contentType);
      const filteredIgnored = filter(ignored, observer.contentType);
      if (
        filteredChanged.length === 0 &&
        filteredInserted.length === 0 &&
        filteredDiscarded.length === 0 &&
        filteredIgnored.length === 0
      ) {
        continue;
      }
      observer.callback(
        filteredChanged,
        filteredInserted,
        filteredDiscarded,
        filteredIgnored,
        source,
        sourceKey
      );
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
  async changeItem<M extends ItemMutator = ItemMutator>(
    uuid: UuidString,
    mutate?: (mutator: M) => void,
    mutationType: MutationType = MutationType.UserInteraction,
    payloadSource = PayloadSource.LocalChanged,
    payloadSourceKey?: string
  ): Promise<SNItem | undefined> {
    if (!isString(uuid)) {
      throw Error('Invalid uuid for changeItem');
    }
    const results = await this.changeItems(
      [uuid],
      mutate,
      mutationType,
      payloadSource,
      payloadSourceKey
    );
    return results[0];
  }

  /**
   * @param mutate If not supplied, the intention would simply be to mark the item as dirty.
   */
  public async changeItems<M extends ItemMutator = ItemMutator>(
    uuids: UuidString[],
    mutate?: (mutator: M) => void,
    mutationType: MutationType = MutationType.UserInteraction,
    payloadSource = PayloadSource.LocalChanged,
    payloadSourceKey?: string
  ): Promise<(SNItem | undefined)[]> {
    const items = this.findItems(uuids as UuidString[], true);
    const payloads = [];
    for (const item of items) {
      if (!item) {
        throw Error('Attempting to change non-existant item');
      }
      const mutator = createMutatorForItem(item, mutationType);
      if (mutate) {
        // DISCUSS: There is an implicit relationship between the createMutatorForItem code and the calling code. 
        // The client codes will type "TagMutator", because implicitly this code /should/ return TagMutator,
        // but there is no way to enforce this. This is implicit. We should fix / reverse this relationship.
        // Maybe there is a way to use union type and type guards to fix this.
        mutate(mutator as M); 
      }
      const payload = mutator.getResult();
      payloads.push(payload);
    }
    await this.payloadManager.emitPayloads(
      payloads,
      payloadSource,
      payloadSourceKey
    );
    const results = this.findItems(payloads.map((p) => p.uuid!));
    return results;
  }

  async changeNote(
    uuid: UuidString,
    mutate: (mutator: NoteMutator) => void,
    mutationType: MutationType = MutationType.UserInteraction,
    payloadSource = PayloadSource.LocalChanged,
    payloadSourceKey?: string
  ): Promise<PurePayload[]> {
    const note = this.findItem(uuid);
    if (!note) {
      throw Error('Attempting to change non-existant note');
    }
    const mutator = new NoteMutator(note, mutationType);
    return this.applyTransform(
      mutator,
      mutate,
      payloadSource,
      payloadSourceKey
    );
  }

  async changeTag(
    uuid: UuidString,
    mutate: (mutator: TagMutator) => void,
    mutationType: MutationType = MutationType.UserInteraction,
    payloadSource = PayloadSource.LocalChanged,
    payloadSourceKey?: string
  ): Promise<SNTag> {
    const tag = this.findItem(uuid);
    if (!tag) {
      throw Error('Attempting to change non-existant tag');
    }
    const mutator = new TagMutator(tag, mutationType);
    await this.applyTransform(mutator, mutate, payloadSource, payloadSourceKey);
    return this.findItem(uuid) as SNTag;
  }

  async changeComponent(
    uuid: UuidString,
    mutate: (mutator: ComponentMutator) => void,
    mutationType: MutationType = MutationType.UserInteraction,
    payloadSource = PayloadSource.LocalChanged,
    payloadSourceKey?: string
  ): Promise<SNComponent> {
    const component = this.findItem(uuid);
    if (!component) {
      throw Error('Attempting to change non-existant component');
    }
    const mutator = new ComponentMutator(component, mutationType);
    await this.applyTransform(mutator, mutate, payloadSource, payloadSourceKey);
    return this.findItem(uuid) as SNComponent;
  }

  async changeFeatureRepo(
    uuid: UuidString,
    mutate: (mutator: FeatureRepoMutator) => void,
    mutationType: MutationType = MutationType.UserInteraction,
    payloadSource = PayloadSource.LocalChanged,
    payloadSourceKey?: string
  ): Promise<SNFeatureRepo> {
    const repo = this.findItem(uuid);
    if (!repo) {
      throw Error('Attempting to change non-existant repo');
    }
    const mutator = new FeatureRepoMutator(repo, mutationType);
    await this.applyTransform(mutator, mutate, payloadSource, payloadSourceKey);
    return this.findItem(uuid) as SNFeatureRepo;
  }

  async changeActionsExtension(
    uuid: UuidString,
    mutate: (mutator: ActionsExtensionMutator) => void,
    mutationType: MutationType = MutationType.UserInteraction,
    payloadSource = PayloadSource.LocalChanged,
    payloadSourceKey?: string
  ): Promise<SNActionsExtension> {
    const extension = this.findItem(uuid);
    if (!extension) {
      throw Error('Attempting to change non-existant extension');
    }
    const mutator = new ActionsExtensionMutator(extension, mutationType);
    await this.applyTransform(mutator, mutate, payloadSource, payloadSourceKey);
    return this.findItem(uuid) as SNActionsExtension;
  }

  async changeItemsKey(
    uuid: UuidString,
    mutate: (mutator: ItemsKeyMutator) => void,
    mutationType: MutationType = MutationType.UserInteraction,
    payloadSource = PayloadSource.LocalChanged,
    payloadSourceKey?: string
  ): Promise<SNItemsKey> {
    const itemsKey = this.findItem(uuid);
    if (!itemsKey) {
      throw Error('Attempting to change non-existant itemsKey');
    }
    const mutator = new ItemsKeyMutator(itemsKey, mutationType);
    await this.applyTransform(mutator, mutate, payloadSource, payloadSourceKey);
    return this.findItem(uuid) as SNItemsKey;
  }

  private async applyTransform<T extends ItemMutator>(
    mutator: T,
    mutate: (mutator: T) => void,
    payloadSource = PayloadSource.LocalChanged,
    payloadSourceKey?: string
  ) {
    mutate(mutator);
    const payload = mutator.getResult();
    return this.payloadManager.emitPayload(
      payload,
      payloadSource,
      payloadSourceKey
    );
  }

  /**
   * Sets the item as needing sync. The item is then run through the mapping function,
   * and propagated to mapping observers.
   * @param updateClientDate - Whether to update the item's "user modified date"
   */
  public async setItemDirty(uuid: UuidString, isUserModified = false) {
    if (!isString(uuid)) {
      throw Error('Must use uuid when setting item dirty');
    }
    const result = await this.setItemsDirty([uuid], isUserModified);
    return result[0];
  }

  /**
   * Similar to `setItemDirty`, but acts on an array of items as the first param.
   */
  public async setItemsDirty(uuids: UuidString[], isUserModified = false) {
    if (!isString(uuids[0])) {
      throw Error('Must use uuid when setting item dirty');
    }
    return this.changeItems(
      uuids,
      undefined,
      isUserModified ? MutationType.UserInteraction : MutationType.Internal
    );
  }

  /**
   * Returns an array of items that need to be synced.
   */
  public getDirtyItems(): SNItem[] {
    const dirty = this.collection.dirtyElements();
    return dirty.filter((item) => {
      return item.isSyncable;
    });
  }

  /**
   * Duplicates an item and maps it, thus propagating the item to observers.
   * @param isConflict - Whether to mark the duplicate as a conflict of the original.
   */
  public async duplicateItem<T extends SNItem>(
    uuid: UuidString,
    isConflict = false,
    additionalContent?: Partial<PayloadContent>
  ) {
    const item = this.findItem(uuid)!;
    const payload = CreateMaxPayloadFromAnyObject(item);
    const resultingPayloads = await PayloadsByDuplicating(
      payload,
      this.payloadManager!.getMasterCollection(),
      isConflict,
      additionalContent
    );
    await this.payloadManager!.emitPayloads(
      resultingPayloads,
      PayloadSource.LocalChanged
    );
    const duplicate = this.findItem(resultingPayloads[0].uuid!);
    return duplicate! as T;
  }

  /**
   * Creates an item and conditionally maps it and marks it as dirty.
   * @param needsSync - Whether to mark the item as needing sync
   */
  public async createItem(
    contentType: ContentType,
    content?: PayloadContent,
    needsSync = false,
    override?: PayloadOverride
  ): Promise<SNItem> {
    if (!contentType) {
      throw 'Attempting to create item with no contentType';
    }
    const payload = CreateMaxPayloadFromAnyObject(
      {
        uuid: await Uuid.GenerateUuid(),
        content_type: contentType,
        content: content ? FillItemContent(content) : undefined,
        dirty: needsSync,
      },
      override
    );
    await this.payloadManager!.emitPayload(payload, PayloadSource.Constructor);
    return this.findItem(payload.uuid!)!;
  }

  /**
   * Create an unmanaged item that can later be inserted via `insertItem`
   */
  public async createTemplateItem(
    contentType: ContentType,
    content?: PayloadContent
  ): Promise<SNItem> {
    const payload = CreateMaxPayloadFromAnyObject({
      uuid: await Uuid.GenerateUuid(),
      content_type: contentType,
      content: FillItemContent(content || {}),
    });
    return CreateItemFromPayload(payload);
  }

  /**
   * Inserts the item as-is by reading its payload value. This function will not
   * modify item in any way (such as marking it as dirty). It is up to the caller
   * to pass in a dirtied item if that is their intention.
   */
  public async insertItem(item: SNItem): Promise<SNItem> {
    return this.emitItemFromPayload(item.payload);
  }

  public async insertItems(items: SNItem[]): Promise<SNItem[]> {
    return this.emitItemsFromPayloads(items.map((item) => item.payload));
  }

  public async emitItemFromPayload(
    payload: PurePayload,
    source = PayloadSource.Constructor
  ): Promise<SNItem> {
    await this.payloadManager.emitPayload(payload, source);
    return this.findItem(payload.uuid!)!;
  }

  public async emitItemsFromPayloads(
    payloads: PurePayload[],
    source = PayloadSource.Constructor
  ) {
    await this.payloadManager!.emitPayloads(payloads, source);
    const uuids = Uuids(payloads);
    return this.findItems(uuids);
  }

  /**
   * Marks the item as deleted and needing sync.
   */
  public async setItemToBeDeleted(uuid: UuidString, source?: PayloadSource) {
    /** Capture referencing ids before we delete the item below, otherwise
     * the index may be updated before we get a chance to act on it */
    const referencingIds = this.collection.uuidsThatReferenceUuid(uuid);

    const item = this.findItem(uuid);
    const changedItem = await this.changeItem(
      uuid,
      (mutator) => {
        mutator.setDeleted();
      },
      undefined,
      source
    );

    /** Handle indirect relationships.
     * (Direct relationships are cleared by clearing content above) */
    for (const referencingId of referencingIds) {
      const referencingItem = this.findItem(referencingId);
      if (referencingItem) {
        await this.changeItem(referencingItem.uuid, (mutator) => {
          mutator.removeItemAsRelationship(item!);
        });
      }
    }
    return changedItem;
  }

  /**
   * Like `setItemToBeDeleted`, but acts on an array of items.
   */
  public async setItemsToBeDeleted(
    uuids: UuidString[]
  ): Promise<(SNItem | undefined)[]> {
    return Promise.all(uuids.map((uuid) => this.setItemToBeDeleted(uuid)));
  }

  /**
   * Returns all items of a certain type
   * @param contentType - A string or array of strings representing
   *    content types.
   */
  public getItems(
    contentType: ContentType | ContentType[],
    nonerroredOnly = false
  ): SNItem[] {
    const items = this.collection.all(contentType);
    if (nonerroredOnly) {
      return items.filter(
        (item) => !item.errorDecrypting && !item.waitingForKey
      );
    } else {
      return items;
    }
  }

  /**
   * Returns all items which are properly decrypted
   */
  nonErroredItemsForContentType(contentType: ContentType) {
    const items = this.collection.all(contentType);
    return items.filter((item) => !item.errorDecrypting && !item.waitingForKey);
  }

  /**
   * Returns all items matching a given predicate
   */
  public itemsMatchingPredicate(predicate: SNPredicate) {
    return this.itemsMatchingPredicates([predicate]);
  }

  /**
   * Returns all items matching an array of predicates
   */
  public itemsMatchingPredicates(predicates: SNPredicate[]) {
    return this.subItemsMatchingPredicates(this.items, predicates);
  }

  /**
   * Performs actual predicate filtering for public methods above.
   * Does not return deleted items.
   */
  public subItemsMatchingPredicates(
    items: SNItem[],
    predicates: SNPredicate[]
  ) {
    const results = items.filter((item) => {
      if (item.deleted) {
        return false;
      }
      for (const predicate of predicates) {
        if (!item.satisfiesPredicate(predicate)) {
          return false;
        }
      }
      return true;
    });
    return results;
  }

  /**
   * Finds the first tag matching a given title
   */
  public findTagByTitle(title: string): SNTag | undefined {
    const lowerCaseTitle = title.toLowerCase();
    return this.tags.find((tag) => tag.title.toLowerCase() === lowerCaseTitle);
  }

  /**
   * Finds tags with title or component starting with a search query and (optionally) not associated with a note
   * @param searchQuery - The query string to match
   * @param note - The note whose tags should be omitted from results
   * @returns Array containing tags matching search query and not associated with note
   */
  public searchTags(searchQuery: string, note?: SNNote): SNTag[] {
    const delimiter = '.';
    return naturalSort(
      this.tags.filter((tag) => {
        const regex = new RegExp(
          `^${searchQuery}|${delimiter}${searchQuery}`,
          'i'
        );
        const matchesQuery = regex.test(tag.title);
        const tagInNote = note
          ? this.itemsReferencingItem(note.uuid).some(
              (item) => item?.uuid === tag.uuid
            )
          : false;
        return matchesQuery && !tagInNote;
      }),
      'title'
    );
  }

  // /**
  //  * Returns all parents for a tag
  //  * @param tag - The tag for which parents need to be found
  //  * @returns Array containing all parent tags
  //  */
  // public getTagParentChain(tag: SNTag): SNTag[] {
  //   const delimiter = '.';
  //   const tagComponents = tag.title.split(delimiter);
  //   const parentTagsTitles: string[] = [];

  //   const getImmediateParent = () => {
  //     if (tagComponents.length > 1) {
  //       tagComponents.splice(-1, 1);
  //       const immediateParentTitle = tagComponents.join(delimiter);
  //       parentTagsTitles.push(immediateParentTitle);
  //       getImmediateParent();
  //     }
  //   };

  //   getImmediateParent();
  //   const parentTags = this.tags.filter((tag) =>
  //     parentTagsTitles.some((title) => title === tag.title)
  //   );
  //   return parentTags;
  // }

  // /**
  //  * Returns all descendants for a tag
  //  * @param tag - The tag for which descendants need to be found
  //  * @returns Array containing all descendant tags
  //  */
  // public getTagDescendants(tag: SNTag): SNTag[] {
  //   const delimiter = '.';
  //   return this.tags.filter((t) => {
  //     const regex = new RegExp(
  //       `^${tag.title}${delimiter}|${delimiter}${tag.title}${delimiter}`,
  //       'i'
  //     );
  //     return regex.test(t.title);
  //   });
  // }

  getTagParent(tagUuid: UuidString): SNTag | undefined {
    const tag = this.findItem(tagUuid) as SNTag;
    const parentId = tag.parentId;
    if (parentId) {
      return this.findItem(tag.parentId) as SNTag;
    }
  }

  /**
   * @returns Array of tags where the front of the array represents the top of the tree.
   */
  getTagParentChain(tagUuid: UuidString): SNTag[] {
    const tag = this.findItem(tagUuid) as SNTag;
    let parentId = tag.parentId;
    const chain: SNTag[] = [];
    while (parentId) {
      const parent = this.findItem(parentId) as SNTag;
      chain.unshift(parent);
      parentId = parent.parentId;
    }
    return chain;
  }

  getTagChildren(tagUuid: UuidString): SNTag[] {
    const tag = this.findItem(tagUuid) as SNTag;
    return this.collection.elementsReferencingElement(tag) as SNTag[];
  }

  /**
   * @returns The changed child tag
   */
  public setTagRelationship(
    parentTag: SNTag,
    childTag: SNTag
  ): Promise<SNTag> {
    return this.changeTag(childTag.uuid, (m) => {
      m.makeChildOf(parentTag);
    });
  }

  /**
   * @returns The changed child tag
   */
  public unsetTagRelationship(
    parentTag: SNTag,
    childTag: SNTag
  ): Promise<SNTag> {
    return this.changeTag(childTag.uuid, (m) => {
      m.removeItemAsRelationship(parentTag)
    });
  }

  public async addTagToNote(note: SNNote, tag: SNTag): Promise<SNTag> {
    return this.changeItem(tag.uuid, (mutator) => {
      mutator.addItemAsRelationship(note);
    }) as Promise<SNTag>;
  }

  /**
   * Get tags for a note sorted in natural order
   * @param note - The note whose tags will be returned
   * @returns Array containing tags associated with a note
   */
  public getSortedTagsForNote(note: SNNote): SNTag[] {
    return naturalSort(
      this.itemsReferencingItem(note.uuid).filter((ref) => {
        return ref?.content_type === ContentType.Tag;
      }) as SNTag[],
      'title'
    );
  }

  /**
   * Finds or creates a tag with a given title
   */
  public async findOrCreateTagByTitle(title: string) {
    const tag = this.findTagByTitle(title);
    return (
      tag ||
      ((await this.createItem(
        ContentType.Tag,
        FillItemContent({ title }),
        true
      )) as SNTag)
    );
  }

  /**
   * Returns all notes matching the smart tag
   */
  public notesMatchingSmartTag(smartTag: SNSmartTag) {
    return this.notesView.notesMatchingSmartTag(smartTag);
  }

  /**
   * Returns the smart tag corresponding to the "Trash" tag.
   */
  public get trashSmartTag() {
    return this.systemSmartTags.find((tag) => tag.isTrashTag)!;
  }

  /**
   * Returns all items currently in the trash
   */
  public get trashedItems() {
    return this.notesMatchingSmartTag(this.trashSmartTag);
  }

  /**
   * Permanently deletes any items currently in the trash. Consumer must manually call sync.
   */
  public async emptyTrash() {
    const notes = this.trashedItems;
    return this.setItemsToBeDeleted(Uuids(notes));
  }

  /**
   * Returns all smart tags, sorted by title.
   */
  public getSmartTags() {
    const userTags = this.collection.displayElements(
      ContentType.SmartTag
    ) as SNSmartTag[];
    return this.systemSmartTags.concat(userTags);
  }

  /**
   * The number of notes currently managed
   */
  public get noteCount() {
    return this.collection.all(ContentType.Note).length;
  }

  /**
   * Immediately removes all items from mapping state and notifies observers
   * Used primarily when signing into an account and wanting to discard any current
   * local data.
   */
  public async removeAllItemsFromMemory() {
    const uuids = Uuids(this.items);
    /** We don't want to set as dirty, since we want to dispose of immediately. */
    await this.changeItems(
      uuids,
      (mutator) => {
        mutator.setDeleted();
      },
      MutationType.NonDirtying
    );
    this.resetState();
    this.payloadManager!.resetState();
  }

  public removeItemLocally(item: SNItem) {
    this.collection.discard(item);
    this.payloadManager!.removePayloadLocally(item.payload);
  }
}

const SYSTEM_TAG_ALL_NOTES = 'all-notes';
const SYSTEM_TAG_ARCHIVED_NOTES = 'archived-notes';
const SYSTEM_TAG_TRASHED_NOTES = 'trashed-notes';

function BuildSmartTags() {
  const allNotes = CreateMaxPayloadFromAnyObject({
    uuid: SYSTEM_TAG_ALL_NOTES,
    content_type: ContentType.SmartTag,
    content: FillItemContent({
      title: 'All notes',
      isSystemTag: true,
      isAllTag: true,
    }),
  });
  const archived = CreateMaxPayloadFromAnyObject({
    uuid: SYSTEM_TAG_ARCHIVED_NOTES,
    content_type: ContentType.SmartTag,
    content: FillItemContent({
      title: 'Archived',
      isSystemTag: true,
      isArchiveTag: true,
    }),
  });
  const trash = CreateMaxPayloadFromAnyObject({
    uuid: SYSTEM_TAG_TRASHED_NOTES,
    content_type: ContentType.SmartTag,
    content: FillItemContent({
      title: 'Trash',
      isSystemTag: true,
      isTrashTag: true,
    }),
  });
  return [
    CreateItemFromPayload(allNotes) as SNSmartTag,
    CreateItemFromPayload(archived) as SNSmartTag,
    CreateItemFromPayload(trash) as SNSmartTag,
  ];
}
