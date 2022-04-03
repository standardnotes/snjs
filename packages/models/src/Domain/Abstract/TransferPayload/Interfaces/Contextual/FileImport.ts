import { Uuid } from '@standardnotes/common'
import { ItemContent } from '../../../Item/Interfaces/ItemContent'
import { PayloadField, ValidPayloadKey } from '../../../Payload'
import { TransferPayload } from './../TransferPayload'

export const FilePayloadFields: Readonly<ValidPayloadKey[]> = Object.freeze([
  PayloadField.Content,
  PayloadField.ContentType,
  PayloadField.CreatedAt,
  PayloadField.CreatedAtTimestamp,
  PayloadField.DuplicateOf,
  PayloadField.EncItemKey,
  PayloadField.ItemsKeyId,
  PayloadField.Legacy003AuthHash,
  PayloadField.ServerUpdatedAt,
  PayloadField.ServerUpdatedAtTimestamp,
  PayloadField.Uuid,
])

export interface FileImportTransferPayload<C extends ItemContent = ItemContent>
  extends TransferPayload {
  auth_hash?: string
  content: C | string
  created_at_timestamp: number
  created_at: Date
  duplicate_of?: Uuid
  enc_item_key?: string
  items_key_id?: string
  updated_at: Date
  updated_at_timestamp: number
}
