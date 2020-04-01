import { PayloadCollection } from '@Payloads/collection';
import { CopyPayload, PayloadOverride } from '@Payloads/generator';
import { SinglePayloadDelta } from './single_payload_delta';

/**
 * The merge delta merges any fields existing in the apply collection,
 * and leaves other fields untouched. The fields are determined on the individual
 * payload.fields. The resulting payload source is then said to be the source of 
 * the payload you are applying. For example, if you apply a payload with a source of LocalDirtied
 * onto a payload of source LocalRetrieved, the resulting payload will have a source of LocalDirtied.
 */
export class DeltaMerge extends SinglePayloadDelta {

  public async resultingCollection() {
    const override: PayloadOverride = {};
    for (const field of this.applyPayload.fields) {
      override[field] = this.applyPayload[field];
    }
    const result = CopyPayload(
      this.basePayload,
      override
    );
    return new PayloadCollection([result], this.applyPayload.source);
  }
}
