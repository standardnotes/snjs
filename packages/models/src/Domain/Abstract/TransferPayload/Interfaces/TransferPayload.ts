import { ContentType, Uuid } from '@standardnotes/common'
import { ItemContent } from '../../Content/ItemContent'

export interface TransferPayload<C extends ItemContent = ItemContent> {
  uuid: Uuid
  content_type: ContentType
  content: C | string | undefined
  deleted?: boolean

  updated_at: Date
  created_at: Date
  created_at_timestamp: number
  updated_at_timestamp: number

  dirtiedDate?: Date
  dirty?: boolean

  lastSyncBegan?: Date
  lastSyncEnd?: Date

  duplicate_of?: Uuid
}
