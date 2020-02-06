import { CreateItemFromPayload } from '@Models/generator';
import {
  PayloadCollection, CopyPayload, ConflictStrategies, PayloadsByDuplicating, PayloadsDelta
} from '@Payloads';
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

    return new PayloadCollection({
      payloads: results,
      source: this.source
    });
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
      const leftPayload = CopyPayload({
        payload: this.basePayload,
        override: {
          updated_at: updatedAt,
          dirty: true
        }
      });
      const rightPayloads = await PayloadsByDuplicating({
        payload: this.applyPayload,
        baseCollection: this.baseCollection,
        isConflict: true,
      });
      return [leftPayload].concat(rightPayloads);
    }

    if (strategy === ConflictStrategies.DuplicateLeftKeepRight) {
      const leftPayloads = await PayloadsByDuplicating({
        payload: this.basePayload,
        baseCollection: this.baseCollection,
        isConflict: true,
      });
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
      const payload = CopyPayload({
        payload: this.basePayload,
        override: {
          updated_at: updatedAt,
          dirty: true,
          content: { references: refs }
        }
      });
      return [payload];
    }

    throw 'Unhandled strategy';
  }
}
