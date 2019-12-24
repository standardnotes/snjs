import { SNProtocolOperator } from "@Protocol/operator/operator";

export class SNProtocolOperator003 extends SNProtocolOperator {

  static pwCost() {
    return 110000;
  }

  static versionString() {
    return "003";
  }

  /**
   * @public
   */

  async computeEncryptionKeys(password, authParams) {
     // Salt is computed from identifier + pw_nonce from server
     const pw_salt = await this.generateSalt(authParams.identifier, authParams.version, authParams.pw_cost, authParams.pw_nonce);
     const keys = await this.deriveKeys({password: password, pw_salt: pw_salt, pw_cost: authParams.pw_cost});
     const userKeys = {pw: keys[0], mk: keys[1], ak: keys[2]};
     return userKeys;
  }

  async createKeysAndAuthParams({identifier, password}) {
    const version = this.constructor.versionString();
    const pw_cost = this.constructor.pwCost();
    const pw_nonce = await this.crypto.generateRandomKey(256);
    const pw_salt = await this.generateSalt(identifier, version, pw_cost, pw_nonce);
    const keys = await this.deriveKeys({password: password, pw_salt: pw_salt, pw_cost: pw_cost})
    const authParams = {pw_nonce: pw_nonce, pw_cost: pw_cost, identifier: identifier, version: version};
    const userKeys = {pw: keys[0], mk: keys[1], ak: keys[2]};
    return {keys: userKeys, authParams: authParams};
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

  async encryptText(text, key, iv) {
    const keyData = await this.crypto.hexStringToArrayBuffer(key);
    const ivData  = await this.crypto.hexStringToArrayBuffer(iv || "");
    return this.crypto.aes256CbcEncrypt(text, keyData, ivData);
  }

  async encryptItem(item, keys, auth_params) {
    const EncryptionKeyLength = 512;
    const params = {};

    // encrypt item key
    const item_key = await this.crypto.generateRandomKey(EncryptionKeyLength);
    params.enc_item_key = await this._private_encryptString(item_key, keys.mk, keys.ak, item.uuid, auth_params);

    // encrypt content
    const ek = await this.firstHalfOfKey(item_key);
    const ak = await this.secondHalfOfKey(item_key);
    const ciphertext = await this._private_encryptString(JSON.stringify(item.createContentJSONFromProperties()), ek, ak, item.uuid, auth_params);
    params.content = ciphertext;
    return params;
  }

  async decryptItem(item, keys) {
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
    const encryptedItemKey = item.enc_item_key;
    const requiresAuth = true;
    const keyParams = this.encryptionComponentsFromString(encryptedItemKey, keys.mk, keys.ak);

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
      item.content = content;
    }
  }

  /**
   * @private
   */

  async generateSalt(identifier, version, cost, nonce) {
    const result = await this.crypto.sha256([identifier, "SF", version, cost, nonce].join(":"));
    return result;
  }

  async deriveKeys({password, salt, iterations} = {}) {
    const PBKDF2OutputKeyLength = 768;
    const derivedKey = await this.crypto.pbkdf2({password, salt, iterations, length: PBKDF2OutputKeyLength});
    return this.splitKey({key: derivedKey, numParts: 3});
  }

  async _private_encryptString(string, encryptionKey, authKey, uuid, auth_params) {
    let fullCiphertext, contentCiphertext;
    const iv = await this.crypto.generateRandomKey(128);
    contentCiphertext = await this.encryptText(string, encryptionKey, iv);
    const ciphertextToAuth = [auth_params.version, uuid, iv, contentCiphertext].join(":");
    const authHash = await this.crypto.hmac256(ciphertextToAuth, authKey);
    const authParamsString = await this.crypto.base64(JSON.stringify(auth_params));
    fullCiphertext = [auth_params.version, authHash, uuid, iv, contentCiphertext, authParamsString].join(":");
    return fullCiphertext;
  }

  encryptionComponentsFromString(string, encryptionKey, authKey) {
    const encryptionVersion = string.substring(0, 3);
    let components = string.split(":");
    return {
      encryptionVersion: components[0],
      authHash: components[1],
      uuid: components[2],
      iv: components[3],
      contentCiphertext: components[4],
      authParams: components[5],
      ciphertextToAuth: [components[0], components[2], components[3], components[4]].join(":"),
      encryptionKey: encryptionKey,
      authKey: authKey,
    }
  }
}
