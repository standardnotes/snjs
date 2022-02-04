import {
  ItemAuthenticatedData,
  LegacyAttachedData,
  RootKeyEncryptedAuthenticatedData,
} from './../payloads/generator';
import { FillItemContent } from '@Models/functions';
import { Uuid } from './../../uuid';
import { CreateItemFromPayload } from '@Models/generator';
import { SNRootKey } from './../root_key';
import { KeyParamsOrigination, SNRootKeyParams } from './../key_params';
import { PurePayload } from './../payloads/pure_payload';
import { SNItemsKey } from '@Models/app/items_key';
import { PayloadFormat } from '@Payloads/formats';
import {
  CreateEncryptionParameters,
  CreateMaxPayloadFromAnyObject,
} from '@Payloads/generator';
import { ProtocolVersion } from '@Protocol/versions';
import { SNPureCrypto } from '@standardnotes/sncrypto-common';
import { ContentType } from '@standardnotes/common';

export type ItemsKeyContent = {
  itemsKey: string;
  dataAuthenticationKey?: string;
  version: ProtocolVersion;
};

/**w
 * An operator is responsible for performing crypto operations, such as generating keys
 * and encrypting/decrypting payloads. Operators interact directly with
 * platform dependent SNPureCrypto implementation to directly access cryptographic primitives.
 * Each operator is versioned according to the protocol version. Functions that are common
 * across all versions appear in this generic parent class.
 */
export abstract class SNProtocolOperator {
  protected readonly crypto: SNPureCrypto;

  constructor(crypto: SNPureCrypto) {
    this.crypto = crypto;
  }

  /**
   * Returns encryption protocol display name
   */
  public abstract getEncryptionDisplayName(): string;

  /**
   * Computes a root key given a password and previous keyParams
   * @param password - Plain string representing raw user password
   */
  public abstract computeRootKey(
    password: string,
    keyParams: SNRootKeyParams
  ): Promise<SNRootKey>;

  /**
   * Creates a new root key given an identifier and a user password
   * @param identifier - Plain string representing a unique identifier
   *    for the user
   * @param password - Plain string representing raw user password
   */
  public abstract createRootKey(
    identifier: string,
    password: string,
    origination: KeyParamsOrigination
  ): Promise<SNRootKey>;

  /**
   * Returns the payload's authenticated data. The passed payload must be in a
   * non-decrypted, ciphertext state.
   */
  public abstract getPayloadAuthenticatedData(
    payload: PurePayload
  ): Promise<
    | RootKeyEncryptedAuthenticatedData
    | ItemAuthenticatedData
    | LegacyAttachedData
    | undefined
  >;

  protected abstract generateNewItemsKeyContent(): Promise<ItemsKeyContent>;

  protected async firstHalfOfKey(key: string) {
    return key.substring(0, key.length / 2);
  }

  protected async secondHalfOfKey(key: string) {
    return key.substring(key.length / 2, key.length);
  }

  protected splitKey(key: string, parts: number) {
    const outputLength = key.length;
    const partLength = outputLength / parts;
    const partitions = [];
    for (let i = 0; i < parts; i++) {
      const partition = key.slice(partLength * i, partLength * (i + 1));
      partitions.push(partition);
    }
    return partitions;
  }

  /**
   * Creates a new random SNItemsKey to use for item encryption.
   * The consumer must save/sync this item.
   */
  public async createItemsKey() {
    const content = await this.generateNewItemsKeyContent();
    const payload = CreateMaxPayloadFromAnyObject({
      uuid: await Uuid.GenerateUuid(),
      content_type: ContentType.ItemsKey,
      content: FillItemContent(content),
    });
    return CreateItemFromPayload(payload) as SNItemsKey;
  }

  /**
   * Converts a bare payload into an encrypted one in the desired format.
   * @param payload - The non-encrypted payload object to encrypt
   * @param key - The key to use to encrypt the payload. Can be either
   *  a RootKey (when encrypting payloads that require root key encryption, such as encrypting
   * items keys), or an ItemsKey (if encrypted regular items)
   * @param format - The desired result format
   */
  public async generateEncryptedParameters(
    payload: PurePayload,
    format: PayloadFormat,
    _key?: SNItemsKey | SNRootKey
  ) {
    if (format === PayloadFormat.DecryptedBareObject) {
      return CreateEncryptionParameters({
        content: payload.content,
      });
    } else {
      throw `Must override generateEncryptedParameters to handle format ${format}.`;
    }
  }

  /**
   * Converts encrypted parameters (a subset of a Payload) into decrypted counterpart.
   * @param encryptedParameters - The encrypted payload object to decrypt
   * @param key - The key to use to decrypt the payload. Can be either
   *  a RootKey (when encrypting payloads that require root key encryption, such as encrypting
   * items keys), or an ItemsKey (if encrypted regular items)
   */
  public async generateDecryptedParameters(
    encryptedParameters: PurePayload,
    _key?: SNItemsKey | SNRootKey
  ) {
    const format = encryptedParameters.format;
    if (format === PayloadFormat.DecryptedBareObject) {
      /** No decryption required */
      return encryptedParameters;
    } else {
      throw Error(
        `Must override generateDecryptedParameters to handle format ${format}.`
      );
    }
  }
}
