import { DomainEventInterface } from './DomainEventInterface'
import { UserRoleChangedEventPayload } from './UserRoleChangedEventPayload'

export interface UserRoleChangedEvent extends DomainEventInterface {
  type: 'USER_ROLE_CHANGED'
  payload: UserRoleChangedEventPayload
}
