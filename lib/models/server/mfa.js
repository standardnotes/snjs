import { SFItem } from '@Models/core/item'
import { CONTENT_TYPE_MFA } from '@Models/content_types';

export class SNMfa extends SFItem {

  get content_type() {
    return CONTENT_TYPE_MFA;
  }

  doNotEncrypt() {
    return true;
  }

}
