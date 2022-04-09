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

  public async resultingCollection(): Promise<
    ImmutablePayloadCollection<FullyFormedPayloadInterface>
  > {
    let strategy: ConflictStrategy | undefined = undefined

    if (isErrorDecryptingPayload(this.basePayload) || isErrorDecryptingPayload(this.applyPayload)) {
      strategy = ConflictStrategy.KeepLeftDuplicateRight
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
        strategy = ConflictStrategy.KeepLeft
      } else {
        const tmpBaseItem = CreateDecryptedItemFromPayload(this.basePayload)
        const tmpApplyItem = CreateItemFromPayload(this.applyPayload)
        const historyEntries = this.historyMap?.[this.basePayload.uuid] || []
        const previousRevision = historyMapFunctions.getNewestRevision(historyEntries)

        strategy = tmpBaseItem.strategyWhenConflictingWithItem(tmpApplyItem, previousRevision)
      }
    }

    if (strategy == undefined) {
      throw Error('Unhandled strategy in Conflict Delta resultingCollection')
    }

    const results = await this.handleStrategy(strategy)

    return ImmutablePayloadCollection.WithPayloads(results, this.source)
  }

  private async handleStrategy(strategy: ConflictStrategy): Promise<FullyFormedPayloadInterface[]> {
    if (strategy === ConflictStrategy.KeepLeft) {
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

    if (strategy === ConflictStrategy.KeepRight) {
      const result = this.applyPayload.copy(
        {
          lastSyncBegan: this.basePayload.lastSyncBegan,
          lastSyncEnd: new Date(),
        },
        this.applyPayload.source,
      )

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

      const leftPayload = this.basePayload.copy(
        {
          updated_at: updatedAt,
          updated_at_timestamp: updatedAtTimestamp,
          dirty: true,
          dirtiedDate: new Date(),
        },
        this.applyPayload.source,
      )

      const rightPayloads = await PayloadsByDuplicating({
        payload: this.applyPayload,
        baseCollection: this.baseCollection,
        isConflict: true,
        source: this.applyPayload.source,
      })

      return [leftPayload].concat(rightPayloads)
    }

    if (strategy === ConflictStrategy.DuplicateLeftKeepRight) {
      const leftPayloads = await PayloadsByDuplicating({
        payload: this.basePayload,
        baseCollection: this.baseCollection,
        isConflict: true,
        source: this.applyPayload.source,
      })

      const rightPayload = this.applyPayload.copy(
        {
          lastSyncBegan: this.basePayload.lastSyncBegan,
          lastSyncEnd: new Date(),
        },
        this.applyPayload.source,
      )

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
