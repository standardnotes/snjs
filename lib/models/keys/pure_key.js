import { SFItem } from '@Models/core/item'
import { CONTENT_TYPE_ROOT_KEY, CONTENT_TYPE_ITEMS_KEY } from '@Models/content_types';
import { SNKeyContent004 } from '@Protocol/versions/004/key_content_004';
import { SNKeyContent003 } from '@Protocol/versions/003/key_content_003';
import { SNKeyContent002 } from '@Protocol/versions/002/key_content_002';
import { SNKeyContent001 } from '@Protocol/versions/001/key_content_001';
import { PROTOCOL_VERSION_004 } from '@Protocol/versions';

export class SNPureKey extends SFItem {

  updateFromPayload(payload) {
    super.updateFromPayload(payload);

    if(this.errorDecrypting) {
      return;
    }

    if(!this.content.version) {
      if(this.content.ak) {
        // If there's no version stored, it must be either 001 or 002.
        // If there's an ak, it has to be 002. Otherwise it's 001.
        this.content.version = "002";
      } else {
        this.content.version = "001";
      }
    }

    if(!this.content.version) {
      throw 'Attempting to create key without version.';
    }

    switch (this.content.version) {
      case '001':
        this.keyContent = new SNKeyContent001(this.content);
        break;
      case '002':
        this.keyContent = new SNKeyContent002(this.content);
        break;
      case '003':
        this.keyContent = new SNKeyContent003(this.content);
        break;
      case '004':
        this.keyContent = new SNKeyContent004(this.content);
        break;
      default:
        break;
    }
  }

  /**
   * Compares two sets of key for equality
   * @returns Boolean
  */
  compare(otherKey) {
    if(this.version !== otherKey.version) {
      return false;
    }
    return this.keyContent.compare(otherKey.keyContent);
  }

  get version() {
    return this.content.version;
  }

  get content_type() {
    throw 'Must override SNPureKey.content_type';
  }

  get itemsKey() {
    return this.keyContent.itemsKey;
  }

  get dataAuthenticationKey() {
    if(this.keyContent.version === PROTOCOL_VERSION_004) {
      throw 'Attempting to access legacy data authentication key.';
    }
    return this.keyContent.dataAuthenticationKey;
  }

  get isRootKey() {
    return this.content_type === CONTENT_TYPE_ROOT_KEY;
  }

  get isItemsKey() {
    return this.content_type === CONTENT_TYPE_ITEMS_KEY;
  }
}
