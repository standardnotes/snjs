import { CreateKeyParams } from '@Protocol/key_params';
import { SNProtocolOperator001 } from "@Protocol/operator/001/operator_001";
import { PayloadFields } from '@Payloads/fields';
import { PayloadFormats } from '@Payloads/formats';
import { CreateEncryptionParameters, CopyEncryptionParameters } from '@Payloads/generator';
import { ProtocolVersions } from '@Protocol/versions';
import { SNRootKey } from '@Protocol/root_key';
import { base64Decode } from 'sncrypto';

// eslint-disable-next-line no-unused-vars
const ENCRYPTION_ALGORITHM = 'AES-CBC';
const ENCRYPTION_KEY_LENGTH = 256;
const ENCRYPTION_IV_LENGTH = 128;
const PBKDF2_OUTPUT_KEY_LENGTH = 768;
const PBKDF2_ITERATIONS = 3000;
const SALT_SEED_LENGTH = 128;

export class SNProtocolOperator002 extends SNProtocolOperator001 {

  static pwCost() {
    return PBKDF2_ITERATIONS;
  }

  static versionString() {
    return ProtocolVersions.V002;
  }

  static encryptionKeyLength() {
    return ENCRYPTION_KEY_LENGTH;
  }

  /** @override */
  async generateNewItemsKeyContent() {
    const keyLength = this.constructor.encryptionKeyLength();
    const itemsKey = await this.crypto.generateRandomKey(keyLength);
    const authKey = await this.crypto.generateRandomKey(keyLength);
    const version = this.constructor.versionString();
    return {
      itemsKey: itemsKey,
      dataAuthenticationKey: authKey,
      version: version
    };
  }

  /** @public */
  async createRootKey({ identifier, password }) {
    const pwCost = this.constructor.pwCost();
    const pwNonce = await this.crypto.generateRandomKey(SALT_SEED_LENGTH);
    const pwSalt = await this.crypto.unsafe_sha1(identifier + ':' + pwNonce);
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
      version: ProtocolVersions.V002
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

  async decryptString(text, rawKey, iv) {
    return this.crypto.aes256CbcDecrypt(text, rawKey, iv);
  }

  async encryptString(text, rawKey, iv) {
    return this.crypto.aes256CbcEncrypt(text, rawKey, iv);
  }

  async encryptTextParams(string, encryptionKey, authKey, uuid, version) {
    const iv = await this.crypto.generateRandomKey(ENCRYPTION_IV_LENGTH);
    const contentCiphertext = await this.encryptString(string, encryptionKey, iv);
    const ciphertextToAuth = [version, uuid, iv, contentCiphertext].join(':');
    const authHash = await this.crypto.hmac256(ciphertextToAuth, authKey);
    const fullCiphertext = [version, authHash, uuid, iv, contentCiphertext].join(':');
    return fullCiphertext;
  }

  async decryptTextParams({
    ciphertextToAuth,
    contentCiphertext,
    encryptionKey,
    iv,
    authHash,
    authKey
  }) {
    if (!encryptionKey) {
      throw 'Attempting to decryptTextParams with null encryptionKey';
    }
    const localAuthHash = await this.crypto.hmac256(ciphertextToAuth, authKey);
    if (this.crypto.timingSafeEqual(authHash, localAuthHash) === false) {
      console.error("Auth hash does not match, returning null.");
      return null;
    }
    return this.decryptString(contentCiphertext, encryptionKey, iv);
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
    const encItemKey = await this.encryptTextParams(
      itemKey,
      key.itemsKey,
      key.dataAuthenticationKey,
      payload.uuid,
      key.version
    );

    /** Encrypt content */
    const ek = await this.firstHalfOfKey(itemKey);
    const ak = await this.secondHalfOfKey(itemKey);
    const ciphertext = await this.encryptTextParams(
      JSON.stringify(payload.content),
      ek,
      ak,
      payload.uuid,
      key.version
    );

    return CreateEncryptionParameters({
      [PayloadFields.ItemsKeyId]: key.isItemsKey ? key.uuid : null,
      [PayloadFields.Content]: ciphertext,
      [PayloadFields.EncItemKey]: encItemKey
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

    if (!key || !key.itemsKey) {
      throw 'Attempting to generateDecryptedParameters with no itemsKey.';
    }

    // decrypt encrypted key
    const encryptedItemKey = encryptedParameters.enc_item_key;
    const itemKeyComponents = this.encryptionComponentsFromString(
      encryptedItemKey,
      key.itemsKey,
      key.dataAuthenticationKey
    );

    const itemKey = await this.decryptTextParams(itemKeyComponents);
    if (!itemKey) {
      console.error("Error decrypting item_key parameters", encryptedParameters);
      return CopyEncryptionParameters({
        encryptionParameters: encryptedParameters,
        override: {
          [PayloadFields.ErrorDecrypting]: true,
          [PayloadFields.ErrorDecryptingChanged]: !encryptedParameters.errorDecrypting
        }
      });
    }

    // decrypt content
    const ek = await this.firstHalfOfKey(itemKey);
    const ak = await this.secondHalfOfKey(itemKey);
    const itemParams = this.encryptionComponentsFromString(
      encryptedParameters.content,
      ek,
      ak
    );

    const content = await this.decryptTextParams(itemParams);
    if (!content) {
      return CopyEncryptionParameters({
        encryptionParameters: encryptedParameters,
        override: {
          [PayloadFields.ErrorDecrypting]: true,
          [PayloadFields.ErrorDecryptingChanged]: !encryptedParameters.errorDecrypting
        }
      });
    } else {
      let authParams;
      try {
        authParams = JSON.parse(await base64Decode(itemParams.authParams));
        // eslint-disable-next-line no-empty
      } catch (e) { }
      return CopyEncryptionParameters({
        encryptionParameters: encryptedParameters,
        override: {
          [PayloadFields.Content]: JSON.parse(content),
          [PayloadFields.Legacy003AuthParams]: authParams,
          [PayloadFields.ErrorDecrypting]: false,
          [PayloadFields.ErrorDecryptingChanged]: encryptedParameters.errorDecrypting === true,
          [PayloadFields.WaitingForKey]: false,
        }
      });
    }
  }

  /** @protected */
  async deriveKey({ password, pwSalt, pwCost } = {}) {
    if (!pwCost || !pwSalt || !password) {
      throw 'Attempting to 003.deriveKey with invalid parameters';
    }
    const derivedKey = await this.crypto.pbkdf2({
      password,
      salt: pwSalt,
      iterations: pwCost,
      length: PBKDF2_OUTPUT_KEY_LENGTH
    });
    const partitions = await this.splitKey({ key: derivedKey, numParts: 3 });
    const key = await SNRootKey.Create({
      content: {
        serverPassword: partitions[0],
        masterKey: partitions[1],
        dataAuthenticationKey: partitions[2],
        version: this.constructor.versionString()
      }
    });
    return key;
  }

  encryptionComponentsFromString(string, encryptionKey, authKey) {
    const components = string.split(':');
    return {
      encryptionVersion: components[0],
      authHash: components[1],
      uuid: components[2],
      iv: components[3],
      contentCiphertext: components[4],
      ciphertextToAuth: [
        components[0],
        components[2],
        components[3],
        components[4]
      ].join(':'),
      encryptionKey: encryptionKey,
      authKey: authKey,
    };
  }
}
