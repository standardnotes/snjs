import remove from 'lodash/remove';
import pull from 'lodash/pull';
import sortedIndexBy from 'lodash/sortedIndexBy';
import { findInArray } from '@Lib/utils';
import {
  ContentTypes,
  CreateItemFromPayload,
  SFPredicate,
  SNSmartTag
} from '@Models';
import { PureService } from '@Lib/services/pure_service';
import {
  PayloadSources,
  PayloadsByDuplicating,
  CreateMaxPayloadFromAnyObject,
  PayloadCollection,
  DeltaFileImport
} from '@Payloads';
import { Uuid } from '@Lib/uuid';

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
  constructor({ timeout }) {
    super();
    this.timeout = timeout;
    this.mappingObservers = [];
    this.creationObservers = [];
    this.items = [];
    this.itemsKeys = [];
    this.notes = [];
    this.tags = [];
    this.components = [];
    this.itemsHash = {};
    this.resolveQueue = {};
    this.masterCollection = new PayloadCollection();
    this.buildSystemSmartTags();
  }

  /**
  * Our payload collectionn keeps the latest mapped payload for every payload
  * that passes through our mapping function. Use this to query current state
  * as needed to make decisions, like about duplication or uuid alteration.
  */
  getMasterCollection() {
    return this.masterCollection;
  }

  deinit() {
    super.deinit();
    this.resetState();
  }

  resetState() {
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
   */
  async setItemProperties({ item, properties }) {
    return this.setItemsProperties({ items: [item], properties });
  }

  async setItemsProperties({ items, properties }) {
    const keys = Object.keys(properties);
    for (const item of items) {
      for (const key of keys) {
        item[key] = properties[key];
      }
    }
    await this.mapItems({ items });
  }

  async modifyItem({ item, modifier }) {
    return this.modifyItems({ items: [item], modifier });
  }

  async modifyItems({ items, modifier }) {
    await modifier();
    await this.setItemsDirty(items, true);
  }

  async mapCollectionToLocalItems({ collection, sourceKey }) {
    return this.mapPayloadsToLocalItems({
      payloads: collection.allPayloads,
      source: collection.source,
      sourceKey: sourceKey
    });
  }

  async mapItem({ item, source, sourceKey }) {
    const items = await this.mapItems({
      items: [item],
      source,
      sourceKey
    });
    return items[0];
  }

  async mapItems({ items, source, sourceKey }) {
    const payloads = items.map((item) => item.payloadRepresentation());
    return this.mapPayloadsToLocalItems({
      payloads: payloads,
      source: source,
      sourceKey: sourceKey
    });
  }

  async mapPayloadToLocalItem({ payload }) {
    const items = await this.mapPayloadsToLocalItems({
      payloads: [payload]
    });
    return items[0];
  }

  async mapPayloadsToLocalItems({ payloads, source, sourceKey }) {
    const itemsToNotifyObserversOf = [];
    const newItems = [];
    const processed = {};

    /** First loop should process payloads and add items only; no relationship handling. */
    for (const payload of payloads) {
      if (!payload) {
        console.error('Payload is null');
        continue;
      }

      if (!payload.isPayload) {
        throw 'Attempting to map non-payload object into local model.';
      }

      const isCorrupt = !payload.content_type || !payload.uuid;
      if (isCorrupt && !payload.deleted) {
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
        this.insertItems({
          items: [item],
          globalOnly: isDirtyDeleted
        });
        newItems.push(item);
      }

      /** Observers do not need to handle items that errored while decrypting. */
      if (!item.errorDecrypting) {
        itemsToNotifyObserversOf.push(item);
      }

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

      const interestedItems = this.popItemsInterestedInMissingItem({
        item: item
      });
      for (const interestedItem of interestedItems) {
        interestedItem.addItemAsRelationship(item);
      }

      item.didCompleteMapping(source);
    }

    const newCollection = new PayloadCollection({
      payloads: allItems.map((item) => item.payloadRepresentation()),
      source: source
    });
    this.masterCollection = this.masterCollection.concat(newCollection);

    if(newItems.length > 0) {
      await this.notifyCreationObservers(
        newItems,
        source,
        sourceKey
      );
    }
    await this.notifyMappingObservers(
      itemsToNotifyObserversOf,
      source,
      sourceKey
    );
    return allItems;
  }

  /** @access public */
  insertItem({ item }) {
    this.insertItems({ items: [item] });
  }

  /** @access public */
  insertItems({ items, globalOnly }) {
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
        this.itemsKeys.unshift(item);
      }
      else if (item.content_type === ContentTypes.Tag) {
        const index = sortedIndexBy(this.tags, item, function (item) {
          if (item.title) { return item.title.toLowerCase(); }
          else { return ''; }
        });
        this.tags.splice(index, 0, item);
      }
      else if (item.content_type === ContentTypes.Note) {
        this.notes.unshift(item);
      }
      else if (item.content_type === ContentTypes.Component) {
        this.components.unshift(item);
      }
    }
  }

  resolveRelationshipWhenItemAvailable({ interestedItem, missingItemId }) {
    const interestedItems = this.resolveQueue[missingItemId] || [];
    interestedItems.push(interestedItem);
    this.resolveQueue[missingItemId] = interestedItems;
  }

  popItemsInterestedInMissingItem({ item }) {
    const interestedItems = this.resolveQueue[item.uuid];
    delete this.resolveQueue[item.uuid];
    return interestedItems || [];
  }

  async resolveReferencesForItem(item, markReferencesDirty = false) {
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
        this.resolveRelationshipWhenItemAvailable({
          interestedItem: item,
          missingItemId: referenceId
        });
      }
    }
  }


  /**
   * @observers
   */

  /* Notifies observers when an item has been created */
  addCreationObserver(observer) {
    this.creationObservers.push(observer);
    return observer;
  }

  removeCreationObserver(observer) {
    remove(this.creationObservers, observer);
  }

  async notifyCreationObservers(items, source, sourceKey) {
    for (const observer of this.creationObservers) {
      await observer.callback({
        items: items,
        source: source,
        sourceKey: sourceKey
      });
    }
  }

  /* Notifies observers when an item has been mapped from */
  addMappingObserver(types, callback) {
    return this.addMappingObserverWithPriority({ types, callback, priority: 1 });
  }

  addMappingObserverWithPriority({ priority, types, callback }) {
    if (!Array.isArray(types)) {
      types = [types];
    }
    const observer = { types, priority, callback };
    this.mappingObservers.push(observer);
    return () => {
      pull(this.mappingObservers, observer);
    };
  }

  /* Note that this function is public, and can also be called manually (desktopManager uses it) */
  async notifyMappingObservers(items, source, sourceKey) {
    const observers = this.mappingObservers.sort((a, b) => {
      return a.priority < b.priority ? -1 : 1;
    });
    for (const observer of observers) {
      const allRelevantItems = observer.types.includes('*')
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
        await this._callMappingObserver(
          observer,
          allRelevantItems,
          validItems,
          deletedItems,
          source,
          sourceKey
        );
      }
    }
  }

  async _callMappingObserver(
    observer,
    allRelevantItems,
    validItems,
    deletedItems,
    source,
    sourceKey
  ) {
    return new Promise((resolve, reject) => {
      this.timeout(async () => {
        try {
          await observer.callback(
            allRelevantItems,
            validItems,
            deletedItems,
            source,
            sourceKey
          );
        } catch (e) {
          console.error('Mapping observer exception', e);
        } finally {
          resolve();
        }
      });
    });
  }

  /**
   * When a client sets an item as dirty, it means its values has changed,
   * and everyone should know about it. Particularly extensions. For example,
   * if you edit the title of a note, extensions won't be notified until
   * the save sync completes. With this, they'll be notified immediately.
   */
  async setItemDirty(item, dirty = true, updateClientDate, source, sourceKey) {
    return this.setItemsDirty([item], dirty, updateClientDate, source, sourceKey);
  }

  async setItemsDirty(items, dirty = true, updateClientDate, source, sourceKey) {
    for (const item of items) {
      if (!item.isItem) {
        throw 'Attempting to dirty non-item object.';
      }
      item.setDirty({ dirty, updateClientDate, authorized: true });
    }
    return this.mapItems({
      items: items,
      source: source || PayloadSources.LocalDirtied,
      sourceKey: sourceKey
    });
  }

  async duplicateItem({ item, isConflict }) {
    if (!item.isItem) {
      throw 'Attempting to duplicate non-item object.';
    }
    const payload = CreateMaxPayloadFromAnyObject({ object: item });
    const payloads = await PayloadsByDuplicating({
      payload: payload,
      baseCollection: this.getMasterCollection(),
      isConflict: isConflict,
    });
    const results = await this.mapPayloadsToLocalItems({
      payloads: payloads
    });
    const copy = results.find((p) => p.uuid === payloads[0].uuid);
    return copy;
  }

  /** @access public */
  async createItem({ contentType, content, add, needsSync }) {
    if (!contentType) {
      throw 'Attempting to create item with no contentType';
    }
    const payload = CreateMaxPayloadFromAnyObject({
      object: {
        uuid: await Uuid.GenerateUuid(),
        content_type: contentType,
        content: content
      }
    });
    const item = CreateItemFromPayload(payload);
    if (add) {
      this.insertItem({ item: item });
      if (needsSync) {
        await this.setItemDirty(item);
      }
      await this.notifyCreationObservers(
        [item]
      );
    }
    return item;
  }

  /**
   * Adds items to model management.
   * @param globalOnly  Whether the item should only be added to main .items
   *                    array, and not individual item arrays like .notes,
   *                    .tags, .components, etc.
   */
  async addItem(item, globalOnly = false) {
    return this.addItems([item], globalOnly);
  }

  async addItems(items, globalOnly = false) {
    console.warn('ModelManager.addItems is depracated. Use mapPayloadsToLocalItems instead.');
    const payloads = items.map((item) => CreateMaxPayloadFromAnyObject({ object: item }));
    await this.mapPayloadsToLocalItems({ payloads: payloads });
  }

  getDirtyItems() {
    return this.items.filter((item) => {
      // An item that has an error decrypting can be synced only if it is being deleted.
      // Otherwise, we don't want to send corrupt content up to the server.
      return item.dirty && !item.dummy && (!item.errorDecrypting || item.deleted);
    });
  }

  async clearDirtyItems(items) {
    return this.setItemsDirty(items, false);
  }

  /* Used when changing encryption key */
  async setAllItemsDirty() {
    const relevantItems = this.allItems;
    await this.setItemsDirty(relevantItems, true);
  }

  async setItemToBeDeleted(item) {
    item.deleted = true;
    if (!item.dummy) {
      await this.setItemDirty(item, true);
    }
    await this.handleReferencesForItemDeletion(item);
    this.removeItemFromRespectiveArray(item);
  }

  async handleReferencesForItemDeletion(item) {
    /** Handle direct relationships */
    if (!item.errorDecrypting) {
      for (const reference of item.content.references) {
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

    /** Handle indirect relationships */
    const referencingItems = item.allReferencingItems;
    for (const referencingItem of referencingItems) {
      referencingItem.removeItemAsRelationship(item);
      await this.setItemDirty(referencingItem, true);
    }

    item.resetLocalReferencePointers();
  }

  async setItemsToBeDeleted(items) {
    for (const item of items) {
      await this.setItemToBeDeleted(item);
    }
  }

  async removeItemLocally(item) {
    remove(this.items, { uuid: item.uuid });
    delete this.itemsHash[item.uuid];
    this.removeItemFromRespectiveArray(item);
    item.isBeingRemovedLocally();
  }

  removeItemFromRespectiveArray(item) {
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

  /* Searching */

  get allItems() {
    return this.items.slice();
  }

  get allNondummyItems() {
    return this.items.filter((item) => {
      return !item.dummy;
    });
  }

  get nonDeletedItems() {
    return this.items.filter((item) => {
      return !item.dummy && !item.deleted;
    });
  }

  getItems(contentType) {
    if (Array.isArray(contentType)) {
      return this.allItems.filter((item) => {
        return !item.dummy && (
          contentType.includes(item.content_type) ||
          contentType.includes('*')
        );
      });
    }
    const managed = this.managedItemsForContentType(contentType);
    return managed || this.getItems([contentType]);
  }

  managedItemsForContentType(contentType) {
    if (contentType === ContentTypes.Note) {
      return this.notes;
    } else if (contentType === ContentTypes.Component) {
      return this.components;
    } else if (contentType === ContentTypes.Tag) {
      return this.tags;
    }

    return null;
  }

  invalidItems() {
    return this.allItems.filter((item) => {
      return item.errorDecrypting;
    });
  }

  validItemsForContentType(contentType) {
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

  findItem(itemId) {
    return this.itemsHash[itemId];
  }

  findItems(ids, includeBlanks = false) {
    const results = [];
    for (const id of ids) {
      const item = this.itemsHash[id];
      if (item || includeBlanks) {
        results.push(item);
      }
    }
    return results;
  }

  itemsMatchingPredicate(predicate) {
    return this.itemsMatchingPredicates([predicate]);
  }

  itemsMatchingPredicates(predicates) {
    return this.filterItemsWithPredicates(this.allItems, predicates);
  }

  filterItemsWithPredicates(items, predicates) {
    const results = items.filter((item) => {
      if(item.deleted) {
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

  async importPayloads(payloads) {
    const delta = new DeltaFileImport({
      baseCollection: this.getMasterCollection(),
      applyCollection: new PayloadCollection({
        payloads: payloads,
        source: PayloadSources.FileImport
      })
    });
    const collection = await delta.resultingCollection();
    const items = await this.mapCollectionToLocalItems({
      collection: collection
    });
    for (const item of items) {
      await this.setItemDirty(item, true, false);
      item.deleted = false;
    }
    return items;
  }

  noteCount() {
    return this.notes.filter((n) => !n.dummy).length;
  }

  removeAllItemsFromMemory() {
    for (const item of this.items) {
      item.deleted = true;
    }
    this.notifyMappingObservers(this.items);
    this.resetState();
  }

  findTag({ title }) {
    return findInArray(this.tags, 'title', title);
  }

  async findOrCreateTag({ title }) {
    let tag = this.findTag({ title });
    if (!tag) {
      tag = await this.createItem({
        contentType: 'Tag',
        content: { title: title },
        add: true,
        needsSync: true
      });
    }
    return tag;
  }

  reorderTagLocation(tag) {
    pull(this.tags, tag);
    this.tags.splice(sortedIndexBy(this.tags, tag, (tag) => {
      if (tag.title) return tag.title.toLowerCase();
      else return '';
    }), 0, tag);
  }

  notesMatchingSmartTag(tag) {
    const contentTypePredicate = new SFPredicate('content_type', '=', 'Note');
    const predicates = [contentTypePredicate, tag.content.predicate];
    if (!tag.content.isTrashTag) {
      const notTrashedPredicate = new SFPredicate('content.trashed', '=', false);
      predicates.push(notTrashedPredicate);
    }
    const results = this.itemsMatchingPredicates(predicates);
    return results;
  }

  trashSmartTag() {
    return this.systemSmartTags.find((tag) => tag.content.isTrashTag);
  }

  trashedItems() {
    return this.notesMatchingSmartTag(this.trashSmartTag());
  }

  emptyTrash() {
    const notes = this.trashedItems();
    for (const note of notes) {
      this.setItemToBeDeleted(note);
    }
  }

  buildSystemSmartTags() {
    this.systemSmartTags = SNSmartTag.systemSmartTags();
  }

  getSmartTagWithId(id) {
    return this.getSmartTags().find((candidate) => candidate.uuid === id);
  }

  getSmartTags() {
    const userTags = this.validItemsForContentType(ContentTypes.SmartTag)
      .sort((a, b) => {
        return a.content.title < b.content.title ? -1 : 1;
      });
    return this.systemSmartTags.concat(userTags);
  }
}
