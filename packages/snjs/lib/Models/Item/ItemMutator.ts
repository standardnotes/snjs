import { AppDataField, DefaultAppDomain } from '@standardnotes/applications'
import { PayloadContent, CopyPayload, PurePayload, PayloadByMerging } from '@standardnotes/payloads'
import { UuidString } from '../../types'
import { Copy, omitInPlace, sortedCopy } from '@standardnotes/utils'
import { PrefKey } from '../UserPrefs/UserPrefs'
import { SNItem } from './Item'
import { MutationType } from './MutationType'

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
    this.item = item
    this.type = type
    this.payload = item.payload
    if (this.payload.content) {
      /** this.content needs to be mutable, so we make a copy */
      this.content = Copy(this.payload.content)
    }
  }

  public getUuid() {
    return this.payload.uuid!
  }

  public getItem() {
    return this.item
  }

  public getResult() {
    if (this.type === MutationType.NonDirtying) {
      return CopyPayload(this.payload, {
        content: this.content,
      })
    }
    if (!this.payload.deleted) {
      if (this.type === MutationType.UserInteraction) {
        this.userModifiedDate = new Date()
      } else {
        const currentValue = this.item.userModifiedDate
        if (!currentValue) {
          this.userModifiedDate = new Date(this.item.serverUpdatedAt!)
        }
      }
    }
    const result = CopyPayload(this.payload, {
      content: this.content,
      dirty: true,
      dirtiedDate: new Date(),
    })
    return result
  }

  /** Merges the input payload with the base payload */
  public mergePayload(payload: PurePayload) {
    this.payload = PayloadByMerging(this.payload, payload)
    if (this.payload.content) {
      /** this.content needs to be mutable, so we make a copy */
      this.content = Copy(this.payload.safeContent)
    } else {
      this.content = undefined
    }
  }

  /** Not recommended to use as this might break item schema if used incorrectly */
  public unsafe_setCustomContent(content: PayloadContent): void {
    this.content = Copy(content)
  }

  public setDeleted() {
    this.content = undefined
    this.payload = CopyPayload(this.payload, {
      content: this.content,
      deleted: true,
    })
  }

  public set lastSyncBegan(began: Date) {
    this.payload = CopyPayload(this.payload, {
      content: this.content,
      lastSyncBegan: began,
    })
  }

  public set errorDecrypting(errorDecrypting: boolean) {
    this.payload = CopyPayload(this.payload, {
      content: this.content,
      errorDecrypting: errorDecrypting,
    })
  }

  public set updated_at(updated_at: Date) {
    this.payload = CopyPayload(this.payload, {
      updated_at: updated_at,
    })
  }

  public set updated_at_timestamp(updated_at_timestamp: number) {
    this.payload = CopyPayload(this.payload, {
      updated_at_timestamp,
    })
  }

  public set userModifiedDate(date: Date) {
    this.setAppDataItem(AppDataField.UserModifiedDate, date)
  }

  public set conflictOf(conflictOf: UuidString | undefined) {
    this.content!.conflict_of = conflictOf
  }

  public set protected(isProtected: boolean) {
    this.content!.protected = isProtected
  }

  public set trashed(trashed: boolean) {
    this.content!.trashed = trashed
  }

  public set pinned(pinned: boolean) {
    this.setAppDataItem(AppDataField.Pinned, pinned)
  }

  public set archived(archived: boolean) {
    this.setAppDataItem(AppDataField.Archived, archived)
  }

  public set locked(locked: boolean) {
    this.setAppDataItem(AppDataField.Locked, locked)
  }

  /**
   * Overwrites the entirety of this domain's data with the data arg.
   */
  public setDomainData(data: any, domain: string) {
    if (this.payload.errorDecrypting) {
      return undefined
    }
    if (!this.content!.appData) {
      this.content!.appData = {}
    }
    this.content!.appData[domain] = data
  }

  /**
   * First gets the domain data for the input domain.
   * Then sets data[key] = value
   */
  public setDomainDataKey(key: string, value: any, domain: string) {
    if (this.payload.errorDecrypting) {
      return undefined
    }
    if (!this.content!.appData) {
      this.content!.appData = {}
    }
    const globalData = this.content!.appData
    if (!globalData[domain]) {
      globalData[domain] = {}
    }
    const domainData = globalData[domain]
    domainData[key] = value
  }

  public setAppDataItem(key: AppDataField | PrefKey, value: any) {
    this.setDomainDataKey(key, value, SNItem.DefaultAppDomain())
  }

  public addItemAsRelationship(item: SNItem) {
    const references = this.content!.references || []
    if (!references.find((r) => r.uuid === item.uuid)) {
      references.push({
        uuid: item.uuid,
        content_type: item.content_type!,
      })
    }
    this.content!.references = references
  }

  public removeItemAsRelationship(item: SNItem) {
    let references = this.content!.references || []
    references = references.filter((r) => r.uuid !== item.uuid)
    this.content!.references = references
  }
}
export function ItemContentsDiffer(item1: SNItem, item2: SNItem, excludeContentKeys?: string[]) {
  if (!excludeContentKeys) {
    excludeContentKeys = []
  }
  return !ItemContentsEqual(
    item1.content as PayloadContent,
    item2.content as PayloadContent,
    item1.contentKeysToIgnoreWhenCheckingEquality().concat(excludeContentKeys),
    item1.appDataContentKeysToIgnoreWhenCheckingEquality(),
  )
}
export function ItemContentsEqual(
  leftContent: PayloadContent,
  rightContent: PayloadContent,
  keysToIgnore: string[],
  appDataKeysToIgnore: string[],
) {
  /* Create copies of objects before running omit as not to modify source values directly. */
  leftContent = sortedCopy(leftContent)
  if (leftContent.appData) {
    const domainData = leftContent.appData[DefaultAppDomain]
    omitInPlace(domainData, appDataKeysToIgnore)
    /**
     * We don't want to disqualify comparison if one object contains an empty domain object
     * and the other doesn't contain a domain object. This can happen if you create an item
     * without setting dirty, which means it won't be initialized with a client_updated_at
     */
    if (domainData) {
      if (Object.keys(domainData).length === 0) {
        delete leftContent.appData
      }
    } else {
      delete leftContent.appData
    }
  }
  omitInPlace(leftContent, keysToIgnore)

  rightContent = sortedCopy(rightContent)
  if (rightContent.appData) {
    const domainData = rightContent.appData[DefaultAppDomain]
    omitInPlace(domainData, appDataKeysToIgnore)
    if (domainData) {
      if (Object.keys(domainData).length === 0) {
        delete rightContent.appData
      }
    } else {
      delete rightContent.appData
    }
  }
  omitInPlace(rightContent, keysToIgnore)

  return JSON.stringify(leftContent) === JSON.stringify(rightContent)
}
