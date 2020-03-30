import { ContentTypes } from '@Models/content_types';
import { PayloadSources } from '@Payloads/sources';
import { PayloadOverride } from './../../protocol/payloads/override';
import { PurePayload } from './../../protocol/payloads/pure_payload';
import { deepMerge, hasGetter, Copy, isNullOrUndefined, isString } from '@Lib/utils';
import { SNPredicate } from '@Models/core/predicate';
import { ItemContentsEqual, ItemContentsDiffer } from '@Models/core/functions';
import { ConflictStrategies, CreateMaxPayloadFromAnyObject, PayloadFields } from '@Payloads/index';
import { DEFAULT_APP_DOMAIN } from '@Lib/index';
import { Uuid } from '@Lib/uuid';

export enum SingletonStrategies {
  KeepEarliest = 1
};

export type ContentReference = {
  uuid: string
  content_type: string
}

export type ItemContent = {
  [key: string]: any
  references?: ContentReference[]
}

type Itemable<K extends keyof any, T> = {
  [P in K]: T;
};

/**
 * The most abstract item that any syncable item needs to extend from.
 */
export class SNItem implements Itemable<PayloadFields, any>  {

  public uuid!: string
  public content!: ItemContent
  public deleted!: boolean
  public content_type!: ContentTypes
  public items_key_id!: string
  public enc_item_key!: string
  public created_at!: Date
  public updated_at!: Date
  public dirtiedDate!: Date
  public dirty!: boolean
  public dummy!: boolean
  public errorDecrypting!: boolean
  public waitingForKey!: boolean
  public errorDecryptingValueChanged!: boolean
  public lastSyncBegan!: Date
  public lastSyncEnd!: Date
  public auth_hash!: string /** @deprecated */
  public auth_params!: any /** @deprecated */

  private _client_updated_at?: Date
  private referencedItems!: Record<string, SNItem>
  private referencingItems!: Record<string, SNItem>

  private static sharedDateFormatter: Intl.DateTimeFormat

  constructor(authorized: boolean) {
    if(!authorized) {
      throw Error('Use CreateItemFromPayload to create items');
    }
    this.content = {
      references: [],
      appData: {
        [DEFAULT_APP_DOMAIN]: {}
      }
    };
    this.resetLocalReferencePointers();
  }

