import { Uuid } from '@standardnotes/common'
import { ItemContent } from '../../../Item/Interfaces/ItemContent'
import { ContextPayload } from './ContextPayload'

export interface FileImportContextualPayload<C extends ItemContent = ItemContent>
  extends ContextPayload {
  auth_hash?: string
  content: C | string
  created_at_timestamp?: number
  created_at?: Date
  duplicate_of?: Uuid
  enc_item_key?: string
  items_key_id?: string
  updated_at?: Date
  updated_at_timestamp?: number
}
