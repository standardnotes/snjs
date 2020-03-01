import { ContentTypes } from '@Models/content_types';
import { ProtocolVersions } from '@Protocol/versions';
import { Uuid } from '@Lib/uuid';
import { Copy } from '@Lib/utils';

/**
 * A root key is a local only construct that houses the key used for the encryption
 * and decryption of items keys.
 */
export class SNRootKey {

  static async Create({ uuid, content }) {
    if (!uuid) {
      uuid = await Uuid.GenerateUuid();
    }
    return new SNRootKey({ uuid, content });
  }

  constructor({ uuid, content }) {
    this.uuid = uuid;
    this.content = Copy(content);

    if (!this.content.version) {
      if (this.content.dataAuthenticationKey) {
        /**
         * If there's no version stored, it must be either 001 or 002.
         * If there's a dataAuthenticationKey, it has to be 002. Otherwise it's 001.
         */
        this.content.version = ProtocolVersions.V002;
      } else {
        this.content.version = ProtocolVersions.V001;
      }
    }

    if (!this.content.version) {
      throw 'Attempting to create key without version.';
    }

    Object.freeze(this);
  }

  static contentType() {
    return ContentTypes.RootKey;
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
    return this.content.masterKey;
  }

  get serverPassword() {
    return this.content.serverPassword;
  }

  /** 003 and below only. */
  get dataAuthenticationKey() {
    return this.content.dataAuthenticationKey;
  }

  /**
   * Compares two keys for equality
   * @returns {boolean} true if equal, otherwise false.
  */
  compare(otherKey) {
    if (this.version !== otherKey.version) {
      return false;
    }
    const hasServerPassword = this.serverPassword && otherKey.serverPassword;
    return (
      this.masterKey === otherKey.masterKey &&
      (!hasServerPassword || this.serverPassword === otherKey.serverPassword)
    );
  }

  /**
   * @returns Object containg key/values that should be extracted from key for local saving.
   */
  getPersistableValue() {
    const values = {
      version: this.version
    };
    if (this.masterKey) {
      values.masterKey = this.masterKey;
    }
    if (this.dataAuthenticationKey) {
      values.dataAuthenticationKey = this.dataAuthenticationKey;
    }
    return values;
  }
}
