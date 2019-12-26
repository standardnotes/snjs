import { SNPureKey } from '@Models/keys/pureKey';
export class SNRootKey extends SNPureKey {

  /**
   * Because this is a traditional SFItem, the constructor expects an object with a .content
   * property. FromRaw allows you to send in an unwrapped raw key hash instead.
  */
  static FromRaw(key) {
    return new SNRootKey({content: key});
  }

  static contentType() {
    return 'SN|RootKey|NoSync';
  }

  get content_type() {
    return this.constructor.contentType();
  }

  get masterKey() {
    return this.keyContent.masterKey;
  }

  get serverAuthenticationValue() {
    return this.keyContent.serverAuthenticationValue;
  }

  setDirty(dirty, updateClientDate) {
    throw 'Root Key should not be dirtied or persisted.';
  }

  /**
   * @returns Object containg key/values that should be extracted from key for local saving.
   */
  rootValues() {
    return this.keyContent.rootValues();
  }
}
