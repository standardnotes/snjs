import { PayloadFormat } from './../../protocol/payloads/formats';
import { ConflictStrategy } from '@Protocol/payloads/deltas/strategies';
import { UuidString } from './../../types';
import { PayloadContent } from './../../protocol/payloads/generator';
import { PayloadOverride, CopyPayload } from '@Payloads/generator';
import { PurePayload } from './../../protocol/payloads/pure_payload';
import { deepFreeze, Copy, sortedCopy, omitInPlace } from '@Lib/utils';
import { SNPredicate } from '@Models/core/predicate';
import { DefaultAppDomain } from '../content_types';
import { PayloadByMerging } from '@Lib/protocol/payloads/generator';
import { PayloadSource } from '@Lib/protocol/payloads/sources';

export enum MutationType {
  /**
   * The item was changed as part of a user interaction. This means that the item's
   * user modified date will be updated
   */
  UserInteraction = 1,
  /**
   * The item was changed as part of an internal operation, such as a migration.
   * This change will not updated the item's user modified date
   */
  Internal = 2,
  /**
   * The item was changed as part of an internal function that wishes to modify
   * internal item properties, such as lastSyncBegan, without modifying the item's dirty
   * state. By default all other mutation types will result in a dirtied result.
   */
  NonDirtying = 3,
}

export enum AppDataField {
  Pinned = 'pinned',
  Archived = 'archived',
  Locked = 'locked',
  UserModifiedDate = 'client_updated_at',
  DefaultEditor = 'defaultEditor',
  MobileRules = 'mobileRules',
  NotAvailableOnMobile = 'notAvailableOnMobile',
  MobileActive = 'mobileActive',
  LastSize = 'lastSize',
  PrefersPlainEditor = 'prefersPlainEditor',
  ComponentInstallError = 'installError'
}

type AppData = {
  [key in AppDataField]?: any
}

export enum SingletonStrategy {
  KeepEarliest = 1
};

/**
 * The most abstract item that any syncable item needs to extend from.
 */
export class SNItem {

  public readonly payload: PurePayload
  public readonly conflictOf?: UuidString
  public readonly createdAtString?: string
  public readonly updatedAtString?: string
  public readonly protected = false
  public readonly trashed = false
  public readonly pinned = false
  public readonly archived = false
  public readonly locked = false
  public readonly userModifiedDate: Date
  private static sharedDateFormatter: Intl.DateTimeFormat

  constructor(payload: PurePayload) {
    if (!payload.uuid || !payload.content_type) {
      throw Error('Cannot create item without both uuid and content_type');
    }
    if (
      payload.format === PayloadFormat.DecryptedBareObject &&
      (payload.enc_item_key || payload.items_key_id || payload.auth_hash)
    ) {
      throw Error('Creating an item from a decrypted payload should not contain enc params');
    }
    this.payload = payload;
    this.conflictOf = payload.safeContent.conflict_of;
    this.createdAtString = this.created_at && this.dateToLocalizedString(this.created_at);
    if (payload.format === PayloadFormat.DecryptedBareObject) {
      this.userModifiedDate = new Date(this.getAppDomainValue(AppDataField.UserModifiedDate) || this.updated_at);
      this.updatedAtString = this.dateToLocalizedString(this.userModifiedDate);
      this.protected = this.payload.safeContent.protected;
      this.trashed = this.payload.safeContent.trashed;
      this.pinned = this.getAppDomainValue(AppDataField.Pinned);
      this.archived = this.getAppDomainValue(AppDataField.Archived);
      this.locked = this.getAppDomainValue(AppDataField.Locked);
    } else {
      this.userModifiedDate = this.updated_at;
    }
    /** Allow the subclass constructor to complete initialization before deep freezing */
    setImmediate(() => {
      deepFreeze(this);
    })
  }

  public static DefaultAppDomain() {
    return DefaultAppDomain;
  }

  get uuid() {
    return this.payload.uuid!;
  }

  get content() {
    return this.payload.content;
  }

  get safeContent() {
    return this.payload.safeContent;
  }

