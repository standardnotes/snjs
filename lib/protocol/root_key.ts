import { ContentType } from '@Models/content_types';
import { ProtocolVersion } from '@Protocol/versions';
import { Uuid } from '@Lib/uuid';
import { Copy } from '@Lib/utils';

export type RootKeyContent = {
  version: ProtocolVersion;
  masterKey: string;
  serverPassword: string;
  dataAuthenticationKey?: string;
}

/**
 * A root key is a local only construct that houses the key used for the encryption
 * and decryption of items keys.
 */
export class SNRootKey {

  public readonly uuid?: string
  public readonly content: RootKeyContent

  static async Create(content: RootKeyContent, uuid?: string) {
    if (!uuid) {
      uuid = await Uuid.GenerateUuid();
    }
    return new SNRootKey(content, uuid);
  }

  constructor(content: RootKeyContent, uuid?: string) {
    this.uuid = uuid;
    this.content = Copy(content) as RootKeyContent;

    if (!this.content.version) {
      if (this.content.dataAuthenticationKey) {
        /**
         * If there's no version stored, it must be either 001 or 002.
         * If there's a dataAuthenticationKey, it has to be 002. Otherwise it's 001.
         */
        this.content.version = ProtocolVersion.V002;
      } else {
        this.content.version = ProtocolVersion.V001;
      }
    }

    if (!this.content.version) {
      throw 'Attempting to create key without version.';
    }

    Object.freeze(this);
  }

  public static contentType() {
    return ContentType.RootKey;
  }

  public get version() {
    return this.content.version;
  }

  public get isRootKey() {
    return true;
  }

  /**
   * When the root key is used to encrypt items, we use the masterKey directly.
   */
  public get itemsKey() {
    return this.masterKey;
  }

  public get masterKey() {
    return this.content.masterKey;
  }

  public get serverPassword() {
    return this.content.serverPassword;
  }

  /** 003 and below only. */
  public  get dataAuthenticationKey() {
    return this.content.dataAuthenticationKey;
  }

  /**
   * Compares two keys for equality
   */
  public compare(otherKey: SNRootKey) {
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
  public getPersistableValue() {
    const values: any = {
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
