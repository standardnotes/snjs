import { SNPureKey } from '@Models/keys/pure_key';
import { CONTENT_TYPE_ITEMS_KEY } from '@Models/content_types';
import { CreateMaxPayloadFromAnyObject } from '@Payloads/generator';
import { PROTOCOL_VERSION_004 } from '@Protocol/versions';
import { CONFLICT_STRATEGY_KEEP_LEFT } from '@Payloads/deltas/strategies'

export class SNItemsKey extends SNPureKey {

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
    })
    return new SNItemsKey(payload);
  }

  get content_type() {
    return CONTENT_TYPE_ITEMS_KEY;
  }

  /** Do not duplicate items keys. Always keep original */
  strategyWhenConflictingWithItem({item}) {
    if(this.errorDecrypting) {
      return super.strategyWhenConflictingWithItem({item});
    }

    return CONFLICT_STRATEGY_KEEP_LEFT;
  }

  get isDefault()  {
    return this.content.isDefault;
  }
}
