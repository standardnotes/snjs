import { ContentTypes, SFItem } from '@Models';

export class SNMfa extends SFItem {
  get content_type() {
    return ContentTypes.Mfa;
  }
  
  doNotEncrypt() {
    return true;
  }
}
