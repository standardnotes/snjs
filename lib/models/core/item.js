import find from 'lodash/find';
import remove from 'lodash/remove';
import { deepMerge, hasGetter, Copy } from '@Lib/utils';
import { SFPredicate } from '@Models/core/predicate'
import * as fields from '@Protocol/payloads/fields';
import * as strategies from '@Protocol/payloads/deltas/strategies';
import {ItemContentsEqual, ItemContentsDiffer} from '@Models/core/functions';
import { CreateMaxPayloadFromAnyObject } from '@Protocol/payloads/generator';

let dateFormatter;

export class SFItem {

  /**
   * Dynamically feed both a syncronous and asyncronous implementation of a UUID generator function.
   * Feeding it this way allows platforms to implement their own uuid generation schemes, without
   * this class having to import any global functions.
   * @param syncImpl  A syncronous function that returns a UUID.
   * @param asyncImpl  An asyncronous function that returns a UUID.
   */
  static SetUuidGenerators({syncImpl, asyncImpl}) {
    this.syncUuidFunc = syncImpl;
    this.asyncUuidFunc = asyncImpl;
  }

  /**
   * A default async implementation of uuid generation.
   */
  static async GenerateUuid() {
    if(this.syncUuidFunc) {
      return this.syncUuidFunc();
    } else {
      return this.asyncUuidFunc();
    }
  }

  /**
   * A default sync implementation of uuid generation.
   */
  static GenerateUuidSynchronously() {
    return this.syncUuidFunc();
  }

  constructor(payload) {
    this.content = {
      references: [],
      appData: {}
    };

    this.resetLocalReferencePointers();

    if(payload) {
      if(!payload.isPayload) {
        throw 'Attempting to construct SFItem from non-payload object.';
      }
      this.updateFromPayload(payload);
    }

    if(!this.errorDecrypting) {
      this.populateDefaultContentValues();
    }

    if(!this.uuid) {
      if(SFItem.syncUuidFunc) {
        this.uuid = SFItem.syncUuidFunc();
      }
    }
  }

  payloadRepresentation({override} = {}) {
    return CreateMaxPayloadFromAnyObject({
      object: this,
      override: override
    })
  }

  /**
   * If creating from external payload, it may not include values for .references and .appData
   * Here we want to initialize these values with default values.
   */
  populateDefaultContentValues() {
    if(this.errorDecrypting) {
      return;
    }

    if(!this.content.references) {
      this.content.references = [];
    }

    if(!this.content.appData) {
      this.content.appData = {};
      this.content.appData[SFItem.AppDomain] = {};
    }
  }

  /**
   * Consumers who create items without a syncronous UUID generation function
   * must manually call this function when creating an item. The consumer must
   * have previously called SFItem.SetUuidGenerators.
   */
  async initUUID() {
    if(!this.uuid) {
      this.uuid = await SFItem.asyncUuidFunc();
    }
  }

  updateFromPayload(payload) {
    if(!payload) {
      return;
    }

    const fieldsToCopy = [
      fields.ITEM_PAYLOAD_CONTENT
    ]

    for(const field of payload.fields()) {
      if(hasGetter(this, field)) {
        continue;
      }
      const value = payload[field];
      if(fieldsToCopy.includes(field))  {
        const copy = Copy(value);
        this[field] = copy;
      } else {
        this[field] = value;
      }
    }

    if(this.content) {
      this.mapContentToLocalProperties(this.content);
    } else if(payload.deleted === true) {
      this.handleDeletedContent();
    }

    if(this.dirtiedDate && typeof this.dirtiedDate === 'string') {
      this.dirtiedDate = new Date(this.dirtiedDate);
    }

    if(this.created_at) { this.created_at = new Date(this.created_at);}
    else { this.created_at = new Date();}

    if(this.updated_at) { this.updated_at = new Date(this.updated_at);}
    else { this.updated_at = new Date(0);} // Epoch

    /** Allows the getter to be re-invoked */
    this._client_updated_at = null;
  }

  mapContentToLocalProperties(content) {
    /** Optional override */
  }

  /**
   * Merges any fields we get from `this.structureParams` into our .content object.
   * Subclasses can override `structureParams`, and add their own custom content
   * and properties to the object returned from `structureParams`.
   * These are properties that this superclass will not be aware of,
   * like `title` or `text`. When we call `collapseContent`, we want to update
   * our own inherit 'content' field with the values returned from structureParams,
   * so that our content field is up to date. Each subclass will call
   * `super.structureParams` and merge it with its own custom result object.
   * Since our own `structureParams` gets a real-time copy of our content,
   * it should be safe to merge the aggregate value back into our own content field.
   */
  collapseContent() {
    let contentCopy = this.structureParams();
    deepMerge(this.content, contentCopy);
    return contentCopy;
  }

  structureParams() {
    return this.getContentCopy();
  }

  /** Allows consumers to check if object is an SFItem subclass and not a generic JS object */
  get isItem() {
    return true;
  }

