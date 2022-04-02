import { ItemContent } from '../../Abstract/Item/Interfaces/ItemContent'
import { ProtocolVersion, AnyKeyParamsContent } from '@standardnotes/common'

export interface RootKeyContentSpecialized {
  version: ProtocolVersion
  masterKey: string
  serverPassword?: string
  dataAuthenticationKey?: string
  keyParams: AnyKeyParamsContent
}

export type RootKeyContent = RootKeyContentSpecialized & ItemContent
