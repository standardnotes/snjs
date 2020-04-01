import { PayloadOverride } from '@Payloads/generator';
import { PurePayload } from '@Payloads/pure_payload';
import { SNComponent } from '@Models/app/component';
import { SNTag } from '@Models/app/tag';
import { SNNote } from './../models/app/note';
import { SNItemsKey } from '@Models/app/items_key';
import { SNItem } from '@Models/core/item';
import { PayloadContent } from '@Payloads/generator';
import remove from 'lodash/remove';
import pull from 'lodash/pull';
import { findInArray, isNullOrUndefined } from '@Lib/utils';
import {
  ContentTypes,
  CreateItemFromPayload,
  SNPredicate,
  SNSmartTag
} from '@Models/index';
import { PureService } from '@Lib/services/pure_service';
import {
  PayloadSources,
  PayloadsByDuplicating,
  CreateMaxPayloadFromAnyObject,
  PayloadCollection,
  DeltaFileImport,
  PayloadFields
} from '@Payloads/index';
import { Uuid } from '@Lib/uuid';
import { BuildItemContent } from '../models/generator';

type CreationCallback = (
  items: SNItem[],
  source: PayloadSources,
  sourceKey?: string
) => Promise<void>

type CreationObserver = {
  callback: CreationCallback
}

type MappingCallback = (
  allItems: SNItem[],
  validItems?: SNItem[],
  deletedItems?: SNItem[],
  source?: PayloadSources,
  sourceKey?: string
) => Promise<void>

type MappingObserver = {
  types: ContentTypes | ContentTypes[]
  priority: number
  callback: MappingCallback
}

/**
 * The model manager is responsible for keeping state regarding what items exist in the
 * global application state. It does so by exposing functions that allow consumers to 'map'
 * a detached payload into global application state. Whenever a change is made or retrieved
 * from any source, it must be mapped in order to be properly reflected in global application state.
 * The model manager deals only with in-memory state, and does not deal directly with storage.
 * It also serves as a query store, and can be queried for current notes, tags, etc.
 * It exposes methods that allow consumers to listen to mapping events. This is how
 * applications 'stream' items to display in the interface.
 */
export class SNModelManager extends PureService {

  private mappingObservers: MappingObserver[] = []
  private creationObservers: CreationObserver[] = []
  private items: SNItem[] = []
  public itemsKeys: SNItemsKey[] = []
  public notes: SNNote[] = []
  public tags: SNTag[] = []
  public components: SNComponent[] = []
  private itemsHash: Record<string, SNItem> = {}
  private resolveQueue: Record<string, SNItem[]> = {}
  private systemSmartTags: SNSmartTag[]
  public masterCollection: PayloadCollection

  constructor() {
    super();
    this.masterCollection = new PayloadCollection();
    this.systemSmartTags = SNSmartTag.systemSmartTags();
  }

  /**
   * Our payload collection keeps the latest mapped payload for every payload
   * that passes through our mapping function. Use this to query current state
   * as needed to make decisions, like about duplication or uuid alteration.
   */
  public getMasterCollection() {
    return this.masterCollection;
  }

  public deinit() {
    super.deinit();
    this.creationObservers.length = 0;
    this.mappingObservers.length = 0;
    this.resetState();
  }

  private resetState() {
    this.items.length = 0;
    this.itemsKeys.length = 0;
    this.notes.length = 0;
    this.tags.length = 0;
    this.components.length = 0;
    this.itemsHash = {};
    this.resolveQueue = {};
    this.masterCollection = new PayloadCollection();
  }

  /**
   * Consumers wanting to modify an item should run it through this block,
   * so that data is properly mapped through our function, and latest state
   * is properly reconciled.
   * The alternative to calling this function is to modify an item directly, then
   * to call one of the mapping functions to propagate the new values.
   * @param properties - Key/value object of new values to set
   */
  public async setItemsProperties(items: SNItem[], properties: Partial<Record<PayloadFields, any>>) {
    const keys = Object.keys(properties) as PayloadFields[];
    for (const item of items) {
      for (const key of keys) {
        (item as any)[key] = properties[key];
      }
    }
    await this.mapItems(items, PayloadSources.LocalChanged);
  }