  /* Allows the item to handle the case where the item is deleted and the content is null */
  handleDeletedContent() {
    /** Subclasses can override */
  }

  setDirty({dirty, updateClientDate, authorized}) {
    if(!authorized) {
      throw 'Do not call setDirty directly. Use modelManager.setItemDirty';
    }

    this.dirty = dirty;


    // Allows the syncManager to check if an item has been marked dirty after a sync has been started
    // This prevents it from clearing it as a dirty item after sync completion, if someone else has marked it dirty
    // again after an ongoing sync.
    if(!this.dirtyCount) { this.dirtyCount = 0; }
    if(dirty) {
      this.dirtyCount++;
    } else {
      this.dirtyCount = 0;
    }

    // Used internally by syncManager to determine if a dirted item needs to be saved offline.
    // You want to set this in both cases, when dirty is true and false. If it's false, we still need
    // to save it to disk as an update.
    this.dirtiedDate = new Date();

    if(dirty && updateClientDate) {
      // Set the client modified date to now if marking the item as dirty
      this.client_updated_at = new Date();
    } else if(!this.hasRawClientUpdatedAtValue()) {
      // if we don't have an explcit raw value, we initialize client_updated_at.
      this.client_updated_at = new Date(this.updated_at);
    }

    this.collapseContent();
  }

  updateLocalRelationships() {
    var references = this.content.references;
    const newUuids = references.map((ref) => {return ref.uuid});
    for(let uuid of Object.keys(this._referencedItems)) {
      const currentReferencedItem = this._referencedItems[uuid];
      if(!newUuids.includes(currentReferencedItem.uuid)) {
        delete this._referencedItems[uuid];
        currentReferencedItem.setIsNoLongerBeingReferencedBy(this);
      }
    }
  }

  addItemAsRelationship(item) {
    item.setIsBeingReferencedBy(this);

    if(!this._referencedItems[item.uuid]) {
      this._referencedItems[item.uuid] = item;
    }

    if(this.hasRelationshipWithItem(item)) {
      return;
    }

    const references = this.content.references || [];
    references.push({
      uuid: item.uuid,
      content_type: item.content_type
    })
    this.content.references = references;
  }

  removeItemAsRelationship(item) {
    item.setIsNoLongerBeingReferencedBy(this);
    this.removeReferenceWithUuid(item.uuid);
    delete this._referencedItems[item.uuid];
  }

  // When another object has a relationship with us, we push that object into memory here.
  // We use this so that when `this` is deleted, we're able to update the references of those other objects.
  setIsBeingReferencedBy(item) {
    if(!this._referencingItems[item.uuid]) {
      this._referencingItems[item.uuid] = item;
    }
  }

  setIsNoLongerBeingReferencedBy(item) {
    delete this._referencingItems[item.uuid];
  }

  removeReferenceWithUuid(uuid) {
    var references = this.content.references || [];
    references = references.filter((r) => {return r.uuid != uuid});
    this.content.references = references;
    delete this._referencedItems[uuid];
  }

  hasRelationshipWithItem(item) {
    let target = this.content.references.find((r) => {
      return r.uuid == item.uuid;
    });
    return target != null;
  }

  isBeingRemovedLocally() {
    for(let uuid of Object.keys(this._referencedItems)) {
      const item = this._referencedItems[uuid];
      item.setIsNoLongerBeingReferencedBy(this);
    }
  }

  /** The number of items this item currently references */
  get referencedItemsCount() {
    return Object.keys(this._referencedItems).length;
  }

  /** The number of items that currently reference this item */
  get referencingItemsCount() {
    return Object.keys(this._referencingItems).length;
  }

  get allReferencingItems() {
    return Object.keys(this._referencingItems).map((uuid) => this._referencingItems[uuid]);
  }

  resetLocalReferencePointers() {
    this._referencingItems = {};
    this._referencedItems = {};
  }

  didFinishSyncing() {

  }

  doNotEncrypt() {
    return false;
  }

  /*
  App Data
  */

  setDomainDataItem(key, value, domain) {
    if(!domain) {
      console.error("SFItem.AppDomain needs to be set.");
      return;
    }

    if(this.errorDecrypting) {
      return;
    }

    if(!this.content.appData) {
      this.content.appData = {};
    }

    let data = this.content.appData[domain];
    if(!data) {
      data = {}
    }
    data[key] = value;
    this.content.appData[domain] = data;
  }

  getDomainDataItem(key, domain) {
    if(!domain) {
      console.error("SFItem.AppDomain needs to be set.");
      return;
    }

    if(this.errorDecrypting) {
      return;
    }

    if(!this.content.appData) {
      this.content.appData = {};
    }

    var data = this.content.appData[domain];
    if(data) {
      return data[key];
    } else {
      return null;
    }
  }

  setAppDataItem(key, value) {
    this.setDomainDataItem(key, value, SFItem.AppDomain);
  }

  getAppDataItem(key) {
    return this.getDomainDataItem(key, SFItem.AppDomain);
  }

