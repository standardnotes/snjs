import { HistoryEntry } from '../History/HistoryEntry'
import { SNItem } from '../Item/Item'
import { ConflictStrategy } from '@standardnotes/payloads'
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

  get keyVersion(): ProtocolVersion {
    return this.payload.safeContent.version
  }

  get isDefault(): boolean | undefined {
    return this.payload.safeContent.isDefault
  }

  get itemsKey(): string {
    return this.payload.safeContent.itemsKey
  }

  get dataAuthenticationKey(): string | undefined {
    if (this.keyVersion === ProtocolVersion.V004) {
      throw 'Attempting to access legacy data authentication key.'
    }
    return this.payload.safeContent.dataAuthenticationKey
  }
}
