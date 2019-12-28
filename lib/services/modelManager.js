import remove from 'lodash/remove';
import find from 'lodash/find';
import includes from 'lodash/includes';
import sortedIndexBy from 'lodash/sortedIndexBy';
import {
  CreatePayloadFromAnyObject,
  CreateMaxPayloadFromItem
 } from '@Protocol/payloads/generator';

import { SN_ITEMS_KEY_CONTENT_TYPE } from '@Lib/constants';

import {
  EncryptionIntentFileEncrypted,
  EncryptionIntentFileDecrypted
} from '@Protocol/intents';

import { SFItem } from '@Models/core/item'
import { SNItemsKey } from '@Models/keys/itemsKey';
import { SFPredicate } from '@Models/core/predicate'
import { SNComponent } from '@Models/app/component';
import { SNEditor } from '@Models/app/editor'
import { SNExtension } from '@Models/app/extension';
import { SNNote } from '@Models/app/note';
import { SNTag } from '@Models/app/tag';
import { SFPrivileges } from '@Models/privileges/privileges';
import { SNMfa } from '@Models/server/mfa';
import { SNServerExtension } from '@Models/server/serverExtension';
import { SNSmartTag } from '@Models/subclasses/smartTag';
import { SNTheme } from '@Models/subclasses/theme';

export class SNModelManager {

  constructor(timeout) {

    SNModelManager.ContentTypeClassMapping = {
      "Note" : SNNote,
      "Tag" : SNTag,
      SN_ITEMS_KEY_CONTENT_TYPE: SNItemsKey,
      "SN|SmartTag" : SNSmartTag,
      "Extension" : SNExtension,
      "SN|Editor" : SNEditor,
      "SN|Theme" : SNTheme,
      "SN|Component" : SNComponent,
      "SF|Extension" : SNServerExtension,
      "SF|MFA" : SNMfa,
      "SN|Privileges" : SFPrivileges
    };

    SNModelManager.isMappingSourceRetrieved = (source) => {
      return [
        MAPPING_SOURCE_REMOTE_RETRIEVED,
        MAPPING_SOURCE_COMPONENT_RETRIEVED,
        MAPPING_SOURCE_REMOTE_ACTION_RETRIEVED
      ].includes(source);
    }

    this.$timeout = timeout || setTimeout.bind(window);

    this.itemSyncObservers = [];
    this.items = [];

    this.itemsKeys = [];
    this.notes = [];
    this.tags = [];
    this.components = [];

    this.itemsHash = {};
    this.missedReferences = {};
    this.uuidChangeObservers = [];
  }

  handleSignout() {
    this.items.length = 0;

    this.itemsKeys.length = 0;
    this.notes.length = 0;
    this.tags.length = 0;
    this.components.length = 0;

    this.itemsHash = {};
    this.missedReferences = {};
  }

  didSyncModelsOffline(items) {
    this.notifySyncObserversOfModels(items, MAPPING_SOURCE_LOCAL_SAVED);
  }

