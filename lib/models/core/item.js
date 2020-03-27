import { deepMerge, hasGetter, Copy, isNullOrUndefined } from '@Lib/utils';
import { SNPredicate } from '@Models/core/predicate';
import { ItemContentsEqual, ItemContentsDiffer } from '@Models/core/functions';
import { ConflictStrategies, CreateMaxPayloadFromAnyObject, PayloadFields } from '@Payloads';
import { DEFAULT_APP_DOMAIN } from '@Lib';
import { Uuid } from '@Lib/uuid';

export const SingletonStrategies = {
  KeepEarliest: 1
};

/**
 * The most abstract item that any syncable item needs to extend from.
 */
export class SNItem {
  constructor(payload) {
    this.content = {
      references: [],
      appData: {
        [DEFAULT_APP_DOMAIN]: {}
      }
    };

    this.resetLocalReferencePointers();

    if (payload) {
      if (!payload.isPayload) {
        throw `Attempting to construct SNItem from non-payload object ${payload}.`;
      }
      this.updateFromPayload(payload);
    }

    if (!this.uuid) {
      if (Uuid.canGenSync()) {
        this.uuid = Uuid.GenerateUuidSynchronously();
      }
    }
  }

  payloadRepresentation({ override } = {}) {
    return CreateMaxPayloadFromAnyObject({
      object: this,
      override: override
    });
  }

  /**
   * If creating from external payload, it may not include values for .references and .appData
   * Here we want to initialize these values with default values.
   */
  populateDefaultContentValues() {
    if (this.errorDecrypting || this.deleted) {
      return;
    }

    if (!this.content.references) {
      this.content.references = [];
    }

    if (!this.content.appData) {
      this.content.appData = {
        [DEFAULT_APP_DOMAIN]: {}
      };
    }
  }

  /**
   * Consumers who create items without a syncronous UUID generation function
   * must manually call this function when creating an item. The consumer must
   * have previously called Uuid.SetGenerators.
   */
  async initUUID() {
    if (!this.uuid) {
      this.uuid = await SNItem.GenerateUuid();
    }
  }

  updateFromPayload(payload) {
    if (!payload) {
      return;
    }

    const fieldsToCopy = [
      PayloadFields.Content
    ];

    for (const field of payload.fields()) {
      if (hasGetter(this, field)) {
        continue;
      }
      const value = payload[field];
      if (fieldsToCopy.includes(field)) {
        const copy = Copy(value || null);
        this[field] = copy;
      } else {
        this[field] = value;
      }
    }

    if (this.content) {
      this.mapContentToLocalProperties(this.content);
    } else if (payload.deleted === true) {
      this.handleDeletedContent();
    }

    if (this.dirtiedDate && typeof this.dirtiedDate === 'string') {
      this.dirtiedDate = new Date(this.dirtiedDate);
    }
    if (this.lastSyncBegan && typeof this.lastSyncBegan === 'string') {
      this.lastSyncBegan = new Date(this.lastSyncBegan);
    }
    if (this.lastSyncEnd && typeof this.lastSyncEnd === 'string') {
      this.lastSyncEnd = new Date(this.lastSyncEnd);
    }
    if (this.created_at) { this.created_at = new Date(this.created_at); }
    else { this.created_at = new Date(); }
    if (this.updated_at) { this.updated_at = new Date(this.updated_at); }
    else { this.updated_at = new Date(0); } // Epoch

    /** Allows the getter to be re-invoked */
    this._client_updated_at = null;

    this.populateDefaultContentValues();
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
    const contentCopy = this.structureParams();
    deepMerge(this.content, contentCopy);
    return contentCopy;
  }

  structureParams() {
    return this.getContentCopy() || {};
  }

  /** Allows consumers to check if object is an SNItem subclass and not a generic JS object */
  get isItem() {
    return true;
  }

  /* Allows the item to handle the case where the item is deleted and the content is null */
  handleDeletedContent() {
    /** Subclasses can override */
  }

