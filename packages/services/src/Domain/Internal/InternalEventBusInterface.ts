import { InternalEventInterface } from './InternalEventInterface'
import { InternalEventType } from './InternalEventType'
import { InternalEventHandlerInterface } from './InternalEventHandlerInterface'

export interface InternalEventBusInterface {
  addEventHandler(handler: InternalEventHandlerInterface, eventType: InternalEventType): void
  publish(event: InternalEventInterface): void
}
