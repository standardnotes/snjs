export class SNService {

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
