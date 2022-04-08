import { ProtocolVersion, Uuid } from '@standardnotes/common'
import { AppDataField } from '../Types/AppDataField'
import { ComponentDataDomain, DefaultAppDomain } from '../Types/DefaultAppDomain'
import { ContentReference } from '../../Reference/ContentReference'
import { PrefKey } from '../../../Syncable/UserPrefs/PrefKey'
import { ItemContent } from '../../Content/ItemContent'
import { DecryptedPayloadInterface } from '../../Payload/Interfaces/DecryptedPayload'
import { ItemInterface } from './ItemInterface'
import { SortableItem } from '../../../Runtime/Collection/CollectionSort'
import { DecryptedTransferPayload } from '../../TransferPayload/Interfaces/DecryptedTransferPayload'

export interface DecryptedItemInterface<C extends ItemContent = ItemContent>
  extends ItemInterface<DecryptedPayloadInterface<C>>,
    SortableItem {
  readonly content: C
  readonly conflictOf?: Uuid
  readonly duplicateOf?: Uuid
  readonly protected: boolean
  readonly trashed: boolean
  readonly pinned: boolean
  readonly archived: boolean
  readonly locked: boolean
  readonly userModifiedDate: Date
  readonly version: ProtocolVersion
  readonly references: ContentReference[]

  getAppDomainValueWithDefault<T, D extends T>(key: AppDataField | PrefKey, defaultValue: D): T

  getAppDomainValue<T>(key: AppDataField | PrefKey): T | undefined

  isItemContentEqualWith(otherItem: DecryptedItemInterface): boolean

  payloadRepresentation(
    override?: Partial<DecryptedTransferPayload<C>>,
  ): DecryptedPayloadInterface<C>

  hasRelationshipWithItem(item: DecryptedItemInterface): boolean

  getDomainData(
    domain: typeof ComponentDataDomain | typeof DefaultAppDomain,
  ): undefined | Record<string, unknown>

  contentKeysToIgnoreWhenCheckingEquality<C extends ItemContent = ItemContent>(): (keyof C)[]

  appDataContentKeysToIgnoreWhenCheckingEquality(): AppDataField[]

  getContentCopy(): C
}
