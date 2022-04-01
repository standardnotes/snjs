import { ProtocolVersion } from '@standardnotes/common'
import { RootKeyContentSpecialized } from '@standardnotes/models'

export interface RootKeyInKeychain {
  version: ProtocolVersion
  masterKey: string
  dataAuthenticationKey?: string
}

export type RootKeyContentInStorage = RootKeyContentSpecialized
