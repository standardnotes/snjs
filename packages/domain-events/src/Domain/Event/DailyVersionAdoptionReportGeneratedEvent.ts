import { DomainEventInterface } from './DomainEventInterface'
import { DailyVersionAdoptionReportGeneratedEventPayload } from './DailyVersionAdoptionReportGeneratedEventPayload'

export interface DailyVersionAdoptionReportGeneratedEvent extends DomainEventInterface {
  type: 'DAILY_VERSION_ADOPTION_REPORT_GENERATED'
  payload: DailyVersionAdoptionReportGeneratedEventPayload
}
