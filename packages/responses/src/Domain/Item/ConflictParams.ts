import { TransferPayload } from '@standardnotes/models'
import { ConflictType } from './ConflictType'

export type ConflictParams = {
  type: ConflictType
  server_item?: TransferPayload
  unsaved_item?: TransferPayload
  /** @legacay */
  item?: TransferPayload
}
