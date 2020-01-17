export class PureService {

  /**
  * @public
  * Application instances will call this function directly when they arrive
  * at a certain migratory state.
  */
  async handleApplicationStage(stage) {

  }

  log(message, obj) {
    if(this.loggingEnabled)  {
      if(obj) {
        console.log(message, obj);
      } else {
        console.log(message);
      }
    }
  }

}
