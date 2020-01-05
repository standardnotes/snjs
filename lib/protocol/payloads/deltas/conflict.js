import { PayloadsDelta } from '@Protocol/payloads/deltas/delta';
import { CreateItemFromPayload } from '@Services/modelManager';
import { PayloadCollection } from '@Protocol/payloads';
import * as sources from '@Protocol/payloads/sources';
import * as strategies from '@Protocol/payloads/deltas/strategies';
import {greaterOfTwoDates, uniqCombineArrays} from '@Lib/utils';

export class ConflictDelta extends PayloadsDelta {

  constructor({baseCollection, basePayload, applyPayload, source}) {
    super({baseCollection: baseCollection});
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
    })
  }

  async payloadsByHandlingStrategy({strategy}) {
    if(strategy === CONFLICT_STRATEGY_KEEP_RIGHT) {
      return [this.applyPayload];
    }

    if(strategy === CONFLICT_STRATEGY_KEEP_LEFT_DUPLICATE_RIGHT) {
      let updated_at = greaterOfTwoDates(
        this.basePayload.updated_at,
        this.applyPayload.updated_at
      );
      const leftPayload = CreatePayloadFromAnyObject({
        object: this.basePayload,
        override: {
          updated_at: updated_at,
          dirty: true
        }
      })
      const rightPayloads = await PayloadsByCopying({
        payload: this.applyPayload,
        baseCollection: this.baseCollection,
        isConflict: true,
      })
      return [leftPayload].concat(rightPayloads);
    }

    if(strategy === CONFLICT_STRATEGY_DUPLICATE_LEFT_KEEP_RIGHT) {
      const leftPayloads = await PayloadsByCopying({
        payload: this.basePayload,
        baseCollection: this.baseCollection,
        isConflict: true,
      })
      const rightPayload = this.applyPayload;
      return leftPayloads.concat([rightPayload]);
    }

    if(strategy === CONFLICT_STRATEGY_KEEP_LEFT_MERGE_REFS) {
      const refs = uniqCombineArrays(
        this.basePayload.content.references,
        this.applyPayload.content.references
      );
      return CreatePayloadFromAnyObject({
        object: this.basePayload,
        override: {
          updated_at: updated_at,
          dirty: true,
          content: { references: refs }
        }
      })
    }

    throw 'Unhandled strategy';
  }
}
