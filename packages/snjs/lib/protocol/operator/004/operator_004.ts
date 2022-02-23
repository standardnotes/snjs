import { SNPureCrypto } from '@standardnotes/sncrypto-common';
import { CreateItemFromPayload } from '@Models/generator';
import {
  ItemAuthenticatedData,
  LegacyAttachedData,
  RootKeyEncryptedAuthenticatedData,
} from './../../payloads/generator';
import { SNItemsKey } from '@Models/app/items_key';
import { PurePayload } from './../../payloads/pure_payload';
import {
  Create004KeyParams,
  KeyParamsOrigination,
  SNRootKeyParams,
} from './../../key_params';
import { V004Algorithm } from './../algorithms';
import { ItemsKeyContent, SynchronousOperator } from './../operator';
import { PayloadFormat } from '@Payloads/formats';
import {
  CopyEncryptionParameters,
  CreateEncryptionParameters,
} from '@Payloads/generator';
import { ProtocolVersion } from '@Protocol/versions';
import { SNRootKey } from '@Protocol/root_key';
import {
  omitUndefinedCopy,
  sortedCopy,
  truncateHexString,
  splitString,
} from '@standardnotes/utils';
import { ContentTypeUsesRootKeyEncryption } from '@Lib/protocol/intents';
import { CreateMaxPayloadFromAnyObject } from '@Payloads/generator';
import { ContentType } from '@standardnotes/common';
import { FillItemContent } from '@Models/functions';
import { Uuid } from '@Lib/uuid';

const PARTITION_CHARACTER = ':';

export class SNProtocolOperator004 implements SynchronousOperator {
  protected readonly crypto: SNPureCrypto;

  constructor(crypto: SNPureCrypto) {
    this.crypto = crypto;
  }

  public getEncryptionDisplayName(): string {
    return 'XChaCha20-Poly1305';
  }

  get version(): string {
    return ProtocolVersion.V004;
  }

  private generateNewItemsKeyContent() {
    const itemsKey = this.crypto.generateRandomKey(
      V004Algorithm.EncryptionKeyLength
    );
    const response: ItemsKeyContent = {
      itemsKey: itemsKey,
      version: ProtocolVersion.V004,
    };
    return response;
  }

  /**
   * Creates a new random SNItemsKey to use for item encryption.
   * The consumer must save/sync this item.
   */
  public createItemsKey(): SNItemsKey {
    const content = this.generateNewItemsKeyContent();
    const payload = CreateMaxPayloadFromAnyObject({
      uuid: Uuid.GenerateUuid(),
      content_type: ContentType.ItemsKey,
      content: FillItemContent(content),
    });
    return CreateItemFromPayload(payload) as SNItemsKey;
  }

  /**
   * We require both a client-side component and a server-side component in generating a
   * salt. This way, a comprimised server cannot benefit from sending the same seed value
   * for every user. We mix a client-controlled value that is globally unique
   * (their identifier), with a server controlled value to produce a salt for our KDF.
   * @param identifier
   * @param seed
   */
  private async generateSalt004(identifier: string, seed: string) {
    const hash = await this.crypto.sha256(
      [identifier, seed].join(PARTITION_CHARACTER)
    );
    return truncateHexString(hash, V004Algorithm.ArgonSaltLength);
  }

  /**
   * Computes a root key given a passworf
   * qwd and previous keyParams
   * @param password - Plain string representing raw user password
   * @param keyParams - KeyParams object
   */
  public async computeRootKey(
    password: string,
    keyParams: SNRootKeyParams
  ): Promise<SNRootKey> {
    return this.deriveKey(password, keyParams);
  }

  /**
   * Creates a new root key given an identifier and a user password
   * @param identifier - Plain string representing a unique identifier
   * @param password - Plain string representing raw user password
   */
  public async createRootKey(
    identifier: string,
    password: string,
    origination: KeyParamsOrigination
  ): Promise<SNRootKey> {
    const version = ProtocolVersion.V004;
    const seed = this.crypto.generateRandomKey(
      V004Algorithm.ArgonSaltSeedLength
    );
    const keyParams = Create004KeyParams({
      identifier: identifier,
      pw_nonce: seed,
      version: version,
      origination: origination,
      created: `${Date.now()}`,
    });
    return this.deriveKey(password, keyParams);
  }