  setDirty({ dirty, updateClientDate, authorized }) {
    if (!authorized) {
      throw 'Do not call setDirty directly. Use modelManager.setItemDirty';
    }

    this.dirty = dirty;
    this.dirtiedDate = new Date();

    if (dirty && updateClientDate) {
      // Set the client modified date to now if marking the item as dirty
      this.client_updated_at = new Date();
    } else if (!this.hasRawClientUpdatedAtValue()) {
      // if we don't have an explcit raw value, we initialize client_updated_at.
      this.client_updated_at = new Date(this.updated_at);
    }

    this.collapseContent();
  }

  /**
   * Loops through all memory-based referenced items and checks to see
   * if they're in our content.references. If not, we remove them from
   * our memory state.
   */
  updateLocalRelationships() {
    const references = this.content.references;
    const uuids = references.map((ref) => { return ref.uuid; });
    const existingUuids = Object.keys(this._referencedItems);

    for (const uuid of existingUuids) {
      const ref = this._referencedItems[uuid];
      if (!uuids.includes(ref.uuid)) {
        delete this._referencedItems[uuid];
        ref.setIsNoLongerReferencedBy(this);
      }
    }
  }

  addItemAsRelationship(item) {
    item.setIsBeingReferencedBy(this);

    if (!this._referencedItems[item.uuid]) {
      this._referencedItems[item.uuid] = item;
    }
    if (this.hasRelationshipWithItem(item)) {
      return;
    }
    const references = this.content.references || [];
    references.push({
      uuid: item.uuid,
      content_type: item.content_type
    });
    this.content.references = references;
  }

  removeItemAsRelationship(item) {
    item.setIsNoLongerReferencedBy(this);
    this.removeReferenceWithUuid(item.uuid);
    delete this._referencedItems[item.uuid];
  }

  /**
   * When another object has a relationship with us, we push that object
   * into memory here. We use this so that when `this` is deleted, we're able
   * to update the references of those other objects.
   */
  setIsBeingReferencedBy(item) {
    if (!this._referencingItems[item.uuid]) {
      this._referencingItems[item.uuid] = item;
    }
  }

  setIsNoLongerReferencedBy(item) {
    delete this._referencingItems[item.uuid];
  }

  removeReferenceWithUuid(uuid) {
    let references = this.content.references || [];
    references = references.filter((r) => r.uuid !== uuid);
    this.content.references = references;
    delete this._referencedItems[uuid];
  }

  hasRelationshipWithItem(item) {
    const target = this.content.references.find((r) => {
      return r.uuid === item.uuid;
    });
    return !isNullOrUndefined(target);
  }

