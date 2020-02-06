import { SFItem } from '@Models/core/item';
import { ContentTypes } from '@Models/content_types';

export class SNEncryptedStorage extends SFItem {
  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content);
    this.storage = content.storage;
  }

  // eslint-disable-next-line camelcase
  get content_type() {
    return ContentTypes.EncryptedStorage;
  }
}