  async mapPayloadsToLocalModels({payloads, omitFields, source, sourceKey, options}) {
    let models = [], processedObjects = [], modelsToNotifyObserversOf = [];

    /** first loop should add and process items */
    for(const payload of payloads) {
      if(!payload) {
        console.error("Payload is null");
        continue;
      }

      if(!payload.isPayload) {
        throw 'Attempting to map non-payload object into local model.';
      }

      // content is missing if it has been sucessfullly decrypted but no content
      let isMissingContent = !payload.content && !payload.errorDecrypting;
      let isCorrupt = !payload.content_type || !payload.uuid;
      if((isCorrupt || isMissingContent) && !payload.deleted) {
        // An item that is not deleted should never have empty content
        console.error("Payload is corrupt:", payload);
        continue;
      }

      // Lodash's omit, which was previously used, seems to cause unexpected behavior
      // when payload is an ES6 item class. So we instead manually omit each key.
      if(Array.isArray(omitFields)) {
        for(let key of omitFields) {
          delete payload[key];
        }
      }

      let item = this.findItem(payload.uuid);

      if(item) {
        item.updateFromPayload(payload);
        /** If an item goes through mapping, it can no longer be a dummy. */
        item.dummy = false;
      }

      let contentType = payload["content_type"] || (item && item.content_type);
      let unknownContentType = this.acceptableContentTypes && !this.acceptableContentTypes.includes(contentType);
      if(unknownContentType) {
        console.error(`Unknown content_type: ${contentType}`);
        continue;
      }

      let isDirtyItemPendingDelete = false;
      if(payload.deleted == true) {
        if(payload.dirty) {
          // Item was marked as deleted but not yet synced (in offline scenario)
          // We need to create this item as usual, but just not add it to individual arrays
          // i.e add to this.items but not this.notes (so that it can be retrieved with getDirtyItems)
          isDirtyItemPendingDelete = true;
        } else {
          if(item) {
            // We still want to return this item to the caller so they know it was handled.
            models.push(item);

            modelsToNotifyObserversOf.push(item);
            this.removeItemLocally(item);
          }
          continue;
        }
      }

      if(!item) {
        item = this.createItemFromPayload(payload);
      }

      this.addItem(item, isDirtyItemPendingDelete);

      // Observers do not need to handle items that errored while decrypting.
      if(!item.errorDecrypting) {
        modelsToNotifyObserversOf.push(item);
      }

      models.push(item);
      processedObjects.push(payload);
    }

    // second loop should process references
    for(let [index, payload] of processedObjects.entries()) {
      let model = models[index];
      if(payload.content) {
        this.resolveReferencesForItem(model);
      }

      model.didFinishSyncing();
    }

    let missedRefs = this.popMissedReferenceStructsForObjects(processedObjects);
    for(let ref of missedRefs) {
      let model = models.find((candidate) => candidate.uuid == ref.reference_uuid);
      // Model should 100% be defined here, but let's not be too overconfident
      if(model) {
        let itemWaitingForTheValueInThisCurrentLoop = ref.for_item;
        itemWaitingForTheValueInThisCurrentLoop.addItemAsRelationship(model);
      }
    }

    await this.notifySyncObserversOfModels(modelsToNotifyObserversOf, source, sourceKey);

    return models;
  }

  missedReferenceBuildKey(referenceId, objectId) {
    return `${referenceId}:${objectId}`
  }

  popMissedReferenceStructsForObjects(objects) {
    if(!objects || objects.length == 0) {
      return [];
    }

    let results = [];
    let toDelete = [];
    let uuids = objects.map((item) => item.uuid);
    let genericUuidLength = uuids[0].length;

    let keys = Object.keys(this.missedReferences);
    for(let candidateKey of keys) {
      /*
      We used to do string.split to get at the UUID, but surprisingly,
      the performance of this was about 20x worse then just getting the substring.

      let matches = candidateKey.split(":")[0] == object.uuid;
      */
      let matches = uuids.includes(candidateKey.substring(0, genericUuidLength));
      if(matches) {
        results.push(this.missedReferences[candidateKey]);
        toDelete.push(candidateKey);
      }
    }

    // remove from hash
    for(let key of toDelete) {
      delete this.missedReferences[key];
    }

    return results;
  }

  resolveReferencesForItem(item, markReferencesDirty = false) {
    if(item.errorDecrypting) {
      return;
    }

    const content = item.content;

    // If another client removes an item's references, this client won't pick up the removal unless
    // we remove everything not present in the current list of references
    item.updateLocalRelationships();

    if(!content.references) {
      return;
    }

    const references = content.references.slice(); // make copy, references will be modified in array

    const referencesIds = references.map((ref) => {return ref.uuid});
    const includeBlanks = true;
    const referencesObjectResults = this.findItems(referencesIds, includeBlanks);

    for(let [index, referencedItem] of referencesObjectResults.entries()) {
      if(referencedItem) {
        item.addItemAsRelationship(referencedItem);
        if(markReferencesDirty) {
          this.setItemDirty(referencedItem, true);
        }
      } else {
        let missingRefId = referencesIds[index];
        // Allows mapper to check when missing reference makes it through the loop,
        // and then runs resolveReferencesForItem again for the original item.
        let mappingKey = this.missedReferenceBuildKey(missingRefId, item.uuid);
        if(!this.missedReferences[mappingKey]) {
          let missedRef = {reference_uuid: missingRefId, for_item: item};
          this.missedReferences[mappingKey] = missedRef;
        }
      }
    }
  }

