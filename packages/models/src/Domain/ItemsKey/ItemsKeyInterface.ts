import { ProtocolVersion } from '@standardnotes/common'
import { ItemInterface } from '../Item/ItemInterface'

export interface ItemsKeyInterface extends ItemInterface {
  get keyVersion(): ProtocolVersion
  get isDefault(): boolean | undefined
  get itemsKey(): string
  get dataAuthenticationKey(): string | undefined
}
