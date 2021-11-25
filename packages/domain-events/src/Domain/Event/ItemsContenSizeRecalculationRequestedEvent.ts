import { DomainEventInterface } from './DomainEventInterface'
import { ItemsContentSizeRecalculationRequestedEventPayload } from './ItemsContentSizeRecalculationRequestedEventPayload'

export interface ItemsContentSizeRecalculationRequestedEvent extends DomainEventInterface {
  type: 'ITEMS_CONTENT_SIZE_RECALCULATION_REQUESTED'
  payload: ItemsContentSizeRecalculationRequestedEventPayload
}
