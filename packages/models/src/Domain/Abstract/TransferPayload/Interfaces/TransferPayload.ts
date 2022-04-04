import { ContentType, Uuid } from '@standardnotes/common'

export interface TransferPayload {
  uuid: Uuid
  content_type: ContentType

  updated_at?: Date
  created_at?: Date
  created_at_timestamp?: number
  updated_at_timestamp?: number

  dirtiedDate?: Date
  dirty?: boolean
  lastSyncBegan?: Date
  lastSyncEnd?: Date

  duplicate_of?: Uuid
}
