import pull from 'lodash/pull';

export class PureService {

  constructor() {
    this.eventObservers = [];
  }

  addEventObserver(observer) {
    this.eventObservers.push(observer);
    return () => {
      pull(this.eventObservers, observer);
    };
  }

  async notifyEvent(eventName, data) {
    for (const observer of this.eventObservers) {
      await observer(eventName, data || {});
    }
  }

  /** 
   * @public
   * Called by application before restart. 
   * Subclasses should deregister any observers/timers 
   */
  async prepareForApplicationRestart() {
    /* Optional override */
  }

  /**
  * @public
  * Application instances will call this function directly when they arrive
  * at a certain migratory state.
  */
  async handleApplicationStage(stage) {

  }

  log(message, obj) {
    if (this.loggingEnabled) {
      if (obj) {
        console.log(message, obj);
      } else {
        console.log(message);
      }
    }
  }

}
