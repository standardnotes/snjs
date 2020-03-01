import { SNItem } from '@Models/core/item';
import { ContentTypes } from '@Models/content_types';

/**
 * A local-only construct that is used to persist a collection of key-values.
 * This object is typically stored in a device's key/value store and not in the
 * device's database.
 */
export class SNEncryptedStorage extends SNItem {
  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content);
    this.storage = content.storage;
  }

  // eslint-disable-next-line camelcase
  get content_type() {
    return ContentTypes.EncryptedStorage;
  }
}
