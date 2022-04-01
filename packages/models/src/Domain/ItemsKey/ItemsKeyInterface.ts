import { ProtocolVersion } from '@standardnotes/common'
import { ItemInterface } from '../Item/ItemInterface'
import { ItemContent, SpecializedContent } from '../Item/ItemContent'

export interface ItemsKeyContentSpecialized extends SpecializedContent {
  version: ProtocolVersion
  isDefault?: boolean | undefined
  itemsKey: string
  dataAuthenticationKey?: string
}

export type ItemsKeyContent = ItemsKeyContentSpecialized & ItemContent

export interface ItemsKeyInterface extends ItemInterface<ItemsKeyContent> {
  get keyVersion(): ProtocolVersion
  get isDefault(): boolean | undefined
  get itemsKey(): string
  get dataAuthenticationKey(): string | undefined
}