  /* Note that this function is public, and can also be called manually (desktopManager uses it) */
  async notifySyncObserversOfModels(models, source, sourceKey) {
    // Make sure `let` is used in the for loops instead of `var`, as we will be using a timeout below.
    let observers = this.itemSyncObservers.sort((a, b) => {
      // sort by priority
      return a.priority < b.priority ? -1 : 1;
    });
    for(let observer of observers) {
      let allRelevantItems = observer.types.includes("*") ? models : models.filter((item) => {return observer.types.includes(item.content_type)});
      let validItems = [], deletedItems = [];
      for(let item of allRelevantItems) {
        if(item.deleted) {
          deletedItems.push(item);
        } else {
          validItems.push(item);
        }
      }

      if(allRelevantItems.length > 0) {
        await this._callSyncObserverCallbackWithTimeout(observer, allRelevantItems, validItems, deletedItems, source, sourceKey);
      }
    }
  }

  /*
    Rather than running this inline in a for loop, which causes problems and requires all variables to be declared with `let`,
    we'll do it here so it's more explicit and less confusing.
   */
  async _callSyncObserverCallbackWithTimeout(observer, allRelevantItems, validItems, deletedItems, source, sourceKey) {
    return new Promise((resolve, reject) => {
      this.$timeout(() => {
        try {
          observer.callback(allRelevantItems, validItems, deletedItems, source, sourceKey);
        } catch (e) {
          console.error("Sync observer exception", e);
        } finally {
          resolve();
        }
      })
    })
  }

  // When a client sets an item as dirty, it means its values has changed, and everyone should know about it.
  // Particularly extensions. For example, if you edit the title of a note, extensions won't be notified until the save sync completes.
  // With this, they'll be notified immediately.
  setItemDirty(item, dirty = true, updateClientDate, source, sourceKey) {
    this.setItemsDirty([item], dirty, updateClientDate, source, sourceKey);
  }

  setItemsDirty(items, dirty = true, updateClientDate, source, sourceKey) {
    for(let item of items) {
      item.setDirty(dirty, updateClientDate);
    }
    this.notifySyncObserversOfModels(items, source || MAPPING_SOURCE_LOCAL_DIRTIED, sourceKey);
  }

  createItemFromPayload(payload) {
    if(!payload.isPayload) {
      throw 'Attempting to create item from non-payload object.';
    }
    let itemClass = (
      SNModelManager.ContentTypeClassMapping
      && SNModelManager.ContentTypeClassMapping[payload.content_type]
    );

    if(!itemClass) {
      itemClass = SFItem;
    }

    const item = new itemClass(payload);
    return item;
  }

  /*
    Be sure itemResponse is a generic Javascript object, and not an Item.
    An Item needs to collapse its properties into its content object before it can be duplicated.
    Note: the reason we need this function is specificallty for the call to resolveReferencesForItem.
    This method creates but does not add the item to the global inventory. It's used by syncManager
    to check if this prospective duplicate item is identical to another item, including the references.
   */
  async createDuplicateItemFromPayload(payload) {
    if(!payload.isPayload) {
      throw 'Attempting to createDuplicateItemFromPayload with non payload object';
    }
    payload.uuid = await SFItem.GenerateUuid();
    let duplicate = this.createItemFromPayload(payload);
    return duplicate;
  }

  duplicateItemAndAddAsConflict(duplicateOf) {
    return this.duplicateItemWithCustomContentAndAddAsConflict({
      content: duplicateOf.content,
      duplicateOf
    });
  }

  duplicateItemWithCustomContentAndAddAsConflict({content, duplicateOf}) {
    let copy = this.duplicateItemWithCustomContent({content, duplicateOf});
    this.addDuplicatedItemAsConflict({
      duplicate: copy,
      duplicateOf
    });
    return copy;
  }

  addDuplicatedItemAsConflict({duplicate, duplicateOf}) {
    this.addDuplicatedItem(duplicate, duplicateOf);
    duplicate.content.conflict_of = duplicateOf.uuid;
  }

  duplicateItemWithCustomContent({content, duplicateOf}) {
    let copy = new duplicateOf.constructor({content});
    copy.created_at = duplicateOf.created_at;
    if(!copy.content_type) {
      copy.content_type = duplicateOf.content_type;
    }
    return copy;
  }

  duplicateItemAndAdd(item) {
    let copy = this.duplicateItemWithoutAdding(item);
    this.addDuplicatedItem(copy, item);
    return copy;
  }

