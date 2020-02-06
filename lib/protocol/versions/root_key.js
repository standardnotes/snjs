import { ContentTypes, SFItem } from '@Models';
import { SNKeyContent004 } from '@Protocol/versions/004/key_content_004';
import { SNKeyContent003 } from '@Protocol/versions/003/key_content_003';
import { SNKeyContent002 } from '@Protocol/versions/002/key_content_002';
import { SNKeyContent001 } from '@Protocol/versions/001/key_content_001';
import {
  ProtocolVersions
} from '@Protocol';
import { Copy } from '@Lib/utils';

export class SNRootKey {

  static async Create({uuid, content}) {
    if(!uuid) {
      uuid = await SFItem.GenerateUuid();
    }
    return new SNRootKey({uuid, content});
  }

  constructor({uuid, content}) {
    this.uuid = uuid;
    this.content = Copy(content);

    if(!this.content.version) {
      if(this.content.ak) {
        /**
         * If there's no version stored, it must be either 001 or 002.
         * If there's an ak, it has to be 002. Otherwise it's 001.
         */
        this.content.version = ProtocolVersions.V002;
      } else {
        this.content.version = ProtocolVersions.V001;
      }
    }

    if(!this.content.version) {
      throw 'Attempting to create key without version.';
    }

    switch (this.content.version) {
      case ProtocolVersions.V001:
        this.keyContent = new SNKeyContent001(this.content);
        break;
      case ProtocolVersions.V002:
        this.keyContent = new SNKeyContent002(this.content);
        break;
      case ProtocolVersions.V003:
        this.keyContent = new SNKeyContent003(this.content);
        break;
      case ProtocolVersions.V004:
        this.keyContent = new SNKeyContent004(this.content);
        break;
      default:
        throw 'Unhandled key version';
    }

    Object.freeze(this);
  }

  static contentType() {
    return ContentTypes.RootKey;
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

  get isRootKey() {
    return true;
  }

  /**
   * When the root key is used to encrypt items, we use the masterKey directly.
   */
  get itemsKey() {
    return this.masterKey;
  }

  get masterKey() {
    return this.keyContent.masterKey;
  }

  get serverPassword() {
    return this.keyContent.serverPassword;
  }

  get dataAuthenticationKey() {
    if(this.keyContent.version === ProtocolVersions.V004) {
      throw 'Attempting to access legacy data authentication key.';
    }
    return this.keyContent.dataAuthenticationKey;
  }

  /**
   * @returns Object containg key/values that should be extracted from key for local saving.
   */
  getRootValues() {
    return this.keyContent.getRootValues();
  }
}
