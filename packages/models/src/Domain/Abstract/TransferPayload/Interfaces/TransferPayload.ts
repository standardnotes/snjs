import { ContentType, Uuid } from '@standardnotes/common'

export interface TransferPayload {
  uuid: Uuid
  content_type: ContentType

  /** updated_at is set by the server only, and not the client.*/
  updated_at?: Date
  created_at?: Date
  created_at_timestamp?: number
  updated_at_timestamp?: number
  serverUpdatedAt?: Date
  serverUpdatedAtTimestamp?: number

  dirtiedDate?: Date
  dirty?: boolean
  lastSyncBegan?: Date
  lastSyncEnd?: Date

  duplicate_of?: Uuid
}