  /**
   * Modifies an item and marks it as dirty
   * @param {object} item
   * @param {function} modifier - An async function that modifies item internals
   */
  public async modifyItem(item: SNItem, modifier: () => Promise<void>) {
    return this.modifyItems([item], modifier);
  }

  /**
  * Modifies multiple items and marks them as dirty
  * @param modifier - An async function that modifies items internals
  */
  public async modifyItems(items: SNItem[], modifier: () => Promise<void>) {
    await modifier();
    await this.setItemsDirty(items, true);
  }

  /**
   * One of many mapping helpers available.
   * This function maps a collection of payloads.
   */
  public async mapCollectionToLocalItems(collection: PayloadCollection, sourceKey?: string) {
    return this.mapPayloadsToLocalItems(
      collection.getAllPayloads(),
      collection.source!,
      sourceKey
    );
  }

  /**
   * One of many mapping helpers available.
   * This function maps an item object to propagate its values.
   */
  public async mapItem(item: SNItem, source: PayloadSources, sourceKey?: string) {
    const items = await this.mapItems(
      [item],
      source,
      sourceKey
    );
    return items[0];
  }

  /**
   * One of many mapping helpers available.
   * This function maps an array of items
   */
  public async mapItems(items: SNItem[], source: PayloadSources, sourceKey?: string) {
    /** 
     * Insert the items first. This way, if one of the input items is a template item,
     * unmanaged item, and we run it through the mapper, we don't want the mapper to create
     * a new object reference, but instead use the one supplied to this function.
     */
    this.insertItems(items);
    const payloads = items.map((item) => item.payloadRepresentation());
    return this.mapPayloadsToLocalItems(
      payloads,
      source,
      sourceKey
    );
  }

  /**
   * One of many mapping helpers available.
   * This function maps a payload to an item
   * @returns The mapped item
   */
  public async mapPayloadToLocalItem(payload: PurePayload, source: PayloadSources) {
    const items = await this.mapPayloadsToLocalItems(
      [payload],
      source
    );
    return items[0];
  }

  /**
   * This function maps multiple payloads to items, and is the authoratative mapping
   * function that all other mapping helpers rely on
   */
  public async mapPayloadsToLocalItems(
    payloads: PurePayload[],
    source: PayloadSources,
    sourceKey?: string
  ) {
    if (!payloads) {
      throw Error('Payloads cannot be null');
    }
    if (isNullOrUndefined(source)) {
      throw Error('Payload source cannot be null');
    }
    const itemsToNotifyObserversOf = [];
    const newItems = [];
    type ProcessedElement = {
      item: SNItem
      payload: PurePayload
    }
    const processed: Record<string, ProcessedElement> = {};
    /** First loop should process payloads and add items only; no relationship handling. */
    for (const payload of payloads) {
      if (!payload) {
        console.error('Payload is null');
        continue;
      }
      if (!payload.uuid || !payload.content_type) {
        console.error('Payload is corrupt:', payload);
        continue;
      }
      let item = this.findItem(payload.uuid);
      let isDirtyDeleted = false;
      if (payload.deleted === true) {
        if (payload.dirty) {
          /**
           * Item was marked as deleted but not yet synced (in offline scenario).
           * Create this item as usual, but do not add it to individual arrays,
           * and remove from individual arrays if neccesary. i.e add to this.items
           * but not this.notes (so that it can be retrieved with getDirtyItems)
           */
          isDirtyDeleted = true;
          if (item) {
            this.removeItemFromRespectiveArray(item);
            item.updateLocalRelationships();
          }
        } else {
          if (item) {
            await this.removeItemLocally(item);
          } else {
            /** Item doesn't exist locally, don't create it. */
            continue;
          }
        }
      }
      if (item) {
        item.updateFromPayload(payload);
      } else {
        item = CreateItemFromPayload(payload);
        this.insertItems([item], isDirtyDeleted);
        newItems.push(item);
      }
      itemsToNotifyObserversOf.push(item);
      processed[item.uuid] = {
        item: item,
        payload: payload
      };
    }
    /** Second loop should process references */
    const allPayloads = [];
    const allItems = [];
    for (const uuid of Object.keys(processed)) {
      const { item, payload } = processed[uuid];
      allPayloads.push(payload);
      allItems.push(item);
      if (payload.content) {
        await this.resolveReferencesForItem(item);
      }
      const interestedItems = this.popItemsInterestedInMissingItem(item);
      for (const interestedItem of interestedItems) {
        interestedItem.addItemAsRelationship(item);
      }
      item.didCompleteMapping(source);
    }
    const newCollection = new PayloadCollection(
      allItems.map((item) => item.payloadRepresentation()),
      source
    );
    this.masterCollection = this.masterCollection.concat(newCollection);
    if (newItems.length > 0) {
      await this.notifyCreationObservers(newItems, source, sourceKey);
    }
    await this.notifyMappingObservers(itemsToNotifyObserversOf, source, sourceKey);
    return allItems;
  }

