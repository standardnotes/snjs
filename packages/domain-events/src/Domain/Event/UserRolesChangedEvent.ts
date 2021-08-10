import { DomainEventInterface } from './DomainEventInterface'
import { UserRolesChangedEventPayload } from './UserRolesChangedEventPayload'

export interface UserRolesChangedEvent extends DomainEventInterface {
  type: 'USER_ROLE_CHANGED'
  payload: UserRolesChangedEventPayload
}
