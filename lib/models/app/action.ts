import merge from 'lodash/merge';
/**
 * An in-memory only construct for displaying a list of actions, as part of SNActionsExtension.
 */
export class Action {

  public running: boolean
  public error: boolean
  public lastExecuted?: Date
  public context!: string

  constructor(json: any) {
    merge(this, json);
    this.running = false;
    this.error = false;
    if (this.lastExecuted) {
      this.lastExecuted = new Date(this.lastExecuted);
    }
  }
}