  /** 
   * Inserts an item to be managed by model manager state, but does not map the item.
   * Access to this function should be restricted to use by consumers that explicitely
   * know what this function is used for.
   */
  public insertItem(item: SNItem) {
    this.insertItems([item]);
  }

  /** 
   * Similiar to `insertItem` but for many items.
   */
  public insertItems(items: SNItem[], globalOnly?: boolean) {
    for (const item of items) {
      if (this.itemsHash[item.uuid]) {
        continue;
      }
      this.itemsHash[item.uuid] = item;
      this.items.push(item);
      /**
       * In some cases, you just want to add the item to this.items, and not to
       * the individual arrays This applies when you want to keep an item
       * syncable, but not display it via the individual arrays
       */
      if (globalOnly) {
        continue;
      }
      if (item.content_type === ContentTypes.ItemsKey) {
        this.itemsKeys.unshift(item as SNItemsKey);
      }
      else if (item.content_type === ContentTypes.Tag) {
        this.tags.unshift(item as SNTag);
      }
      else if (item.content_type === ContentTypes.Note) {
        this.notes.unshift(item as SNNote);
      }
      else if (item.content_type === ContentTypes.Component) {
        this.components.unshift(item as SNComponent);
      }
    }
  }

  /**
   * Adds items to model management.
   * @deprecated Use `insertItem` instead.
   */
  async addItem(item: SNItem) {
    return this.addItems([item]);
  }

  /**
   * @deprecated Use `insertItems` instead.
   */
  async addItems(items: SNItem[]) {
    console.warn('ModelManager.addItems is depracated. Use mapPayloadsToLocalItems instead.');
    const payloads = items.map((item) => CreateMaxPayloadFromAnyObject(item));
    return this.mapPayloadsToLocalItems(payloads, PayloadSources.LocalChanged);
  }

  private resolveRelationshipWhenItemAvailable(interestedItem: SNItem, missingItemId: string) {
    const interestedItems = this.resolveQueue[missingItemId] || [];
    interestedItems.push(interestedItem);
    this.resolveQueue[missingItemId] = interestedItems;
  }

  private popItemsInterestedInMissingItem(item: SNItem) {
    const interestedItems = this.resolveQueue[item.uuid];
    delete this.resolveQueue[item.uuid];
    return interestedItems || [];
  }

  public async resolveReferencesForItem(item: SNItem, markReferencesDirty = false) {
    if (item.errorDecrypting) {
      return;
    }
    const content = item.content;
    /**
     * If another client removes an item's references, this client won't pick
     * up the removal unless we remove everything not present in the current
     * list of references
     */
    item.updateLocalRelationships();
    if (!content.references || item.deleted) {
      return;
    }
    /** Make copy, references will be modified in array */
    const references = content.references.slice();
    const referencesIds = references.map((ref) => { return ref.uuid; });
    const includeBlanks = true;
    const items = this.findItems(referencesIds, includeBlanks);
    for (const [index, referencedItem] of items.entries()) {
      if (referencedItem) {
        item.addItemAsRelationship(referencedItem);
        if (markReferencesDirty) {
          await this.setItemDirty(referencedItem, true);
        }
      } else {
        const referenceId = referencesIds[index];
        this.resolveRelationshipWhenItemAvailable(item, referenceId);
      }
    }
  }

  /** 
   * Notifies observers when an item has been created 
   */
  public addCreationObserver(callback: CreationCallback) {
    const observer: CreationObserver = { callback };
    this.creationObservers.push(observer);
    return () => {
      remove(this.creationObservers, observer);
    };
  }

