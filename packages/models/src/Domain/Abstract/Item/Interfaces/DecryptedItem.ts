import { Uuid } from '@standardnotes/common'
import { AppDataField } from '../Types/AppDataField'
import { ComponentDataDomain, DefaultAppDomain } from '../Types/DefaultAppDomain'
import { ContentReference } from '../../Reference/ContentReference'
import { PrefKey } from '../../../Syncable/UserPrefs/PrefKey'
import { ItemContent } from './ItemContent'
import { DecryptedPayloadInterface } from '../../Payload/Interfaces/DecryptedPayload'
import { ItemInterface } from './ItemInterface'

export interface DecryptedItemInterface<C extends ItemContent = ItemContent> extends ItemInterface {
  readonly payload: DecryptedPayloadInterface<C>
  readonly conflictOf?: Uuid
  readonly duplicateOf?: Uuid
  readonly protected: boolean
  readonly trashed: boolean
  readonly pinned: boolean
  readonly archived: boolean
  readonly locked: boolean
  readonly userModifiedDate: Date
  content: C
  references: ContentReference[]

  getAppDomainValueWithDefault<T, D extends T>(key: AppDataField | PrefKey, defaultValue: D): T

  getAppDomainValue(key: any): any

  isItemContentEqualWith(otherItem: ItemInterface): boolean

  payloadRepresentation(override?: Partial<DecryptedPayloadInterface<C>>): DecryptedPayloadInterface

  hasRelationshipWithItem(item: ItemInterface): boolean

  getDomainData(
    domain: typeof ComponentDataDomain | typeof DefaultAppDomain,
  ): undefined | Record<string, any>

  contentKeysToIgnoreWhenCheckingEquality<C extends ItemContent = ItemContent>(): (keyof C)[]

  appDataContentKeysToIgnoreWhenCheckingEquality(): AppDataField[]

  getContentCopy(): C
}
