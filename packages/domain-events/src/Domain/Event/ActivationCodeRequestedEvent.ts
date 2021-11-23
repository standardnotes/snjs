import { DomainEventInterface } from './DomainEventInterface'
import { ActivationCodeRequestedEventPayload } from './ActivationCodeRequestedEventPayload'

export interface ActivationCodeRequested extends DomainEventInterface {
  type: 'ACTIVATION_CODE_REQUESTED'
  payload: ActivationCodeRequestedEventPayload
}
