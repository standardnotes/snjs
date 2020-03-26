import remove from 'lodash/remove';
import pull from 'lodash/pull';
import { findInArray, isNullOrUndefined } from '@Lib/utils';
import {
  ContentTypes,
  CreateItemFromPayload,
  SNPredicate,
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
  constructor() {
    super();
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
    this.systemSmartTags = SNSmartTag.systemSmartTags();
  }

  /**
   * @access public
   * Our payload collection keeps the latest mapped payload for every payload
   * that passes through our mapping function. Use this to query current state
   * as needed to make decisions, like about duplication or uuid alteration.
   */
  getMasterCollection() {
    return this.masterCollection;
  }

  /** @access public */
  deinit() {
    super.deinit();
    this.creationObservers.length = 0;
    this.mappingObservers.length = 0;
    this.resetState();
  }

  /** @access private */
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
   * The alternative to calling this function is to modify an item directly, then
   * to call one of the mapping functions to propagate the new values.
   * @access public
   * @param {object} item
   * @param {object} properties - Key/value object of new values to set
   */
  async setItemProperties({ item, properties }) {
    return this.setItemsProperties({ items: [item], properties });
  }

  /** @access public */
  async setItemsProperties({ items, properties }) {
    const keys = Object.keys(properties);
    for (const item of items) {
      for (const key of keys) {
        item[key] = properties[key];
      }
    }
    await this.mapItems({ 
      items,
      source: PayloadSources.LocalChanged
    });
  }

  /**
   * Modifies an item and marks it as dirty
   * @access public
   * @param {object} item
   * @param {function} modifier - An async function that modifies item internals
   */
  async modifyItem({ item, modifier }) {
    return this.modifyItems({ items: [item], modifier });
  }

  /**
  * Modifies multiple items and marks them as dirty
  * @access public
  * @param {object} items
  * @param {function} modifier - An async function that modifies items internals
  */
  async modifyItems({ items, modifier }) {
    await modifier();
    await this.setItemsDirty(items, true);
  }

  /**
   * One of many mapping helpers available.
   * This function maps a collection of payloads.
   * @access public
   */
  async mapCollectionToLocalItems({ collection, sourceKey }) {
    return this.mapPayloadsToLocalItems({
      payloads: collection.getAllPayloads(),
      source: collection.source,
      sourceKey: sourceKey
    });
  }

  /**
   * One of many mapping helpers available.
   * This function maps an item object to propagate its values.
   * @access public
   */
  async mapItem({ item, source, sourceKey }) {
    const items = await this.mapItems({
      items: [item],
      source,
      sourceKey
    });
    return items[0];
  }

  /**
   * One of many mapping helpers available.
   * This function maps an array of items
   * @access public
   */
  async mapItems({ items, source, sourceKey }) {
    /** 
     * Insert the items first. This way, if one of the input items is a template item,
     * unmanaged item, and we run it through the mapper, we don't want the mapper to create
     * a new object reference, but instead use the one supplied to this function.
     */
    this.insertItems({ items: items });
    const payloads = items.map((item) => item.payloadRepresentation());
    return this.mapPayloadsToLocalItems({
      payloads: payloads,
      source: source,
      sourceKey: sourceKey
    });
  }

  /**
   * One of many mapping helpers available.
   * This function maps a payload to an item
   * @access public
   * @returns {object} The mapped item
   */
  async mapPayloadToLocalItem({ payload, source }) {
    const items = await this.mapPayloadsToLocalItems({
      payloads: [payload],
      source: source
    });
    return items[0];
  }

  /**
   * This function maps multiple payloads to items, and is the authoratative mapping
   * function that all other mapping helpers rely on.
   * @access public
   * @returns {object} The mapped item
   */
  async mapPayloadsToLocalItems({ payloads, source, sourceKey }) {
    if(!payloads) {
      throw Error('Payloads cannot be null');
    }
    if(isNullOrUndefined(source)) {
      throw Error('Payload source cannot be null');
    }
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
      if (!payload.uuid) {
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
   * @access public 
   */
  insertItem({ item }) {
    this.insertItems({ items: [item] });
  }

  /** 
   * Similiar to `insertItem` but for many items.
   * @access public 
   */
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
        this.tags.unshift(item);
      }
      else if (item.content_type === ContentTypes.Note) {
        this.notes.unshift(item);
      }
      else if (item.content_type === ContentTypes.Component) {
        this.components.unshift(item);
      }
    }
  }

  /**
   * Adds items to model management.
   * @deprecated Use `insertItem` instead.
   * @param globalOnly  Whether the item should only be added to main .items
   *                    array, and not individual item arrays like .notes,
   *                    .tags, .components, etc.
   */
  async addItem(item, globalOnly = false) {
    return this.addItems([item], globalOnly);
  }

  /**
   * @deprecated Use `insertItems` instead.
   */
  async addItems(items, globalOnly = false) {
    console.warn('ModelManager.addItems is depracated. Use mapPayloadsToLocalItems instead.');
    const payloads = items.map((item) => CreateMaxPayloadFromAnyObject({ object: item }));
    await this.mapPayloadsToLocalItems({ 
      payloads: payloads,
      source: PayloadSources.LocalChanged
    });
  }

  /** @access private */
  resolveRelationshipWhenItemAvailable({ interestedItem, missingItemId }) {
    const interestedItems = this.resolveQueue[missingItemId] || [];
    interestedItems.push(interestedItem);
    this.resolveQueue[missingItemId] = interestedItems;
  }

  /** @access private */
  popItemsInterestedInMissingItem({ item }) {
    const interestedItems = this.resolveQueue[item.uuid];
    delete this.resolveQueue[item.uuid];
    return interestedItems || [];
  }

  /** @access private */
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
   * Notifies observers when an item has been created 
   * @access public
   * @param {object} observer
   * @param {function} observer.callback
   * @param {Array.<object>} observer.callback.items
   * @param {PayloadSource} observer.callback.source
   * @param {string} observer.callback.sourceKey
   * @returns {function} A function to remove the observer
   */
  addCreationObserver(observer) {
    this.creationObservers.push(observer);
    return () => {
      remove(this.creationObservers, observer);
    };
  }

  /** @access private */
  async notifyCreationObservers(items, source, sourceKey) {
    for (const observer of this.creationObservers) {
      await observer.callback({
        items: items,
        source: source,
        sourceKey: sourceKey
      });
    }
  }

  /** 
   * Notifies observers when an item has been mapped.
   * @param {Array.<string>} types - An array of content types to listen for
   * @param {function} callback
   * @param {Array.<object>} callback.items
   * @param {PayloadSource} callback.source
   * @param {string} callback.sourceKey
   * @param {number} priority - The lower the priority, the earlier the function is called 
   *  wrt to other observers
   * @returns {function} A function to remove the observer
   */
  addMappingObserver(types, callback, priority = 1) {
    if (!Array.isArray(types)) {
      types = [types];
    }
    const observer = { types, priority, callback };
    this.mappingObservers.push(observer);
    return () => {
      pull(this.mappingObservers, observer);
    };
  }

  /** 
   * @access public
   * This function is mostly for internal use, but can be used externally by consumers who
   * explicitely understand what they are doing (want to propagate model state without mapping)
   */
  async notifyMappingObservers(items, source, sourceKey) {
    const observers = this.mappingObservers.sort((a, b) => {
      return a.priority < b.priority ? -1 : 1;
    });
    for (const observer of observers) {
      const allRelevantItems =
        observer.types.includes('*')
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
   * @access public
   * @param {object} item
   * @param {boolean} dirty
   * @param {boolean} updateClientDate - Whether to update the item's "user modified date"
   * @param {PayloadSource} source
   * @param {string} sourceKey
   */
  async setItemDirty(item, dirty = true, updateClientDate, source, sourceKey) {
    return this.setItemsDirty([item], dirty, updateClientDate, source, sourceKey);
  }

  /**
   * @access public
   * Similar to `setItemDirty`, but acts on an array of items as the first param.
   */
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

  /**
   * Duplicates an item and maps it, thus propagating the item to observers.
   * @access public
   * @param {object} params
   * @param {Item} params.item
   * @param {boolean} params.isConflict - Whether to mark the duplicate as a conflict
   *    of the original.
   */
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
      payloads: payloads,
      source: PayloadSources.LocalChanged
    });
    const copy = results.find((p) => p.uuid === payloads[0].uuid);
    return copy;
  }

  /**
   * Creates an item and conditionally maps it and marks it as dirty.
   * @access public
   * @param {object} params
   * @param {string} params.contentType
   * @param {object} params.content
   * @param {boolean} params.add - Whether to insert the item to model manager state.
   * @param {boolean} params.needsSync - Whether to mark the item as needing sync
   * @returns {Item} The created item
   */
  async createItem({ contentType, content, add, needsSync, override }) {
    if (!contentType) {
      throw 'Attempting to create item with no contentType';
    }
    const payload = CreateMaxPayloadFromAnyObject({
      object: {
        uuid: await Uuid.GenerateUuid(),
        content_type: contentType,
        content: content || {}
      },
      override: override
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
   * Returns an array of items that need to be synced.
   * @returns {Array.<Item>}
   */
  getDirtyItems() {
    return this.items.filter((item) => {
      /* An item that has an error decrypting can be synced only if it is being deleted.
        Otherwise, we don't want to send corrupt content up to the server. */
      return item.dirty && !item.dummy && (!item.errorDecrypting || item.deleted);
    });
  }

  /**
   * Marks the item as deleted and needing sync.
   * Removes the item from respective content arrays (this.notes, this.tags, etc.)
   * @access public
   * @param {Item} item 
   */
  async setItemToBeDeleted(item) {
    item.deleted = true;
    if (!item.dummy) {
      await this.setItemDirty(item, true);
    }
    await this.handleReferencesForItemDeletion(item);
    this.removeItemFromRespectiveArray(item);
  }

  /**
   * Like `setItemToBeDeleted`, but acts on an array of items.
   * @access public
   * @param {Array.<Item>} items
   */
  async setItemsToBeDeleted(items) {
    for (const item of items) {
      await this.setItemToBeDeleted(item);
    }
  }

  /**
   * @access private
   * @param {Item} item 
   */
  async handleReferencesForItemDeletion(item) {
    /* Handle direct relationships */
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
   * @access public
   * @param {Item} item 
   */
  async removeItemLocally(item) {
    remove(this.items, { uuid: item.uuid });
    delete this.itemsHash[item.uuid];
    this.removeItemFromRespectiveArray(item);
    item.isBeingRemovedLocally();
  }

  /** @access private */
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

  /** 
   * Returns a detached array of all items
   * @access public 
   */
  get allItems() {
    return this.items.slice();
  }

  /**
   * Returns a detached array of all items which are not dummys
   * @access public
   */
  get allNondummyItems() {
    return this.items.filter((item) => {
      return !item.dummy;
    });
  }

  /**
   * Returns a detached array of all items which are not deleted
   * @access public
   */
  get nonDeletedItems() {
    return this.items.filter((item) => {
      return !item.dummy && !item.deleted;
    });
  }

  /**
   * Returns all items of a certain type
   * @access public
   * @param {string|Array.<string>} contentType - A string or array of strings representing
   *    content types. Use '*' for all content types.
   */
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

  /** @access private */
  managedItemsForContentType(contentType) {
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
   * @access public 
   */
  invalidItems() {
    return this.allItems.filter((item) => {
      return item.errorDecrypting;
    });
  }

  /**
   * Returns all items which are properly decrypted
   * @param {string} contentType 
   */
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

  /**
   * Returns an item for a given id
   * @access public
   * @param {string} itemId 
   */
  findItem(itemId) {
    return this.itemsHash[itemId];
  }

  /**
   * Returns all items matching given ids
   * @access public
   * @param {Array.<string>} ids 
   * @param {boolean} includeBlanks - Whether to include a null array element where a 
   *  result could not be found. If true, ids.length and results.length will always be the same.
   */
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

  /**
   * Returns all items matching a given predicate
   * @access public
   * @param {SNPredicate} predicate 
   */
  itemsMatchingPredicate(predicate) {
    return this.itemsMatchingPredicates([predicate]);
  }

  /**
  * Returns all items matching an array of predicates
  * @access public
  * @param {Array.<SNPredicate>} predicates
  */
  itemsMatchingPredicates(predicates) {
    return this.filterItemsWithPredicates(this.allItems, predicates);
  }

  /**
   * Performs actual predicate filtering for public methods above.
   * Does not return deleted items.
   * @access private
   */
  filterItemsWithPredicates(items, predicates) {
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
   * @access public
   * @param {Array.<Payload>} payloads 
   * @returns {Array.<Item>} Resulting items
   */
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

  /**
   * The number of notes currently managed
   * @access public
   */
  noteCount() {
    return this.notes.filter((n) => !n.dummy).length;
  }

  /**
   * Immediately removes all items from mapping state and notifies observers
   * Used primarily when signing into an account and wanting to discard any current
   * local data.
   * @access public
   */
  removeAllItemsFromMemory() {
    for (const item of this.items) {
      item.deleted = true;
    }
    this.notifyMappingObservers(this.items);
    this.resetState();
  }

  /**
   * Finds the first tag matching a given title
   * @access public
   * @param {string} title
   * @returns {Tag|null}
   */
  findTagByTitle(title) {
    return findInArray(this.tags, 'title', title);
  }

  /**
  * Finds or creates a tag with a given title
  * @access public
  * @param {string} title
  * @returns {Promise<Tag>}
  */
  async findOrCreateTagByTitle(title) {
    let tag = this.findTagByTitle(title);
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

  /**
   * Returns all notes matching the smart tag
   * @access public
   * @param {SmartTag} smartTag 
   */
  notesMatchingSmartTag(smartTag) {
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
   * @access public
   */
  trashSmartTag() {
    return this.systemSmartTags.find((tag) => tag.content.isTrashTag);
  }

  /**
   * Returns all items currently in the trash
   * @access public
   */
  trashedItems() {
    return this.notesMatchingSmartTag(this.trashSmartTag());
  }

  /**
   * Permanently deletes any items currently in the trash. Consumer must manually call sync.
   * @access public
   */
  async emptyTrash() {
    const notes = this.trashedItems();
    return this.setItemsToBeDeleted(notes);
  }

  /**
   * Returns all smart tags, sorted by title.
   * @access public
   */
  getSmartTags() {
    const userTags = this.validItemsForContentType(ContentTypes.SmartTag)
      .sort((a, b) => {
        return a.content.title < b.content.title ? -1 : 1;
      });
    return this.systemSmartTags.concat(userTags);
  }
}