  get references() {
    return this.payload.safeContent.references || [];
  }

  get deleted() {
    return this.payload.deleted;
  }

  get content_type() {
    return this.payload.content_type!;
  }

  get created_at() {
    return this.payload.created_at!;
  }

  get updated_at() {
    return this.payload.updated_at!;
  }

  get dirtiedDate() {
    return this.payload.dirtiedDate;
  }

  get dirty() {
    return this.payload.dirty;
  }

  get errorDecrypting() {
    return this.payload.errorDecrypting;
  }

  get waitingForKey() {
    return this.payload.waitingForKey;
  }

  get errorDecryptingValueChanged() {
    return this.payload.errorDecryptingValueChanged;
  }

  get lastSyncBegan() {
    return this.payload.lastSyncBegan;
  }

  get lastSyncEnd() {
    return this.payload.lastSyncEnd;
  }

  /** @deprecated */
  get auth_hash() {
    return this.payload.auth_hash;
  }

  /** @deprecated */
  get auth_params() {
    return this.payload.auth_params;
  }

  public payloadRepresentation(override?: PayloadOverride) {
    return CopyPayload(this.payload, override);
  }

  public hasRelationshipWithItem(item: SNItem) {
    const target = this.payload.safeContent.references?.find((r) => {
      return r.uuid === item.uuid;
    });
    return !!target;
  }

  /**
   * Inside of content is a record called `appData` (which should have been called `domainData`).
   * It was named `appData` as a way to indicate that it can house data for multiple apps.
   * Each key of appData is a domain string, which was originally designed
   * to allow for multiple 3rd party apps who share access to the same data to store data
   * in an isolated location. This design premise is antiquited and no longer pursued,
   * however we continue to use it as not to uncesesarily create a large data migration
   * that would require users to sync all their data.
   *
   * domainData[DomainKey] will give you another Record<string, any>.
   *
   * Currently appData['org.standardnotes.sn'] returns an object of type AppData.
   * And appData['org.standardnotes.sn.components] returns an object of type ComponentData
   */
  public getDomainData(domain: string) : undefined | Record<string, any> {
    const domainData = this.payload.safeContent.appData;
    if (!domainData) {
      return undefined;
    }
    const data = domainData[domain];
    return data;
  }

