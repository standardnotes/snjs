import { SFItem } from '../core/item'

import { SNKeysContent004 } from '@Protocol/versions/004/keys_content_004';
import { SNKeysContent003 } from '@Protocol/versions/003/keys_content_003';
import { SNKeysContent002 } from '@Protocol/versions/002/keys_content_002';
import { SNKeysContent001 } from '@Protocol/versions/001/keys_content_001';

/**
 * Rather than creating a different content_type/item for every key version, thus making storage
 * and retrieval more difficult, we store all keys under the main SNKeys item, and instead use
 * versioned memory-only (non-SFItem) SNKeyContent items to handle versioned API.
*/

export class SNKeys extends SFItem {

  /**
   * Because this is a traditional SFItem, the constructor expects an object with a .content
   * property. FromRaw allows you to send in an unwrapped raw keys hash instead.
  */
  static FromRaw(keys) {
    return new SNKeys({content: keys});
  }

  constructor(json_obj) {
    super(json_obj);
  }

  updateFromJSON(json_obj) {
    super.updateFromJSON(json_obj);

    if(!this.content.version) {
      if(this.content.ak) {
        // If there's no version stored, it must be either 001 or 002.
        // If there's an ak, it has to be 002. Otherwise it's 001.
        this.content.version = "002";
      } else {
        this.content.version = "001";
      }
    }

    switch (this.content.version) {
      case '001':
        this.keysContent = new SNKeysContent001(json_obj.content);
        break;
      case '002':
        this.keysContent = new SNKeysContent002(json_obj.content);
        break;
      case '003':
        this.keysContent = new SNKeysContent003(json_obj.content);
        break;
      case '004':
        this.keysContent = new SNKeysContent004(json_obj.content);
        break;
      default:
        break;
    }
  }

  /**
   * Compares two sets of keys for equality
   * @returns Boolean
  */
  compare(otherKey) {
    if(this.version !== otherKey.version) {
      return false;
    }
    return this.keysContent.compare(otherKey.keysContent);
  }

  get version() {
    return this.content.version;
  }

  get content_type() {
    return "SN|Keys";
  }

  get itemsMasterKey() {
    return this.keysContent.itemsMasterKey;
  }

  get masterKey() {
    return this.keysContent.masterKey;
  }

  get serverAuthenticationValue() {
    return this.keysContent.serverAuthenticationValue;
  }

  get encryptionAuthenticationKey() {
    return this.keysContent.encryptionAuthenticationKey;
  }

  /**
   * @returns Object containg key/values that should be extracted from keys for local saving.
   */
  rootValues() {
    return this.keysContent.rootValues();
  }
}
