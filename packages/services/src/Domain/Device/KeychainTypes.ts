import { ApplicationIdentifier, ProtocolVersion } from '@standardnotes/common'

export type RawKeychainValue = Record<ApplicationIdentifier, NamespacedRootKeyInKeychain>

export interface NamespacedRootKeyInKeychain {
  version: ProtocolVersion
  masterKey: string
  dataAuthenticationKey?: string
}

export interface LegacyRawKeychainValue {
  mk: string
  ak: string
  version: ProtocolVersion
}

export type LegacyMobileKeychainStructure = {
  offline?: {
    timing?: unknown
    pw?: string
  }
  encryptedAccountKeys?: unknown
  mk: string
  pw: string
  ak: string
  version?: string
  jwt?: string
}
