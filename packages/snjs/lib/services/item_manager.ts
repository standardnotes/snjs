import { createMutatorForItem } from '@Lib/models/mutator';
import {
  PredicateInterface,
  ItemDelta,
  FillItemContent,
  CollectionSort,
  ItemCollection,
  CollectionSortDirection,
  CreateMaxPayloadFromAnyObject,
  PayloadContent,
  PayloadOverride,
  PurePayload,
  PayloadSource,
  ItemInterface,
  predicateFromDSLString,
} from '@standardnotes/payloads';
import { ItemCollectionNotesView } from '@Lib/protocol/collection/item_collection_notes_view';
import { NotesDisplayCriteria } from '@Lib/protocol/collection/notes_display_criteria';
import {
  isString,
  naturalSort,
  removeFromArray,
  UuidGenerator,
} from '@standardnotes/utils';
import { SNComponent } from '@Models/app/component';
import { SNItemsKey } from '@Models/app/items_key';
import { isTag, SNTag, TagFolderDelimitter } from '@Models/app/tag';
import { Uuids } from '@Models/functions';
import { CreateItemFromPayload } from '@Models/generator';
import { PayloadsByDuplicating } from '@Payloads/functions';
import { ContentType } from '@standardnotes/common';
import { ComponentMutator } from './../models/app/component';
import {
  ActionsExtensionMutator,
  SNActionsExtension,
} from './../models/app/extension';
import {
  FeatureRepoMutator,
  SNFeatureRepo,
} from './../models/app/feature_repo';
import { ItemsKeyMutator } from './../models/app/items_key';
import { NoteMutator, SNNote } from './../models/app/note';
import {
  SMART_TAG_DSL_PREFIX,
  SmartView,
  SystemViewId,
} from './../models/app/smartTag';
import { TagMutator } from './../models/app/tag';
import { ItemMutator, MutationType, SNItem } from './../models/core/item';
import {
  TagNoteCountChangeObserver,
  TagNotesIndex,
} from './../protocol/collection/tag_notes_index';
import { UuidString } from './../types';
import { PayloadManager } from './payload_manager';
import { AbstractService } from '@standardnotes/services';
import { BuildSmartViews } from '@Lib/protocol/collection/smart_view_builder';

type ObserverCallback = (
  /** The items are pre-existing but have been changed */
  changed: SNItem[],
  /** The items have been newly inserted */
  inserted: SNItem[],
  /** The items have been deleted from local state (and remote state if applicable) */
  discarded: SNItem[],
  /** Items for which encrypted overwrite protection is enabled and enacted */
  ignored: SNItem[],
  source: PayloadSource,
  sourceKey?: string
) => void;

type Observer = {
  contentType: ContentType[];
  callback: ObserverCallback;
};

export type TransactionalMutation = {
  itemUuid: UuidString;
  mutate: (mutator: ItemMutator) => void;
  mutationType?: MutationType;
};

export const isTagOrNote = (x: SNItem): x is SNNote | SNTag =>
  x.content_type === ContentType.Note || x.content_type === ContentType.Tag;

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
export class ItemManager extends AbstractService {
  private unsubChangeObserver: () => void;
  private observers: Observer[] = [];
  private collection!: ItemCollection;
  private notesView!: ItemCollectionNotesView;
  private systemSmartViews: SmartView[];
  private tagNotesIndex!: TagNotesIndex;

  constructor(private payloadManager: PayloadManager) {
    super();
    this.payloadManager = payloadManager;
    this.systemSmartViews = this.rebuildSystemSmartViews(
      NotesDisplayCriteria.Create({})
    );
    this.createCollection();
    this.unsubChangeObserver = this.payloadManager.addObserver(
      ContentType.Any,
      this.setPayloads.bind(this)
    );
  }

