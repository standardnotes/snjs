import { SNCryptoOperator } from "@Crypto/operator/operator";

export class SNCryptoOperator002 extends SNCryptoOperator {

  static pwCost() {
    return 3000;
  }

  static versionString() {
    return "002";
  }

  async generateSalt(identifier, version, cost, nonce) {
    const result = await this.crypto.sha256([identifier, "SF", version, cost, nonce].join(":"));
    return result;
  }

  async computeEncryptionKeysForUser(password, authParams) {
    // Salt is returned from server
    const pw_salt = authParams.pw_salt;
    const keys = await this.crypto.generateSymmetricKeyPair({password: password, pw_salt: pw_salt, pw_cost: authParams.pw_cost})
    const userKeys = {pw: keys[0], mk: keys[1], ak: keys[2]};
    return userKeys;
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

  async encryptItem(item, keys, auth_params) {
    const params = {};
    // encrypt item key
    const item_key = await this.crypto.generateItemEncryptionKey();
    params.enc_item_key = await this._private_encryptString(item_key, keys.mk, keys.ak, item.uuid, auth_params);

    // encrypt content
    const ek = await this.crypto.firstHalfOfKey(item_key);
    const ak = await this.crypto.secondHalfOfKey(item_key);
    const ciphertext = await this._private_encryptString(JSON.stringify(item.createContentJSONFromProperties()), ek, ak, item.uuid, auth_params);
    params.content = ciphertext;
    return params;
  }

  encryptionComponentsFromString(string, encryptionKey, authKey) {
    const encryptionVersion = string.substring(0, 3);
    const components = string.split(":");
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
    const ek = await this.crypto.firstHalfOfKey(item_key);
    const ak = await this.crypto.secondHalfOfKey(item_key);
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
}
