import { InternalEventBusInterface } from './InternalEventBusInterface'
import { InternalEventHandlerInterface } from './InternalEventHandlerInterface'
import { InternalEventInterface } from './InternalEventInterface'
import { InternalEventType } from './InternalEventType'

export class InternalEventBus implements InternalEventBusInterface {
  private eventHandlers: Map<InternalEventType, InternalEventHandlerInterface[]>

  constructor(
  ) {
    this.eventHandlers = new Map<InternalEventType, InternalEventHandlerInterface[]>()
  }

  addEventHandler(handler: InternalEventHandlerInterface, eventType: string): void {
    let handlersForEventType = this.eventHandlers.get(eventType)
    if (handlersForEventType === undefined) {
      handlersForEventType = []
    }

    handlersForEventType.push(handler)

    this.eventHandlers.set(eventType, handlersForEventType)
  }

  publish(event: InternalEventInterface): void {
    const handlersForEventType = this.eventHandlers.get(event.type)
    if (handlersForEventType === undefined) {
      return
    }

    for (const handlerForEventType of handlersForEventType) {
      void handlerForEventType.handleEvent(event)
    }
  }
}
