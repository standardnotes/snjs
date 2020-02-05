import { ContentTypes, SFItem } from '@Models';

export class SNEncryptedStorage extends SFItem {
  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content);
    this.storage = content.storage;
  }

  get content_type() {
    return ContentTypes.EncryptedStorage;
  }
}
