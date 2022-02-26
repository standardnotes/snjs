import { SNItem } from '@Models/core/item';
import { SNTag } from '@Models/app/tag';
import { SNPredicate } from '@Models/core/predicate';
import { PurePayload } from '@standardnotes/payloads';

export const SMART_TAG_DSL_PREFIX = '![';

type SmartTagPredicateOperator =
  | 'and'
  | 'or'
  | 'not'
  | '!='
  | '='
  | '<'
  | '>'
  | '>='
  | '<='
  | 'startsWith'
  | 'in'
  | 'includes'
  | 'matches';

export interface SmartTagPredicateContent {
  keypath: string;
  operator: SmartTagPredicateOperator;
  value: string | Date | boolean | number | boolean | SmartTagPredicateContent;
}

/**
 * A tag that defines a predicate that consumers can use to retrieve a dynamic
 * list of notes.
 */
export class SNSmartTag extends SNTag {
  public readonly predicate!: SNPredicate<SNItem>;

  constructor(payload: PurePayload) {
    super(payload);
    if (payload.safeContent.predicate) {
      this.predicate = SNPredicate.FromJson(payload.safeContent.predicate);
    }
  }
}