  /**
   * @param plaintext - The plaintext to encrypt.
   * @param rawKey - The key to use to encrypt the plaintext.
   * @param nonce - The nonce for encryption.
   * @param authenticatedData - JavaScript object (will be stringified) representing
                'Additional authenticated data': data you want to be included in authentication.
   */
  private encryptString004(
    plaintext: string,
    rawKey: string,
    nonce: string,
    authenticatedData: ItemAuthenticatedData
  ) {
    if (!nonce) {
      throw 'encryptString null nonce';
    }
    if (!rawKey) {
      throw 'encryptString null rawKey';
    }
    return this.crypto.xchacha20Encrypt(
      plaintext,
      nonce,
      rawKey,
      this.authenticatedDataToString(authenticatedData)
    );
  }

  /**
   * @param ciphertext  The encrypted text to decrypt.
   * @param rawKey  The key to use to decrypt the ciphertext.
   * @param nonce  The nonce for decryption.
   * @param rawAuthenticatedData String representing
                'Additional authenticated data' - data you want to be included in authentication.
   */
  private decryptString004(
    ciphertext: string,
    rawKey: string,
    nonce: string,
    rawAuthenticatedData: string
  ) {
    return this.crypto.xchacha20Decrypt(
      ciphertext,
      nonce,
      rawKey,
      rawAuthenticatedData
    );
  }

  /**
   * @param plaintext  The plaintext text to decrypt.
   * @param rawKey  The key to use to encrypt the plaintext.
   * @param itemUuid  The uuid of the item being encrypted
   */
  private generateEncryptedProtocolString(
    plaintext: string,
    rawKey: string,
    authenticatedData: ItemAuthenticatedData
  ) {
    const nonce = this.crypto.generateRandomKey(
      V004Algorithm.EncryptionNonceLength
    );
    const version = ProtocolVersion.V004;
    const ciphertext = this.encryptString004(
      plaintext,
      rawKey,
      nonce,
      authenticatedData
    );
    const components: string[] = [
      version as string,
      nonce,
      ciphertext,
      this.authenticatedDataToString(authenticatedData),
    ];
    return components.join(PARTITION_CHARACTER);
  }

  public getPayloadAuthenticatedData(
    payload: PurePayload
  ):
    | RootKeyEncryptedAuthenticatedData
    | ItemAuthenticatedData
    | LegacyAttachedData
    | undefined {
    if (payload.format !== PayloadFormat.EncryptedString) {
      throw Error(
        'Attempting to get embedded key params of already decrypted item'
      );
    }
    const itemKeyComponents = this.deconstructEncryptedPayloadString(
      payload.enc_item_key!
    );
    const authenticatedData = itemKeyComponents.rawAuthenticatedData;
    const result = this.stringToAuthenticatedData(authenticatedData);
    return result;
  }

  /**
   * For items that are encrypted with a root key, we append the root key's key params, so
   * that in the event the client/user loses a reference to their root key, they may still
   * decrypt data by regenerating the key based on the attached key params.
   */
  private generateAuthenticatedDataForPayload(
    payload: PurePayload,
    key: SNItemsKey | SNRootKey
  ): ItemAuthenticatedData | RootKeyEncryptedAuthenticatedData {
    const baseData: ItemAuthenticatedData = {
      u: payload.uuid,
      v: ProtocolVersion.V004,
    };
    if (ContentTypeUsesRootKeyEncryption(payload.content_type)) {
      return {
        ...baseData,
        kp: (key as SNRootKey).keyParams.content,
      };
    } else {
      if (!(key instanceof SNItemsKey)) {
        throw Error('Attempting to use non-items key for regular item.');
      }
      return baseData;
    }
  }

  private authenticatedDataToString(attachedData: ItemAuthenticatedData) {
    return this.crypto.base64Encode(
      JSON.stringify(sortedCopy(omitUndefinedCopy(attachedData)))
    );
  }

  private stringToAuthenticatedData(
    rawAuthenticatedData: string,
    override?: Partial<ItemAuthenticatedData>
  ): RootKeyEncryptedAuthenticatedData | ItemAuthenticatedData {
    const base = JSON.parse(this.crypto.base64Decode(rawAuthenticatedData));
    return sortedCopy({
      ...base,
      ...override,
    });
  }

