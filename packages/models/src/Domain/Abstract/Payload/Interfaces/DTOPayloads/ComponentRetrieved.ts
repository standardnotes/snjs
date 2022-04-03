import { ItemContent } from './../../../Item/Interfaces/ItemContent'
import { ContentType, Uuid } from '@standardnotes/common'
import { PayloadInterface } from '../PayloadInterface'

/**
 * Represents a payload with permissible fields for when a
 * payload is retrieved from a component for saving
 */
export interface ComponentRetrievedDTOPayload<C extends ItemContent = ItemContent>
  extends PayloadInterface {
  uuid: Uuid
  content: C
  content_type: ContentType
  created_at: Date
}
