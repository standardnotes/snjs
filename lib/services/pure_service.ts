import { removeFromArray } from '@Lib/utils';
import { ApplicationStage } from '@Lib/stages';
import { DeviceInterface } from '../device_interface';

type EventObserver<T> = (eventName: T, data: any) => Promise<void>

export abstract class PureService<E = string> {

  private eventObservers: EventObserver<E>[] = []
  public loggingEnabled = false
  public deviceInterface?: DeviceInterface
  private criticalPromises: Promise<any>[] = []

  public addEventObserver(observer: EventObserver<E>) {
    this.eventObservers.push(observer);
    return () => {
      removeFromArray(this.eventObservers, observer);
    };
  }

  protected async notifyEvent(eventName: E, data?: any) {
    for (const observer of this.eventObservers) {
      await observer(eventName, data || {});
    }
  }

  /**
   * Called by application to allow services to momentarily block deinit until
   * sensitive operations complete.
   */
  public async blockDeinit() {
    await Promise.all(this.criticalPromises);
  }

  /**
   * Called by application before restart.
   * Subclasses should deregister any observers/timers
   */
  public deinit() {
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
  protected async executeCriticalFunction<T = void>(func: () => Promise<T>) {
    const promise = func();
    this.criticalPromises.push(promise);
    return promise;
  }


  /**
  * Application instances will call this function directly when they arrive
  * at a certain migratory state.
  */
  public async handleApplicationStage(_stage: ApplicationStage) {
    // optional override
  }

  log(message: string, ...args: any[]) {
    if (this.loggingEnabled) {
      const date = new Date();
      const timeString = date.toLocaleTimeString().replace(' PM', '').replace(' AM', '');
      const string = `${timeString}.${date.getMilliseconds()}`;
      if (args) {
        args = args.map((arg) => {
          if(Array.isArray(arg)) {
            return arg.slice();
          } else {
            return arg;
          }
        })
        console.log(string, message, ...args);
      } else {
        console.log(string, message);
      }
    }
  }
}