  private async notifyCreationObservers(
    items: SNItem[],
    source: PayloadSources,
    sourceKey?: string
  ) {
    for (const observer of this.creationObservers) {
      await observer.callback(items, source, sourceKey);
    }
  }

  /** 
   * Notifies observers when an item has been mapped.
   * @param types - An array of content types to listen for
   * @param priority - The lower the priority, the earlier the function is called 
   *  wrt to other observers
   */
  public addMappingObserver(
    types: ContentTypes | ContentTypes[],
    callback: MappingCallback,
    priority = 1
  ) {
    if (!Array.isArray(types)) {
      types = [types];
    }
    const observer: MappingObserver = {
      types,
      priority,
      callback
    };
    this.mappingObservers.push(observer);
    return () => {
      pull(this.mappingObservers, observer);
    };
  }

  /** 
   * This function is mostly for internal use, but can be used externally by consumers who
   * explicitely understand what they are doing (want to propagate model state without mapping)
   */
  public async notifyMappingObservers(
    items: SNItem[],
    source: PayloadSources,
    sourceKey?: string
  ) {
    const observers = this.mappingObservers.sort((a, b) => {
      return a.priority < b.priority ? -1 : 1;
    });
    for (const observer of observers) {
      const allRelevantItems =
        observer.types.includes(ContentTypes.Any)
          ? items
          : items.filter((item) => {
            return observer.types.includes(item.content_type);
          });
      const validItems = [];
      const deletedItems = [];
      for (const item of allRelevantItems) {
        if (item.deleted) {
          deletedItems.push(item);
        } else {
          validItems.push(item);
        }
      }
      if (allRelevantItems.length > 0) {
        await observer.callback(
          allRelevantItems,
          validItems,
          deletedItems,
          source,
          sourceKey
        );
      }
    }
  }

  /**
   * Sets the item as needing sync. The item is then run through the mapping function,
   * and propagated to mapping observers.
   * @param updateClientDate - Whether to update the item's "user modified date"
   */
  public async setItemDirty(
    item: SNItem,
    dirty = true,
    updateClientDate = false,
    source?: PayloadSources,
    sourceKey?: string
  ) {
    return this.setItemsDirty([item], dirty, updateClientDate, source, sourceKey);
  }

  /**
   * Similar to `setItemDirty`, but acts on an array of items as the first param.
   */
  public async setItemsDirty(
    items: SNItem[],
    dirty = true,
    updateClientDate = false,
    source?: PayloadSources,
    sourceKey?: string
  ) {
    for (const item of items) {
      item.setDirty(dirty, updateClientDate, true);
    }
    return this.mapItems(
      items,
      source || PayloadSources.LocalDirtied,
      sourceKey
    );
  }

  /**
   * Duplicates an item and maps it, thus propagating the item to observers.
   * @param isConflict - Whether to mark the duplicate as a conflict
   *    of the original.
   */
  public async duplicateItem(item: SNItem, isConflict = false) {
    const payload = CreateMaxPayloadFromAnyObject(item);
    const payloads = await PayloadsByDuplicating(
      payload,
      this.getMasterCollection(),
      isConflict,
    );
    const results = await this.mapPayloadsToLocalItems(
      payloads,
      PayloadSources.LocalChanged
    );
    const copy = results.find((p) => p.uuid === payloads[0].uuid);
    return copy!;
  }

  /**
   * Creates an item and conditionally maps it and marks it as dirty.
   * @param add - Whether to insert the item to model manager state.
   * @param needsSync - Whether to mark the item as needing sync
   */
  public async createItem(
    contentType: ContentTypes,
    content?: PayloadContent,
    add = false,
    needsSync = false,
    override?: PayloadOverride
  ) {
    if (!contentType) {
      throw 'Attempting to create item with no contentType';
    }
    const payload = CreateMaxPayloadFromAnyObject(
      {
        uuid: await Uuid.GenerateUuid(),
        content_type: contentType,
        content: BuildItemContent(content)
      },
      undefined,
      undefined,
      override
    );
    const item = CreateItemFromPayload(payload);
    if (add) {
      this.insertItem(item);
      if (needsSync) {
        await this.setItemDirty(item);
      }
      await this.notifyCreationObservers([item], PayloadSources.LocalChanged);
    }
    return item;
  }

