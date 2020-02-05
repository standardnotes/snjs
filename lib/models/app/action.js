import merge from 'lodash/merge';
export class Action {
  constructor(json) {
    merge(this, json);
    this.running = false;
    this.error = false;
    if (this.lastExecuted) {
      this.lastExecuted = new Date(this.lastExecuted);
    }
  }
}
