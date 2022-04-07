import { greaterOfTwoDates, uniqCombineObjArrays } from '@standardnotes/utils'
import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import { CreateDecryptedItemFromPayload } from '../../Abstract/Item/Utilities/Generator'
import { HistoryMap, historyMapFunctions } from '../History/HistoryMap'
import { ConflictStrategy } from '../../Abstract/Item/Types/ConflictStrategy'
import { PayloadsByDuplicating } from '../../Abstract/Payload/Utilities/PayloadsByDuplicating'
import { PayloadContentsEqual } from '../../Abstract/Payload/Utilities/PayloadContentsEqual'
import { PayloadSource } from '../../Abstract/Payload/Types/PayloadSource'
import { FullyFormedPayloadInterface } from '../../Abstract/Payload'
import {
  isDecryptedPayload,
  isErrorDecryptingPayload,
} from '../../Abstract/Payload/Interfaces/TypeCheck'

export class ConflictDelta {
  constructor(
    protected readonly baseCollection: ImmutablePayloadCollection<FullyFormedPayloadInterface>,
    protected readonly basePayload: FullyFormedPayloadInterface,
    protected readonly applyPayload: FullyFormedPayloadInterface,
    protected readonly source: PayloadSource,
    protected readonly historyMap?: HistoryMap,
  ) {}

  public async resultingCollection(): Promise<ImmutablePayloadCollection> {
    let strategy: ConflictStrategy | undefined = undefined
    if (isErrorDecryptingPayload(this.basePayload) || isErrorDecryptingPayload(this.applyPayload)) {
      strategy = ConflictStrategy.KeepLeftDuplicateRight
    } else if (isDecryptedPayload(this.basePayload) && isDecryptedPayload(this.applyPayload)) {
      /**
       * Ensure no conflict has already been created with the incoming content.
       * This can occur in a multi-page sync request where in the middle of the request,
       * we make changes to many items, including duplicating, but since we are still not
       * uploading the changes until after the multi-page request completes, we may have
       * already conflicted this item.
       */
      const existingConflict = this.baseCollection.conflictsOf(this.applyPayload.uuid)[0]
      if (existingConflict && PayloadContentsEqual(existingConflict, this.applyPayload)) {
        /** Conflict exists and its contents are the same as incoming value, do not make duplicate */
        strategy = ConflictStrategy.KeepLeft
      } else {
        const tmpBaseItem = CreateDecryptedItemFromPayload(this.basePayload)
        const tmpApplyItem = CreateDecryptedItemFromPayload(this.applyPayload)
        const historyEntries = this.historyMap?.[this.basePayload.uuid] || []
        const previousRevision = historyMapFunctions.getNewestRevision(historyEntries)
        strategy = tmpBaseItem.strategyWhenConflictingWithItem(tmpApplyItem, previousRevision)
      }
    }

    if (strategy == undefined) {
      throw Error('Unhandled strategy in Conflict Delta')
    }

    const results = await this.payloadsByHandlingStrategy(strategy)

    return ImmutablePayloadCollection.WithPayloads(results, this.source)
  }

  private async payloadsByHandlingStrategy(strategy: ConflictStrategy) {
    if (strategy === ConflictStrategy.KeepLeft) {
      const updatedAt = greaterOfTwoDates(
        this.basePayload.serverUpdatedAt,
        this.applyPayload.serverUpdatedAt,
      )
      const updatedAtTimestamp = Math.max(
        this.basePayload.updated_at_timestamp,
        this.applyPayload.updated_at_timestamp,
      )
      const leftPayload = this.basePayload.copy({
        updated_at: updatedAt,
        updated_at_timestamp: updatedAtTimestamp,
        dirty: true,
        dirtiedDate: new Date(),
      })
      return [leftPayload]
    }

    if (strategy === ConflictStrategy.KeepRight) {
      const result = this.applyPayload.copy({
        lastSyncBegan: this.basePayload.lastSyncBegan,
        lastSyncEnd: new Date(),
      })
      return [result]
    }

    if (strategy === ConflictStrategy.KeepLeftDuplicateRight) {
      const updatedAt = greaterOfTwoDates(
        this.basePayload.serverUpdatedAt,
        this.applyPayload.serverUpdatedAt,
      )

      const updatedAtTimestamp = Math.max(
        this.basePayload.updated_at_timestamp,
        this.applyPayload.updated_at_timestamp,
      )

      const leftPayload = this.basePayload.copy({
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
      const rightPayload = this.applyPayload.copy({
        lastSyncBegan: this.basePayload.lastSyncBegan,
        lastSyncEnd: new Date(),
      })

      return leftPayloads.concat([rightPayload])
    }

    if (
      strategy === ConflictStrategy.KeepLeftMergeRefs &&
      isDecryptedPayload(this.basePayload) &&
      isDecryptedPayload(this.applyPayload)
    ) {
      const refs = uniqCombineObjArrays(
        this.basePayload.content.references,
        this.applyPayload.content.references,
        ['uuid', 'content_type'],
      )

      const updatedAt = greaterOfTwoDates(
        this.basePayload.serverUpdatedAt,
        this.applyPayload.serverUpdatedAt,
      )

      const updatedAtTimestamp = Math.max(
        this.basePayload.updated_at_timestamp,
        this.applyPayload.updated_at_timestamp,
      )

      const payload = this.basePayload.copy({
        updated_at: updatedAt,
        updated_at_timestamp: updatedAtTimestamp,
        dirty: true,
        dirtiedDate: new Date(),
        content: {
          ...this.basePayload.content,
          references: refs,
        },
      })
      return [payload]
    }

    throw Error('Unhandled strategy')
  }
}
