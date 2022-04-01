import { RawPayload } from '@standardnotes/models'
import { ConflictType } from './ConflictType'

export type ConflictParams = {
  type: ConflictType
  server_item?: RawPayload
  unsaved_item?: RawPayload
  /** @legacay */
  item?: RawPayload
}
