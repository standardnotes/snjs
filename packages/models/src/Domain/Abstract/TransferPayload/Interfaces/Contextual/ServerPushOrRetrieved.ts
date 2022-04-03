import { Uuid } from '@standardnotes/common'
import { TransferPayload } from './../TransferPayload'

export interface ServerPushOrRetrievedTransferPayload extends TransferPayload {
  auth_hash?: string
  content?: string
  created_at_timestamp: number
  created_at: Date
  deleted: boolean
  duplicate_of?: Uuid
  enc_item_key?: string
  items_key_id?: string
  updated_at_timestamp?: number
  updated_at: Date
}