  public getAppDomainValue(key: AppDataField) {
    const appData = this.getDomainData(SNItem.DefaultAppDomain());
    return appData![key];
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
  public appDataContentKeysToIgnoreWhenCheckingEquality() {
    return [AppDataField.UserModifiedDate];
  }

  public getContentCopy() {
    return JSON.parse(JSON.stringify(this.content));
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
  public get singletonPredicate(): SNPredicate {
    throw 'Must override SNItem.singletonPredicate';
  }

  public get singletonStrategy() {
    return SingletonStrategy.KeepEarliest;
  }

  /**
   * Subclasses can override this method and provide their own opinion on whether
   * they want to be duplicated. For example, if this.content.x = 12 and
   * item.content.x = 13, this function can be overriden to always return
   * ConflictStrategy.KeepLeft to say 'don't create a duplicate at all, the
   * change is not important.'
   *
   * In the default implementation, we create a duplicate if content differs.
   * However, if they only differ by references, we KEEP_LEFT_MERGE_REFS.
   */
  public strategyWhenConflictingWithItem(item: SNItem) {
    if (this.errorDecrypting) {
      return ConflictStrategy.KeepLeftDuplicateRight;
    }
    if (this.isSingleton) {
      return ConflictStrategy.KeepLeft;
    }
    if (this.deleted) {
      return ConflictStrategy.KeepRight;
    }
    if (item.deleted) {
      if (this.payload.source === PayloadSource.FileImport) {
        /** Imported items take precedence */
        return ConflictStrategy.KeepLeft;
      }
      return ConflictStrategy.KeepRight;
    }
    const contentDiffers = ItemContentsDiffer(this, item);
    if (!contentDiffers) {
      return ConflictStrategy.KeepRight;
    }
    const itemsAreDifferentExcludingRefs = ItemContentsDiffer(
      this,
      item,
      ['references']
    );
    if (itemsAreDifferentExcludingRefs) {
      const twentySeconds = 20_000;
      if (
        /**
         * If the incoming item comes from an import, treat it as
         * less important than the existing one.
         */
        item.payload.source === PayloadSource.FileImport ||
        /**
         * If the user is actively editing our item, duplicate the incoming item
         * to avoid creating surprises in the client's UI.
         */
        Date.now() - this.userModifiedDate.getTime() < twentySeconds
      ) {
        return ConflictStrategy.KeepLeftDuplicateRight;
      } else {
        return ConflictStrategy.DuplicateLeftKeepRight;
      }
    } else {
      /** Only the references have changed; merge them. */
      return ConflictStrategy.KeepLeftMergeRefs;
    }
  }

  public isItemContentEqualWith(otherItem: SNItem) {
    return ItemContentsEqual(
      this.payload.contentObject,
      otherItem.payload.contentObject,
      this.contentKeysToIgnoreWhenCheckingEquality(),
      this.appDataContentKeysToIgnoreWhenCheckingEquality()
    );
  }

  public satisfiesPredicate(predicate: SNPredicate) {
    return SNPredicate.ItemSatisfiesPredicate(this, predicate);
  }

  public updatedAtTimestamp() {
    return this.updated_at?.getTime();
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

/**
 * An item mutator takes in an item, and an operation, and returns the resulting payload.
 * Subclasses of mutators can modify the content field directly, but cannot modify the payload directly.
 * All changes to the payload must occur by copying the payload and reassigning its value.
 */
export class ItemMutator {
  public readonly item: SNItem
  protected readonly type: MutationType
  protected payload: PurePayload
  protected content?: PayloadContent

  constructor(item: SNItem, type: MutationType) {
    this.item = item;
    this.type = type;
    this.payload = item.payload;
    if (this.payload.content) {
      /** this.content needs to be mutable, so we make a copy */
      this.content = Copy(this.payload.content);
    }
  }

  public getUuid() {
    return this.payload.uuid!;
  }

  public getItem() {
    return this.item;
  }

  public getResult() {
    if (this.type === MutationType.NonDirtying) {
      return CopyPayload(
        this.payload,
        {
          content: this.content,
        }
      )
    }
    if (!this.payload.deleted) {
      if (this.type === MutationType.UserInteraction) {
        // Set the user modified date to now if marking the item as dirty
        this.userModifiedDate = new Date();
      } else {
        const currentValue = this.item.userModifiedDate;
        if (!currentValue) {
          // if we don't have an explcit raw value, we initialize client_updated_at.
          this.userModifiedDate = new Date(this.item.updated_at!);
        }
      }
    }
    const result = CopyPayload(
      this.payload,
      {
        content: this.content,
        dirty: true,
        dirtiedDate: new Date()
      }
    )
    return result;
  }

  /** Merges the input payload with the base payload */
  public mergePayload(payload: PurePayload) {
    this.payload = PayloadByMerging(this.payload, payload);
    if (this.payload.content) {
      /** this.content needs to be mutable, so we make a copy */
      this.content = Copy(this.payload.safeContent);
    } else {
      this.content = undefined;
    }
  }

  public setContent(content: PayloadContent) {
    this.content = Copy(content);
  }

  public setDeleted() {
    this.content = undefined;
    this.payload = CopyPayload(
      this.payload,
      {
        content: this.content,
        deleted: true
      }
    )
  }

  public set lastSyncBegan(began: Date) {
    this.payload = CopyPayload(
      this.payload,
      {
        content: this.content,
        lastSyncBegan: began
      }
    )
  }

  public set errorDecrypting(errorDecrypting: boolean) {
    this.payload = CopyPayload(
      this.payload,
      {
        content: this.content,
        errorDecrypting: errorDecrypting
      }
    )
  }


  public set updated_at(updated_at: Date) {
    this.payload = CopyPayload(
      this.payload,
      {
        updated_at: updated_at
      }
    )
  }

  public set userModifiedDate(date: Date) {
    this.setAppDataItem(AppDataField.UserModifiedDate, date);
  }

  public set conflictOf(conflictOf: UuidString | undefined) {
    this.content!.conflict_of = conflictOf;
  }

  public set protected(isProtected: boolean) {
    this.content!.protected = isProtected;
  }

  public set trashed(trashed: boolean) {
    this.content!.trashed = trashed;
  }

  public set pinned(pinned: boolean) {
    this.setAppDataItem(AppDataField.Pinned, pinned);
  }

  public set archived(archived: boolean) {
    this.setAppDataItem(AppDataField.Archived, archived);
  }

  public set locked(locked: boolean) {
    this.setAppDataItem(AppDataField.Locked, locked);
  }

  /**
   * Overwrites the entirety of this domain's data with the data arg.
   */
  public setDomainData(data: any, domain: string) {
    if (this.payload.errorDecrypting) {
      return undefined;
    }
    if (!this.content!.appData) {
      this.content!.appData = {};
    }
    this.content!.appData[domain] = data;
  }

  /**
   * First gets the domain data for the input domain.
   * Then sets data[key] = value
   */
  public setDomainDataKey(key: string, value: any, domain: string) {
    if (this.payload.errorDecrypting) {
      return undefined;
    }
    if (!this.content!.appData) {
      this.content!.appData = {};
    }
    const globalData = this.content!.appData;
    if (!globalData[domain]) {
      globalData[domain] = {};
    }
    const domainData = globalData[domain];
    domainData[key] = value;
  }

  public setAppDataItem(key: AppDataField, value: any) {
    this.setDomainDataKey(key, value, SNItem.DefaultAppDomain());
  }

  public addItemAsRelationship(item: SNItem) {
    const references = this.content!.references || [];
    if (!references.find((r) => r.uuid === item.uuid)) {
      references.push({
        uuid: item.uuid,
        content_type: item.content_type!
      });
    }
    this.content!.references = references;
  }

  public removeItemAsRelationship(item: SNItem) {
    let references = this.content!.references || [];
    references = references.filter((r) => r.uuid !== item.uuid);
    this.content!.references = references;
  }
}

function ItemContentsDiffer(
  item1: SNItem,
  item2: SNItem,
  excludeContentKeys?: string[]
) {
  if (!excludeContentKeys) {
    excludeContentKeys = [];
  }
  return !ItemContentsEqual(
    item1.content as PayloadContent,
    item2.content as PayloadContent,
    item1.contentKeysToIgnoreWhenCheckingEquality().concat(excludeContentKeys),
    item1.appDataContentKeysToIgnoreWhenCheckingEquality()
  );
}

function ItemContentsEqual(
  leftContent: PayloadContent,
  rightContent: PayloadContent,
  keysToIgnore: string[],
  appDataKeysToIgnore: string[]
) {
  /* Create copies of objects before running omit as not to modify source values directly. */
  leftContent = sortedCopy(leftContent);
  if (leftContent.appData) {
    const domainData = leftContent.appData[DefaultAppDomain];
    omitInPlace(domainData, appDataKeysToIgnore);
    /**
     * We don't want to disqualify comparison if one object contains an empty domain object
     * and the other doesn't contain a domain object. This can happen if you create an item
     * without setting dirty, which means it won't be initialized with a client_updated_at
     */
    if (domainData) {
      if (Object.keys(domainData).length === 0) {
        delete leftContent.appData;
      }
    } else {
      delete leftContent.appData;
    }

  }
  omitInPlace(leftContent, keysToIgnore);

  rightContent = sortedCopy(rightContent);
  if (rightContent.appData) {
    const domainData = rightContent.appData[DefaultAppDomain];
    omitInPlace(domainData, appDataKeysToIgnore);
    if (domainData) {
      if (Object.keys(domainData).length === 0) {
        delete rightContent.appData;
      }
    } else {
      delete rightContent.appData;
    }
  }
  omitInPlace(rightContent, keysToIgnore);

  return JSON.stringify(leftContent) === JSON.stringify(rightContent);
}
