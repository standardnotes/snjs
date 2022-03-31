import { ConflictStrategy, PayloadContent, PurePayload } from '@standardnotes/payloads'
import { ProtocolVersion } from '@standardnotes/common'
import { HistoryEntry, SNItem, ItemsKeyInterface } from '@standardnotes/models'

interface ItemsKeyContent extends PayloadContent {
  keyVersion: ProtocolVersion
  isDefault: boolean | undefined
  itemsKey: string
}

export function isItemsKey(x: unknown): x is ItemsKeyInterface {
  return x instanceof SNItemsKey
}

/**
 * A key used to encrypt other items. Items keys are synced and persisted.
 */
export class SNItemsKey extends SNItem<ItemsKeyContent> implements ItemsKeyInterface {
  constructor(payload: PurePayload<ItemsKeyContent>) {
    super(payload)
    this.keyVersion = payload.safeContent.keyVersion
  }

  /** Do not duplicate items keys. Always keep original */
  strategyWhenConflictingWithItem(item: SNItem, previousRevision?: HistoryEntry): ConflictStrategy {
    if (this.errorDecrypting) {
      return super.strategyWhenConflictingWithItem(item, previousRevision)
    }

    return ConflictStrategy.KeepLeft
  }

  get keyVersion(): ProtocolVersion {
    return this.payload.safeContent.versdion
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
