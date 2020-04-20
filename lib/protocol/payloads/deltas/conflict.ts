import { SinglePayloadDelta } from './single_payload_delta';
import { CreateItemFromPayload } from '@Models/generator';
import { ImmutablePayloadCollection } from "@Protocol/collection/payload_collection";
import { ConflictStrategy } from '@Protocol/payloads/deltas/strategies';
import { CopyPayload } from '@Payloads/generator';
import { PayloadsByDuplicating, PayloadContentsEqual } from '@Payloads/functions';
import { greaterOfTwoDates, uniqCombineObjArrays } from '@Lib/utils';

export class ConflictDelta extends SinglePayloadDelta {

  public async resultingCollection() {
    const tmpBaseItem = CreateItemFromPayload(this.basePayload);
    const tmpApplyItem = CreateItemFromPayload(this.applyPayload);
    const strategy = tmpBaseItem.strategyWhenConflictingWithItem(tmpApplyItem);
    const results = await this.payloadsByHandlingStrategy(strategy);
    return ImmutablePayloadCollection.WithPayloads(results, this.source);
  }

  private async payloadsByHandlingStrategy(strategy: ConflictStrategy) {
    /** Ensure no conflict has already been created with the incoming content.
     * This can occur in a multi-page sync request where in the middle of the request,
     * we make changes to many items, including duplicating, but since we are still not
     * uploading the changes until after the multi-page request completes, we may have
     * already conflicted this item. */
    const existingConflict = this.baseCollection.conflictsOf(this.applyPayload.uuid)[0];
    if (existingConflict && PayloadContentsEqual(existingConflict, this.applyPayload)) {
      /** Conflict exists and its contents are the same as incoming value, do not make duplicate */
      return [];
    }
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
          dirty: true,
          dirtiedDate: new Date()
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
          dirtiedDate: new Date(),
          content: {
            ...this.basePayload.safeContent,
            references: refs
          }
        }
      );
      return [payload];
    }

    throw 'Unhandled strategy';
  }
}
