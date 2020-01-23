import { SNProtocolOperator } from '@Protocol/versions/operator';
import { SNRootKeyParams002 } from "@Protocol/versions/002/key_params_002";
import { SNProtocolOperator001 } from "@Protocol/versions/001/operator_001";
import { CreateEncryptionParameters, CopyEncryptionParameters } from '@Payloads/generator';
import { SNEncryptionParameters } from '@Payloads/encryption_parameters';
import * as fields from '@Payloads/fields';
import {
  PAYLOAD_CONTENT_FORMAT_ENCRYPTED_STRING,
  PAYLOAD_CONTENT_FORMAT_DECRYPTED_BARE_OBJECT,
  PAYLOAD_CONTENT_FORMAT_DECRYPTED_BASE_64_STRING,
} from '@Payloads/formats';
import {
  PROTOCOL_VERSION_002,
  PROTOCOL_VERSION_BASE_64_DECRYPTED,
  PROTOCOL_VERSION_LENGTH
} from '@Protocol/versions';
import {
  isLocalStorageIntent,
  isFileIntent,
  ENCRYPTION_INTENT_SYNC
} from '@Protocol/intents';
import { SNRootKey } from '@Protocol/versions/root_key';

const ENCRYPTION_ALGORITHM      = 'AES-CBC';
const ENCRYPTION_KEY_LENGTH     = 256;
const ENCRYPTION_IV_LENGTH      = 128;
const PBKDF2_OUTPUT_KEY_LENGTH  = 768;
const PBKDF2_ITERATIONS         = 3000;
const SALT_SEED_LENGTH          = 128;

export class SNProtocolOperator002 extends SNProtocolOperator001 {

  static pwCost() {
    return PBKDF2_ITERATIONS;
  }

  static versionString() {
    return PROTOCOL_VERSION_002;
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
    const authKey = await this.crypto.generateRandomKey(keyLength);
    const version = this.constructor.versionString();
    return {
      itemsKey: itemsKey,
      dataAuthenticationKey: authKey,
      version: version
    };
  }

  /**
   * @public
   */

