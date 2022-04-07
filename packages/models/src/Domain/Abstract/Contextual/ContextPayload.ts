import { ContentType } from '@standardnotes/common'
import { ItemContent } from '../Item'

export interface ContextPayload<C extends ItemContent = ItemContent> {
  uuid: string
  content_type: ContentType
  content: C | string | undefined
  deleted: boolean
}