  duplicateItemWithoutAdding(item) {
    if(!item.isItem) {
      throw 'Attempting to duplicate non-item object.';
    }
    const payload = CreateMaxPayloadFromItem({item: item});
    payload.uuid = null;

    const copy = new item.constructor(payload);
    copy.created_at = item.created_at;
    if(!copy.content_type) {
      copy.content_type = item.content_type;
    }
    return copy;
  }

  addDuplicatedItem(duplicate, original) {
    this.addItem(duplicate);
    /** the duplicate should inherit the original's relationships */
    for(const referencingObject of original.referencingObjects) {
      referencingObject.addItemAsRelationship(duplicate);
      this.setItemDirty(referencingObject, true);
    }
    this.resolveReferencesForItem(duplicate);
    this.setItemDirty(duplicate, true);
  }


  addItem(item, globalOnly = false) {
    this.addItems([item], globalOnly);
  }

  addItems(items, globalOnly = false) {
    items.forEach((item) => {
      if(!this.itemsHash[item.uuid]) {
        this.itemsHash[item.uuid] = item;
        this.items.push(item);
      }

      // In some cases, you just want to add the item to this.items, and not to the individual arrays
      // This applies when you want to keep an item syncable, but not display it via the individual arrays
      if(!globalOnly) {
         if(item.content_type === SN_ITEMS_KEY_CONTENT_TYPE) {
          if(!find(this.itemsKeys, {uuid: item.uuid})) {
            this.itemsKeys.unshift(item);
          }
        } else if(item.content_type == "Tag") {
          if(!find(this.tags, {uuid: item.uuid})) {
            this.tags.splice(sortedIndexBy(this.tags, item, function(item){
              if (item.title) return item.title.toLowerCase();
              else return ''
            }), 0, item);
          }
        } else if(item.content_type == "Note") {
          if(!find(this.notes, {uuid: item.uuid})) {
            this.notes.unshift(item);
          }
        } else if(item.content_type == "SN|Component") {
          if(!find(this.components, {uuid: item.uuid})) {
            this.components.unshift(item);
          }
        }
      }
    });
  }

  /* Notifies observers when an item has been synced or mapped from a remote response */
  addItemSyncObserver(id, types, callback) {
    this.addItemSyncObserverWithPriority({id, types, callback, priority: 1})
  }

  addItemSyncObserverWithPriority({id, priority, types, callback}) {
    if(!Array.isArray(types)) {
      types = [types];
    }
    this.itemSyncObservers.push({id, types, priority, callback});
  }

  removeItemSyncObserver(id) {
    remove(this.itemSyncObservers, find(this.itemSyncObservers, {id: id}));
  }

  getDirtyItems() {
    return this.items.filter((item) => {
      // An item that has an error decrypting can be synced only if it is being deleted.
      // Otherwise, we don't want to send corrupt content up to the server.
      return item.dirty == true && !item.dummy && (!item.errorDecrypting || item.deleted);
    })
  }

  clearDirtyItems(items) {
    for(let item of items) {
      item.setDirty(false);
    }
  }

  removeAndDirtyAllRelationshipsForItem(item) {
    // Handle direct relationships
    // An item with errorDecrypting will not have valid content field
    if(!item.errorDecrypting) {
      for(let reference of item.content.references) {
        let relationship = this.findItem(reference.uuid);
        if(relationship) {
          item.removeItemAsRelationship(relationship);
          if(relationship.hasRelationshipWithItem(item)) {
            relationship.removeItemAsRelationship(item);
            this.setItemDirty(relationship, true);
          }
        }
      }
    }

    /** Handle indirect relationships */
    for(let object of item.referencingObjects) {
      object.removeItemAsRelationship(item);
      this.setItemDirty(object, true);
    }

    item.referencingObjects = [];
    item.referencedObjects = [];
  }

  /* Used when changing encryption key */
  setAllItemsDirty() {
    let relevantItems = this.allItems;
    this.setItemsDirty(relevantItems, true);
  }

  setItemToBeDeleted(item) {
    item.deleted = true;

    if(!item.dummy) {
      this.setItemDirty(item, true);
    }

    this.removeAndDirtyAllRelationshipsForItem(item);

    this.removeItemFromRespectiveArray(item);
  }

