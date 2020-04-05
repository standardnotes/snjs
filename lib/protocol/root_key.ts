import { BuildItemContent } from '@Models/generator';
import { CreateMaxPayloadFromAnyObject } from '@Payloads/generator';
import { SNItem } from '@Models/core/item';
import { ContentType } from '@Models/content_types';
import { ProtocolVersion } from '@Protocol/versions';
import { Uuid } from '@Lib/uuid';

export type RootKeyContent = {
  version: ProtocolVersion;
  masterKey: string;
  serverPassword: string;
  dataAuthenticationKey?: string;
}

/**
 * A root key is a local only construct that houses the key used for the encryption
 * and decryption of items keys. A root key extends SNItem for local convenience, but is
 * not part of the syncing or storage ecosystem—root keys are managed independently.
 */
export class SNRootKey extends SNItem {

  static async Create(content: RootKeyContent, uuid?: string) {
    if (!uuid) {
      uuid = await Uuid.GenerateUuid();
    }
    if (!content.version) {
      if (content.dataAuthenticationKey) {
        /**
         * If there's no version stored, it must be either 001 or 002.
         * If there's a dataAuthenticationKey, it has to be 002. Otherwise it's 001.
         */
        content.version = ProtocolVersion.V002;
      } else {
        content.version = ProtocolVersion.V001;
      }
    }
    const payload = CreateMaxPayloadFromAnyObject(
      {
        uuid: uuid,
        content_type: ContentType.RootKey,
        content: BuildItemContent(content)
      }
    )
    return new SNRootKey(payload);
  }

  public get version() {
    if (!this.payload.safeContent.version) {
      throw 'Attempting to create key without version.';
    }
    return this.payload.safeContent.version;
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
    return this.payload.safeContent.masterKey;
  }

  public get serverPassword() {
    return this.payload.safeContent.serverPassword;
  }

  /** 003 and below only. */
  public get dataAuthenticationKey() {
    return this.payload.safeContent.dataAuthenticationKey;
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
