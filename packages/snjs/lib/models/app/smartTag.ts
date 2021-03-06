import { PurePayload } from './../../protocol/payloads/pure_payload';
import { SNTag } from '@Models/app/tag';
import { SNPredicate } from '@Models/core/predicate';

/**
 * A tag that defines a predicate that consumers can use to retrieve a dynamic
 * list of notes.
 */
export class SNSmartTag extends SNTag {
  public readonly predicate!: SNPredicate;

  constructor(payload: PurePayload) {
    super(payload);
    if (payload.safeContent.predicate) {
      this.predicate = SNPredicate.FromJson(payload.safeContent.predicate);
    }
  }
}
