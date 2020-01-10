import { SNProtocolOperator } from '@Protocol/versions/operator';
import { SNRootKeyParams001 } from "@Protocol/versions/001/key_params_001";
import { CreateEncryptionParameters, CopyEncryptionParameters } from '@Payloads/generator';
import { SNRootKey } from '@Models/keys/rootKey';
import { SNEncryptionParameters } from '@Payloads/encryption_parameters';
import * as fields from '@Payloads/fields';
import {
  PAYLOAD_CONTENT_FORMAT_ENCRYPTED_STRING,
  PAYLOAD_CONTENT_FORMAT_DECRYPTED_BARE_OBJECT,
  PAYLOAD_CONTENT_FORMAT_DECRYPTED_BASE_64_STRING,
} from '@Payloads/formats';
import {
  ENCRYPTION_INTENT_SYNC,
  isLocalStorageIntent,
  isFileIntent,
} from '@Protocol/intents';
import {
  PROTOCOL_VERSION_001,
  PROTOCOL_VERSION_BASE_64_DECRYPTED,
  PROTOCOL_VERSION_LENGTH
} from '@Protocol/versions';

const ENCRYPTION_ALGORITHM      = 'AES-CBC';
const ENCRYPTION_KEY_LENGTH     = 512;
const PBKDF2_OUTPUT_KEY_LENGTH  = 512;
const PBKDF2_ITERATIONS         = 3000;
const SALT_SEED_LENGTH          = 128;

export class SNProtocolOperator001 extends SNProtocolOperator {

  static pwCost() {
    return PBKDF2_ITERATIONS;
  }

  static versionString() {
    return PROTOCOL_VERSION_001;
  }

  /**
   * @public
   */

  async createRootKey({identifier, password}) {
    const version = this.constructor.versionString();
    const pw_cost = this.constructor.pwCost();
    const pw_nonce = await this.crypto.generateRandomKey(SALT_SEED_LENGTH);
    const pw_salt = await this.crypto.unsafe_sha1(identifier + 'SN' + pw_nonce);
    const key = await this.deriveKey({password: password, pw_salt: pw_salt, pw_cost: pw_cost})
    const keyParams = new SNRootKeyParams001({pw_nonce: pw_nonce, pw_cost: pw_cost, pw_salt, email: identifier});
    return {key: key, keyParams: keyParams};
  }

  async computeRootKey({password, keyParams}) {
    if(!keyParams.isKeyParamsObject) {
      throw 'Attempting to compute root key with non params object.';
    }
    // Salt is returned from server
    const key = await this.deriveKey({
      password: password,
      pw_salt: keyParams.salt,
      pw_cost: keyParams.kdfIterations
    });
    return key;
  }

  async decryptText({ciphertextToAuth, contentCiphertext, encryptionKey, iv} = {}) {
    const keyData = await this.crypto.hexStringToArrayBuffer(encryptionKey);
    const ivData  = await this.crypto.hexStringToArrayBuffer(iv || '');
    if(!ivData) {
      // in 001, iv can be null, so we'll initialize to an empty array buffer instead
      ivData = new ArrayBuffer(16);
    }
    return this.crypto.aes256CbcDecrypt(contentCiphertext, keyData, ivData);
  }

  async encryptText(text, rawKey, iv) {
    const keyData = await this.crypto.hexStringToArrayBuffer(rawKey);
    const ivData  = await this.crypto.hexStringToArrayBuffer(iv || '');
    if(!ivData) {
      // in 001, iv can be null, so we'll initialize to an empty array buffer instead
      ivData = new ArrayBuffer(16);
    }
    return this.crypto.aes256CbcEncrypt(text, keyData, ivData);
  }

  async generateEncryptionParameters({payload, key, format}) {
    if((
      format === PAYLOAD_CONTENT_FORMAT_DECRYPTED_BARE_OBJECT ||
      format === PAYLOAD_CONTENT_FORMAT_DECRYPTED_BASE_64_STRING
    ))  {
      return super.generateEncryptionParameters({payload, key, format});
    }

    if(format !== PAYLOAD_CONTENT_FORMAT_ENCRYPTED_STRING) {
      throw `Unsupport format for generateEncryptionParameters ${format}`;
    }

    /** Encrypt item key */
    const item_key = await this.crypto.generateRandomKey(ENCRYPTION_KEY_LENGTH);
    const enc_item_key = await this.encryptText(item_key, key.masterKey, null);

    /** Encrypt content */
    const ek = await this.firstHalfOfKey(item_key);
    const ak = await this.secondHalfOfKey(item_key);
    const ciphertext = await this._private_encryptString(
      JSON.stringify(payload.content),
      ek,
      ak,
      payload.uuid,
      key.version
    );
    const authHash = await this.crypto.hmac256(ciphertext, ak);
    return CreateEncryptionParameters({
      enc_item_key: enc_item_key,
      content: ciphertext,
      auth_hash: authHash
    });
  }

