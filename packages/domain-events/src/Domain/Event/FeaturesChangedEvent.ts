import { DomainEventInterface } from './DomainEventInterface'
import { FeaturesChangedEventPayload } from './FeaturesChangedEventPayload'

export interface FeaturesChangedEvent extends DomainEventInterface {
  type: 'FEATURES_CHANGED'
  payload: FeaturesChangedEventPayload,
}
