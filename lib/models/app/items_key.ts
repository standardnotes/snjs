import { ConflictStrategy } from '@Protocol/payloads/deltas/strategies';
import { SNItem, ItemMutator } from '@Models/core/item';
import { ProtocolVersion } from '@Protocol/versions';

/**
 * A key used to encrypt other items. Items keys are synced and persisted.
 */
export class SNItemsKey extends SNItem {

  /** Do not duplicate items keys. Always keep original */
  strategyWhenConflictingWithItem(item: SNItem) {
    if (this.errorDecrypting) {
      return super.strategyWhenConflictingWithItem(item);
    }

    return ConflictStrategy.KeepLeft;
  }

  get version() {
    return this.payload.safeContent.version;
  }

  get isItemsKey() {
    return true;
  }

  get isDefault() {
    return this.payload.safeContent.isDefault;
  }

  get itemsKey() {
    return this.payload.safeContent.itemsKey;
  }

  get dataAuthenticationKey() {
    if (this.version === ProtocolVersion.V004) {
      throw 'Attempting to access legacy data authentication key.';
    }
    return this.payload.safeContent.dataAuthenticationKey;
  }
}

export class ItemsKeyMutator extends ItemMutator {
  set isDefault(isDefault: boolean) {
    this.content!.isDefault = isDefault;
  }
}