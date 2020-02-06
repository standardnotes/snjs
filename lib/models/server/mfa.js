import { ContentTypes, SFItem } from '@Models';

export class SNMfa extends SFItem {
  // eslint-disable-next-line camelcase
  get content_type() {
    return ContentTypes.Mfa;
  }
  
  doNotEncrypt() {
    return true;
  }
}
