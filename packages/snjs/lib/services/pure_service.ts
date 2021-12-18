import { log, removeFromArray } from '@Lib/utils';
import { ApplicationStage } from '@Lib/stages';
import { DeviceInterface } from '../device_interface';

type EventObserver<E, D> = (eventName: E, data?: D) => Promise<void> | void;

export abstract class PureService<EventName = string, EventData = undefined> {
  private eventObservers: EventObserver<EventName, EventData>[] = [];
  public loggingEnabled = false;
  public deviceInterface?: DeviceInterface;
  private criticalPromises: Promise<unknown>[] = [];

  public addEventObserver(
    observer: EventObserver<EventName, EventData>
  ): () => void {
    this.eventObservers.push(observer);
    return () => {
      removeFromArray(this.eventObservers, observer);
    };
  }

  protected async notifyEvent(
    eventName: EventName,
    data?: EventData
  ): Promise<void> {
    for (const observer of this.eventObservers) {
      await observer(eventName, data);
    }
  }

  /**
   * Called by application to allow services to momentarily block deinit until
   * sensitive operations complete.
   */
  public async blockDeinit(): Promise<void> {
    await Promise.all(this.criticalPromises);
  }

  /**
   * Called by application before restart.
   * Subclasses should deregister any observers/timers
   */
  public deinit(): void {
    this.eventObservers.length = 0;
    this.deviceInterface = undefined;
  }

  /**
   * A critical function is one that should block signing out or destroying application
   * session until the crticial function has completed. For example, persisting keys to
   * disk is a critical operation, and should be wrapped in this function call. The
   * parent application instance will await all criticial functions via the `blockDeinit`
   * function before signing out and deiniting.
   */
  protected async executeCriticalFunction<T = void>(
    func: () => Promise<T>
  ): Promise<T> {
    const promise = func();
    this.criticalPromises.push(promise);
    return promise;
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
      log(this, message, args);
    }
  }
}
