import { SNProtocolOperator } from '@Protocol/versions/operator';
import { SNItemsKey } from '@Models/keys/itemsKey';
import { SNRootKeyParams004 } from '@Protocol/versions/004/key_params_004';
import { SNProtocolOperator003 } from '@Protocol/versions/003/operator_003';
import { SNRootKey } from '@Models/keys/rootKey';
import { CreateEncryptionParameters, CopyEncryptionParameters } from '@Protocol/payloads/generator';
import { SNEncryptionParameters } from '@Protocol/payloads/encryption_parameters';
import * as fields from '@Protocol/payloads/fields';
import {
  PROTOCOL_VERSION_004,
  PROTOCOL_VERSION_BASE_64_DECRYPTED,
  PROTOCOL_VERSION_LENGTH
} from '@Protocol/versions';
import {
  PAYLOAD_CONTENT_FORMAT_ENCRYPTED_STRING,
  PAYLOAD_CONTENT_FORMAT_DECRYPTED_BARE_OBJECT,
  PAYLOAD_CONTENT_FORMAT_DECRYPTED_BASE_64_STRING,
} from '@Protocol/payloads/formats';
import {
  SN_ROOT_KEY_CONTENT_TYPE,
  SN_ITEMS_KEY_CONTENT_TYPE
} from '@Lib/constants';

const ENCRYPTION_ALGORITHM      = 'AES-GCM';
const ENCRYPTION_KEY_LENGTH     = 256;
const ENCRYPTION_IV_LENGTH      = 96;
const PBKDF2_OUTPUT_KEY_LENGTH  = 512;
const PBKDF2_ITERATIONS         = 500000;
const SALT_SEED_LENGTH          = 256;

export class SNProtocolOperator004 extends SNProtocolOperator003 {

  /**
   * The protocol version. Will be prefixed to encrypted payloads.
   */
  static versionString() {
    return PROTOCOL_VERSION_004;
  }

  /**
   * The number of PBKDF2 iterations.
   */
  static kdfIterations() {
    return PBKDF2_ITERATIONS;
  }

  static encryptionAlgorithm() {
    return ENCRYPTION_ALGORITHM;
  }

  /**
   * @public
   */

  /**
   * We require both a client-side component and a server-side component in generating a salt.
   * This way, a comprimised server cannot benefit from sending the same seed value for every user.
   * We mix a client-controlled value that is globally unique (their identifier), with a server controlled value
   * to produce a salt for our KDF.
   *
  */
  async generateSalt({identifier, seed}) {
    const result = await this.crypto.sha256([identifier, seed].join(":"));
    return result;
  }

  async computeRootKey({password, keyParams}) {
    if(!keyParams.isKeyParamsObject) {
      throw 'Attempting to compute root key with non params object.';
    }
    const salt = await this.generateSalt({
      identifier: keyParams.identifier,
      seed: keyParams.seed
    });
    const key = await this.deriveKey({
      password: password,
      salt: salt,
      iterations: keyParams.kdfIterations
    });
    return key;
  }

  async createRootKey({identifier, password}) {
    const version = this.constructor.versionString();
    const iterations = this.constructor.kdfIterations();
    const seed = await this.crypto.generateRandomKey(SALT_SEED_LENGTH);
    const salt = await this.generateSalt({identifier, seed});
    const key = await this.deriveKey({
      password: password,
      salt: salt,
      iterations: iterations
    })
    /**
     * @todo Rename pw_cost -> iterations and pw_nonce -> seed
     */
    const keyParams = new SNRootKeyParams004({
      version: version,
      identifier: identifier,
      pw_cost: iterations,
      pw_nonce: seed
    });
    return {key: key, keyParams: keyParams};
  }

  /**
   * Creates a new random SNItemsKey to use for item encryption. The consumer must save/sync this item.
   * @returns  A new SNItemsKey
   */
  async createItemsKey() {
    const rawKey = await this.crypto.generateRandomKey(ENCRYPTION_KEY_LENGTH);
    const version = this.constructor.versionString();
    const payload = CreateMaxPayloadFromAnyObject({
      object: {
        content: {
          itemsKey: rawKey,
          version: version
        }
      }
    })

    const itemsKey = new SNItemsKey(payload)
    await itemsKey.initUUID();
    return itemsKey;
  }

