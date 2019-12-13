export class SFItemTransformer {

  constructor(crypto) {
    this.crypto = crypto;
  }

  async _private_encryptString(string, encryptionKey, authKey, uuid, auth_params) {
    var fullCiphertext, contentCiphertext;
    if(auth_params.version === "001") {
      contentCiphertext = await this.crypto.encryptText(string, encryptionKey, null);
      fullCiphertext = auth_params.version + contentCiphertext;
    } else {
      var iv = await this.crypto.generateRandomKey(128);
      contentCiphertext = await this.crypto.encryptText(string, encryptionKey, iv);
      var ciphertextToAuth = [auth_params.version, uuid, iv, contentCiphertext].join(":");
      var authHash = await this.crypto.hmac256(ciphertextToAuth, authKey);
      var authParamsString = await this.crypto.base64(JSON.stringify(auth_params));
      fullCiphertext = [auth_params.version, authHash, uuid, iv, contentCiphertext, authParamsString].join(":");
    }

    return fullCiphertext;
  }

  async encryptItem(item, keys, auth_params) {
    var params = {};
    // encrypt item key
    var item_key = await this.crypto.generateItemEncryptionKey();
    if(auth_params.version === "001") {
      // legacy
      params.enc_item_key = await this.crypto.encryptText(item_key, keys.mk, null);
    } else {
      params.enc_item_key = await this._private_encryptString(item_key, keys.mk, keys.ak, item.uuid, auth_params);
    }

    // encrypt content
    var ek = await this.crypto.firstHalfOfKey(item_key);
    var ak = await this.crypto.secondHalfOfKey(item_key);
    var ciphertext = await this._private_encryptString(JSON.stringify(item.createContentJSONFromProperties()), ek, ak, item.uuid, auth_params);
    if(auth_params.version === "001") {
      var authHash = await this.crypto.hmac256(ciphertext, ak);
      params.auth_hash = authHash;
    }

    params.content = ciphertext;
    return params;
  }

  encryptionComponentsFromString(string, encryptionKey, authKey) {
    var encryptionVersion = string.substring(0, 3);
    if(encryptionVersion === "001") {
      return {
        contentCiphertext: string.substring(3, string.length),
        encryptionVersion: encryptionVersion,
        ciphertextToAuth: string,
        iv: null,
        authHash: null,
        encryptionKey: encryptionKey,
        authKey: authKey
      }
    } else {
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

  async decryptItem(item, keys) {

    if(typeof item.content != "string") {
      // Content is already an object, can't do anything with it.
      return;
    }

    if(item.content.startsWith("000")) {
      // is base64 encoded
      try {
        item.content = JSON.parse(await this.crypto.base64Decode(item.content.substring(3, item.content.length)));
      } catch (e) {}

      return;
    }

    if(!item.enc_item_key) {
      // This needs to be here to continue, return otherwise
      console.log("Missing item encryption key, skipping decryption.");
      return;
    }

    // decrypt encrypted key
    var encryptedItemKey = item.enc_item_key;
    var requiresAuth = true;
    if(!encryptedItemKey.startsWith("002") && !encryptedItemKey.startsWith("003")) {
      // legacy encryption type, has no prefix
      encryptedItemKey = "001" + encryptedItemKey;
      requiresAuth = false;
    }
    var keyParams = this.encryptionComponentsFromString(encryptedItemKey, keys.mk, keys.ak);

    // return if uuid in auth hash does not match item uuid. Signs of tampering.
    if(keyParams.uuid && keyParams.uuid !== item.uuid) {
      console.error("Item key params UUID does not match item UUID");
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
      return;
    }

    var item_key = await this.crypto.decryptText(keyParams, requiresAuth);

    if(!item_key) {
      console.log("Error decrypting item", item);
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
      return;
    }

    // decrypt content
    var ek = await this.crypto.firstHalfOfKey(item_key);
    var ak = await this.crypto.secondHalfOfKey(item_key);
    var itemParams = this.encryptionComponentsFromString(item.content, ek, ak);

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
      // legacy 001
      itemParams.authHash = item.auth_hash;
    }

    var content = await this.crypto.decryptText(itemParams, true);
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

  async decryptMultipleItems(items, keys, throws) {
    let decrypt = async (item) => {
      if(!item) {
        return;
      }
      // 4/15/18: Adding item.content == null clause. We still want to decrypt deleted items incase
      // they were marked as dirty but not yet synced. Not yet sure why we had this requirement.
      if(item.deleted == true && item.content == null) {
        return;
      }

      var isString = typeof item.content === 'string' || item.content instanceof String;
      if(isString) {
        try {
          await this.decryptItem(item, keys);
        } catch (e) {
          if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
          item.errorDecrypting = true;
          if(throws) {
            throw e;
          }
          console.error("Error decrypting item", item, e);
          return;
        }
      }
    }

    return Promise.all(items.map((item) => {
      return decrypt(item);
    }));

  }
}
