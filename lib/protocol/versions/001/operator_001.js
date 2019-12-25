import { SNProtocolOperator } from '@Protocol/versions/operator';
import { SNRootKeyParams001 } from "@Protocol/versions/001/key_params_001";
import { EncryptionIntentLocalStorage, EncryptionIntentFile, EncryptionIntentSync } from '@Protocol/intents';
import omit from 'lodash/omit';
import merge from 'lodash/merge';

export class SNProtocolOperator001 extends SNProtocolOperator {

  static pwCost() {
    return 3000;
  }

  static versionString() {
    return "001";
  }

  /**
   * @public
   */

  async createRootKey({identifier, password}) {
    const version = this.constructor.versionString();
    const pw_cost = this.constructor.pwCost();
    const pw_nonce = await this.crypto.generateRandomKey(128);
    const pw_salt = await this.crypto.unsafe_sha1(identifier + "SN" + pw_nonce);
    const key = await this.deriveKey({password: password, pw_salt: pw_salt, pw_cost: pw_cost})
    const keyParams = new SNRootKeyParams001({pw_nonce: pw_nonce, pw_cost: pw_cost, pw_salt, email: identifier});
    return {key: key, keyParams: keyParams};
  }

  async computeRootKey({password, keyParams}) {
    // Salt is returned from server
    const pw_salt = keyParams.pw_salt;
    const key = await this.deriveKey({password: password, pw_salt: pw_salt, pw_cost: keyParams.pw_cost})
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
    if(!ivData) {
      // in 001, iv can be null, so we'll initialize to an empty array buffer instead
      ivData = new ArrayBuffer(16);
    }
    return this.crypto.aes256CbcDecrypt(contentCiphertext, keyData, ivData);
  }

  async encryptText(text, key, iv) {
    const keyData = await this.crypto.hexStringToArrayBuffer(key);
    const ivData  = await this.crypto.hexStringToArrayBuffer(iv || "");
    if(!ivData) {
      // in 001, iv can be null, so we'll initialize to an empty array buffer instead
      ivData = new ArrayBuffer(16);
    }
    return this.crypto.aes256CbcEncrypt(text, keyData, ivData);
  }

  async encryptItem({item, keys, keyParams}) {
    const EncryptionKeyLength = 512;
    const params = {};

    // encrypt item key
    const item_key = await this.crypto.generateRandomKey(EncryptionKeyLength);
    params.enc_item_key = await this.encryptText(item_key, keys.mk, null);

    // encrypt content
    const ek = await this.firstHalfOfKey(item_key);
    const ak = await this.secondHalfOfKey(item_key);
    const ciphertext = await this._private_encryptString(JSON.stringify(item.createContentJSONFromProperties()), ek, ak, item.uuid, keyParams);
    const authHash = await this.crypto.hmac256(ciphertext, ak);
    params.auth_hash = authHash;
    params.content = ciphertext;
    return params;
  }

  async decryptItem({item, keys}) {
    if(typeof item.content != "string") {
      // Content is already an object, can't do anything with it.
      return;
    }

    // 000 prefix indicates a non-encrypted base64 encoded item
    if(item.content.startsWith("000")) {
      try { item.content = JSON.parse(await this.crypto.base64Decode(item.content.substring(3, item.content.length))); }
      catch (e) {}
      return;
    }

    if(!item.enc_item_key) {
      // This needs to be here to continue, return otherwise
      console.log("Missing item encryption key, skipping decryption.");
      return;
    }

    // decrypt encrypted key
    let encryptedItemKey = item.enc_item_key;
    let requiresAuth = true;
    encryptedItemKey = "001" + encryptedItemKey;
    requiresAuth = false;
    const keyParams = this.encryptionComponentsFromString(encryptedItemKey, keys.itemsKey, keys.encryptionAuthenticationKey);

    // return if uuid in auth hash does not match item uuid. Signs of tampering.
    if(keyParams.uuid && keyParams.uuid !== item.uuid) {
      console.error("Item key params UUID does not match item UUID");
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
      return;
    }

    const item_key = await this.decryptText(keyParams, requiresAuth);
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
      item.keyParams = JSON.parse(await this.crypto.base64Decode(itemParams.authParams));
    } catch (e) {}

