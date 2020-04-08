import { removeFromArray } from '@Lib/utils';
import { ApplicationStage } from '@Lib/stages';
import { DeviceInterface } from '../device_interface';

type EventObserver = (eventName: string, data: any) => Promise<void>

export abstract class PureService {

  private eventObservers: EventObserver[] = []
  public loggingEnabled = false
  public deviceInterface?: DeviceInterface

  public addEventObserver(observer: EventObserver) {
    this.eventObservers.push(observer);
    return () => {
      removeFromArray(this.eventObservers, observer);
    };
  }

  protected async notifyEvent(eventName: string, data?: any) {
    for (const observer of this.eventObservers) {
      await observer(eventName, data || {});
    }
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
  * Application instances will call this function directly when they arrive
  * at a certain migratory state.
  */
  public async handleApplicationStage(stage: ApplicationStage) {

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
