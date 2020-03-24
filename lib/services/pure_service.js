import { removeFromArray } from '@Lib/utils';

export class PureService {

  constructor() {
    this.eventObservers = [];
  }

  addEventObserver(observer) {
    this.eventObservers.push(observer);
    return () => {
      removeFromArray(this.eventObservers, observer);
    };
  }

  async notifyEvent(eventName, data) {
    for (const observer of this.eventObservers) {
      await observer(eventName, data || {});
    }
  }

  /** 
   * @access public
   * Called by application before restart. 
   * Subclasses should deregister any observers/timers 
   */
  deinit() {
    /* Optional override */
    this.eventObservers.length = 0;
  }

  /**
  * @access public
  * Application instances will call this function directly when they arrive
  * at a certain migratory state.
  */
  async handleApplicationStage(stage) {

  }

  log(message, ...args) {
    if (this.loggingEnabled) {
      const date = new Date();
      const timeString = date.toLocaleTimeString().replace(' PM', '').replace(' AM', '');
      const string = `${timeString}.${date.getMilliseconds()}`;
      if (args) {
        console.log(string, message, ...args);
      } else {
        console.log(string, message);
      }
    }
  }

}
