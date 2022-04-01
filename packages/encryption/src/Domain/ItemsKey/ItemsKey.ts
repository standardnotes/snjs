import { ConflictStrategy, ItemsKeyContent, PayloadInterface } from '@standardnotes/models'
import { ProtocolVersion } from '@standardnotes/common'
import { HistoryEntryInterface, SNItem, ItemsKeyInterface } from '@standardnotes/models'

export function isItemsKey(x: unknown): x is ItemsKeyInterface {
  return x instanceof SNItemsKey
}

/**
 * A key used to encrypt other items. Items keys are synced and persisted.
 */
export class SNItemsKey extends SNItem<ItemsKeyContent> implements ItemsKeyInterface {
  keyVersion: ProtocolVersion
  isDefault: boolean | undefined
  itemsKey: string

  constructor(payload: PayloadInterface<ItemsKeyContent>) {
    super(payload)
    this.keyVersion = payload.safeContent.version
    this.isDefault = payload.safeContent.isDefault
    this.itemsKey = this.payload.safeContent.itemsKey
  }

  /** Do not duplicate items keys. Always keep original */
  strategyWhenConflictingWithItem(
    item: SNItem,
    previousRevision?: HistoryEntryInterface,
  ): ConflictStrategy {
    if (this.errorDecrypting) {
      return super.strategyWhenConflictingWithItem(item, previousRevision)
    }

    return ConflictStrategy.KeepLeft
  }

  get dataAuthenticationKey(): string | undefined {
    if (this.keyVersion === ProtocolVersion.V004) {
      throw 'Attempting to access legacy data authentication key.'
    }
    return this.payload.safeContent.dataAuthenticationKey
  }
}
