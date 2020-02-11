import { SFItem } from '@Models/core/item';
import { ContentTypes } from '@Models/content_types';

export class SNServerExtension extends SFItem {
  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content);
    this.url = content.url;
  }

  // eslint-disable-next-line camelcase
  get content_type() {
    return ContentTypes.ServerExtension;
  }
}
