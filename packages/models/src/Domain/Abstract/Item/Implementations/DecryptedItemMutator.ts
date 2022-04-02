import { Copy } from '@standardnotes/utils'
import { MutationType } from '../Types/MutationType'
import { PrefKey } from '../../../Syncable/UserPrefs/PrefKey'
import { DecryptedItem } from './DecryptedItem'
import { Uuid } from '@standardnotes/common'
import { ItemContent } from '../Interfaces/ItemContent'
import { PurePayload } from '../../Payload/Implementations/PurePayload'
import { CopyPayload, PayloadByMerging } from '../../Payload/Utilities/Functions'
import { AppDataField } from '../Types/AppDataField'
import { DefaultAppDomain, DomainDataValueType, ItemDomainKey } from '../Types/DefaultAppDomain'
import { GenericItem } from './GenericItem'
import { PayloadInterface } from '../../Payload'
import { ItemMutator } from './ItemMutator'
import { DecryptedPayloadInterface } from '../../Payload/Interfaces/DecryptedPayload'

/**
 * An item mutator takes in an item, and an operation, and returns the resulting payload.
 * Subclasses of mutators can modify the content field directly, but cannot modify the payload directly.
 * All changes to the payload must occur by copying the payload and reassigning its value.
 */

export class DecryptedItemMutator<C extends ItemContent = ItemContent> extends ItemMutator {
  public readonly item: DecryptedItem<C>
  protected payload: DecryptedPayloadInterface
  protected readonly type: MutationType
  protected content: C

  constructor(item: DecryptedItem<C>, type: MutationType) {
    super(item, type)

    const mutableCopy = Copy(this.payload.content)
    this.content = mutableCopy
  }

  public getResult() {
    if (this.type === MutationType.NonDirtying) {
      return CopyPayload(this.payload, {
        content: this.content,
      })
    }

    if (!this.payload.deleted) {
      if (this.type === MutationType.UpdateUserTimestamps) {
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
    const merged = PayloadByMerging(this.payload, payload)
    this.payload = merged

    const mutableCopy = Copy(merged)
    this.content = mutableCopy
  }

  /** Not recommended to use as this might break item schema if used incorrectly */
  public unsafe_setCustomContent(content: ItemContent): void {
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

  public set conflictOf(conflictOf: Uuid | undefined) {
    this.sureContent.conflict_of = conflictOf
  }

  public set protected(isProtected: boolean) {
    this.sureContent.protected = isProtected
  }

  public set trashed(trashed: boolean) {
    this.sureContent.trashed = trashed
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
  public setDomainData(data: DomainDataValueType, domain: ItemDomainKey): void {
    if (this.payload.errorDecrypting) {
      return
    }

    if (!this.sureContent.appData) {
      this.sureContent.appData = {
        [DefaultAppDomain]: {},
      }
    }

    this.sureContent.appData[domain] = data
  }

  /**
   * First gets the domain data for the input domain.
   * Then sets data[key] = value
   */
  public setDomainDataKey(
    key: keyof DomainDataValueType,
    value: unknown,
    domain: ItemDomainKey,
  ): void {
    if (this.payload.errorDecrypting) {
      return
    }

    if (!this.sureContent.appData) {
      this.sureContent.appData = {
        [DefaultAppDomain]: {},
      }
    }

    if (!this.sureContent.appData[domain]) {
      this.sureContent.appData[domain] = {}
    }

    const domainData = this.sureContent.appData[domain] as DomainDataValueType
    domainData[key] = value
  }

  public setAppDataItem(key: AppDataField | PrefKey, value: unknown) {
    this.setDomainDataKey(key, value, DefaultAppDomain)
  }

  public addItemAsRelationship(item: DecryptedItem) {
    const references = this.sureContent.references || []
    if (!references.find((r) => r.uuid === item.uuid)) {
      references.push({
        uuid: item.uuid,
        content_type: item.content_type,
      })
    }
    this.sureContent.references = references
  }

  public removeItemAsRelationship(item: DecryptedItem) {
    let references = this.sureContent.references || []
    references = references.filter((r) => r.uuid !== item.uuid)
    this.sureContent.references = references
  }
}
