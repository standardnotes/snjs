import { SNProtocolOperator } from "@Protocol/operator/operator";

export class SNProtocolOperator001 extends SNProtocolOperator {

  static pwCost() {
    return 3000;
  }

  static versionString() {
    return "001";
  }

  async generateSalt(identifier, version, cost, nonce) {
    const result = await this.crypto.sha256([identifier, "SF", version, cost, nonce].join(":"));
    return result;
  }

  async computeEncryptionKeysForUser(password, authParams) {
    // Salt is returned from server
    const pw_salt = authParams.pw_salt;
    const keys = await this.crypto.generateSymmetricKeyPair({password: password, pw_salt: pw_salt, pw_cost: authParams.pw_cost})
    let userKeys = {pw: keys[0], mk: keys[1], ak: keys[2]};
    return userKeys;
   }

  async _private_encryptString(string, encryptionKey, authKey, uuid, auth_params) {
    let fullCiphertext, contentCiphertext;
    contentCiphertext = await this.encryptText(string, encryptionKey, null);
    fullCiphertext = auth_params.version + contentCiphertext;
    return fullCiphertext;
  }

  async encryptItem(item, keys, auth_params) {
    const params = {};
    // encrypt item key
    const item_key = await this.crypto.generateItemEncryptionKey();
    params.enc_item_key = await this.encryptText(item_key, keys.mk, null);
    // encrypt content
    const ek = await this.crypto.firstHalfOfKey(item_key);
    const ak = await this.crypto.secondHalfOfKey(item_key);
    const ciphertext = await this._private_encryptString(JSON.stringify(item.createContentJSONFromProperties()), ek, ak, item.uuid, auth_params);
    const authHash = await this.crypto.hmac256(ciphertext, ak);
    params.auth_hash = authHash;
    params.content = ciphertext;
    return params;
  }

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
    let encryptedItemKey = item.enc_item_key;
    let requiresAuth = true;
    encryptedItemKey = "001" + encryptedItemKey;
    requiresAuth = false;
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
}
