/* istanbul ignore file */
import { log, removeFromArray } from '@standardnotes/utils'
import { EventObserver } from '../Event/EventObserver'
import { ServiceInterface } from './ServiceInterface'
import { InternalEventBusInterface } from '../Internal/InternalEventBusInterface'
import { InternalEventPublishStrategy } from '..'
import { ApplicationStage } from '../Application/ApplicationStage'

export abstract class AbstractService<EventName = string, EventData = undefined>
  implements ServiceInterface<EventName, EventData>
{
  private eventObservers: EventObserver<EventName, EventData>[] = []
  public loggingEnabled = false
  private criticalPromises: Promise<unknown>[] = []

  constructor(protected internalEventBus: InternalEventBusInterface) {}

  public addEventObserver(observer: EventObserver<EventName, EventData>): () => void {
    this.eventObservers.push(observer)
    return () => {
      removeFromArray(this.eventObservers, observer)
    }
  }

  protected async notifyEvent(eventName: EventName, data?: EventData): Promise<void> {
    for (const observer of this.eventObservers) {
      await observer(eventName, data)
    }

    this.internalEventBus.publish({
      type: eventName as unknown as string,
      payload: data,
    })
  }

  protected async notifyEventSync(eventName: EventName, data?: EventData): Promise<void> {
    for (const observer of this.eventObservers) {
      await observer(eventName, data)
    }

    await this.internalEventBus.publishSync(
      {
        type: eventName as unknown as string,
        payload: data,
      },
      InternalEventPublishStrategy.SEQUENCE,
    )
  }

  /**
   * Called by application to allow services to momentarily block deinit until
   * sensitive operations complete.
   */
  public async blockDeinit(): Promise<void> {
    await Promise.all(this.criticalPromises)
  }

  /**
   * Called by application before restart.
   * Subclasses should deregister any observers/timers
   */
  public deinit(): void {
    this.eventObservers.length = 0
    ;(this.internalEventBus as unknown) = undefined
  }

  /**
   * A critical function is one that should block signing out or destroying application
   * session until the crticial function has completed. For example, persisting keys to
   * disk is a critical operation, and should be wrapped in this function call. The
   * parent application instance will await all criticial functions via the `blockDeinit`
   * function before signing out and deiniting.
   */
  protected async executeCriticalFunction<T = void>(func: () => Promise<T>): Promise<T> {
    const promise = func()
    this.criticalPromises.push(promise)
    return promise
  }

  /**
   * Application instances will call this function directly when they arrive
   * at a certain migratory state.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async handleApplicationStage(_stage: ApplicationStage): Promise<void> {
    // optional override
  }

  log(message: string, ...args: unknown[]): void {
    if (this.loggingEnabled) {
      log(this, message, args)
    }
  }
}
