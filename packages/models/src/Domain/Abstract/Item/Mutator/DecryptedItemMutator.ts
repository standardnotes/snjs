import { DecryptedItemInterface } from './../Interfaces/DecryptedItem'
import { Copy } from '@standardnotes/utils'
import { MutationType } from '../Types/MutationType'
import { PrefKey } from '../../../Syncable/UserPrefs/PrefKey'
import { Uuid } from '@standardnotes/common'
import { ItemContent } from '../../Content/ItemContent'
import { AppDataField } from '../Types/AppDataField'
import { DefaultAppDomain, DomainDataValueType, ItemDomainKey } from '../Types/DefaultAppDomain'
import { ItemMutator } from './ItemMutator'
import { DecryptedPayloadInterface } from '../../Payload/Interfaces/DecryptedPayload'

export class DecryptedItemMutator<C extends ItemContent = ItemContent> extends ItemMutator<
  DecryptedPayloadInterface<C>,
  DecryptedItemInterface<C>
> {
  protected content: C

  constructor(item: DecryptedItemInterface<C>, type: MutationType) {
    super(item, type)

    const mutableCopy = Copy(this.payload.content)
    this.content = mutableCopy
  }

  public override getResult() {
    if (this.type === MutationType.NonDirtying) {
      return this.payload.copy({
        content: this.content,
      })
    }

    if (this.type === MutationType.UpdateUserTimestamps) {
      this.userModifiedDate = new Date()
    } else {
      const currentValue = this.item.userModifiedDate
      if (!currentValue) {
        this.userModifiedDate = new Date(this.item.serverUpdatedAt)
      }
    }

    const result = this.payload.copy({
      content: this.content,
      dirty: true,
      dirtiedDate: new Date(),
    })

    return result
  }

  public override set lastSyncBegan(began: Date) {
    this.payload = this.payload.copy({
      content: this.content,
      lastSyncBegan: began,
    })
  }

  /** Not recommended to use as this might break item schema if used incorrectly */
  public setCustomContent(content: C): void {
    this.content = Copy(content)
  }

  public set userModifiedDate(date: Date) {
    this.setAppDataItem(AppDataField.UserModifiedDate, date)
  }

  public set conflictOf(conflictOf: Uuid | undefined) {
    this.content.conflict_of = conflictOf
  }

  public set protected(isProtected: boolean) {
    this.content.protected = isProtected
  }

  public set trashed(trashed: boolean) {
    this.content.trashed = trashed
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
    if (!this.content.appData) {
      this.content.appData = {
        [DefaultAppDomain]: {},
      }
    }

    this.content.appData[domain] = data
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
    if (!this.content.appData) {
      this.content.appData = {
        [DefaultAppDomain]: {},
      }
    }

    if (!this.content.appData[domain]) {
      this.content.appData[domain] = {}
    }

    const domainData = this.content.appData[domain] as DomainDataValueType
    domainData[key] = value
  }

  public setAppDataItem(key: AppDataField | PrefKey, value: unknown) {
    this.setDomainDataKey(key, value, DefaultAppDomain)
  }

  public addItemAsRelationship(item: DecryptedItemInterface) {
    const references = this.content.references || []
    if (!references.find((r) => r.uuid === item.uuid)) {
      references.push({
        uuid: item.uuid,
        content_type: item.content_type,
      })
    }
    this.content.references = references
  }

  public removeItemAsRelationship(item: DecryptedItemInterface) {
    let references = this.content.references || []
    references = references.filter((r) => r.uuid !== item.uuid)
    this.content.references = references
  }
}
