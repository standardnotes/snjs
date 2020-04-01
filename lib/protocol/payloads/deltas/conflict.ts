import { SinglePayloadDelta } from './single_payload_delta';
import { CreateItemFromPayload } from '@Models/generator';
import { PayloadCollection } from '@Payloads/collection';
import { ConflictStrategy } from '@Payloads/deltas/strategies';
import { CopyPayload } from '@Payloads/generator';
import { PayloadsByDuplicating } from '@Payloads/functions';
import { greaterOfTwoDates, uniqCombineObjArrays } from '@Lib/utils';

export class ConflictDelta extends SinglePayloadDelta {

  public async resultingCollection() {
    const tmpBaseItem = CreateItemFromPayload(this.basePayload);
    const tmpApplyItem = CreateItemFromPayload(this.applyPayload);
    const strategy = tmpBaseItem.strategyWhenConflictingWithItem(tmpApplyItem);
    const results = await this.payloadsByHandlingStrategy(strategy);
    return new PayloadCollection(results, this.source);
  }

  private async payloadsByHandlingStrategy(strategy: ConflictStrategy) {
    if (strategy === ConflictStrategy.KeepLeft) {
      return [this.basePayload];
    }
    if (strategy === ConflictStrategy.KeepRight) {
      return [this.applyPayload];
    }
    if (strategy === ConflictStrategy.KeepLeftDuplicateRight) {
      const updatedAt = greaterOfTwoDates(
        this.basePayload.updated_at!,
        this.applyPayload.updated_at!
      );
      const leftPayload = CopyPayload(
        this.basePayload,
        {
          updated_at: updatedAt,
          dirty: true
        }
      );
      const rightPayloads = await PayloadsByDuplicating(
        this.applyPayload,
        this.baseCollection,
        true,
      );
      return [leftPayload].concat(rightPayloads);
    }

    if (strategy === ConflictStrategy.DuplicateLeftKeepRight) {
      const leftPayloads = await PayloadsByDuplicating(
        this.basePayload,
        this.baseCollection,
        true,
      );
      const rightPayload = this.applyPayload;
      return leftPayloads.concat([rightPayload]);
    }

    if (strategy === ConflictStrategy.KeepLeftMergeRefs) {
      const refs = uniqCombineObjArrays(
        this.basePayload.contentObject.references,
        this.applyPayload.contentObject.references,
        ['uuid', 'content_type']
      );
      const updatedAt = greaterOfTwoDates(
        this.basePayload.updated_at!,
        this.applyPayload.updated_at!
      );
      const payload = CopyPayload(
        this.basePayload,
        {
          updated_at: updatedAt,
          dirty: true,
          content: { references: refs }
        }
      );
      return [payload];
    }

    throw 'Unhandled strategy';
  }
}