  /**
   * Returns an array of items that need to be synced.
   */
  public getDirtyItems() {
    return this.items.filter((item) => {
      /* An item that has an error decrypting can be synced only if it is being deleted.
        Otherwise, we don't want to send corrupt content up to the server. */
      return item.dirty && !item.dummy && (!item.errorDecrypting || item.deleted);
    });
  }

  /**
   * Marks the item as deleted and needing sync.
   * Removes the item from respective content arrays (this.notes, this.tags, etc.)
   */
  public async setItemToBeDeleted(item: SNItem) {
    item.deleted = true;
    if (!item.dummy) {
      await this.setItemDirty(item, true);
    }
    await this.handleReferencesForItemDeletion(item);
    this.removeItemFromRespectiveArray(item);
  }

  /**
   * Like `setItemToBeDeleted`, but acts on an array of items.
   */
  public async setItemsToBeDeleted(items: SNItem[]) {
    for (const item of items) {
      await this.setItemToBeDeleted(item);
    }
  }

  private async handleReferencesForItemDeletion(item: SNItem) {
    /* Handle direct relationships */
    if (!item.errorDecrypting) {
      for (const reference of item.content.references!) {
        const relationship = this.findItem(reference.uuid);
        if (relationship) {
          item.removeItemAsRelationship(relationship);
          if (relationship.hasRelationshipWithItem(item)) {
            relationship.removeItemAsRelationship(item);
            await this.setItemDirty(relationship, true);
          }
        }
      }
    }
    /* Handle indirect relationships */
    const referencingItems = item.allReferencingItems;
    for (const referencingItem of referencingItems) {
      referencingItem.removeItemAsRelationship(item);
      await this.setItemDirty(referencingItem, true);
    }
    item.resetLocalReferencePointers();
  }

  /**
   * Removes an item directly from local state, without setting it as deleted or
   * as needing sync. This is typically called after a deleted item has been fully synced.
   */
  public async removeItemLocally(item: SNItem) {
    remove(this.items, { uuid: item.uuid });
    delete this.itemsHash[item.uuid];
    this.removeItemFromRespectiveArray(item);
    item.isBeingRemovedLocally();
  }

  private removeItemFromRespectiveArray(item: SNItem) {
    if (item.content_type === ContentTypes.Tag) {
      remove(this.tags, { uuid: item.uuid });
    } else if (item.content_type === ContentTypes.Note) {
      remove(this.notes, { uuid: item.uuid });
    } else if (item.content_type === ContentTypes.Component) {
      remove(this.components, { uuid: item.uuid });
    } else if (item.content_type === ContentTypes.ItemsKey) {
      remove(this.itemsKeys, { uuid: item.uuid });
    }
  }

  /** 
   * Returns a detached array of all items
   */
  public get allItems() {
    return this.items.slice();
  }

  /**
   * Returns a detached array of all items which are not dummys
   */
  public get allNondummyItems() {
    return this.items.filter((item) => {
      return !item.dummy;
    });
  }

  /**
   * Returns a detached array of all items which are not deleted
   */
  public get nonDeletedItems() {
    return this.items.filter((item) => {
      return !item.dummy && !item.deleted;
    });
  }

  /**
   * Returns all items of a certain type
   * @param contentType - A string or array of strings representing
   *    content types.
   */
  public getItems(contentType: ContentTypes | ContentTypes[]): SNItem[] {
    if (Array.isArray(contentType)) {
      return this.allItems.filter((item) => {
        return !item.dummy && contentType.includes(item.content_type);
      });
    }
    const managed = this.managedItemsForContentType(contentType);
    return managed || this.getItems([contentType]);
  }

  private managedItemsForContentType(contentType: ContentTypes): SNItem[] | null {
    if (contentType === ContentTypes.Note) {
      return this.notes.slice();
    } else if (contentType === ContentTypes.Component) {
      return this.components.slice();
    } else if (contentType === ContentTypes.Tag) {
      return this.tags.slice();
    }
    return null;
  }

  /** 
   * Returns all items that have not been able to decrypt.
   */
  public invalidItems() {
    return this.allItems.filter((item) => {
      return item.errorDecrypting;
    });
  }