  async removeItemLocally(item) {
    remove(this.items, {uuid: item.uuid});

    delete this.itemsHash[item.uuid]

    this.removeItemFromRespectiveArray(item);

    item.isBeingRemovedLocally();
  }

  removeItemFromRespectiveArray(item) {
    if(item.content_type == "Tag") {
      remove(this.tags, {uuid: item.uuid});
    } else if(item.content_type == "Note") {
      remove(this.notes, {uuid: item.uuid});
    } else if(item.content_type == "SN|Component") {
      remove(this.components, {uuid: item.uuid});
    } else if(item.content_type === SN_ITEMS_KEY_CONTENT_TYPE) {
      remove(this.itemsKeys, {uuid: item.uuid});
    }
  }

  /**
   @uuid_alternation
   */

   addModelUuidChangeObserver(id, callback) {
     this.uuidChangeObservers.push({id: id, callback: callback});
   }

   notifyObserversOfUuidChange(oldItem, newItem) {
     for(let observer of this.uuidChangeObservers) {
     try {
       observer.callback(oldItem, newItem);
     } catch (e) {
       console.error("Notify observers of uuid change exception:", e);
     }
    }
   }

  async alternateUUIDForItem(item) {
    if(!item.isItem) {
      throw 'Attempting to alternate uuid of non-item object';
    }
    const inPayload = CreateMaxPayloadFromItem({item: item});
    /**
    * We need to clone this item and give it a new uuid,
    * then delete item with old uuid from db (cannot modify uuids in our IndexedDB setup)
    */
    inPayload.uuid = await SFItem.GenerateUuid();
    let newItem = this.createItemFromPayload(inPayload);

    /** Update uuids of relationships */
    newItem.informReferencesOfUUIDChange(item.uuid, newItem.uuid);
    this.informModelsOfUUIDChangeForItem(newItem, item.uuid, newItem.uuid);

    /** The new item should inherit the original's relationships */
    for(const referencingObject of item.referencingObjects) {
      referencingObject.setIsNoLongerBeingReferencedBy(item);
      item.setIsNoLongerBeingReferencedBy(referencingObject);
      referencingObject.addItemAsRelationship(newItem);
    }

    this.setItemsDirty(item.referencingObjects, true);

    this.resolveReferencesForItem(newItem);

    if(this.loggingEnabled) {
      console.log(item.uuid, "-->", newItem.uuid);
    }

    /** Set to deleted, then run through mapping function so that observers can be notified */
    item.deleted = true;
    item.content.references = [];
    /**
    * Don't set dirty, because we don't need to sync old item. Alternating uuid only occurs in two cases:
    * 1. Signing in and merging offline data
    * 2. When a uuid-conflict occurs.
    * In both cases, the original item never saves to a server, so doesn't need to be synced.
    * informModelsOfUUIDChangeForItem may set this object to dirty, but we want to undo that here,
    * so that the item gets deleted right away through the mapping function.
    */
    this.setItemDirty(
     item,
     false,
     false,
     MAPPING_SOURCE_LOCAL_SAVED
    );
    const payload = CreatePayloadFromAnyObject({
     object: item,
     source: MAPPING_SOURCE_LOCAL_SAVED
    });
    await this.mapPayloadsToLocalModels({
     payloads: [payload],
     source: MAPPING_SOURCE_LOCAL_SAVED
    });

    this.addItem(newItem);
    this.setItemDirty(newItem, true, true, MAPPING_SOURCE_LOCAL_SAVED);
    this.notifyObserversOfUuidChange(item, newItem);
    return newItem;
  }

   informModelsOfUUIDChangeForItem(newItem, oldUUID, newUUID) {
     // some models that only have one-way relationships might be interested to hear that an item has changed its uuid
     // for example, editors have a one way relationship with notes. When a note changes its UUID, it has no way to inform the editor
     // to update its relationships

     for(let model of this.items) {
       model.potentialItemOfInterestHasChangedItsUUID(newItem, oldUUID, newUUID);
     }
   }

  /* Searching */

  get allItems() {
    return this.items.slice();
  }

  get allNondummyItems() {
    return this.items.filter(function(item){
      return !item.dummy;
    })
  }

  allItemsMatchingTypes(contentTypes) {
    return this.allItems.filter(function(item){
      return (includes(contentTypes, item.content_type) || includes(contentTypes, "*")) && !item.dummy;
    })
  }