  public updateFromPayload(payload: PurePayload) {
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
        (this as any)[field] = copy;
      } else {
        (this as any)[field] = value;
      }
    }

    if (this.content) {
      this.mapContentToLocalProperties(this.content);
    } else if (payload.deleted === true) {
      this.handleDeletedContent();
    }

    if (isString(this.dirtiedDate)) {
      this.dirtiedDate = new Date(this.dirtiedDate);
    }
    if (isString(this.lastSyncBegan)) {
      this.lastSyncBegan = new Date(this.lastSyncBegan);
    }
    if (isString(this.lastSyncEnd)) {
      this.lastSyncEnd = new Date(this.lastSyncEnd);
    }
    if (this.created_at) { this.created_at = new Date(this.created_at); }
    else { this.created_at = new Date(); }
    if (this.updated_at) { this.updated_at = new Date(this.updated_at); }
    else { this.updated_at = new Date(0); } // Epoch

    /** Allows the getter to be re-invoked */
    this._client_updated_at = undefined;

    this.populateDefaultContentValues();

    if (!this.content_type) {
      this.content_type = this.getDefaultContentType()!;
    }
    if (!this.uuid) {
      if (Uuid.canGenSync()) {
        this.uuid = Uuid.GenerateUuidSynchronously();
      }
    }
  }

  public payloadRepresentation(override?: PayloadOverride) {
    return CreateMaxPayloadFromAnyObject(
      this,
      undefined,
      undefined,
      override
    );
  }

  protected getDefaultContentType() : ContentTypes | null {
    return null;
  }

  /**
   * If creating from external payload, it may not include values for .references and .appData
   * Here we want to initialize these values with default values.
   */
  private populateDefaultContentValues() {
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
  public async initUUID() {
    if (!this.uuid) {
      this.uuid = await Uuid.GenerateUuid();
    }
  }

  protected mapContentToLocalProperties(_: ItemContent) {
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
  public collapseContent() {
    const contentCopy = this.structureParams();
    deepMerge(this.content, contentCopy);
    return contentCopy;
  }

  protected structureParams() {
    return this.getContentCopy() || {};
  }

  /* Allows the item to handle the case where the item is deleted and the content is null */
  protected handleDeletedContent() {
    /** Subclasses can override */
  }

  public setDirty(
    dirty: boolean,
    updateClientDate: boolean,
    authorized: boolean
  ) {
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
  public updateLocalRelationships() {
    const references = this.content.references;
    const uuids = references!.map((ref) => { return ref.uuid; });
    const existingUuids = Object.keys(this.referencedItems);

    for (const uuid of existingUuids) {
      const ref = this.referencedItems[uuid];
      if (!uuids.includes(ref.uuid)) {
        delete this.referencedItems[uuid];
        ref.setIsNoLongerReferencedBy(this);
      }
    }
  }

  public addItemAsRelationship(item: SNItem) {
    item.setIsBeingReferencedBy(this);
    if (!this.referencedItems[item.uuid]) {
      this.referencedItems[item.uuid] = item;
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

  public removeItemAsRelationship(item: SNItem) {
    item.setIsNoLongerReferencedBy(this);
    this.removeReferenceWithUuid(item.uuid);
    delete this.referencedItems[item.uuid];
  }

  /**
   * When another object has a relationship with us, we push that object
   * into memory here. We use this so that when `this` is deleted, we're able
   * to update the references of those other objects.
   */
  protected setIsBeingReferencedBy(item: SNItem) {
    if (!this.referencingItems[item.uuid]) {
      this.referencingItems[item.uuid] = item;
    }
  }

  public setIsNoLongerReferencedBy(item: SNItem) {
    delete this.referencingItems[item.uuid];
  }

  protected removeReferenceWithUuid(uuid: string) {
    let references = this.content.references || [];
    references = references.filter((r) => r.uuid !== uuid);
    this.content.references = references;
    delete this.referencedItems[uuid];
  }

  public hasRelationshipWithItem(item: SNItem) {
    const target = this.content.references!.find((r) => {
      return r.uuid === item.uuid;
    });
    return !isNullOrUndefined(target);
  }

  public isBeingRemovedLocally() {
    for (const uuid of Object.keys(this.referencedItems)) {
      const item = this.referencedItems[uuid];
      item.setIsNoLongerReferencedBy(this);
    }
  }

  /** The number of items this item currently references */
  private get referencedItemsCount() {
    return Object.keys(this.referencedItems).length;
  }

  /** The number of items that currently reference this item */
  private get referencingItemsCount() {
    return Object.keys(this.referencingItems).length;
  }

  public get allReferencingItems() {
    return Object.keys(this.referencingItems)
      .map((uuid) => this.referencingItems[uuid]);
  }

  private get allReferencedItems() {
    return Object.keys(this.referencedItems)
      .map((uuid) => this.referencedItems[uuid]);
  }

  public resetLocalReferencePointers() {
    this.referencingItems = {};
    this.referencedItems = {};
  }

  public didCompleteMapping(_: PayloadSources) {
    for (const item of this.allReferencedItems) {
      item.referencingItemCompletedMapping(this);
    }
  }

  public referencingItemCompletedMapping(item: SNItem) {

  }

  public setDomainDataItem(key: string, value: any, domain: string) {
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

  public getDomainDataItem(key: string, domain: string) {
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

  public setAppDataItem(key: string, value: any) {
    this.setDomainDataItem(key, value, DEFAULT_APP_DOMAIN);
  }

  public getAppDataItem(key: string) {
    return this.getDomainDataItem(key, DEFAULT_APP_DOMAIN);
  }

  public get pinned() {
    return this.getAppDataItem('pinned');
  }

  public get archived() {
    return this.getAppDataItem('archived');
  }

  public get locked() {
    return this.getAppDataItem('locked');
  }

  private hasRawClientUpdatedAtValue() {
    return this.getAppDataItem('client_updated_at') != null;
  }

  // eslint-disable-next-line camelcase
  public get client_updated_at() {
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
  public set client_updated_at(date: Date) {
    this._client_updated_at = date;
    this.setAppDataItem('client_updated_at', date);
  }

  /**
   * During sync conflicts, when determing whether to create a duplicate for an item, 
   * we can omit keys that have no meaningful weight and can be ignored. For example, 
   * if one component has active = true and another component has active = false, 
   * it would be needless to duplicate them, so instead we ignore that value.
   */
  public contentKeysToIgnoreWhenCheckingEquality() {
    return ['conflict_of'];
  }

  /** Same as `contentKeysToIgnoreWhenCheckingEquality`, but keys inside appData[Item.AppDomain] */
  public appDatacontentKeysToIgnoreWhenCheckingEquality() {
    return ['client_updated_at'];
  }

  public getContentCopy() {
    const contentCopy = JSON.parse(JSON.stringify(this.content));
    return contentCopy;
  }

  /** Whether the item has never been synced to a server */
  public get neverSynced() {
    return !this.updated_at || this.updated_at.getTime() === 0;
  }

  /**
   * Subclasses can override this getter to return true if they want only
   * one of this item to exist, depending on custom criteria.
   */
  public get isSingleton() {
    return false;
  }

  /** The predicate by which singleton items should be unique */
  public get singletonPredicate() : SNPredicate {
    throw 'Must override SNItem.singletonPredicate';
  }

  public get singletonStrategy() {
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
  public strategyWhenConflictingWithItem(item: SNItem) {
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

  public isItemContentEqualWith(otherItem: SNItem) {
    return ItemContentsEqual(
      this.content,
      otherItem.content,
      this.contentKeysToIgnoreWhenCheckingEquality(),
      this.appDatacontentKeysToIgnoreWhenCheckingEquality()
    );
  }

  public satisfiesPredicate(predicate: SNPredicate) {
    return SNPredicate.ItemSatisfiesPredicate(this, predicate);
  }

  public createdAtString() {
    return this.dateToLocalizedString(this.created_at);
  }

  public updatedAtString() {
    return this.dateToLocalizedString(this.client_updated_at);
  }

  public updatedAtTimestamp() {
    return this.updated_at.getTime();
  }

  private dateToLocalizedString(date: Date) {
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