  async generateDecryptedParameters({encryptedParameters, key}) {
    const format = encryptedParameters.getContentFormat();
    if((
      format === PAYLOAD_CONTENT_FORMAT_DECRYPTED_BARE_OBJECT ||
      format === PAYLOAD_CONTENT_FORMAT_DECRYPTED_BASE_64_STRING
    )) {
      return super.generateDecryptedParameters({encryptedParameters, key});
    }

    if(!encryptedParameters.enc_item_key) {
      console.log("Missing item encryption key, skipping decryption.");
      return encryptedParameters;
    }

    /** Decrypt encrypted key */
    let encryptedItemKey = encryptedParameters.enc_item_key;
    encryptedItemKey = PROTOCOL_VERSION_001 + encryptedItemKey;
    const itemKeyComponents = this.encryptionComponentsFromString(
      encryptedItemKey,
      key.itemsKey
    );

    // return if uuid in auth hash does not match item uuid. Signs of tampering.
    if(itemKeyComponents.uuid && itemKeyComponents.uuid !== encryptedParameters.uuid) {
      console.error("Item key params UUID does not match item UUID");
      return CopyEncryptionParameters({
        encryptionParameters: encryptedParameters,
        override: {
          [fields.ITEM_PAYLOAD_ERROR_DECRYPTING]: true,
          [fields.ITEM_PAYLOAD_ERROR_DECRYPTING_CHANGED]: !encryptedParameters.errorDecrypting
        }
      });
    }

    const item_key = await this.decryptText(itemKeyComponents);
    if(!item_key) {
      console.log("Error decrypting item", item);
      return CopyEncryptionParameters({
        encryptionParameters: encryptedParameters,
        override: {
          [fields.ITEM_PAYLOAD_ERROR_DECRYPTING]: true,
          [fields.ITEM_PAYLOAD_ERROR_DECRYPTING_CHANGED]: !encryptedParameters.errorDecrypting
        }
      });
    }

    const itemParams = this.encryptionComponentsFromString(
      encryptedParameters.content,
      item_key
    );

    // return if uuid in auth hash does not match item uuid. Signs of tampering.
    if(itemParams.uuid && itemParams.uuid !== encryptedParameters.uuid) {
      return CopyEncryptionParameters({
        encryptionParameters: encryptedParameters,
        override: {
          [fields.ITEM_PAYLOAD_ERROR_DECRYPTING]: true,
          [fields.ITEM_PAYLOAD_ERROR_DECRYPTING_CHANGED]: !encryptedParameters.errorDecrypting
        }
      });
    }

    const content = await this.decryptText(itemParams, true);
    if(!content) {
      return CopyEncryptionParameters({
        encryptionParameters: encryptedParameters,
        override: {
          [fields.ITEM_PAYLOAD_ERROR_DECRYPTING]: true,
          [fields.ITEM_PAYLOAD_ERROR_DECRYPTING_CHANGED]: !encryptedParameters.errorDecrypting
        }
      });
    } else {
      return CopyEncryptionParameters({
        encryptionParameters: encryptedParameters,
        override: {
          [fields.ITEM_PAYLOAD_CONTENT]: JSON.parse(content),
          [fields.ITEM_PAYLOAD_ERROR_DECRYPTING]: false,
          [fields.ITEM_PAYLOAD_ERROR_DECRYPTING_CHANGED]: encryptedParameters.errorDecrypting === true,
          [fields.ITEM_PAYLOAD_WAITING_FOR_KEY]: false,
        }
      });
    }
  }

  /**
   * @private
   */

  encryptionComponentsFromString(string, encryptionKey) {
    const encryptionVersion = string.substring(0, PROTOCOL_VERSION_LENGTH);
    return {
      contentCiphertext: string.substring(PROTOCOL_VERSION_LENGTH, string.length),
      encryptionVersion: encryptionVersion,
      encryptionKey: encryptionKey,
      iv: null
    }
  }

  async deriveKey({password, pw_salt, pw_cost} = {}) {
    const derivedKey = await this.crypto.pbkdf2({
      password,
      salt: pw_salt,
      iterations: pw_cost,
      length: PBKDF2_OUTPUT_KEY_LENGTH
    });
    const partitions = await this.splitKey({key: derivedKey, numParts: 2});
    const key = SNRootKey.FromRaw({
      pw: partitions[0],
      mk: partitions[1],
      version: this.constructor.versionString()
    });
    return key;
  }

  async _private_encryptString(string, encryptionKey, authKey, uuid, version) {
    let fullCiphertext, contentCiphertext;
    contentCiphertext = await this.encryptText(string, encryptionKey, null);
    fullCiphertext = version + contentCiphertext;
    return fullCiphertext;
  }
}
