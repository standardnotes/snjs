import { Uuid } from '@standardnotes/common'
import { TransferPayload } from './../TransferPayload'

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