  private rebuildSystemSmartViews(criteria: NotesDisplayCriteria): SmartView[] {
    this.systemSmartViews = BuildSmartViews(criteria);
    return this.systemSmartViews;
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
      ContentType.SmartView,
      CollectionSort.Title,
      'dsc'
    );
    this.notesView = new ItemCollectionNotesView(this.collection);
    this.tagNotesIndex = new TagNotesIndex(
      this.collection,
      this.tagNotesIndex?.observers
    );
  }

  public setDisplayOptions(
    contentType: ContentType,
    sortBy?: CollectionSort,
    direction?: CollectionSortDirection,
    filter?: (element: any) => boolean
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
    this.rebuildSystemSmartViews(criteria);
    const updatedCriteria = NotesDisplayCriteria.Copy(criteria, {
      views: criteria.views.map((tag) => {
        const matchingSystemTag = this.systemSmartViews.find(
          (view) => view.uuid === tag.uuid
        );
        return matchingSystemTag || tag;
      }),
    });
    this.notesView.setCriteria(updatedCriteria);
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
    const itemFromCollection = this.collection.find(uuid);

    if (itemFromCollection) {
      return itemFromCollection as T;
    }

    const itemFromSmartViews = this.systemSmartViews.find(
      (tag) => tag.uuid === uuid
    );

    if (itemFromSmartViews) {
      return (itemFromSmartViews as unknown) as T;
    }

    return undefined;
  }

  /**
   * Returns all items matching given ids
   * @param includeBlanks If true and an item is not found, an `undefined` element
   * will be inserted into the array.
   */
  findItems(uuids: UuidString[], includeBlanks = false): SNItem[] {
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
  get components(): SNComponent[] {
    const components = this.collection.displayElements(
      ContentType.Component
    ) as SNComponent[];
    const themes = this.collection.displayElements(
      ContentType.Theme
    ) as SNComponent[];
    return components.concat(themes);
  }

  public addNoteCountChangeObserver(
    observer: TagNoteCountChangeObserver
  ): () => void {
    return this.tagNotesIndex.addCountChangeObserver(observer);
  }

  public allCountableNotesCount(): number {
    return this.tagNotesIndex.allCountableNotesCount();
  }

  public countableNotesForTag(tag: SNTag | SmartView): number {
    if (tag instanceof SmartView) {
      if (tag.uuid === SystemViewId.AllNotes) {
        return this.tagNotesIndex.allCountableNotesCount();
      }

      throw Error(
        'countableNotesForTag is not meant to be used for smart tags.'
      );
    }
    return this.tagNotesIndex.countableNotesForTag(tag);
  }

  public addObserver(
    contentType: ContentType | ContentType[],
    callback: ObserverCallback
  ): () => void {
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
    source: PayloadSource,
    sourceKey?: string
  ) {
    const createItems = (items: PurePayload[]) =>
      items.map((item) => CreateItemFromPayload(item));

    const delta: ItemDelta = {
      changed: createItems(changed),
      inserted: createItems(inserted),
      discarded: createItems(discarded),
      ignored: createItems(ignored),
    };

    this.collection.onChange(delta);
    this.notesView.onChange(delta);
    this.tagNotesIndex.onChange(delta);

    this.notifyObservers(
      delta.changed,
      delta.inserted,
      delta.discarded,
      delta.ignored,
      source,
      sourceKey
    );
  }

  private notifyObservers(
    changed: SNItem[],
    inserted: SNItem[],
    discarded: SNItem[],
    ignored: SNItem[],
    source: PayloadSource,
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

  /**
   * Run unique mutations per each item in the array, then only propagate all changes
   * once all mutations have been run. This differs from `changeItems` in that changeItems
   * runs the same mutation on all items.
   */
  public async runTransactionalMutations(
    transactions: TransactionalMutation[],
    payloadSource = PayloadSource.LocalChanged,
    payloadSourceKey?: string
  ): Promise<(SNItem | undefined)[]> {
    const payloads: PurePayload[] = [];
    for (const transaction of transactions) {
      const item = this.findItem(transaction.itemUuid);
      if (!item) {
        continue;
      }
      const mutator = createMutatorForItem(
        item,
        transaction.mutationType || MutationType.UserInteraction
      );
      transaction.mutate(mutator);
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

  public async runTransactionalMutation(
    transaction: TransactionalMutation,
    payloadSource = PayloadSource.LocalChanged,
    payloadSourceKey?: string
  ): Promise<SNItem | undefined> {
    const item = this.findItem(transaction.itemUuid);
    const mutator = createMutatorForItem(
      item!,
      transaction.mutationType || MutationType.UserInteraction
    );
    transaction.mutate(mutator);
    const payload = mutator.getResult();

    await this.payloadManager.emitPayloads(
      [payload],
      payloadSource,
      payloadSourceKey
    );
    const result = this.findItem(payload.uuid);
    return result;
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
    return this.findItem<SNComponent>(uuid)!;
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
      this.payloadManager.getMasterCollection(),
      isConflict,
      additionalContent
    );
    await this.payloadManager.emitPayloads(
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
  public async createItem<T extends SNItem>(
    contentType: ContentType,
    content?: PayloadContent,
    needsSync = false,
    override?: PayloadOverride
  ): Promise<T> {
    if (!contentType) {
      throw 'Attempting to create item with no contentType';
    }
    const payload = CreateMaxPayloadFromAnyObject(
      {
        uuid: await UuidGenerator.GenerateUuid(),
        content_type: contentType,
        content: content ? FillItemContent(content) : undefined,
        dirty: needsSync,
      },
      override
    );
    await this.payloadManager.emitPayload(payload, PayloadSource.Constructor);
    return this.findItem(payload.uuid!) as T;
  }

  /**
   * Create an unmanaged item that can later be inserted via `insertItem`
   */
  public async createTemplateItem(
    contentType: ContentType,
    content?: PayloadContent
  ): Promise<SNItem> {
    const payload = CreateMaxPayloadFromAnyObject({
      uuid: await UuidGenerator.GenerateUuid(),
      content_type: contentType,
      content: FillItemContent(content || {}),
    });
    return CreateItemFromPayload(payload);
  }

  /**
   * @param item item to be checked
   * @returns Whether the item is a template (unmanaged)
   */
  public isTemplateItem(item: SNItem): boolean {
    return !this.findItem(item.uuid);
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
    return this.findItem(payload.uuid) as SNItem;
  }

  public async emitItemsFromPayloads(
    payloads: PurePayload[],
    source = PayloadSource.Constructor
  ): Promise<SNItem[]> {
    await this.payloadManager.emitPayloads(payloads, source);
    const uuids = Uuids(payloads);
    return this.findItems(uuids);
  }

  /**
   * Marks the item as deleted and needing sync.
   */
  public async setItemToBeDeleted(
    uuid: UuidString,
    source?: PayloadSource
  ): Promise<SNItem | undefined> {
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
  public getItems<T extends SNItem>(
    contentType: ContentType | ContentType[],
    nonerroredOnly = false
  ): T[] {
    const items = this.collection.all(contentType);
    if (nonerroredOnly) {
      return items.filter(
        (item) => !item.errorDecrypting && !item.waitingForKey
      ) as T[];
    } else {
      return items as T[];
    }
  }

  /**
   * Returns all items which are properly decrypted
   */
  nonErroredItemsForContentType<T extends SNItem>(
    contentType: ContentType
  ): T[] {
    const items = this.collection.all(contentType);
    return items.filter(
      (item) => !item.errorDecrypting && !item.waitingForKey
    ) as T[];
  }

  /**
   * Returns all items matching a given predicate
   */
  public itemsMatchingPredicate<T extends SNItem>(
    contentType: ContentType,
    predicate: PredicateInterface<T>
  ): SNItem[] {
    return this.itemsMatchingPredicates(contentType, [predicate]);
  }

  /**
   * Returns all items matching an array of predicates
   */
  public itemsMatchingPredicates<T extends SNItem>(
    contentType: ContentType,
    predicates: PredicateInterface<T>[]
  ): SNItem[] {
    const subItems = this.getItems<T>(contentType);
    return this.subItemsMatchingPredicates(subItems, predicates);
  }

  /**
   * Performs actual predicate filtering for public methods above.
   * Does not return deleted items.
   */
  public subItemsMatchingPredicates<T extends SNItem>(
    items: T[],
    predicates: PredicateInterface<T>[]
  ): T[] {
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

  public getRootTags(): SNTag[] {
    return this.tags.filter((tag) => tag.parentId === undefined);
  }

  /**
   * Finds the first tag matching a given title
   */
  public findTagByTitle(title: string): SNTag | undefined {
    const lowerCaseTitle = title.toLowerCase();
    return this.tags.find((tag) => tag.title?.toLowerCase() === lowerCaseTitle);
  }

  public findTagByTitleAndParent(
    title: string,
    parentUuid: UuidString | undefined
  ): SNTag | undefined {
    const lowerCaseTitle = title.toLowerCase();

    const tags = parentUuid
      ? this.getTagChildren(parentUuid)
      : this.getRootTags();

    return tags.find((tag) => tag.title?.toLowerCase() === lowerCaseTitle);
  }

  /**
   * Finds tags with title or component starting with a search query and (optionally) not associated with a note
   * @param searchQuery - The query string to match
   * @param note - The note whose tags should be omitted from results
   * @returns Array containing tags matching search query and not associated with note
   */
  public searchTags(searchQuery: string, note?: SNNote): SNTag[] {
    return naturalSort(
      this.tags.filter((tag) => {
        const regex = new RegExp(
          `^${searchQuery}|${TagFolderDelimitter}${searchQuery}`,
          'i'
        );
        const expandedTitle = this.getTagLongTitle(tag);
        const matchesQuery = regex.test(expandedTitle);
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

  getTagParent(tagUuid: UuidString): SNTag | undefined {
    const tag = this.findItem(tagUuid) as SNTag;
    const parentId = tag.parentId;
    if (parentId) {
      return this.findItem(parentId) as SNTag;
    }
  }

  public getTagPrefixTitle(tag: SNTag): string | undefined {
    const hierarchy = this.getTagParentChain(tag.uuid);

    if (hierarchy.length === 0) {
      return undefined;
    }

    const prefixTitle = hierarchy.map((tag) => tag.title).join('/');
    return `${prefixTitle}/`;
  }

  public getTagLongTitle(tag: SNTag): string {
    const hierarchy = this.getTagParentChain(tag.uuid);
    const tags = [...hierarchy, tag];
    const longTitle = tags.map((tag) => tag.title).join('/');
    return longTitle;
  }

  /**
   * @returns Array of tags where the front of the array represents the top of the tree.
   */
  getTagParentChain(tagUuid: UuidString): SNTag[] {
    const tag = this.findItem<SNTag>(tagUuid);
    if (!tag) {
      return [];
    }

    let parentId = tag.parentId;
    const chain: SNTag[] = [];

    while (parentId) {
      const parent = this.findItem<SNTag>(parentId);
      if (!parent) {
        return chain;
      }
      chain.unshift(parent);
      parentId = parent.parentId;
    }

    return chain;
  }

  public async findOrCreateTagParentChain(
    titlesHierarchy: string[]
  ): Promise<SNTag> {
    let current: SNTag | undefined = undefined;

    for (const title of titlesHierarchy) {
      const currentUuid: string | undefined = current
        ? current.uuid
        : undefined;

      current = await this.findOrCreateTagByTitle(title, currentUuid);
    }

    if (!current) {
      throw new Error('Invalid tag hierarchy');
    }

    return current;
  }

  public getTagChildren(tagUuid: UuidString): SNTag[] {
    const tag = this.findItem(tagUuid) as SNTag;
    const tags = this.collection.elementsReferencingElement(
      tag,
      ContentType.Tag
    ) as SNTag[];

    return tags.filter((tag) => tag.parentId === tagUuid);
  }

  public isTagAncestor(tagUuid: UuidString, childUuid: UuidString): boolean {
    const tag = this.findItem(childUuid) as SNTag;
    let parentId = tag.parentId;

    while (parentId) {
      if (parentId === tagUuid) {
        return true;
      }

      const parent = this.findItem(parentId) as SNTag;
      parentId = parent.parentId;
    }

    return false;
  }

  public isValidTagParent(
    parentTagUuid: UuidString,
    childTagUuid: UuidString
  ): boolean {
    if (parentTagUuid === childTagUuid) {
      return false;
    }

    if (this.isTagAncestor(childTagUuid, parentTagUuid)) {
      return false;
    }

    return true;
  }

  /**
   * @returns The changed child tag
   */
  public setTagParent(parentTag: SNTag, childTag: SNTag): Promise<SNTag> {
    if (parentTag.uuid === childTag.uuid) {
      throw new Error('Can not set a tag parent of itself');
    }

    if (this.isTagAncestor(childTag.uuid, parentTag.uuid)) {
      throw new Error('Can not set a tag ancestor of itself');
    }

    return this.changeTag(childTag.uuid, (m) => {
      m.makeChildOf(parentTag);
    });
  }

  /**
   * @returns The changed child tag
   */
  public unsetTagParent(childTag: SNTag): Promise<SNTag> {
    const parentTag = this.getTagParent(childTag.uuid);

    if (!parentTag) {
      return Promise.resolve(childTag);
    }

    return this.changeTag(childTag.uuid, (m) => {
      m.unsetParent();
    });
  }

  public async addTagToNote(note: SNNote, tag: SNTag): Promise<SNTag> {
    return this.changeItem(tag.uuid, (mutator) => {
      mutator.addItemAsRelationship(note);
    }) as Promise<SNTag>;
  }

  public async addTagHierarchyToNote(
    note: SNNote,
    tag: SNTag
  ): Promise<SNTag[]> {
    const parentChainTags = this.getTagParentChain(tag.uuid);
    const tagsToAdd = [...parentChainTags, tag];
    return Promise.all(
      tagsToAdd.map((tagToAdd) => this.addTagToNote(note, tagToAdd))
    );
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

  public async createTag(
    title: string,
    parentUuid?: UuidString
  ): Promise<SNTag> {
    const newTag = (await this.createItem(
      ContentType.Tag,
      FillItemContent({ title }),
      true
    )) as SNTag;

    if (parentUuid) {
      const parentTag = this.findItem(parentUuid);
      if (!parentTag || !isTag(parentTag)) {
        throw new Error('Invalid parent tag');
      }
      return this.changeTag(newTag.uuid, (m) => {
        m.makeChildOf(parentTag);
      });
    }

    return newTag;
  }

  public async createSmartView<T extends ItemInterface>(
    title: string,
    predicate: PredicateInterface<T>
  ): Promise<SmartView> {
    return this.createItem(
      ContentType.SmartView,
      FillItemContent({ title, predicate }),
      true
    ) as Promise<SmartView>;
  }

  public async createSmartViewFromDSL<T extends ItemInterface>(
    dsl: string
  ): Promise<SmartView> {
    let components = null;
    try {
      components = JSON.parse(dsl.substring(1, dsl.length));
    } catch (e) {
      throw Error('Invalid smart tag syntax');
    }

    const title = components[0];
    const predicate = predicateFromDSLString<T>(dsl);
    return this.createSmartView(title, predicate);
  }

  public async createTagOrSmartView(title: string): Promise<SNTag | SmartView> {
    if (this.isSmartViewTitle(title)) {
      return this.createSmartViewFromDSL(title);
    } else {
      return this.createTag(title);
    }
  }

  public isSmartViewTitle(title: string): boolean {
    return title.startsWith(SMART_TAG_DSL_PREFIX);
  }

  /**
   * Finds or creates a tag with a given title
   */
  public async findOrCreateTagByTitle(
    title: string,
    parentUuid?: UuidString
  ): Promise<SNTag> {
    const tag = this.findTagByTitleAndParent(title, parentUuid);
    return tag || this.createTag(title, parentUuid);
  }

  public notesMatchingSmartView(view: SmartView): SNNote[] {
    return this.notesView.notesMatchingSmartView(view);
  }

  public get trashSmartView(): SmartView {
    return this.systemSmartViews.find(
      (tag) => tag.uuid === SystemViewId.TrashedNotes
    ) as SmartView;
  }

  public get trashedItems(): SNNote[] {
    return this.notesMatchingSmartView(this.trashSmartView);
  }

  /**
   * Permanently deletes any items currently in the trash. Consumer must manually call sync.
   */
  public async emptyTrash(): Promise<void> {
    const notes = this.trashedItems;
    await this.setItemsToBeDeleted(Uuids(notes));
  }

  /**
   * Returns all smart tags, sorted by title.
   */
  public getSmartViews(): SmartView[] {
    const userTags = this.collection.displayElements(
      ContentType.SmartView
    ) as SmartView[];
    return this.systemSmartViews.concat(userTags);
  }

  /**
   * The number of notes currently managed
   */
  public get noteCount(): number {
    return this.collection.all(ContentType.Note).length;
  }

  /**
   * Immediately removes all items from mapping state and notifies observers
   * Used primarily when signing into an account and wanting to discard any current
   * local data.
   */
  public async removeAllItemsFromMemory(): Promise<void> {
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
    this.payloadManager.resetState();
  }

  public removeItemLocally(item: SNItem): void {
    this.collection.discard(item);
    this.payloadManager.removePayloadLocally(item.payload);
  }
}
