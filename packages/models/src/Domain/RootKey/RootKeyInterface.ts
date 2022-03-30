import { ProtocolVersion, AnyKeyParamsContent } from '@standardnotes/common'

export type RootKeyContent = {
  version: ProtocolVersion
  masterKey: string
  serverPassword?: string
  dataAuthenticationKey?: string
  keyParams: AnyKeyParamsContent
}

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
