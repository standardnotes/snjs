import { PredicateInterface, PredicateOperator } from './../core/interface';
import { SNItem } from '@Models/core/item';
import { SNTag } from '@Models/app/tag';
import { PurePayload } from '@standardnotes/payloads';
import { predicateFromJson } from '../core/generators';

export const SMART_TAG_DSL_PREFIX = '![';

export interface SmartTagPredicateContent {
  keypath: string;
  operator: PredicateOperator;
  value: string | Date | boolean | number | boolean | SmartTagPredicateContent;
}

/**
 * A tag that defines a predicate that consumers can use to retrieve a dynamic
 * list of notes.
 */
export class SNSmartTag extends SNTag {
  public readonly predicate!: PredicateInterface<SNItem>;

  constructor(payload: PurePayload) {
    super(payload);
    if (payload.safeContent.predicate) {
      this.predicate = predicateFromJson(payload.safeContent.predicate);
    }
  }
}
