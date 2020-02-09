import { SNProtocolOperator } from '@Protocol/versions/operator';
import { CreateKeyParams } from '@Protocol/versions/key_params';
import { PayloadFields} from '@Payloads/fields';
import { PayloadFormats } from '@Payloads/formats';
import { CreateEncryptionParameters, CopyEncryptionParameters } from '@Payloads/generator';
import { ProtocolVersions } from '@Protocol/versions';
import { SNRootKey } from '@Protocol/versions/root_key';

// eslint-disable-next-line no-unused-vars
const ENCRYPTION_ALGORITHM = 'AES-CBC';
const ENCRYPTION_KEY_LENGTH = 256;
const PBKDF2_OUTPUT_KEY_LENGTH = 512;
const PBKDF2_ITERATIONS = 3000;
const SALT_SEED_LENGTH = 128;

export class SNProtocolOperator001 extends SNProtocolOperator {

  static pwCost() {
    return PBKDF2_ITERATIONS;
  }

  static versionString() {
    return ProtocolVersions.V001;
  }

  static encryptionKeyLength() {
    return ENCRYPTION_KEY_LENGTH;
  }

  /**
   * @override
   */
  async generateNewItemsKeyContent() {
    const keyLength = this.constructor.encryptionKeyLength();
    const itemsKey = await this.crypto.generateRandomKey(keyLength);
    const version = this.constructor.versionString();
    return {
      itemsKey: itemsKey,
      version: version
    };
  }

  /**
   * @public
   */

  async createRootKey({ identifier, password }) {
    const pwCost = this.constructor.pwCost();
    const pwNonce = await this.crypto.generateRandomKey(SALT_SEED_LENGTH);
    const pwSalt = await this.crypto.unsafe_sha1(identifier + 'SN' + pwNonce);
    const key = await this.deriveKey({
      password: password,
      pwSalt: pwSalt,
      pwCost: pwCost
    });
    const keyParams = CreateKeyParams({
      email: identifier,
      pw_cost: pwCost,
      pw_nonce: pwNonce,
      pw_salt: pwSalt,
      version: ProtocolVersions.V001
    });
    return { key: key, keyParams: keyParams };
  }

  async computeRootKey({ password, keyParams }) {
    if (!keyParams.isKeyParamsObject) {
      throw 'Attempting to compute root key with non params object.';
    }
    // Salt is returned from server
    const key = await this.deriveKey({
      password: password,
      pwSalt: keyParams.salt,
      pwCost: keyParams.kdfIterations
    });
    return key;
  }

  async decryptText({ ciphertextToAuth, contentCiphertext, encryptionKey, iv } = {}) {
    const keyData = await this.crypto.hexStringToArrayBuffer(encryptionKey);
    let ivData = await this.crypto.hexStringToArrayBuffer(iv || '');
    if (!ivData) {
      // in 001, iv can be null, so we'll initialize to an empty array buffer instead
      ivData = new ArrayBuffer(16);
    }
    return this.crypto.aes256CbcDecrypt(contentCiphertext, keyData, ivData);
  }

  async encryptText(text, rawKey, iv) {
    const keyData = await this.crypto.hexStringToArrayBuffer(rawKey);
    let ivData = await this.crypto.hexStringToArrayBuffer(iv || '');
    if (!ivData) {
      // in 001, iv can be null, so we'll initialize to an empty array buffer instead
      ivData = new ArrayBuffer(16);
    }
    return this.crypto.aes256CbcEncrypt(text, keyData, ivData);
  }

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

    /**
     * Generate new item key that is double the key size.
     * Will be split to create encryption key and authentication key.
     */
    const itemKey = await this.crypto.generateRandomKey(ENCRYPTION_KEY_LENGTH * 2);
    const encItemKey = await this.encryptText(
      itemKey,
      key.itemsKey,
      null
    );

