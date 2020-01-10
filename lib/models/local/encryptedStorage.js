import { SFItem } from '@Models/core/item'

export class SNEncryptedStorage extends SFItem {

  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content)
    this.storage = content.storage;
  }

  get content_type() {
    return "SN|EncryptedStorage";
  }

}
