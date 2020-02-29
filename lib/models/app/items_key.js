import { SFItem } from '@Models/core/item';
import { ContentTypes } from '@Models/content_types';
import { CreateMaxPayloadFromAnyObject, ConflictStrategies } from '@Payloads';
import { ProtocolVersions } from '@Protocol';

/**
 * A key used to encrypt other items. Items keys are synced and persisted.
 */
export class SNItemsKey extends SFItem {

  /**
   * Because this is a traditional SFItem, the constructor expects an object
   * with a .content property. FromRaw allows you to send in an unwrapped
   * raw key hash instead.
   */
  static FromRaw(key) {
    const payload = CreateMaxPayloadFromAnyObject({
      object: {
        content: key
      }
    });
    return new SNItemsKey(payload);
  }

  // eslint-disable-next-line camelcase
  get content_type() {
    return ContentTypes.ItemsKey;
  }

  /** Do not duplicate items keys. Always keep original */
  strategyWhenConflictingWithItem({item}) {
    if(this.errorDecrypting) {
      return super.strategyWhenConflictingWithItem({item});
    }

    return ConflictStrategies.KeepLeft;
  }

  get version() {
    return this.content.version;
  }

  get isItemsKey() {
    return true;
  }

  get isDefault()  {
    return this.content.isDefault;
  }

  get itemsKey() {
    return this.content.itemsKey;
  }

  get dataAuthenticationKey() {
    if(this.version === ProtocolVersions.V004) {
      throw 'Attempting to access legacy data authentication key.';
    }
    return this.content.dataAuthenticationKey;
  }
}
