import { DomainEventInterface } from './DomainEventInterface'

import { DashboardTokenCreatedEventPayload } from './DashboardTokenCreatedEventPayload'

export interface DashboardTokenCreatedEvent extends DomainEventInterface {
  type: 'DASHBOARD_TOKEN_CREATED'
  payload: DashboardTokenCreatedEventPayload
}
