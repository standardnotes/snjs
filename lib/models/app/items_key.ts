import { SNItem } from '@Models/core/item';
import { ContentTypes } from '@Models/content_types';
import { CreateMaxPayloadFromAnyObject, ConflictStrategies } from '@Payloads/index';
import { ProtocolVersions } from '@Protocol/versions';

/**
 * A key used to encrypt other items. Items keys are synced and persisted.
 */
export class SNItemsKey extends SNItem {

  getDefaultContentType() {
    return ContentTypes.ItemsKey;
  }

  /** Do not duplicate items keys. Always keep original */
  strategyWhenConflictingWithItem(item: SNItem) {
    if (this.errorDecrypting) {
      return super.strategyWhenConflictingWithItem(item);
    }

    return ConflictStrategies.KeepLeft;
  }

  get version() {
    return this.content.version;
  }

  get isItemsKey() {
    return true;
  }

  get isDefault() {
    return this.content.isDefault;
  }

  get itemsKey() {
    return this.content.itemsKey;
  }

  get dataAuthenticationKey() {
    if (this.version === ProtocolVersions.V004) {
      throw 'Attempting to access legacy data authentication key.';
    }
    return this.content.dataAuthenticationKey;
  }
}