  /**
   * @param plaintext  The plaintext to encrypt.
   * @param rawKey  The key to use to encrypt the plaintext.
   * @param iv  The initialization vector for encryption.
   * @param aad  JavaScript object (will be stringified) representing
                'Additional authenticated data' — data you want to be included in authentication.
   */
  async encryptText({plaintext, rawKey, iv, aad}) {
    const keyData = await this.crypto.hexStringToArrayBuffer(rawKey);
    const ivData  = await this.crypto.hexStringToArrayBuffer(iv);
    const aadData = aad ? await this.crypto.stringToArrayBuffer(JSON.stringify(aad)) : null;
    return this.crypto.aes256GcmEncrypt(plaintext, keyData, ivData, aadData);
  }

  /**
   * @param ciphertext  The encrypred text to decrypt.
   * @param rawKey  The key to use to decrypt the ciphertext.
   * @param iv  The initialization vector for decryption.
   * @param aad  JavaScript object (will be stringified) representing
                'Additional authenticated data' — data you want to be included in authentication.
   */
  async decryptText({ciphertext, rawKey, iv, aad}) {
    const keyData = await this.crypto.hexStringToArrayBuffer(rawKey);
    const ivData  = await this.crypto.hexStringToArrayBuffer(iv);
    const aadData = aad ? await this.crypto.stringToArrayBuffer(JSON.stringify(aad)) : null;
    return this.crypto.aes256GcmDecrypt(ciphertext, keyData, ivData, aadData);
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

    const item_key = await this.crypto.generateRandomKey(ENCRYPTION_KEY_LENGTH);

    /** Encrypt content with item_key */
    const contentPlaintext = JSON.stringify(payload.content);
    const encryptedContentString = await this.generateEncryptedString({
      plaintext: contentPlaintext,
      rawKey: item_key,
      itemUuid: payload.uuid,
    });

    /** Encrypt item_key with master itemEncryptionKey */
    const encryptedItemKey = await this.generateEncryptedString({
      plaintext: item_key,
      rawKey: key.itemsKey,
      itemUuid: payload.uuid
    });

    return CreateEncryptionParameters({
      [fields.ITEM_PAYLOAD_ITEMS_KEY_ID]: key.uuid,
      [fields.ITEM_PAYLOAD_CONTENT]: encryptedContentString,
      [fields.ITEM_PAYLOAD_ENC_ITEM_KEY]: encryptedItemKey
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

    // Decrypt item_key payload.
    const itemKeyComponents = this.deconstructEncryptedPayloadString(
      encryptedParameters.enc_item_key
    );
    const item_key = await this.decryptText({
      ciphertext: itemKeyComponents.ciphertext,
      rawKey: key.itemsKey,
      iv: itemKeyComponents.iv,
      aad: {u: encryptedParameters.uuid, v: itemKeyComponents.version}
    });

    if(!item_key) {
      console.error("Error decrypting item", item);
      return CopyEncryptionParameters({
        encryptionParameters: encryptedParameters,
        override: {
          [fields.ITEM_PAYLOAD_ERROR_DECRYPTING]: true,
          [fields.ITEM_PAYLOAD_ERROR_DECRYPTING_CHANGED]: !encryptedParameters.errorDecrypting
        }
      });
    }

    // Decrypt content payload.
    const contentComponents = this.deconstructEncryptedPayloadString(encryptedParameters.content);
    const content = await this.decryptText({
      ciphertext: contentComponents.ciphertext,
      rawKey: item_key,
      iv: contentComponents.iv,
      aad:  {u: encryptedParameters.uuid, v: contentComponents.version}
    });

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

  deconstructEncryptedPayloadString(payloadString) {
    const encryptionVersion = payloadString.substring(0, this.constructor.versionString().length);
    let components = payloadString.split(':');
    return {
      version: components[0],
      uuid: components[1],
      iv: components[2],
      ciphertext: components[3],
    }
  }

  async generateEncryptedString({plaintext, rawKey, itemUuid}) {
    const version = this.constructor.versionString();
    const iv = await this.crypto.generateRandomKey(ENCRYPTION_IV_LENGTH);
    const ciphertext = await this.encryptText({
      plaintext,
      rawKey,
      iv,
      aad: {u: itemUuid, v: version}
    });
    const payload = [version, itemUuid, iv, ciphertext].join(':');
    return payload;
  }

  async deriveKey({password, salt, iterations} = {}) {
    const derivedKey = await this.crypto.pbkdf2({password, salt, iterations, length: PBKDF2_OUTPUT_KEY_LENGTH});
    const partitions = await this.splitKey({key: derivedKey, numParts: 2});
    const masterKey = partitions[0];
    const serverPassword = partitions[1];
    const params = {
      masterKey,
      serverPassword,
      version: this.constructor.versionString()
    };
    /** @todo: HKDF each key to domain-seperate. */
    const key = SNRootKey.FromRaw(params);
    return key;
  }
}
