import { SNPureKey } from '@Models/keys/pureKey';
import { SN_ROOT_KEY_CONTENT_TYPE } from '@Lib/constants';
import { CreateMaxPayloadFromAnyObject } from '@Protocol/payloads/generator';
export class SNRootKey extends SNPureKey {

  /**
   * Because this is a traditional SFItem, the constructor expects an object with a .content
   * property. FromRaw allows you to send in an unwrapped raw key hash instead.
  */
  static FromRaw(key) {
    const payload = CreateMaxPayloadFromAnyObject({
      object: {content: key}
    })
    return new SNRootKey(payload);
  }

  static contentType() {
    return SN_ROOT_KEY_CONTENT_TYPE;
  }

  get content_type() {
    return this.constructor.contentType();
  }

  /**
   * When the root key is used to encrypt items, we use the masterKey directly.
   */
  get itemsKey() {
    return this.masterKey;
  }

  get masterKey() {
    return this.keyContent.masterKey;
  }

  get serverPassword() {
    return this.keyContent.serverPassword;
  }

  setDirty({}) {
    throw 'Root Key should not be dirtied or persisted.';
  }

  /**
   * @returns Object containg key/values that should be extracted from key for local saving.
   */
  rootValues() {
    return this.keyContent.rootValues();
  }
}
