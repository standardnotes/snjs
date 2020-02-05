import { ContentTypes, SFItem } from '@Models';

export class SNServerExtension extends SFItem {
  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content);
    this.url = content.url;
  }

  get content_type() {
    return ContentTypes.ServerExtension;
  }

  doNotEncrypt() {
    return true;
  }
}
