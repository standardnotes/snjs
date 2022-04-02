import { Copy } from '@standardnotes/utils'
import { MutationType } from '../Types/MutationType'
import { PrefKey } from '../../../Syncable/UserPrefs/PrefKey'
import { DecryptedItem } from './DecryptedItem'
import { Uuid } from '@standardnotes/common'
import { ItemContent } from '../Interfaces/ItemContent'
import { AppDataField } from '../Types/AppDataField'
import { DefaultAppDomain, DomainDataValueType, ItemDomainKey } from '../Types/DefaultAppDomain'
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
      return super.getResult()
    }

    if (this.type === MutationType.UpdateUserTimestamps) {
      this.userModifiedDate = new Date()
    } else {
      const currentValue = this.item.userModifiedDate
      if (!currentValue) {
        this.userModifiedDate = new Date(this.item.serverUpdatedAt)
      }
    }

    return super.getResult()
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

  public addItemAsRelationship(item: DecryptedItem) {
    const references = this.content.references || []
    if (!references.find((r) => r.uuid === item.uuid)) {
      references.push({
        uuid: item.uuid,
        content_type: item.content_type,
      })
    }
    this.content.references = references
  }

  public removeItemAsRelationship(item: DecryptedItem) {
    let references = this.content.references || []
    references = references.filter((r) => r.uuid !== item.uuid)
    this.content.references = references
  }
}
