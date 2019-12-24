import { SNProtocolOperator } from "@Protocol/operator/operator";

export class SNProtocolOperator003 extends SNProtocolOperator {

  /**
   * The protocol version. Will be prefixed to encrypted payloads.
   */
  static versionString() {
    return "004";
  }

  /**
   * The number of PBKDF2 iterations.
   */
  static kdfIterations() {
    return 500000;
  }

  static encryptionAlgorithm() {
    return "AES-GCM";
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
  async generateSalt({identifier, seed}}) {
    const result = await this.crypto.sha256([identifier, seed].join(":"));
    return result;
  }

  async computeEncryptionKeys({password, identifier, seed, iterations}) {
    const salt = await this.generateSalt({identifier, seed});
    const keys = await this.deriveKeys({password: password, salt: salt, iterations: iterations});
    return keys;
  }

  async createKeysAndAuthParams({identifier, password}) {
    const version = this.constructor.versionString();
    const iterations = this.constructor.kdfIterations();
    const seed = await this.crypto.generateRandomKey(256);
    const salt = await this.generateSalt({identifier, seed});
    const keys = await this.deriveKeys({password: password, salt: salt, iterations: iterations})
    const authParams = {
      version: version,
      identifier: identifier,
      iterations: iterations,
      seed: seed
    };
    return {keys: keys, authParams: authParams};
  }

  async encryptText({plaintext, key, iv}) {
    const keyData = await this.crypto.hexStringToArrayBuffer(key);
    const ivData  = await this.crypto.hexStringToArrayBuffer(iv);
    return this.crypto.aes256GcmEncrypt(plaintext, keyData, ivData);
  }

  async decryptText({ciphertext, key, iv} = {}) {
    const keyData = await this.crypto.hexStringToArrayBuffer(key);
    const ivData  = await this.crypto.hexStringToArrayBuffer(iv);
    return this.crypto.aes256GcmDecrypt(contentCiphertext, keyData, ivData);
  }

  async encryptItem(item, keys, auth_params) {
    const EncryptionKeyLength = 256;
    const item_key = await this.crypto.generateRandomKey(EncryptionKeyLength);

    // Encrypt content with item_key
    const contentPlaintext = JSON.stringify(item.createContentJSONFromProperties());
    const ciphertext = await this.generateEncryptedPayloadString({
      plaintext: contentPlaintext,
      key: item_key,
      item_uuid: item.uuid,
    });

    // Encrypt item_key with master itemEncryptionKey
    const enc_item_key = await this.generateEncryptedPayloadString({
      plaintext: item_key,
      key: keys.masterItemsKey,
      item_uuid: item.uuid
    });

    return {content: ciphertext, enc_item_key: enc_item_key};
  }

  /**
   * Decrypts item.content in-place, meaning the passed-in item's .content property will be modified
   * to be a decrypted JSON string.
   */
  async decryptItem(item, keys) {
    if(typeof item.content != "string") {
      // Content is already an object, which is desired result.
      return;
    }

    // 000 prefix indicates a non-encrypted base64 encoded item
    if(item.content.startsWith("000")) {
      try { item.content = JSON.parse(await this.crypto.base64Decode(item.content.substring(3, item.content.length))); }
      catch (e) {}
      return;
    }

    // Decrypt item_key payload.
    const itemKeyParams = this.deconstructEncryptedPayloadString(item.enc_item_key);

    // return if uuid in auth hash does not match item uuid. Signs of tampering.
    if(itemKeyParams.uuid && itemKeyParams.uuid !== item.uuid) {
      console.error("Item key params UUID does not match item UUID");
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
      return;
    }

    const item_key = await this.decryptText({
      itemKeyParams.ciphertext,
      key: keys.masterItemsKey,
      iv: itemKeyParams.iv
    });

    if(!item_key) {
      console.error("Error decrypting item", item);
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
      return;
    }

    // Decrypt content payload.
    const itemParams = this.deconstructEncryptedPayloadString(item.content);

    // return if uuid in auth hash does not match item uuid. Signs of tampering.
    if(itemParams.uuid && itemParams.uuid !== item.uuid) {
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
      return;
    }

    const content = await this.decryptText({
      ciphertext: itemParams.ciphertext,
      key: item_key,
      iv: itemParams.iv
    });

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

  deconstructEncryptedPayloadString(payloadString) {
    const encryptionVersion = string.substring(0, this.constructor.versionString().length);
    let components = string.split(":");
    return {
      version: components[0],
      uuid: components[1],
      iv: components[2],
      ciphertext: components[3],
    }
  }

  async generateEncryptedPayloadString({plaintext, key, item_uuid}) {
    const version = this.constructor.versionString();
    const iv = await this.crypto.generateRandomKey(128);
    const ciphertext = await this.encryptText(plaintext, key, iv);
    const payload = [version, item_uuid, iv, ciphertext].join(":");
    return payload;
  }

  async deriveKeys({password, salt, iterations} = {}) {
    const PBKDF2OutputKeyLength = 512;
    const derivedKey = await this.crypto.pbkdf2({password, salt, iterations, length: PBKDF2OutputKeyLength});
    const partitions = this.splitKey({key: derivedKey, numParts: 3});
    const keys = {pw: partitions[0], mk: partitions[1], ak: partitions[2]};
    return keys;
  }

}
