import { greaterOfTwoDates, uniqCombineObjArrays } from '@standardnotes/utils'
import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import {
  CreateDecryptedItemFromPayload,
  CreateItemFromPayload,
} from '../../Utilities/Item/ItemGenerator'
import { HistoryMap, historyMapFunctions } from '../History/HistoryMap'
import { ConflictStrategy } from '../../Abstract/Item/Types/ConflictStrategy'
import { PayloadsByDuplicating } from '../../Utilities/Payload/PayloadsByDuplicating'
import { PayloadContentsEqual } from '../../Utilities/Payload/PayloadContentsEqual'
import { FullyFormedPayloadInterface } from '../../Abstract/Payload'
import {
  isDecryptedPayload,
  isErrorDecryptingPayload,
  isDeletedPayload,
} from '../../Abstract/Payload/Interfaces/TypeCheck'
import { ContentType } from '@standardnotes/common'

export class ConflictDelta {
  constructor(
    protected readonly baseCollection: ImmutablePayloadCollection,
    protected readonly basePayload: FullyFormedPayloadInterface,
    protected readonly applyPayload: FullyFormedPayloadInterface,
    protected readonly historyMap: HistoryMap,
  ) {}

  public result(): FullyFormedPayloadInterface[] {
    const strategy = this.getConflictStrategy()

    return this.handleStrategy(strategy)
  }

  private getConflictStrategy(): ConflictStrategy {
    if (this.basePayload.content_type === ContentType.ItemsKey) {
      return this.getItemsKeyConflictStrategy()
    }

    if (isErrorDecryptingPayload(this.basePayload) || isErrorDecryptingPayload(this.applyPayload)) {
      return ConflictStrategy.KeepBaseDuplicateApply
    } else if (isDecryptedPayload(this.basePayload)) {
      /**
       * Ensure no conflict has already been created with the incoming content.
       * This can occur in a multi-page sync request where in the middle of the request,
       * we make changes to many items, including duplicating, but since we are still not
       * uploading the changes until after the multi-page request completes, we may have
       * already conflicted this item.
       */
      const existingConflict = this.baseCollection.conflictsOf(this.applyPayload.uuid)[0]
      if (
        existingConflict &&
        isDecryptedPayload(existingConflict) &&
        isDecryptedPayload(this.applyPayload) &&
        PayloadContentsEqual(existingConflict, this.applyPayload)
      ) {
        /** Conflict exists and its contents are the same as incoming value, do not make duplicate */
        return ConflictStrategy.KeepBase
      } else {
        const tmpBaseItem = CreateDecryptedItemFromPayload(this.basePayload)
        const tmpApplyItem = CreateItemFromPayload(this.applyPayload)
        const historyEntries = this.historyMap[this.basePayload.uuid] || []
        const previousRevision = historyMapFunctions.getNewestRevision(historyEntries)

        return tmpBaseItem.strategyWhenConflictingWithItem(tmpApplyItem, previousRevision)
      }
    } else if (isDeletedPayload(this.basePayload) || isDeletedPayload(this.applyPayload)) {
      const baseDeleted = isDeletedPayload(this.basePayload)
      const applyDeleted = isDeletedPayload(this.applyPayload)
      if (baseDeleted && applyDeleted) {
        return ConflictStrategy.KeepApply
      } else {
        return ConflictStrategy.KeepApply
      }
    }

    throw Error('Unhandled strategy in Conflict Delta getConflictStrategy')
  }

  private getItemsKeyConflictStrategy(): ConflictStrategy {
    return ConflictStrategy.KeepApply
  }

  private handleStrategy(strategy: ConflictStrategy): FullyFormedPayloadInterface[] {
    if (strategy === ConflictStrategy.KeepBase) {
      const updatedAt = greaterOfTwoDates(
        this.basePayload.serverUpdatedAt,
        this.applyPayload.serverUpdatedAt,
      )
      const updatedAtTimestamp = Math.max(
        this.basePayload.updated_at_timestamp,
        this.applyPayload.updated_at_timestamp,
      )

      const leftPayload = this.basePayload.copy(
        {
          updated_at: updatedAt,
          updated_at_timestamp: updatedAtTimestamp,
          dirty: true,
          dirtiedDate: new Date(),
        },
        this.applyPayload.source,
      )

      return [leftPayload]
    }

    if (strategy === ConflictStrategy.KeepApply) {
      const result = this.applyPayload.copy(
        {
          lastSyncBegan: this.basePayload.lastSyncBegan,
        },
        this.applyPayload.source,
      )

      return [result]
    }

    if (strategy === ConflictStrategy.KeepBaseDuplicateApply) {
      const updatedAt = greaterOfTwoDates(
        this.basePayload.serverUpdatedAt,
        this.applyPayload.serverUpdatedAt,
      )

      const updatedAtTimestamp = Math.max(
        this.basePayload.updated_at_timestamp,
        this.applyPayload.updated_at_timestamp,
      )

      const leftPayload = this.basePayload.copy(
        {
          updated_at: updatedAt,
          updated_at_timestamp: updatedAtTimestamp,
          dirty: true,
          dirtiedDate: new Date(),
        },
        this.applyPayload.source,
      )

      const rightPayloads = PayloadsByDuplicating({
        payload: this.applyPayload,
        baseCollection: this.baseCollection,
        isConflict: true,
        source: this.applyPayload.source,
      })

      return [leftPayload].concat(rightPayloads)
    }

    if (strategy === ConflictStrategy.DuplicateBaseKeepApply) {
      const leftPayloads = PayloadsByDuplicating({
        payload: this.basePayload,
        baseCollection: this.baseCollection,
        isConflict: true,
        source: this.applyPayload.source,
      })

      const rightPayload = this.applyPayload.copy(
        {
          lastSyncBegan: this.basePayload.lastSyncBegan,
        },
        this.applyPayload.source,
      )

      return leftPayloads.concat([rightPayload])
    }

    if (
      strategy === ConflictStrategy.KeepBaseMergeRefs &&
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

      const payload = this.basePayload.copy(
        {
          updated_at: updatedAt,
          updated_at_timestamp: updatedAtTimestamp,
          dirty: true,
          dirtiedDate: new Date(),
          content: {
            ...this.basePayload.content,
            references: refs,
          },
        },
        this.applyPayload.source,
      )

      return [payload]
    }

    throw Error('Unhandled strategy in conflict delta payloadsByHandlingStrategy')
  }
}
