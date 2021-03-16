import { PayloadByMerging } from '@Lib/protocol/payloads/generator';
import { PayloadSource } from './../sources';
import { PurePayload } from './../pure_payload';
import { CreateItemFromPayload } from '@Models/generator';
import { ImmutablePayloadCollection } from '@Protocol/collection/payload_collection';
import { ConflictStrategy } from '@Protocol/payloads/deltas/strategies';
import { CopyPayload } from '@Payloads/generator';
import {
  PayloadContentsEqual,
  PayloadsByDuplicating,
} from '@Payloads/functions';
import { greaterOfTwoDates, uniqCombineObjArrays } from '@Lib/utils';
import { PayloadField } from '../fields';
import { HistoryMap } from '@Lib/services/history/history_map';

export class ConflictDelta {
  constructor(
    protected readonly baseCollection: ImmutablePayloadCollection,
    protected readonly basePayload: PurePayload,
    protected readonly applyPayload: PurePayload,
    protected readonly source: PayloadSource,
    protected readonly historyMap?: HistoryMap
  ) {}

  public async resultingCollection(): Promise<ImmutablePayloadCollection> {
    const tmpBaseItem = CreateItemFromPayload(this.basePayload);
    const tmpApplyItem = CreateItemFromPayload(this.applyPayload);
    const strategy = tmpBaseItem.strategyWhenConflictingWithItem(
      tmpApplyItem,
      this.historyMap?.[this.basePayload.uuid]
    );
    const results = await this.payloadsByHandlingStrategy(strategy);
    return ImmutablePayloadCollection.WithPayloads(results, this.source);
  }

  private async payloadsByHandlingStrategy(strategy: ConflictStrategy) {
    /** Ensure no conflict has already been created with the incoming content.
     * This can occur in a multi-page sync request where in the middle of the request,
     * we make changes to many items, including duplicating, but since we are still not
     * uploading the changes until after the multi-page request completes, we may have
     * already conflicted this item. */
    const existingConflict = this.baseCollection.conflictsOf(
      this.applyPayload.uuid
    )[0];
    if (
      existingConflict &&
      PayloadContentsEqual(existingConflict, this.applyPayload)
    ) {
      /** Conflict exists and its contents are the same as incoming value, do not make duplicate */
      return [];
    }
    if (strategy === ConflictStrategy.KeepLeft) {
      const updatedAt = greaterOfTwoDates(
        this.basePayload.serverUpdatedAt!,
        this.applyPayload.serverUpdatedAt!
      );
      const leftPayload = CopyPayload(this.basePayload, {
        updated_at: updatedAt,
        dirty: true,
        dirtiedDate: new Date(),
      });
      return [leftPayload];
    }
    if (strategy === ConflictStrategy.KeepRight) {
      const result = PayloadByMerging(
        this.applyPayload,
        this.basePayload,
        [PayloadField.LastSyncBegan],
        {
          lastSyncEnd: new Date(),
        }
      );
      return [result];
    }
    if (strategy === ConflictStrategy.KeepLeftDuplicateRight) {
      const updatedAt = greaterOfTwoDates(
        this.basePayload.serverUpdatedAt!,
        this.applyPayload.serverUpdatedAt!
      );
      const leftPayload = CopyPayload(this.basePayload, {
        updated_at: updatedAt,
        dirty: true,
        dirtiedDate: new Date(),
      });
      const rightPayloads = await PayloadsByDuplicating(
        this.applyPayload,
        this.baseCollection,
        true
      );
      return [leftPayload].concat(rightPayloads);
    }

    if (strategy === ConflictStrategy.DuplicateLeftKeepRight) {
      const leftPayloads = await PayloadsByDuplicating(
        this.basePayload,
        this.baseCollection,
        true
      );
      const rightPayload = PayloadByMerging(
        this.applyPayload,
        this.basePayload,
        [PayloadField.LastSyncBegan],
        {
          lastSyncEnd: new Date(),
        }
      );
      return leftPayloads.concat([rightPayload]);
    }

    if (strategy === ConflictStrategy.KeepLeftMergeRefs) {
      const refs = uniqCombineObjArrays(
        this.basePayload.contentObject.references,
        this.applyPayload.contentObject.references,
        ['uuid', 'content_type']
      );
      const updatedAt = greaterOfTwoDates(
        this.basePayload.serverUpdatedAt!,
        this.applyPayload.serverUpdatedAt!
      );
      const payload = CopyPayload(this.basePayload, {
        updated_at: updatedAt,
        dirty: true,
        dirtiedDate: new Date(),
        content: {
          ...this.basePayload.safeContent,
          references: refs,
        },
      });
      return [payload];
    }

    throw Error('Unhandled strategy');
  }
}
