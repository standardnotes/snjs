import merge from 'lodash/merge';

type AccessType = 'encrypted' | 'decrypted'
type ActionVerb = 'get' | 'render' | 'show' | 'post' | 'nested'

/**
 * An in-memory only construct for displaying a list of actions, as part of SNActionsExtension.
 */
export class Action {

  public label!: string
  public desc!: string
  public running: boolean
  public error: boolean
  public lastExecuted?: Date
  public context!: string
  public verb!: ActionVerb
  public url!: string
  public access_type!: AccessType
  public readonly subactions?: Action[]
  public subrows?: any[]

  constructor(json: any) {
    merge(this, json);
    this.running = false;
    this.error = false;
    if (this.lastExecuted) {
      this.lastExecuted = new Date(this.lastExecuted);
    }
  }
}