  async createRootKey({identifier, password}) {
    const version = this.constructor.versionString();
    const pw_cost = this.constructor.pwCost();
    const pw_nonce = await this.crypto.generateRandomKey(SALT_SEED_LENGTH);
    const pw_salt = await this.crypto.unsafe_sha1(identifier + ":" + pw_nonce);
    const key = await this.deriveKey({
      password: password,
      pw_salt: pw_salt,
      pw_cost:
      pw_cost
    })
    const keyParams = new SNRootKeyParams002({
      pw_nonce: pw_nonce,
      pw_cost: pw_cost,
      pw_salt,
      email: identifier
    });
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
    })
    return key;
  }

  async decryptText({
    ciphertextToAuth,
    contentCiphertext,
    encryptionKey,
    iv,
    authHash,
    authKey
  } = {}, requiresAuth) {
    if(!encryptionKey) {
      throw 'Attempting to decryptText with null encryptionKey';
    }
    if(requiresAuth && !authHash) {
      console.error("Auth hash is required.");
      return;
    }

    if(authHash) {
      const localAuthHash = await this.crypto.hmac256(ciphertextToAuth, authKey);
      if(this.crypto.timingSafeEqual(authHash, localAuthHash) === false) {
        console.error("Auth hash does not match, returning null.");
        return null;
      }
    }

    const keyData = await this.crypto.hexStringToArrayBuffer(encryptionKey);
    const ivData  = await this.crypto.hexStringToArrayBuffer(iv || "");
    return this.crypto.aes256CbcDecrypt(contentCiphertext, keyData, ivData);
  }

  async encryptText(text, rawKey, iv) {
    const keyData = await this.crypto.hexStringToArrayBuffer(rawKey);
    const ivData  = await this.crypto.hexStringToArrayBuffer(iv || "");
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
    if(!key || !key.itemsKey) {
      throw 'Attempting to generateEncryptionParameters with no itemsKey.';
    }

    /**
     * Generate new item key that is double the key size.
     * Will be split to create encryption key and authentication key.
     */
    const item_key = await this.crypto.generateRandomKey(ENCRYPTION_KEY_LENGTH * 2);
    const enc_item_key = await this._private_encryptString(
      item_key,
      key.itemsKey,
      key.dataAuthenticationKey,
      payload.uuid,
      key.version
    );

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
    return CreateEncryptionParameters({
      content: ciphertext,
      enc_item_key: enc_item_key
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
      console.error("Missing item encryption key, skipping decryption.");
      return encryptedParameters;
    }

    if(!key || !key.itemsKey) {
      throw 'Attempting to generateDecryptedParameters with no itemsKey.';
    }

    // decrypt encrypted key
    const encryptedItemKey = encryptedParameters.enc_item_key;
    const requiresAuth = true;
    const itemKeyComponents = this.encryptionComponentsFromString(
      encryptedItemKey,
      key.itemsKey,
      key.dataAuthenticationKey
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

    const item_key = await this.decryptText(itemKeyComponents, requiresAuth);
    if(!item_key) {
      console.error("Error decrypting item_key parameters", encryptedParameters);
      return CopyEncryptionParameters({
        encryptionParameters: encryptedParameters,
        override: {
          [fields.ITEM_PAYLOAD_ERROR_DECRYPTING]: true,
          [fields.ITEM_PAYLOAD_ERROR_DECRYPTING_CHANGED]: !encryptedParameters.errorDecrypting
        }
      });
    }


    // decrypt content
    const ek = await this.firstHalfOfKey(item_key);
    const ak = await this.secondHalfOfKey(item_key);
    const itemParams = this.encryptionComponentsFromString(
      encryptedParameters.content,
      ek,
      ak
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
      let authParams;
      try {
        auth_params = JSON.parse(await this.crypto.base64Decode(itemParams.authParams));
      } catch (e) {}
      return CopyEncryptionParameters({
        encryptionParameters: encryptedParameters,
        override: {
          [fields.ITEM_PAYLOAD_CONTENT]: JSON.parse(content),
          [fields.ITEM_PAYLOAD_LEGACY_003_AUTH_PARAMS]: authParams,
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

   async deriveKey({password, pw_salt, pw_cost} = {}) {
     const derivedKey = await this.crypto.pbkdf2({
       password,
       salt: pw_salt,
       iterations: pw_cost,
       length: PBKDF2_OUTPUT_KEY_LENGTH
     });
     const partitions = await this.splitKey({key: derivedKey, numParts: 3});
     const key = await SNRootKey.Create({
       content: {
         pw: partitions[0],
         mk: partitions[1],
         ak: partitions[2],
         version: this.constructor.versionString()
       }
     });
     return key;
   }

  async _private_encryptString(string, encryptionKey, authKey, uuid, version) {
    let fullCiphertext, contentCiphertext;
    const iv = await this.crypto.generateRandomKey(ENCRYPTION_IV_LENGTH);
    contentCiphertext = await this.encryptText(string, encryptionKey, iv);
    const ciphertextToAuth = [version, uuid, iv, contentCiphertext].join(":");
    const authHash = await this.crypto.hmac256(ciphertextToAuth, authKey);
    fullCiphertext = [version, authHash, uuid, iv, contentCiphertext].join(":");
    return fullCiphertext;
  }

  encryptionComponentsFromString(string, encryptionKey, authKey) {
    const encryptionVersion = string.substring(0, PROTOCOL_VERSION_LENGTH);
    const components = string.split(":");
    return {
      encryptionVersion: components[0],
      authHash: components[1],
      uuid: components[2],
      iv: components[3],
      contentCiphertext: components[4],
      ciphertextToAuth: [components[0], components[2], components[3], components[4]].join(":"),
      encryptionKey: encryptionKey,
      authKey: authKey,
    }
  }
}
