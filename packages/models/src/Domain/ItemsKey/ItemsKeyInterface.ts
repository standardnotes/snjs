import { ProtocolVersion } from '@standardnotes/common'
import { ItemContent, ItemInterface } from '../Item/ItemInterface'

export interface ItemsKeyContent extends ItemContent {
  version: ProtocolVersion
  isDefault?: boolean | undefined
  itemsKey: string
  dataAuthenticationKey?: string
}

export interface ItemsKeyInterface extends ItemInterface<ItemsKeyContent> {
  get keyVersion(): ProtocolVersion
  get isDefault(): boolean | undefined
  get itemsKey(): string
  get dataAuthenticationKey(): string | undefined
}
