/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContentType } from '@standardnotes/common'
import { ItemContent } from '../Item/ItemContent'

export type RawPayload<C extends ItemContent = ItemContent> = {
  uuid: string
  content_type: ContentType
  content?: C | string
  deleted?: boolean
  items_key_id?: string
  enc_item_key?: string
  created_at?: Date
  updated_at?: Date
  created_at_timestamp?: number
  updated_at_timestamp?: number
  dirtiedDate?: Date
  dirty?: boolean
  errorDecrypting?: boolean
  waitingForKey?: boolean
  errorDecryptingValueChanged?: boolean
  lastSyncBegan?: Date
  lastSyncEnd?: Date
  auth_hash?: string
  auth_params?: any
  duplicate_of?: string
}
