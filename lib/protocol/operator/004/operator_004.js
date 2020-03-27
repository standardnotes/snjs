import { CreateKeyParams } from '@Protocol/key_params';
import { SNProtocolOperator003 } from '@Protocol/operator/003/operator_003';
import { PayloadFields } from '@Payloads/fields';
import { PayloadFormats } from '@Payloads/formats';
import { CreateEncryptionParameters, CopyEncryptionParameters } from '@Payloads/generator';
import { ProtocolVersions } from '@Protocol/versions';
import { SNRootKey } from '@Protocol/root_key';
import { truncateHexString } from '@Lib/utils';

const ARGON2_MEMLIMIT = 67108864;
const ARGON2_OUTPUT_KEY_BYTES = 64;
const ARGON2_ITERATIONS = 5;
const ARGON2_SALT_SEED_LENGTH = 256;
const ARGON2_SALT_LENGTH = 128;
const ENCRYPTION_KEY_LENGTH = 256;
const ENCRYPTION_NONCE_LENGTH = 192;
const PARTITION_CHARACTER = ':';

/**
 * 004 Primitives:
 * Encryption: XChaCha20+Poly1305
 * KDF: Argon2id
 */
export class SNProtocolOperator004 extends SNProtocolOperator003 {

  static versionString() {
    return ProtocolVersions.V004;
  }

  static kdfIterations() {
    return ARGON2_ITERATIONS;
  }

  /** 
   * @override
   * @access protected
   */
  async generateNewItemsKeyContent() {
    const itemsKey = await this.crypto.generateRandomKey(ENCRYPTION_KEY_LENGTH);
    const version = this.constructor.versionString();
    return {
      itemsKey: itemsKey,
      version: version
    };
  }

  /**
   * We require both a client-side component and a server-side component in generating a 
   * salt. This way, a comprimised server cannot benefit from sending the same seed value 
   * for every user. We mix a client-controlled value that is globally unique 
   * (their identifier), with a server controlled value to produce a salt for our KDF.
   * @access private
   * @param {string} identifier
   * @param {string} seed
  */
  async generateSalt({ identifier, seed }) {
    const hash = await this.crypto.sha256([identifier, seed].join(PARTITION_CHARACTER));
    return truncateHexString(hash, ARGON2_SALT_LENGTH);
  }

  /**
   * Computes a root key given a password and previous keyParams
   * @access public
   * @param {object} params
   * @param {string} params.password - Plain string representing raw user password
   * @param {SNRootKeyParams} params.keyParams - KeyParams object
   * @returns {SNRootKey}
   */
  async computeRootKey({ password, keyParams }) {
    if (!keyParams.isKeyParamsObject) {
      throw 'Attempting to compute root key with non params object.';
    }
    const salt = await this.generateSalt({
      identifier: keyParams.identifier,
      seed: keyParams.seed
    });
    const key = await this.deriveKey({
      password: password,
      salt: salt,
      iterations: this.constructor.kdfIterations()
    });
    return key;
  }

  /**
   * Creates a new root key given an identifier and a user password
   * @access public
   * @param {object} params
   * @param {string} params.identifier - Plain string representing a unique identifier
   *    for the user
   * @param {string} params.password - Plain string representing raw user password
   * @returns {SNRootKey}
   */
  async createRootKey({ identifier, password }) {
    const version = this.constructor.versionString();
    const iterations = this.constructor.kdfIterations();
    const seed = await this.crypto.generateRandomKey(ARGON2_SALT_SEED_LENGTH);
    const salt = await this.generateSalt({ identifier, seed });
    const key = await this.deriveKey({
      password: password,
      salt: salt,
      iterations: iterations
    });
    const keyParams = CreateKeyParams({
      identifier: identifier,
      pw_cost: iterations,
      pw_nonce: seed,
      version: version,
    });
    return { key: key, keyParams: keyParams };
  }

  /**
   * @access private
   * @param {string} plaintext - The plaintext to encrypt.
   * @param {string} rawKey - The key to use to encrypt the plaintext.
   * @param {string} nonce - The nonce for encryption.
   * @param {object} aad - JavaScript object (will be stringified) representing
                'Additional authenticated data': data you want to be included in authentication.
   */
  async encryptString({ plaintext, rawKey, nonce, aad }) {
    if (!nonce) {
      throw 'encryptString null nonce';
    }
    if (!rawKey) {
      throw 'encryptString null rawKey';
    }
    return this.crypto.xchacha20Encrypt(plaintext, nonce, rawKey, JSON.stringify(aad));
  }

  /**
   * @access private
   * @param {string} ciphertext  The encrypted text to decrypt.
   * @param {string} rawKey  The key to use to decrypt the ciphertext.
   * @param {string} nonce  The nonce for decryption.
   * @param {object} aad  JavaScript object (will be stringified) representing
                'Additional authenticated data' - data you want to be included in authentication.
   */
  async decryptString({ ciphertext, rawKey, nonce, aad }) {
    return this.crypto.xchacha20Decrypt(ciphertext, nonce, rawKey, JSON.stringify(aad));
  }

  /**
   * @access private
   * @param {string} plaintext  The plaintext text to decrypt.
   * @param {string} rawKey  The key to use to encrypt the plaintext.
   * @param {string} itemUuid  The uuid of the item being encrypted
   */
  async generateEncryptedProtocolString({ plaintext, rawKey, itemUuid }) {
    const nonce = await this.crypto.generateRandomKey(ENCRYPTION_NONCE_LENGTH);
    const version = this.constructor.versionString();
    const ciphertext = await this.encryptString({
      plaintext,
      rawKey,
      nonce,
      aad: { u: itemUuid, v: version }
    });
    const payload = [version, nonce, ciphertext].join(PARTITION_CHARACTER);
    return payload;
  }

