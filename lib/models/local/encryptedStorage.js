import { SFItem } from '@Models/core/item'
import { CONTENT_TYPE_ENCRYPTED_STORAGE } from '@Models/content_types';

export class SNEncryptedStorage extends SFItem {

  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content)
    this.storage = content.storage;
  }

  get content_type() {
    return CONTENT_TYPE_ENCRYPTED_STORAGE;
  }

}
