import { ProtocolVersion, Uuid } from '@standardnotes/common'
import { ContentReference } from '../Reference/ContentReference'

export type PayloadContent = {
  references: ContentReference[]
  version: ProtocolVersion
  conflict_of?: Uuid
}