  invalidItems() {
    return this.allItems.filter((item) => {
      return item.errorDecrypting;
    });
  }

  validItemsForContentType(contentType) {
    return this.allItems.filter((item) => {
      return item.content_type == contentType && !item.errorDecrypting;
    });
  }

  findItem(itemId) {
    return this.itemsHash[itemId];
  }

  findItems(ids, includeBlanks = false) {
    let results = [];
    for(let id of ids) {
      let item = this.itemsHash[id];
      if(item || includeBlanks) {
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
    let results = items.filter((item) => {
      for(let predicate of predicates)  {
        if(!item.satisfiesPredicate(predicate)) {
          return false;
        }
      }
      return true;
    })

    return results;
  }


  /*
  Archives
  */

  async importItemsFromRaw(externalItems) {
    const payloadsToMap = [];
    /**
     * Get local values before doing any processing. This way, if a note change below modifies a tag,
     * and the tag is going to be iterated on in the same loop, then we don't want this change to be compared
     * to the local value.
     */
    let localValues = {};
    for(const itemData of externalItems) {
      const localItem = this.findItem(itemData.uuid);
      if(!localItem) {
        localValues[itemData.uuid] = {};
        continue;
      }
      const frozenValue = this.duplicateItemWithoutAdding(localItem);
      localValues[itemData.uuid] = {frozenValue, itemRef: localItem};
    }

    for(const itemData of externalItems) {
      const payload = CreatePayloadFromAnyObject({
        object: itemData,
        source: MAPPING_SOURCE_FILE_IMPORT
      });
      const {frozenValue, itemRef} = localValues[itemData.uuid];
      if(frozenValue && !itemRef.errorDecrypting) {
        // if the item already exists, check to see if it's different from the import data.
        // If it's the same, do nothing, otherwise, create a copy.
        const duplicate = await this.createDuplicateItemFromPayload(payload);
        if(!itemData.deleted && !frozenValue.isItemContentEqualWith(duplicate)) {
          // Data differs
          this.addDuplicatedItemAsConflict({duplicate, duplicateOf: itemRef});
          const duplicatePayload = CreateMaxPayloadFromItem({
            item: duplicate
          });
          payloadsToMap.push(duplicatePayload);
        }
      } else {
        // it doesn't exist, push it into items to be mapped
        payloadsToMap.push(payload);
        if(itemRef && itemRef.errorDecrypting) {
          itemRef.errorDecrypting = false;
        }
      }
    }

    const items = await this.mapPayloadsToLocalModels({
      payloads: payloadsToMap,
      source: MAPPING_SOURCE_FILE_IMPORT
    });

    for(const item of items) {
      this.setItemDirty(item, true, false);
      item.deleted = false;
    }

    return items;
  }

  async getAllItemsJSONData(keyParams, returnNullIfEmpty) {
    return this.getJSONDataForItems(this.allItems, keyParams, returnNullIfEmpty);
  }

  async getJSONDataForItems(items, keyParams, returnNullIfEmpty) {
    const intent = keyParams ? EncryptionIntentFileEncrypted : EncryptionIntentFileDecrypted;
    return Promise.all(items.map((item) => {
      return protocolManager.generateItemPayload({
        item: item,
        intent: intent
      })
    })).then((items) => {
      if(returnNullIfEmpty && items.length == 0) {
        return null;
      }
      const data = {
        items: items
      }
      if(keyParams) {
        // auth params are only needed when encrypted with a standard notes key
        data["keyParams"] = keyParams;
      }
      const prettyPrint = 2;
      return JSON.stringify(data, null, prettyPrint);
    })
  }

  humanReadableDisplayForContentType(contentType) {
    return {
      "Note" : "note",
      "Tag" : "tag",
      "SN|SmartTag": "smart tag",
      "Extension" : "action-based extension",
      "SN|Component" : "component",
      "SN|Editor" : "editor",
      "SN|Theme" : "theme",
      "SF|Extension" : "server extension",
      "SF|MFA" : "two-factor authentication setting",
      "SN|FileSafe|Credentials": "FileSafe credential",
      "SN|FileSafe|FileMetadata": "FileSafe file",
      "SN|FileSafe|Integration": "FileSafe integration"
    }[contentType];
  }
}
