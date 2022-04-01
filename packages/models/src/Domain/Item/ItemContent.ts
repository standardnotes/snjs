import { Uuid, ProtocolVersion } from '@standardnotes/common'
import { AppData } from './DefaultAppDomain'
import { ContentReference } from '../Reference/ContentReference'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SpecializedContent {}

export interface ItemContent {
  references: ContentReference[]
  version?: ProtocolVersion
  conflict_of?: Uuid
  protected?: boolean
  trashed?: boolean
  pinned?: boolean
  archived?: boolean
  locked?: boolean
  appData?: AppData
}