  get pinned() {
    return this.getAppDataItem("pinned");
  }

  get archived() {
    return this.getAppDataItem("archived");
  }

  get locked() {
    return this.getAppDataItem("locked");
  }

  /**
   * May be used by clients to display the human readable type for this item.
   * Should be overriden by subclasses.
   */
  get displayName() {
    return "Item";
  }

  hasRawClientUpdatedAtValue() {
    return this.getAppDataItem("client_updated_at") != null;
  }

  get client_updated_at() {
    if(!this._client_updated_at) {
      var saved = this.getAppDataItem("client_updated_at");
      if(saved) {
        this._client_updated_at = new Date(saved);
      } else {
        this._client_updated_at = new Date(this.updated_at);
      }
    }
    return this._client_updated_at;
  }

  set client_updated_at(date) {
    this._client_updated_at = date;
    this.setAppDataItem("client_updated_at", date);
  }

  /*
    During sync conflicts, when determing whether to create a duplicate for an item, we can omit keys that have no
    meaningful weight and can be ignored. For example, if one component has active = true and another component has active = false,
    it would be silly to duplicate them, so instead we ignore this.
   */
  contentKeysToIgnoreWhenCheckingEquality() {
    return ['conflict_of'];
  }

  // Same as above, but keys inside appData[Item.AppDomain]
  appDatacontentKeysToIgnoreWhenCheckingEquality() {
    return ['client_updated_at'];
  }

  getContentCopy() {
    let contentCopy = JSON.parse(JSON.stringify(this.content));
    return contentCopy;
  }

  /**
   * Subclasses can override this method and provide their own opinion on whether
   * they want to be duplicated. For example, if this.content.x = 12 and
   * item.content.x = 13, this function can be overriden to always return
   * CONFLICT_STRATEGY_KEEP_LEFT to say "don't create a duplicate at all, the
   * change is not important."
   *
   * In the default implementation, we create a duplicate if content differs.
   * However, if they only differ by references, we KEEP_LEFT_MERGE_REFS.
   */
  strategyWhenConflictingWithItem({item}) {
    if(this.errorDecrypting) {
      return CONFLICT_STRATEGY_KEEP_LEFT_DUPLICATE_RIGHT;
    }
    /**
      * The number of seconds in between changes to constitue a
      * subjective measure of what we think is active editing of an item
      */
    const IS_ACTIVELY_EDITING_THRESHOLD = 10;
    function ItemIsBeingActivelyEdited(item) {
      const isEpoch = item.client_updated_at.getTime() === 0;
      if(!item.client_updated_at) {
        return false;
      }
      return (new Date() - item.client_updated_at) / 1000 < IS_ACTIVELY_EDITING_THRESHOLD;
    }

    if(this.deleted || item.deleted) {
      return strategies.CONFLICT_STRATEGY_KEEP_RIGHT;
    }
    const contentDiffers = ItemContentsDiffer(this, item);
    if(!contentDiffers) {
      return strategies.CONFLICT_STRATEGY_KEEP_RIGHT;
    }
    const differsExclRefs = ItemContentsDiffer(
      this,
      item,
      ['references']
    );
    if(differsExclRefs) {
      return strategies.CONFLICT_STRATEGY_KEEP_LEFT_DUPLICATE_RIGHT;
      /** Has differences beyond just references */
      // const isActivelyEdited = ItemIsBeingActivelyEdited(this);
      // if(isActivelyEdited) {
      // } else {
      //   return strategies.CONFLICT_STRATEGY_DUPLICATE_LEFT_KEEP_RIGHT;
      // }
    } else {
      /** Is only references change */
      return strategies.CONFLICT_STRATEGY_KEEP_LEFT_MERGE_REFS;
    }
  }

  isItemContentEqualWith(otherItem) {
    return ItemContentsEqual({
      leftContent: this.content,
      rightContent: otherItem.content,
      keysToIgnore: this.contentKeysToIgnoreWhenCheckingEquality(),
      appDataKeysToIgnore: this.appDatacontentKeysToIgnoreWhenCheckingEquality()
    })
  }

  satisfiesPredicate(predicate) {
    return SFPredicate.ItemSatisfiesPredicate(this, predicate);
  }

  /*
  Dates
  */

  createdAtString() {
    return this.dateToLocalizedString(this.created_at);
  }

  updatedAtString() {
    return this.dateToLocalizedString(this.client_updated_at);
  }

  updatedAtTimestamp() {
    return this.updated_at.getTime();
  }

  dateToLocalizedString(date) {
    if(typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      if(!dateFormatter) {
        const locale = (
          (navigator.languages && navigator.languages.length)
          ? navigator.languages[0]
          : navigator.language
        );
        dateFormatter = new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          weekday: 'long',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      return dateFormatter.format(date);
    } else {
      // IE < 11, Safari <= 9.0.
      // In English, this generates the string most similar to
      // the toLocaleDateString() result above.
      return date.toDateString() + ' ' + date.toLocaleTimeString();
    }
  }
}