  isBeingRemovedLocally() {
    for (const uuid of Object.keys(this._referencedItems)) {
      const item = this._referencedItems[uuid];
      item.setIsNoLongerReferencedBy(this);
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
    return Object.keys(this._referencingItems)
      .map((uuid) => this._referencingItems[uuid]);
  }

  resetLocalReferencePointers() {
    this._referencingItems = {};
    this._referencedItems = {};
  }

  didCompleteMapping(source) {
    /** Optional override */
  }

  /* App Data */

  setDomainDataItem(key, value, domain) {
    if (!domain) {
      console.error('DEFAULT_APP_DOMAIN needs to be set.');
      return;
    }

    if (this.errorDecrypting) {
      return;
    }

    if (!this.content.appData) {
      this.content.appData = {};
    }

    let data = this.content.appData[domain];
    if (!data) {
      data = {};
    }
    data[key] = value;
    this.content.appData[domain] = data;
  }

  getDomainDataItem(key, domain) {
    if (!domain) {
      console.error('DEFAULT_APP_DOMAIN needs to be set.');
      return;
    }
    if (this.errorDecrypting) {
      return;
    }
    if (!this.content.appData) {
      this.content.appData = {};
    }
    const data = this.content.appData[domain];
    if (data) {
      return data[key];
    } else {
      return null;
    }
  }

  setAppDataItem(key, value) {
    this.setDomainDataItem(key, value, DEFAULT_APP_DOMAIN);
  }

  getAppDataItem(key) {
    return this.getDomainDataItem(key, DEFAULT_APP_DOMAIN);
  }

  get pinned() {
    return this.getAppDataItem('pinned');
  }

  get archived() {
    return this.getAppDataItem('archived');
  }

  get locked() {
    return this.getAppDataItem('locked');
  }

  hasRawClientUpdatedAtValue() {
    return this.getAppDataItem('client_updated_at') != null;
  }

  // eslint-disable-next-line camelcase
  get client_updated_at() {
    if (!this._client_updated_at) {
      const saved = this.getAppDataItem('client_updated_at');
      if (saved) {
        this._client_updated_at = new Date(saved);
      } else {
        this._client_updated_at = new Date(this.updated_at);
      }
    }
    return this._client_updated_at;
  }

  // eslint-disable-next-line camelcase
  set client_updated_at(date) {
    this._client_updated_at = date;
    this.setAppDataItem('client_updated_at', date);
  }

  /**
   * During sync conflicts, when determing whether to create a duplicate for an item, 
   * we can omit keys that have no meaningful weight and can be ignored. For example, 
   * if one component has active = true and another component has active = false, 
   * it would be needless to duplicate them, so instead we ignore that value.
   */
  contentKeysToIgnoreWhenCheckingEquality() {
    return ['conflict_of'];
  }

  /** Same as `contentKeysToIgnoreWhenCheckingEquality`, but keys inside appData[Item.AppDomain] */
  appDatacontentKeysToIgnoreWhenCheckingEquality() {
    return ['client_updated_at'];
  }

  getContentCopy() {
    const contentCopy = JSON.parse(JSON.stringify(this.content));
    return contentCopy;
  }

  /** Whether the item has never been synced to a server */
  get neverSynced() {
    return !this.updated_at || this.updated_at.getTime() === 0;
  }

  /**
   * Subclasses can override this getter to return true if they want only
   * one of this item to exist, depending on custom criteria.
   */
  get isSingleton() {
    return false;
  }

  /** The predicate by which singleton items should be unique */
  get singletonPredicate() {
    throw 'Must override SNItem.singletonPredicate';
  }

  get singletonStrategy() {
    return SingletonStrategies.KeepEarliest;
  }

  /**
   * Subclasses can override this method and provide their own opinion on whether
   * they want to be duplicated. For example, if this.content.x = 12 and
   * item.content.x = 13, this function can be overriden to always return
   * ConflictStrategies.KeepLeft to say 'don't create a duplicate at all, the
   * change is not important.'
   *
   * In the default implementation, we create a duplicate if content differs.
   * However, if they only differ by references, we KEEP_LEFT_MERGE_REFS.
   */
  strategyWhenConflictingWithItem({ item }) {
    if (this.errorDecrypting) {
      return ConflictStrategies.KeepLeftDuplicateRight;
    }
    if (this.isSingleton) {
      return ConflictStrategies.KeepLeft;
    }
    if (this.deleted || item.deleted) {
      return ConflictStrategies.KeepRight;
    }
    const contentDiffers = ItemContentsDiffer(this, item);
    if (!contentDiffers) {
      return ConflictStrategies.KeepRight;
    }
    const differsExclRefs = ItemContentsDiffer(
      this,
      item,
      ['references']
    );
    if (differsExclRefs) {
      return ConflictStrategies.KeepLeftDuplicateRight;
    } else {
      /** Is only references change */
      return ConflictStrategies.KeepLeftMergeRefs;
    }
  }

  isItemContentEqualWith(otherItem) {
    return ItemContentsEqual({
      leftContent: this.content,
      rightContent: otherItem.content,
      keysToIgnore: this.contentKeysToIgnoreWhenCheckingEquality(),
      appDataKeysToIgnore: this.appDatacontentKeysToIgnoreWhenCheckingEquality()
    });
  }

  satisfiesPredicate(predicate) {
    return SNPredicate.ItemSatisfiesPredicate(this, predicate);
  }

  /** Dates */

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
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      if (!SNItem.sharedDateFormatter) {
        const locale = (
          (navigator.languages && navigator.languages.length)
            ? navigator.languages[0]
            : navigator.language
        );
        SNItem.sharedDateFormatter = new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          weekday: 'long',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      return SNItem.sharedDateFormatter.format(date);
    } else {
      // IE < 11, Safari <= 9.0.
      // In English, this generates the string most similar to
      // the toLocaleDateString() result above.
      return date.toDateString() + ' ' + date.toLocaleTimeString();
    }
  }
}
