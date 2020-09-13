import { SNItemsKey } from '@Models/app/items_key';
import { PurePayload } from './../../payloads/pure_payload';
import { SNRootKeyParams } from './../../key_params';
import { V004Algorithm } from './../algorithms';
import { ItemsKeyContent } from './../operator';
import { CreateKeyParams } from '@Protocol/key_params';
import { SNProtocolOperator003 } from '@Protocol/operator/003/operator_003';
import { PayloadFormat } from '@Payloads/formats';
import { CreateEncryptionParameters, CopyEncryptionParameters } from '@Payloads/generator';
import { ProtocolVersion } from '@Protocol/versions';
import { SNRootKey } from '@Protocol/root_key';
import { truncateHexString } from '@Lib/utils';

const PARTITION_CHARACTER = ':';

export class SNProtocolOperator004 extends SNProtocolOperator003 {

  public getEncryptionDisplayName(): string {
    return 'XChaCha20-Poly1305';
  }

  get version() {
    return ProtocolVersion.V004;
  }

  protected async generateNewItemsKeyContent() {
    const itemsKey = await this.crypto.generateRandomKey(V004Algorithm.EncryptionKeyLength);
    const response: ItemsKeyContent = {
      itemsKey: itemsKey,
      version: this.version
    }
    return response;
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
    const hash = await this.crypto.sha256([identifier, seed].join(PARTITION_CHARACTER));
    return truncateHexString(hash, V004Algorithm.ArgonSaltLength);
  }

  /**
   * Computes a root key given a password and previous keyParams
   * @param password - Plain string representing raw user password
   * @param keyParams - KeyParams object
   */
  public async computeRootKey(password: string, keyParams: SNRootKeyParams) {
    const salt = await this.generateSalt004(
      keyParams.identifier!,
      keyParams.seed!
    );
    const key = await this.deriveKey(
      password,
      salt,
      V004Algorithm.ArgonIterations
    );
    return key;
  }

  /**
   * Creates a new root key given an identifier and a user password
   * @param identifier - Plain string representing a unique identifier
   * @param password - Plain string representing raw user password
   */
  public async createRootKey(identifier: string, password: string) {
    const version = this.version;
    const iterations = V004Algorithm.ArgonIterations;
    const seed = await this.crypto.generateRandomKey(V004Algorithm.ArgonSaltSeedLength);
    const salt = await this.generateSalt004(identifier, seed);
    const key = await this.deriveKey(
      password,
      salt,
      iterations
    );
    const keyParams = CreateKeyParams({
      identifier: identifier,
      pw_cost: iterations,
      pw_nonce: seed,
      version: version,
    });
    return { key: key, keyParams: keyParams };
  }

  /**
   * @param plaintext - The plaintext to encrypt.
   * @param rawKey - The key to use to encrypt the plaintext.
   * @param nonce - The nonce for encryption.
   * @param aad - JavaScript object (will be stringified) representing
                'Additional authenticated data': data you want to be included in authentication.
   */
  private async encryptString004(plaintext: string, rawKey: string, nonce: string, aad: object) {
    if (!nonce) {
      throw 'encryptString null nonce';
    }
    if (!rawKey) {
      throw 'encryptString null rawKey';
    }
    return this.crypto.xchacha20Encrypt(plaintext, nonce, rawKey, JSON.stringify(aad));
  }

  /**
   * @param {string} ciphertext  The encrypted text to decrypt.
   * @param {string} rawKey  The key to use to decrypt the ciphertext.
   * @param {string} nonce  The nonce for decryption.
   * @param {object} aad  JavaScript object (will be stringified) representing
                'Additional authenticated data' - data you want to be included in authentication.
   */
  private async decryptString004(ciphertext: string, rawKey: string, nonce: string, aad: object) {
    return this.crypto.xchacha20Decrypt(ciphertext, nonce, rawKey, JSON.stringify(aad));
  }

  /**
   * @param plaintext  The plaintext text to decrypt.
   * @param rawKey  The key to use to encrypt the plaintext.
   * @param itemUuid  The uuid of the item being encrypted
   */
  private async generateEncryptedProtocolString(plaintext: string, rawKey: string, itemUuid: string) {
    const nonce = await this.crypto.generateRandomKey(V004Algorithm.EncryptionNonceLength);
    const version = this.version;
    const ciphertext = await this.encryptString004(
      plaintext,
      rawKey,
      nonce,
      { u: itemUuid, v: version }
    );
    const payload = [version, nonce, ciphertext].join(PARTITION_CHARACTER);
    return payload;
  }