  /**
   * Converts a bare payload into an encrypted one in the desired format.
   * @access public
   * @param {Payload} payload - The non-encrypted payload object to encrypt
   * @param {SNRootKey|SNItemsKey} key - The key to use to encrypt the payload. Can be either
   *  a RootKey (when encrypting payloads that require root key encryption, such as encrypting
   * items keys), or an ItemsKey (if encrypted regular items)
   * @param {PayloadFormat} format - The desired result format
   * @returns {EncryptionParameters}
   */
  async generateEncryptionParameters({ payload, key, format }) {
    if ((
      format === PayloadFormats.DecryptedBareObject ||
      format === PayloadFormats.DecryptedBase64String
    )) {
      return super.generateEncryptionParameters({ payload, key, format });
    }
    if (format !== PayloadFormats.EncryptedString) {
      throw `Unsupport format for generateEncryptionParameters ${format}`;
    }
    if (!key || !key.itemsKey) {
      throw 'Attempting to generateEncryptionParameters with no itemsKey.';
    }
    const itemKey = await this.crypto.generateRandomKey(ENCRYPTION_KEY_LENGTH);
    /** Encrypt content with item_key */
    const contentPlaintext = JSON.stringify(payload.content);
    const encryptedContentString = await this.generateEncryptedProtocolString({
      plaintext: contentPlaintext,
      rawKey: itemKey
    });
    /** Encrypt item_key with master itemEncryptionKey */
    const encryptedItemKey = await this.generateEncryptedProtocolString({
      plaintext: itemKey,
      rawKey: key.itemsKey
    });
    return CreateEncryptionParameters(
      {
        [PayloadFields.ItemsKeyId]: key.isItemsKey ? key.uuid : null,
        [PayloadFields.Content]: encryptedContentString,
        [PayloadFields.EncItemKey]: encryptedItemKey
      }
    );
  }

  /**
   * Converts encrypted parameters (a subset of a Payload) into decrypted counterpart.
   * @access public
   * @param {EncryptionParameters} encryptedParameters - The encrypted payload object to decrypt
   * @param {SNRootKey|SNItemsKey} key - The key to use to decrypt the payload. Can be either
   *  a RootKey (when encrypting payloads that require root key encryption, such as encrypting
   * items keys), or an ItemsKey (if encrypted regular items)
   * @returns {EncryptionParameters}
   */
  async generateDecryptedParameters({ encryptedParameters, key }) {
    const format = encryptedParameters.getContentFormat();
    if ((
      format === PayloadFormats.DecryptedBareObject ||
      format === PayloadFormats.DecryptedBase64String
    )) {
      return super.generateDecryptedParameters({ encryptedParameters, key });
    }
    if (!key || !key.itemsKey) {
      throw 'Attempting to generateDecryptedParameters with no itemsKey.';
    }
    /** Decrypt item_key payload. */
    const itemKeyComponents = this.deconstructEncryptedPayloadString(
      encryptedParameters.enc_item_key
    );
    const itemKey = await this.decryptString({
      ciphertext: itemKeyComponents.ciphertext,
      rawKey: key.itemsKey,
      nonce: itemKeyComponents.nonce,
      aad: { u: itemKeyComponents.uuid, v: itemKeyComponents.version }
    });
    if (!itemKey) {
      console.error('Error decrypting itemKey parameters', encryptedParameters);
      return CopyEncryptionParameters(
        encryptedParameters,
        {
          [PayloadFields.ErrorDecrypting]: true,
          [PayloadFields.ErrorDecryptingChanged]: !encryptedParameters.errorDecrypting
        }
      );
    }
    /** Decrypt content payload. */
    const contentComponents = this.deconstructEncryptedPayloadString(
      encryptedParameters.content
    );
    const content = await this.decryptString({
      ciphertext: contentComponents.ciphertext,
      rawKey: itemKey,
      nonce: contentComponents.nonce,
      aad: { u: contentComponents.uuid, v: contentComponents.version }
    });
    if (!content) {
      return CopyEncryptionParameters(
        encryptedParameters,
        {
          [PayloadFields.ErrorDecrypting]: true,
          [PayloadFields.ErrorDecryptingChanged]: !encryptedParameters.errorDecrypting
        }
      );
    } else {
      return CopyEncryptionParameters(
        encryptedParameters,
        {
          [PayloadFields.Content]: JSON.parse(content),
          [PayloadFields.ErrorDecrypting]: false,
          [PayloadFields.ErrorDecryptingChanged]: encryptedParameters.errorDecrypting === true,
          [PayloadFields.WaitingForKey]: false,
        }
      );
    }
  }

  /** 
   * @access private 
   * @returns {object}
   */
  deconstructEncryptedPayloadString(payloadString) {
    const components = payloadString.split(PARTITION_CHARACTER);
    return {
      version: components[0],
      nonce: components[1],
      ciphertext: components[2],
    };
  }

  /** 
   * @access private 
   * @returns {SNRootKey}
   */
  async deriveKey({ password, salt, iterations } = {}) {
    if (!iterations || !salt || !password) {
      throw 'Attempting to 004.deriveKey with invalid parameters';
    }
    const derivedKey = await this.crypto.argon2(
      password,
      salt,
      iterations,
      ARGON2_MEMLIMIT,
      ARGON2_OUTPUT_KEY_BYTES
    );
    const partitions = await this.splitKey({
      key: derivedKey,
      numParts: 2
    });
    const masterKey = partitions[0];
    const serverPassword = partitions[1];
    return SNRootKey.Create(
      null,
      {
        masterKey,
        serverPassword,
        version: this.constructor.versionString()
      }
    );
  }
}
