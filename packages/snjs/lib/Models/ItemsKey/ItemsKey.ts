import { HistoryEntry } from '@Lib/Services/History/Entries/HistoryEntry'
import { SNItem } from '@Lib/Models/Item/Item'
import { ConflictStrategy } from '@Lib/Protocol/payloads/deltas/strategies'
import { ProtocolVersion } from '@standardnotes/common'

/**
 * A key used to encrypt other items. Items keys are synced and persisted.
 */
export class SNItemsKey extends SNItem {
  /** Do not duplicate items keys. Always keep original */
  strategyWhenConflictingWithItem(item: SNItem, previousRevision?: HistoryEntry): ConflictStrategy {
    if (this.errorDecrypting) {
      return super.strategyWhenConflictingWithItem(item, previousRevision)
    }

    return ConflictStrategy.KeepLeft
  }

  get keyVersion(): string | undefined {
    return this.payload.safeContent.version
  }

  get isItemsKey(): boolean {
    return true
  }

  get isDefault(): boolean | undefined {
    return this.payload.safeContent.isDefault
  }

  get itemsKey(): string | undefined {
    return this.payload.safeContent.itemsKey
  }

  get dataAuthenticationKey(): string | undefined {
    if (this.keyVersion === ProtocolVersion.V004) {
      throw 'Attempting to access legacy data authentication key.'
    }
    return this.payload.safeContent.dataAuthenticationKey
  }
}
