import { ContentTypes, SFItem } from '@Models';

export class SNServerExtension extends SFItem {
  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content);
    this.url = content.url;
  }

  // eslint-disable-next-line camelcase
  get content_type() {
    return ContentTypes.ServerExtension;
  }

  doNotEncrypt() {
    return true;
  }
}
