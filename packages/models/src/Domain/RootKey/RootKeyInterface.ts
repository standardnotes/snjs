import { ProtocolVersion } from '@standardnotes/common'
import { RootKeyContent } from './RootKeyContent'

export interface RootKeyInterface {
  get keyVersion(): ProtocolVersion
  get itemsKey(): string
  get masterKey(): string
  get serverPassword(): string | undefined
  get dataAuthenticationKey(): string | undefined
  compare(otherKey: RootKeyInterface): boolean
  persistableValueWhenWrapping(): Partial<RootKeyContent>
  getKeychainValue(): Partial<RootKeyContent>
}