    /** Encrypt content */
    const ek = await this.firstHalfOfKey(itemKey);
    const ak = await this.secondHalfOfKey(itemKey);
    const ciphertext = await this.privateEncryptString(
      JSON.stringify(payload.content),
      ek,
      ak,
      payload.uuid,
      key.version
    );
    const authHash = await this.crypto.hmac256(ciphertext, ak);
    return CreateEncryptionParameters({
      enc_item_key: encItemKey,
      content: ciphertext,
      auth_hash: authHash
    });
  }

  async generateDecryptedParameters({ encryptedParameters, key }) {
    const format = encryptedParameters.getContentFormat();
    if ((
      format === PayloadFormats.DecryptedBareObject ||
      format === PayloadFormats.DecryptedBase64String
    )) {
      return super.generateDecryptedParameters({ encryptedParameters, key });
    }

    if (!encryptedParameters.enc_item_key) {
      console.error("Missing item encryption key, skipping decryption.");
      return encryptedParameters;
    }

    /** Decrypt encrypted key */
    let encryptedItemKey = encryptedParameters.enc_item_key;
    encryptedItemKey = ProtocolVersions.V001 + encryptedItemKey;
    const itemKeyComponents = this.encryptionComponentsFromString(
      encryptedItemKey,
      key.itemsKey
    );

    // return if uuid in auth hash does not match item uuid. Signs of tampering.
    if (itemKeyComponents.uuid && itemKeyComponents.uuid !== encryptedParameters.uuid) {
      console.error("Item key params UUID does not match item UUID");
      return CopyEncryptionParameters({
        encryptionParameters: encryptedParameters,
        override: {
          [PayloadFields.ErrorDecrypting]: true,
          [PayloadFields.ErrorDecryptingChanged]: !encryptedParameters.errorDecrypting
        }
      });
    }

    const itemKey = await this.decryptText(itemKeyComponents);
    if (!itemKey) {
      console.error("Error decrypting parameters", encryptedParameters);
      return CopyEncryptionParameters({
        encryptionParameters: encryptedParameters,
        override: {
          [PayloadFields.ErrorDecrypting]: true,
          [PayloadFields.ErrorDecryptingChanged]: !encryptedParameters.errorDecrypting
        }
      });
    }

    const itemParams = this.encryptionComponentsFromString(
      encryptedParameters.content,
      itemKey
    );

    // return if uuid in auth hash does not match item uuid. Signs of tampering.
    if (itemParams.uuid && itemParams.uuid !== encryptedParameters.uuid) {
      return CopyEncryptionParameters({
        encryptionParameters: encryptedParameters,
        override: {
          [PayloadFields.ErrorDecrypting]: true,
          [PayloadFields.ErrorDecryptingChanged]: !encryptedParameters.errorDecrypting
        }
      });
    }

    const content = await this.decryptText(itemParams, true);
    if (!content) {
      return CopyEncryptionParameters({
        encryptionParameters: encryptedParameters,
        override: {
          [PayloadFields.ErrorDecrypting]: true,
          [PayloadFields.ErrorDecryptingChanged]: !encryptedParameters.errorDecrypting
        }
      });
    } else {
      return CopyEncryptionParameters({
        encryptionParameters: encryptedParameters,
        override: {
          [PayloadFields.Content]: JSON.parse(content),
          [PayloadFields.ErrorDecrypting]: false,
          [PayloadFields.ErrorDecryptingChanged]: encryptedParameters.errorDecrypting === true,
          [PayloadFields.WaitingForKey]: false,
        }
      });
    }
  }

  /**
   * @private
   */

  encryptionComponentsFromString(string, encryptionKey) {
    const encryptionVersion = string.substring(0, ProtocolVersions.VersionLength);
    return {
      contentCiphertext: string.substring(ProtocolVersions.VersionLength, string.length),
      encryptionVersion: encryptionVersion,
      encryptionKey: encryptionKey,
      iv: null
    };
  }

  async deriveKey({ password, pwSalt, pwCost } = {}) {
    const derivedKey = await this.crypto.pbkdf2({
      password,
      salt: pwSalt,
      iterations: pwCost,
      length: PBKDF2_OUTPUT_KEY_LENGTH
    });
    const partitions = await this.splitKey({ key: derivedKey, numParts: 2 });
    const key = await SNRootKey.Create({
      content: {
        serverPassword: partitions[0],
        masterKey: partitions[1],
        version: this.constructor.versionString()
      }
    });
    return key;
  }

  /** @private */
  async privateEncryptString(string, encryptionKey, authKey, uuid, version) {
    const contentCiphertext = await this.encryptText(string, encryptionKey, null);
    const fullCiphertext = version + contentCiphertext;
    return fullCiphertext;
  }
}
