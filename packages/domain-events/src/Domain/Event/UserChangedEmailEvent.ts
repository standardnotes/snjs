import { DomainEventInterface } from './DomainEventInterface'
import { UserChangedEmailEventPayload } from './UserChangedEmailEventPayload'

export interface UserChangedEmailEvent extends DomainEventInterface {
  type: 'USER_CHANGED_EMAIL'
  payload: UserChangedEmailEventPayload
}
