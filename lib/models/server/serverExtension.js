import { SFItem } from '@Models/core/item'
import { CONTENT_TYPE_SERVER_EXTENSION } from '@Models/content_types';

export class SNServerExtension extends SFItem {

  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content)
    this.url = content.url;
  }

  get content_type() {
    return CONTENT_TYPE_SERVER_EXTENSION;
  }

  doNotEncrypt() {
    return true;
  }
}
