import { SNProtocolOperator } from '@Protocol/versions/operator';
import { SNRootKeyParams002 } from "@Protocol/versions/002/key_params_002";
import { SNProtocolOperator001 } from "@Protocol/versions/001/operator_001";
import { PROTOCOL_VERSION_002, PROTOCOL_VERSION_BASE_64_DECRYPTED, SN_PROTOCOL_VERSION_LENGTH } from '@Protocol/versions';

import {
  SNEncryptionPayload,
  ENCRYPTION_PAYLOAD_TYPE_ENCRYPTED,
  ENCRYPTION_PAYLOAD_TYPE_DECRYPTED_BARE_OBJECT,
  ENCRYPTION_PAYLOAD_TYPE_DECRYPTED_BASE_64
 } from '@Protocol/payloads/encryption_payload';

const ENCRYPTION_ALGORITHM      = 'AES-CBC';
const ENCRYPTION_KEY_LENGTH     = 512;
const ENCRYPTION_IV_LENGTH      = 128;
const PBKDF2_OUTPUT_KEY_LENGTH  = 768;
const PBKDF2_ITERATIONS         = 3000;
const SALT_SEED_LENGTH          = 128;

import { isLocalStorageIntent, isFileIntent, EncryptionIntentSync } from '@Protocol/intents';
import { SNRootKey } from '@Models/keys/rootKey';

export class SNProtocolOperator002 extends SNProtocolOperator001 {

  static pwCost() {
    return PBKDF2_ITERATIONS;
  }

  static versionString() {
    return PROTOCOL_VERSION_002;
  }

  /**
   * @public
   */

  async createRootKey({identifier, password}) {
    const version = this.constructor.versionString();
    const pw_cost = this.constructor.pwCost();
    const pw_nonce = await this.crypto.generateRandomKey(SALT_SEED_LENGTH);
    const pw_salt = await this.crypto.unsafe_sha1(identifier + ":" + pw_nonce);
    const key = await this.deriveKey({password: password, pw_salt: pw_salt, pw_cost: pw_cost})
    const keyParams = new SNRootKeyParams002({pw_nonce: pw_nonce, pw_cost: pw_cost, pw_salt, email: identifier});
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

  async decryptText({ciphertextToAuth, contentCiphertext, encryptionKey, iv, authHash, authKey} = {}, requiresAuth) {
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

  async generateEncryptionPayload({item, key, intent}) {
    const payloadType = this.encryptionPayloadType({item, key, intent});
    if(payloadType === ENCRYPTION_PAYLOAD_TYPE_ENCRYPTED) {
      /** Encrypt item key */
      const item_key = await this.crypto.generateRandomKey(ENCRYPTION_KEY_LENGTH);
      const enc_item_key = await this._private_encryptString(
        item_key,
        key.masterKey,
        key.dataAuthenticationKey,
        item.uuid,
        key.version
      );

      /** Encrypt content */
      const ek = await this.firstHalfOfKey(item_key);
      const ak = await this.secondHalfOfKey(item_key);
      const ciphertext = await this._private_encryptString(
        JSON.stringify(item.collapseContentAndGetJson()),
        ek,
        ak,
        item.uuid,
        key.version
      );
      return new SNEncryptionPayload({
        content: ciphertext,
        enc_item_key: enc_item_key
      });
    } else if(payloadType === ENCRYPTION_PAYLOAD_TYPE_DECRYPTED_BARE_OBJECT)  {
      const content = item.collapseContentAndGetJson();
      return new SNEncryptionPayload({
        content: content
      });
    } else if(payloadType === ENCRYPTION_PAYLOAD_TYPE_DECRYPTED_BASE_64) {
      const content = PROTOCOL_VERSION_BASE_64_DECRYPTED + await this.crypto.base64(JSON.stringify(item.collapseContentAndGetJson()));
      return new SNEncryptionPayload({
        content: content
      });
    } else {
      throw 'Invalid payload type for 002 payload generation.';
    }
  }

  async decryptItemPayload({item, key}) {
    if(typeof item.content !== 'string') {
      // Content is already an object, which is desired result.
      return;
    }

    if(item.content.startsWith(PROTOCOL_VERSION_BASE_64_DECRYPTED)) {
      try {
        const contentString = item.content.substring(SN_PROTOCOL_VERSION_LENGTH, item.content.length);
        const payload = await this.crypto.base64Decode(contentString)
        item.content = JSON.parse(payload);
      }
      catch (e) {}
      return;
    }

    if(!item.enc_item_key) {
      console.log("Missing item encryption key, skipping decryption.");
      return;
    }

    // decrypt encrypted key
    const encryptedItemKey = item.enc_item_key;
    const requiresAuth = true;

    const itemKeyComponents = this.encryptionComponentsFromString(
      encryptedItemKey,
      key.masterKey,
      key.dataAuthenticationKey
    );

    // return if uuid in auth hash does not match item uuid. Signs of tampering.
    if(itemKeyComponents.uuid && itemKeyComponents.uuid !== item.uuid) {
      console.error("Item key params UUID does not match item UUID");
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
      return;
    }

    const item_key = await this.decryptText(itemKeyComponents, requiresAuth);
    if(!item_key) {
      console.log("Error decrypting item", item);
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
      return;
    }

    // decrypt content
    const ek = await this.firstHalfOfKey(item_key);
    const ak = await this.secondHalfOfKey(item_key);
    const itemParams = this.encryptionComponentsFromString(item.content, ek, ak);

    try {
      item.auth_params = JSON.parse(await this.crypto.base64Decode(itemParams.authParams));
    } catch (e) {}

    // return if uuid in auth hash does not match item uuid. Signs of tampering.
    if(itemParams.uuid && itemParams.uuid !== item.uuid) {
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
      return;
    }

    const content = await this.decryptText(itemParams, true);
    if(!content) {
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
    } else {
      if(item.errorDecrypting == true) { item.errorDecryptingValueChanged = true;}
       // Content should only be set if it was successfully decrypted, and should otherwise remain unchanged.
      item.errorDecrypting = false;
      item.content = JSON.parse(content);
      item.content.version = this.constructor.versionString();
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
     const key = SNRootKey.FromRaw({
       pw: partitions[0],
       mk: partitions[1],
       ak: partitions[2],
       version: this.constructor.versionString()
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
    const encryptionVersion = string.substring(0, SN_PROTOCOL_VERSION_LENGTH);
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