  public async generateEncryptedParameters(
    payload: PurePayload,
    format: PayloadFormat,
    key?: SNItemsKey | SNRootKey,
  ) {
    if ((
      format === PayloadFormat.DecryptedBareObject ||
      format === PayloadFormat.DecryptedBase64String
    )) {
      return super.generateEncryptedParameters(payload, format, key);
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
    const itemKey = await this.crypto.generateRandomKey(V004Algorithm.EncryptionKeyLength);
    /** Encrypt content with item_key */
    const contentPlaintext = JSON.stringify(payload.content);
    const encryptedContentString = await this.generateEncryptedProtocolString(
      contentPlaintext,
      itemKey,
      payload.uuid
    );
    /** Encrypt item_key with master itemEncryptionKey */
    const encryptedItemKey = await this.generateEncryptedProtocolString(
      itemKey,
      key.itemsKey,
      payload.uuid
    );
    return CreateEncryptionParameters(
      {
        uuid: payload.uuid,
        items_key_id: key instanceof SNItemsKey ? key.uuid : undefined,
        content: encryptedContentString,
        enc_item_key: encryptedItemKey
      }
    );
  }

  public async generateDecryptedParameters(
    encryptedParameters: PurePayload,
    key?: SNItemsKey | SNRootKey
  ) {
    const format = encryptedParameters.format;
    if ((
      format === PayloadFormat.DecryptedBareObject ||
      format === PayloadFormat.DecryptedBase64String
    )) {
      return super.generateDecryptedParameters(encryptedParameters, key);
    }
    if(!encryptedParameters.uuid) {
      throw 'encryptedParameters.uuid cannot be null';
    }
    if (!key || !key.itemsKey) {
      throw 'Attempting to generateDecryptedParameters with no itemsKey.';
    }
    /** Decrypt item_key payload. */
    const itemKeyComponents = this.deconstructEncryptedPayloadString(
      encryptedParameters.enc_item_key!
    );
    const itemKey = await this.decryptString004(
      itemKeyComponents.ciphertext,
      key.itemsKey,
      itemKeyComponents.nonce,
      { u: encryptedParameters.uuid, v: itemKeyComponents.version }
    );
    if (!itemKey) {
      console.error('Error decrypting itemKey parameters', encryptedParameters);
      return CopyEncryptionParameters(
        encryptedParameters,
        {
          errorDecrypting: true,
          errorDecryptingValueChanged: !encryptedParameters.errorDecrypting
        }
      );
    }
    /** Decrypt content payload. */
    const contentComponents = this.deconstructEncryptedPayloadString(
      encryptedParameters.contentString
    );
    const content = await this.decryptString004(
      contentComponents.ciphertext,
      itemKey,
      contentComponents.nonce,
      { u: encryptedParameters.uuid, v: contentComponents.version }
    );
    if (!content) {
      return CopyEncryptionParameters(
        encryptedParameters,
        {
          errorDecrypting: true,
          errorDecryptingValueChanged: !encryptedParameters.errorDecrypting
        }
      );
    } else {
      return CopyEncryptionParameters(
        encryptedParameters,
        {
          content: JSON.parse(content),
          items_key_id: undefined,
          enc_item_key: undefined,
          errorDecrypting: false,
          errorDecryptingValueChanged: encryptedParameters.errorDecrypting === true,
          waitingForKey: false,
        }
      );
    }
  }

  private deconstructEncryptedPayloadString(payloadString: string) {
    const components = payloadString.split(PARTITION_CHARACTER);
    return {
      version: components[0],
      nonce: components[1],
      ciphertext: components[2],
    };
  }

  protected async deriveKey(password: string, salt: string, iterations: number) {
    const derivedKey = await this.crypto.argon2(
      password,
      salt,
      iterations,
      V004Algorithm.ArgonMemLimit,
      V004Algorithm.ArgonOutputKeyBytes
    );
    const partitions = this.splitKey(derivedKey, 2);
    const masterKey = partitions[0];
    const serverPassword = partitions[1];
    return SNRootKey.Create(
      {
        masterKey,
        serverPassword,
        version: this.version
      }
    );
  }
}
