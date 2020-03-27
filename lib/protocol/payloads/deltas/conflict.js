import { CreateItemFromPayload } from '@Models/generator';
import { PayloadCollection } from '@Payloads/collection';
import { ConflictStrategies } from '@Payloads/deltas/strategies';
import { PayloadsDelta } from '@Payloads/deltas/delta';
import { CopyPayload } from '@Payloads/generator';
import { PayloadsByDuplicating } from '@Payloads/functions';
import { greaterOfTwoDates, uniqCombineObjArrays } from '@Lib/utils';

export class ConflictDelta extends PayloadsDelta {

  constructor({ baseCollection, basePayload, applyPayload, source }) {
    super({ baseCollection: baseCollection });
    this.basePayload = basePayload;
    this.applyPayload = applyPayload;
    this.source = source;
  }

  async resultingCollection() {
    const tmpBaseItem = CreateItemFromPayload(this.basePayload);
    const tmpApplyItem = CreateItemFromPayload(this.applyPayload);
    const strategy = tmpBaseItem.strategyWhenConflictingWithItem({
      item: tmpApplyItem
    });

    const results = await this.payloadsByHandlingStrategy({
      strategy: strategy
    });

    return new PayloadCollection(results, this.source);
  }

  async payloadsByHandlingStrategy({ strategy }) {
    if (strategy === ConflictStrategies.KeepLeft) {
      return [this.basePayload];
    }

    if (strategy === ConflictStrategies.KeepRight) {
      return [this.applyPayload];
    }

    if (strategy === ConflictStrategies.KeepLeftDuplicateRight) {
      const updatedAt = greaterOfTwoDates(
        this.basePayload.updated_at,
        this.applyPayload.updated_at
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

    if (strategy === ConflictStrategies.DuplicateLeftKeepRight) {
      const leftPayloads = await PayloadsByDuplicating(
        this.basePayload,
        this.baseCollection,
        true,
      );
      const rightPayload = this.applyPayload;
      return leftPayloads.concat([rightPayload]);
    }

    if (strategy === ConflictStrategies.KeepLeftMergeRefs) {
      const refs = uniqCombineObjArrays(
        this.basePayload.content.references,
        this.applyPayload.content.references,
        ['uuid', 'content_type']
      );
      const updatedAt = greaterOfTwoDates(
        this.basePayload.updated_at,
        this.applyPayload.updated_at
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
