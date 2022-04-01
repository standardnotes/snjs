import { greaterOfTwoDates, uniqCombineObjArrays } from '@standardnotes/utils'
import { ImmutablePayloadCollection } from '../Collection/ImmutablePayloadCollection'
import { CreateItemFromPayload } from '../../Abstract/Item/Generator'
import { HistoryMap, historyMapFunctions } from '../History/HistoryMap'
import { ConflictStrategy } from '../../Abstract/Item/ConflictStrategy'
import {
  CopyPayload,
  PayloadByMerging,
} from '../../Abstract/Payload/Utilities/Functions'
import { PayloadsByDuplicating } from "../../Abstract/Payload/Utilities/PayloadsByDuplicating"
import { PayloadContentsEqual } from "../../Abstract/Payload/Utilities/PayloadContentsEqual"
import { PayloadField } from '../../Abstract/Payload/PayloadField'
import { PayloadSource } from '../../Abstract/Payload/PayloadSource'
import { PurePayload } from '../../Abstract/Payload/PurePayload'

export class ConflictDelta {
  constructor(
    protected readonly baseCollection: ImmutablePayloadCollection,
    protected readonly basePayload: PurePayload,
    protected readonly applyPayload: PurePayload,
    protected readonly source: PayloadSource,
    protected readonly historyMap?: HistoryMap,
  ) {}

  public async resultingCollection(): Promise<ImmutablePayloadCollection> {
    const tmpBaseItem = CreateItemFromPayload(this.basePayload)
    const tmpApplyItem = CreateItemFromPayload(this.applyPayload)
    const historyEntries = this.historyMap?.[this.basePayload.uuid] || []
    const previousRevision = historyMapFunctions.getNewestRevision(historyEntries)
    const strategy = tmpBaseItem.strategyWhenConflictingWithItem(tmpApplyItem, previousRevision)
    const results = await this.payloadsByHandlingStrategy(strategy)
    return ImmutablePayloadCollection.WithPayloads(results, this.source)
  }

  private async payloadsByHandlingStrategy(strategy: ConflictStrategy) {
    /** Ensure no conflict has already been created with the incoming content.
     * This can occur in a multi-page sync request where in the middle of the request,
     * we make changes to many items, including duplicating, but since we are still not
     * uploading the changes until after the multi-page request completes, we may have
     * already conflicted this item. */
    const existingConflict = this.baseCollection.conflictsOf(this.applyPayload.uuid)[0]
    if (existingConflict && PayloadContentsEqual(existingConflict, this.applyPayload)) {
      /** Conflict exists and its contents are the same as incoming value, do not make duplicate */
      strategy = ConflictStrategy.KeepLeft
    }
    if (strategy === ConflictStrategy.KeepLeft) {
      const updatedAt = greaterOfTwoDates(
        this.basePayload.serverUpdatedAt,
        this.applyPayload.serverUpdatedAt,
      )
      const updatedAtTimestamp = Math.max(
        this.basePayload.updated_at_timestamp!,
        this.applyPayload.updated_at_timestamp!,
      )
      const leftPayload = CopyPayload(this.basePayload, {
        updated_at: updatedAt,
        updated_at_timestamp: updatedAtTimestamp,
        dirty: true,
        dirtiedDate: new Date(),
      })
      return [leftPayload]
    }
    if (strategy === ConflictStrategy.KeepRight) {
      const result = PayloadByMerging(
        this.applyPayload,
        this.basePayload,
        [PayloadField.LastSyncBegan],
        {
          lastSyncEnd: new Date(),
        },
      )
      return [result]
    }
    if (strategy === ConflictStrategy.KeepLeftDuplicateRight) {
      const updatedAt = greaterOfTwoDates(
        this.basePayload.serverUpdatedAt,
        this.applyPayload.serverUpdatedAt,
      )
      const updatedAtTimestamp = Math.max(
        this.basePayload.updated_at_timestamp!,
        this.applyPayload.updated_at_timestamp!,
      )
      const leftPayload = CopyPayload(this.basePayload, {
        updated_at: updatedAt,
        updated_at_timestamp: updatedAtTimestamp,
        dirty: true,
        dirtiedDate: new Date(),
      })
      const rightPayloads = await PayloadsByDuplicating(
        this.applyPayload,
        this.baseCollection,
        true,
      )
      return [leftPayload].concat(rightPayloads)
    }

    if (strategy === ConflictStrategy.DuplicateLeftKeepRight) {
      const leftPayloads = await PayloadsByDuplicating(this.basePayload, this.baseCollection, true)
      const rightPayload = PayloadByMerging(
        this.applyPayload,
        this.basePayload,
        [PayloadField.LastSyncBegan],
        {
          lastSyncEnd: new Date(),
        },
      )
      return leftPayloads.concat([rightPayload])
    }

    if (strategy === ConflictStrategy.KeepLeftMergeRefs) {
      const refs = uniqCombineObjArrays(
        this.basePayload.contentObject.references,
        this.applyPayload.contentObject.references,
        ['uuid', 'content_type'],
      )
      const updatedAt = greaterOfTwoDates(
        this.basePayload.serverUpdatedAt,
        this.applyPayload.serverUpdatedAt,
      )
      const updatedAtTimestamp = Math.max(
        this.basePayload.updated_at_timestamp!,
        this.applyPayload.updated_at_timestamp!,
      )
      const payload = CopyPayload(this.basePayload, {
        updated_at: updatedAt,
        updated_at_timestamp: updatedAtTimestamp,
        dirty: true,
        dirtiedDate: new Date(),
        content: {
          ...this.basePayload.safeContent,
          references: refs,
        },
      })
      return [payload]
    }

    throw Error('Unhandled strategy')
  }
}
