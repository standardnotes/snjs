import { SFItem } from '@Models/core/item';
import { ContentTypes } from '@Models/content_types';

export class SNMfa extends SFItem {
  // eslint-disable-next-line camelcase
  get content_type() {
    return ContentTypes.Mfa;
  }
  
  doNotEncrypt() {
    return true;
  }
}
