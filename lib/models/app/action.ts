import merge from 'lodash/merge';

export enum ActionAccessType {
  Encrypted = 'encrypted',
  Decrypted = 'decrypted'
};

export enum ActionVerb {
  Get = 'get',
  Render = 'render',
  Show = 'show',
  Post = 'post',
  Nested = 'nested'
};

let availableId = Number.MIN_SAFE_INTEGER;
function getAvailableId() {
  availableId += 1;
  if (availableId === Number.MAX_SAFE_INTEGER) {
    /** Wrap around */
    availableId = Number.MIN_SAFE_INTEGER;
  }
  return availableId;
}

/**
 * An in-memory only construct for displaying a list of actions, as part of SNActionsExtension.
 */
export class Action {

  public readonly id = getAvailableId();
  public label!: string
  public desc!: string
  public running: boolean
  public error: boolean
  public lastExecuted?: Date
  public context!: string
  public verb!: ActionVerb
  public url!: string
  public access_type!: ActionAccessType
  public readonly subactions?: Action[]

  constructor(json: any) {
    merge(this, json);
    this.running = json.running ?? false;
    this.error = json.error ?? false;
    if (this.lastExecuted) {
      this.lastExecuted = new Date(this.lastExecuted);
    }
    this.subactions = json.subactions?.map((json: any) => new Action(json));
  }
}
