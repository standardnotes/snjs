import { SFItem } from '../core/item'

import { SNKeyContent004 } from '@Protocol/versions/004/key_content_004';
import { SNKeyContent003 } from '@Protocol/versions/003/key_content_003';
import { SNKeyContent002 } from '@Protocol/versions/002/key_content_002';
import { SNKeyContent001 } from '@Protocol/versions/001/key_content_001';

export class SNPureKey extends SFItem {

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

    if(!this.content.version) {
      throw 'Attempting to create key without version.';
    }

    switch (this.content.version) {
      case '001':
        this.keyContent = new SNKeyContent001(json_obj.content);
        break;
      case '002':
        this.keyContent = new SNKeyContent002(json_obj.content);
        break;
      case '003':
        this.keyContent = new SNKeyContent003(json_obj.content);
        break;
      case '004':
        this.keyContent = new SNKeyContent004(json_obj.content);
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
    throw 'Must override';
  }
}