  public generateEncryptedParametersSync(
    payload: PurePayload,
    format: PayloadFormat,
    key?: SNItemsKey | SNRootKey
  ): PurePayload {
    if (format === PayloadFormat.DecryptedBareObject) {
      return CreateEncryptionParameters({
        content: payload.content,
      });
    }
    if (format !== PayloadFormat.EncryptedString) {
      throw `Unsupport format for generateEncryptedParameters ${format}`;
    }
    if (!payload.uuid) {
      throw 'payload.uuid cannot be null';
    }
    if (!key || !key.itemsKey) {
      throw 'Attempting to generateEncryptedParameters with no itemsKey.';
    }
    const itemKey = this.crypto.generateRandomKey(
      V004Algorithm.EncryptionKeyLength
    );
    /** Encrypt content with item_key */
    const contentPlaintext = JSON.stringify(payload.content);
    const authenticatedData = this.generateAuthenticatedDataForPayload(
      payload,
      key
    );
    const encryptedContentString = this.generateEncryptedProtocolString(
      contentPlaintext,
      itemKey,
      authenticatedData
    );
    /** Encrypt item_key with master itemEncryptionKey */
    const encryptedItemKey = this.generateEncryptedProtocolString(
      itemKey,
      key.itemsKey,
      authenticatedData
    );
    return CreateEncryptionParameters({
      uuid: payload.uuid,
      items_key_id: key instanceof SNItemsKey ? key.uuid : undefined,
      content: encryptedContentString,
      enc_item_key: encryptedItemKey,
    });
  }

  public generateDecryptedParametersSync(
    payload: PurePayload,
    key?: SNItemsKey | SNRootKey
  ): PurePayload {
    const format = payload.format;
    if (format === PayloadFormat.DecryptedBareObject) {
      /** No decryption required */
      return payload;
    }
    if (!payload.uuid) {
      throw Error('encryptedParameters.uuid cannot be null');
    }
    if (!key || !key.itemsKey) {
      throw Error(
        'Attempting to generateDecryptedParameters with no itemsKey.'
      );
    }
    /** Decrypt item_key payload. */
    const itemKeyComponents = this.deconstructEncryptedPayloadString(
      payload.enc_item_key!
    );
    const authenticatedData = this.stringToAuthenticatedData(
      itemKeyComponents.rawAuthenticatedData,
      {
        u: payload.uuid,
        v: payload.version,
      }
    );
    const useAuthenticatedString = this.authenticatedDataToString(
      authenticatedData
    );
    const itemKey = this.decryptString004(
      itemKeyComponents.ciphertext,
      key.itemsKey,
      itemKeyComponents.nonce,
      useAuthenticatedString
    );
    if (!itemKey) {
      console.error('Error decrypting itemKey parameters', payload);
      return CopyEncryptionParameters(payload, {
        errorDecrypting: true,
        errorDecryptingValueChanged: !payload.errorDecrypting,
      });
    }
    /** Decrypt content payload. */
    const contentComponents = this.deconstructEncryptedPayloadString(
      payload.contentString
    );
    const content = this.decryptString004(
      contentComponents.ciphertext,
      itemKey,
      contentComponents.nonce,
      useAuthenticatedString
    );
    if (!content) {
      return CopyEncryptionParameters(payload, {
        errorDecrypting: true,
        errorDecryptingValueChanged: !payload.errorDecrypting,
      });
    } else {
      return CopyEncryptionParameters(payload, {
        content: JSON.parse(content),
        items_key_id: undefined,
        enc_item_key: undefined,
        auth_hash: undefined,
        errorDecrypting: false,
        errorDecryptingValueChanged: payload.errorDecrypting === true,
        waitingForKey: false,
      });
    }
  }

  private deconstructEncryptedPayloadString(payloadString: string) {
    const components = payloadString.split(PARTITION_CHARACTER);
    return {
      version: components[0],
      nonce: components[1],
      ciphertext: components[2],
      rawAuthenticatedData: components[3],
    };
  }

  private async deriveKey(
    password: string,
    keyParams: SNRootKeyParams
  ): Promise<SNRootKey> {
    const salt = await this.generateSalt004(
      keyParams.content004.identifier,
      keyParams.content004.pw_nonce
    );
    const derivedKey = this.crypto.argon2(
      password,
      salt,
      V004Algorithm.ArgonIterations,
      V004Algorithm.ArgonMemLimit,
      V004Algorithm.ArgonOutputKeyBytes
    );
    const partitions = splitString(derivedKey, 2);
    const masterKey = partitions[0];
    const serverPassword = partitions[1];
    return SNRootKey.Create({
      masterKey,
      serverPassword,
      version: ProtocolVersion.V004,
      keyParams: keyParams.getPortableValue(),
    });
  }
}
