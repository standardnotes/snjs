import { Uuid } from '@standardnotes/common'
import { PayloadField, ValidPayloadKey } from '../../../Payload'
import { TransferPayload } from './../TransferPayload'

export const StoragePayloadFields: Readonly<ValidPayloadKey[]> = Object.freeze([
  PayloadField.Content,
  PayloadField.ContentType,
  PayloadField.CreatedAt,
  PayloadField.CreatedAtTimestamp,
  PayloadField.Deleted,
  PayloadField.DirtiedDate,
  PayloadField.Dirty,
  PayloadField.DuplicateOf,
  PayloadField.EncItemKey,
  PayloadField.ErrorDecrypting,
  PayloadField.ItemsKeyId,
  PayloadField.Legacy003AuthHash,
  PayloadField.Legacy003AuthParams,
  PayloadField.ServerUpdatedAt,
  PayloadField.ServerUpdatedAtTimestamp,
  PayloadField.Uuid,
  PayloadField.WaitingForKey,
])

export interface LocalStorageTransferPayload extends TransferPayload {
  auth_hash?: string
  auth_params?: unknown
  content: string
  created_at_timestamp: number
  created_at: Date
  deleted?: boolean
  dirtiedDate?: Date
  dirty?: boolean
  duplicate_of?: Uuid
  enc_item_key: string
  errorDecrypting?: boolean
  items_key_id?: string
  updated_at_timestamp?: number
  updated_at: Date
  waitingForKey?: boolean
}