  /**
   * Returns all items which are properly decrypted
   */
  validItemsForContentType(contentType: ContentTypes) {
    const managed = this.managedItemsForContentType(contentType);
    const items = managed || this.allItems;
    return items.filter((item) => {
      return !item.errorDecrypting && (
        Array.isArray(contentType)
          ? contentType.includes(item.content_type)
          : item.content_type === contentType
      );
    });
  }

  /**
   * Returns an item for a given id
   */
  findItem(itemId: string) {
    return this.itemsHash[itemId];
  }

  /**
   * Returns all items matching given ids
   * @param includeBlanks - Whether to include a null array element where a 
   *  result could not be found. If true, ids.length and results.length will always be the same.
   */
  public findItems(ids: string[], includeBlanks = false) {
    const results = [];
    for (const id of ids) {
      const item = this.itemsHash[id];
      if (item || includeBlanks) {
        results.push(item);
      }
    }
    return results;
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
    return this.filterItemsWithPredicates(this.allItems, predicates);
  }

  /**
   * Performs actual predicate filtering for public methods above.
   * Does not return deleted items.
   */
  private filterItemsWithPredicates(items: SNItem[], predicates: SNPredicate[]) {
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
   * Imports an array of payloads from an external source (such as a backup file)
   * and marks the items as dirty.
   * @returns Resulting items
   */
  public async importPayloads(payloads: PurePayload[]) {
    const delta = new DeltaFileImport(
      this.getMasterCollection(),
      new PayloadCollection(
        payloads,
        PayloadSources.FileImport
      )
    );
    const collection = await delta.resultingCollection();
    const items = await this.mapCollectionToLocalItems(collection);
    for (const item of items) {
      await this.setItemDirty(item, true, false);
      item.deleted = false;
    }
    return items;
  }

  /**
   * The number of notes currently managed
   */
  public noteCount() {
    return this.notes.filter((n) => !n.dummy).length;
  }

  /**
   * Immediately removes all items from mapping state and notifies observers
   * Used primarily when signing into an account and wanting to discard any current
   * local data.
   */
  public removeAllItemsFromMemory() {
    for (const item of this.items) {
      item.deleted = true;
    }
    this.notifyMappingObservers(this.items, PayloadSources.LocalChanged);
    this.resetState();
  }

  /**
   * Finds the first tag matching a given title
   */
  public findTagByTitle(title: string) {
    return findInArray(this.tags, 'title', title as any);
  }

  /**
  * Finds or creates a tag with a given title
  */
  public async findOrCreateTagByTitle(title: string) {
    let tag = this.findTagByTitle(title);
    if (!tag) {
      tag = await this.createItem(
        ContentTypes.Tag,
        BuildItemContent({ title }),
        true,
        true
      );
    }
    return tag;
  }

  /**
   * Returns all notes matching the smart tag
   */
  public notesMatchingSmartTag(smartTag: SNSmartTag) {
    const contentTypePredicate = new SNPredicate('content_type', '=', 'Note');
    const predicates = [contentTypePredicate, smartTag.content.predicate];
    if (!smartTag.content.isTrashTag) {
      const notTrashedPredicate = new SNPredicate('content.trashed', '=', false);
      predicates.push(notTrashedPredicate);
    }
    const results = this.itemsMatchingPredicates(predicates);
    return results;
  }

  /**
   * Returns the smart tag corresponding to the "Trash" tag.
   */
  public trashSmartTag() {
    return this.systemSmartTags.find((tag) => tag.content.isTrashTag);
  }

  /**
   * Returns all items currently in the trash
   */
  public trashedItems() {
    return this.notesMatchingSmartTag(this.trashSmartTag()!);
  }

  /**
   * Permanently deletes any items currently in the trash. Consumer must manually call sync.
   */
  public async emptyTrash() {
    const notes = this.trashedItems();
    return this.setItemsToBeDeleted(notes);
  }

  /**
   * Returns all smart tags, sorted by title.
   */
  public getSmartTags() {
    const userTags: SNSmartTag[] = this.validItemsForContentType(ContentTypes.SmartTag)
      .sort((a, b) => {
        return a.content.title < b.content.title ? -1 : 1;
      }) as SNSmartTag[];
    return this.systemSmartTags.concat(userTags);
  }
}
