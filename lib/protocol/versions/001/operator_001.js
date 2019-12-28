import { SNProtocolOperator } from '@Protocol/versions/operator';
import { SNRootKeyParams001 } from "@Protocol/versions/001/key_params_001";
import { PROTOCOL_VERSION_001, PROTOCOL_VERSION_BASE_64_DECRYPTED, SN_PROTOCOL_VERSION_LENGTH } from '@Protocol/versions';
import { isLocalStorageIntent, isFileIntent, EncryptionIntentSync } from '@Protocol/intents';
import { CreatePayloadFromItem } from '@Protocol/payloads/generator';
import { SNRootKey } from '@Models/keys/rootKey';

import {
  SNEncryptionPayload,
  ENCRYPTION_PAYLOAD_TYPE_ENCRYPTED,
  ENCRYPTION_PAYLOAD_TYPE_DECRYPTED_BARE_OBJECT,
  ENCRYPTION_PAYLOAD_TYPE_DECRYPTED_BASE_64
 } from '@Protocol/payloads/encryption_payload';

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

  /**
   * Generates parameters for an item that are typically encrypted, and used for syncing or saving locally.
   * Parameters are non-typed objects that can later by converted to objects.
   * @returns A plain key/value object.
   */
  async generateItemPayload({item, key, intent}) {
    const encryptionPayload = await this.generateEncryptionPayload({
      item: item,
      key: key,
      intent: intent
    });

    const itemPayload = CreatePayloadFromItem({
      item: item,
      encryptionPayload: encryptionPayload,
      intent: intent
    });

    return itemPayload;
  }

  async generateEncryptionPayload({item, key, intent}) {
    const payloadType = this.encryptionPayloadType({item, key, intent});
    if(payloadType === ENCRYPTION_PAYLOAD_TYPE_ENCRYPTED) {
      /** Encrypt item key */
      const item_key = await this.crypto.generateRandomKey(ENCRYPTION_KEY_LENGTH);
      const enc_item_key = await this.encryptText(item_key, key.masterKey, null);

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
      const authHash = await this.crypto.hmac256(ciphertext, ak);
      return new SNEncryptionPayload({
        enc_item_key: enc_item_key,
        content: ciphertext,
        auth_hash: authHash
      });
    } else if(payloadType === ENCRYPTION_PAYLOAD_TYPE_DECRYPTED_BARE_OBJECT)  {
      const content = item.collapseContentAndGetJson();
      return new SNEncryptionPayload({
        content: content
      });
    } else if(payloadType === ENCRYPTION_PAYLOAD_TYPE_DECRYPTED_BASE_64) {
      const jsonString = JSON.stringify(item.collapseContentAndGetJson());
      const base64String = await this.crypto.base64(jsonString);
      const content = PROTOCOL_VERSION_BASE_64_DECRYPTED + base64String;
      return new SNEncryptionPayload({
        content: content
      });
    } else {
      throw 'Invalid payload type for 001 payload generation.';
    }
  }

  async decryptItemPayload({item, key}) {
    if(typeof item.content !== 'string') {
      // Content is already an object/decrypted.
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
    let encryptedItemKey = item.enc_item_key;
    encryptedItemKey = PROTOCOL_VERSION_001 + encryptedItemKey;
    const itemKeyComponents = this.encryptionComponentsFromString(
      encryptedItemKey,
      key.itemsKey
    );

    // return if uuid in auth hash does not match item uuid. Signs of tampering.
    if(itemKeyComponents.uuid && itemKeyComponents.uuid !== item.uuid) {
      console.error("Item key params UUID does not match item UUID");
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
      return;
    }

    const item_key = await this.decryptText(itemKeyComponents);
    if(!item_key) {
      console.log("Error decrypting item", item);
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
      return;
    }

    const itemParams = this.encryptionComponentsFromString(item.content, item_key);

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
    }
  }

  /**
   * @private
   */

  encryptionComponentsFromString(string, encryptionKey) {
    const encryptionVersion = string.substring(0, SN_PROTOCOL_VERSION_LENGTH);
    return {
      contentCiphertext: string.substring(SN_PROTOCOL_VERSION_LENGTH, string.length),
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
