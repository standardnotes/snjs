import { Uuid } from '@standardnotes/common'
import { PayloadField, ValidPayloadKey } from '../../../Payload'
import { TransferPayload } from './../TransferPayload'

export const ServerPushPayloadFields: Readonly<ValidPayloadKey[]> = Object.freeze([
  PayloadField.Content,
  PayloadField.ContentType,
  PayloadField.CreatedAt,
  PayloadField.CreatedAtTimestamp,
  PayloadField.Deleted,
  PayloadField.DuplicateOf,
  PayloadField.EncItemKey,
  PayloadField.ItemsKeyId,
  PayloadField.Legacy003AuthHash,
  PayloadField.ServerUpdatedAt,
  PayloadField.ServerUpdatedAtTimestamp,
  PayloadField.Uuid,
])

export interface ServerPushOrRetrievedTransferPayload extends TransferPayload {
  auth_hash?: string
  content: string
  created_at_timestamp: number
  created_at: Date
  deleted?: boolean
  duplicate_of?: Uuid
  enc_item_key: string
  items_key_id?: string
  updated_at_timestamp?: number
  updated_at: Date
}