    // return if uuid in auth hash does not match item uuid. Signs of tampering.
    if(itemParams.uuid && itemParams.uuid !== item.uuid) {
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
      return;
    }

    if(!itemParams.authHash) {
      itemParams.authHash = item.auth_hash;
    }

    const content = await this.decryptText(itemParams, true);
    if(!content) {
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
    } else {
      if(item.errorDecrypting == true) { item.errorDecryptingValueChanged = true;}
       // Content should only be set if it was successfully decrypted, and should otherwise remain unchanged.
      item.errorDecrypting = false;
      item.content = content;
    }
  }

  /**
   * Generates parameters for an item that are typically encrypted, and used for syncing or saving locally.
   * Parameters are non-typed objects that can later by converted to objects.
   * @returns A plain key/value object.
   */
  async generateExportParameters({item, keys, keyParams, includeDeleted, intent}) {
    if(keys && !keyParams) { throw "keyParams must be supplied if supplying keys." }
    if(keyParams && !keyParams.version) { throw "keyParams is missing version" }

    const computeParams = async (additionalFields, omitFields) => {
      const params = {
        uuid: item.uuid,
        content_type: item.content_type,
        deleted: item.deleted,
        created_at: item.created_at,
        updated_at: item.updated_at
      };

      if(item.errorDecrypting) {
        // Keep content and related fields as is (and do not try to encrypt, otherwise that would be undefined behavior)
        params.content = item.content;
        params.enc_item_key = item.enc_item_key;
        params.auth_hash = item.auth_hash;
        if(additionalFields) { merge(params, pick(item, additionalFields)) }
        return;
      }

      const isForRemoteSync = intent === EncryptionIntentSync;
      // Items should always be encrypted for export files. Only respect item.doNotEncrypt for remote sync params.
      const doNotEncrypt = item.doNotEncrypt() && isForRemoteSync;
      const encrypt = keys && !doNotEncrypt;

      if(encrypt) {
        const encryptedParams = await this.encryptItem({
          item: item,
          keys: keys,
          keyParams: keyParams
        });

        merge(params, encryptedParams);
      } else {
        if(!isForRemoteSync) {
          params.content = item.createContentJSONFromProperties();
        } else {
          params.content = "000" + await this.crypto.base64(JSON.stringify(item.createContentJSONFromProperties()));
        }

        if(!isForRemoteSync) {
          params.enc_item_key = null;
          params.auth_hash = null;
        }
      }

      if(additionalFields) {
        merge(params, pick(item, additionalFields));
      }

      if(omitFields) {
        params = omit(params, omitFields);
      }

      return params;
    }

    const additionalFields =
      intent === EncryptionIntentLocalStorage ?
        ["dirty", "dirtiedDate", "errorDecrypting"]
      : null;
    const omitFields = intent === EncryptionIntentFile && !includeDeleted ?
        ["deleted"]
      : null;
    const params = await computeParams(additionalFields, omitFields);
    return params;
  }

  /**
   * @private
   */

   encryptionComponentsFromString(string, encryptionKey, authKey) {
     const encryptionVersion = string.substring(0, 3);
     return {
       contentCiphertext: string.substring(3, string.length),
       encryptionVersion: encryptionVersion,
       ciphertextToAuth: string,
       iv: null,
       authHash: null,
       encryptionKey: encryptionKey,
       authKey: authKey
     }
   }

  async deriveKey({password, pw_salt, pw_cost} = {}) {
    const PBKDF2OutputKeyLength = 512;
    const derivedKey = await this.crypto.pbkdf2({password, salt: pw_salt, iterations: pw_cost, length: PBKDF2OutputKeyLength});
    const partitions = await this.splitKey({key: derivedKey, numParts: 2});
    const keys = SNItemKey.FromRaw({
      pw: partitions[0],
      mk: partitions[1],
      version: this.constructor.versionString()
    });
    return keys;
  }

  async _private_encryptString(string, encryptionKey, authKey, uuid, keyParams) {
    let fullCiphertext, contentCiphertext;
    contentCiphertext = await this.encryptText(string, encryptionKey, null);
    fullCiphertext = keyParams.version + contentCiphertext;
    return fullCiphertext;
  }
}
