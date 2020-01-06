import { SNPureKey } from '@Models/keys/pureKey';
import { SN_ITEMS_KEY_CONTENT_TYPE } from '@Lib/constants';
import { CreateMaxPayloadFromAnyObject } from '@Protocol/payloads/generator';

export class SNItemsKey extends SNPureKey {

  /**
   * Because this is a traditional SFItem, the constructor expects an object with a .content
   * property. FromRaw allows you to send in an unwrapped raw key hash instead.
  */
  static FromRaw(key) {
    const payload = CreateMaxPayloadFromAnyObject({
      object: {content: key}
    })
    return new SNItemsKey(payload);
  }

  get content_type() {
    return SN_ITEMS_KEY_CONTENT_TYPE;
  }

  get itemsKey() {
    return this.keyContent.itemsKey;
  }

  get dataAuthenticationKey() {
    if(this.keyContent.version === '004') {
      throw 'Attempting to access legacy data authentication key.';
    }
    return this.keyContent.dataAuthenticationKey;
  }

  get isDefault()  {
    return this.content.isDefault;
  }
}
