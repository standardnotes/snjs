import { ProtocolVersion } from '@standardnotes/common'
import { DecryptedItemInterface } from '../../Abstract/Item/Interfaces/DecryptedItem'
import { RootKeyContent } from './RootKeyContent'

export interface RootKeyInterface extends DecryptedItemInterface<RootKeyContent> {
  get keyVersion(): ProtocolVersion
  get itemsKey(): string
  get masterKey(): string
  get serverPassword(): string | undefined
  get dataAuthenticationKey(): string | undefined
  compare(otherKey: RootKeyInterface): boolean
  persistableValueWhenWrapping(): Partial<RootKeyContent>
  getKeychainValue(): Partial<RootKeyContent>
}
