import { SNPureKey } from '@Models/keys/pureKey';

export class SNItemKey extends SNPureKey {

  /**
   * Because this is a traditional SFItem, the constructor expects an object with a .content
   * property. FromRaw allows you to send in an unwrapped raw key hash instead.
  */
  static FromRaw(key) {
    return new SNItemKey({content: key});
  }

  get content_type() {
    return "SN|ItemKey";
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
