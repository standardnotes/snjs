import { SNProtocolOperator } from '@Protocol/versions/operator';
import { SNItemKey } from '@Models/keys/itemKey';
import { SNRootKeyParams004 } from '@Protocol/versions/004/key_params_004';
import { SNProtocolOperator003 } from '@Protocol/versions/003/operator_003';

export class SNProtocolOperator004 extends SNProtocolOperator003 {

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
  async generateSalt({identifier, seed}) {
    const result = await this.crypto.sha256([identifier, seed].join(":"));
    return result;
  }

  async computeRootKey({password, keyParams}) {
    const salt = await this.generateSalt({identifier: keyParams.identifier, seed: keyParams.seed});
    const keys = await this.deriveKey({password: password, salt: salt, iterations: keyParams.iterations});
    return keys;
  }

  async createRootKey({identifier, password}) {
    const version = this.constructor.versionString();
    const iterations = this.constructor.kdfIterations();
    const seed = await this.crypto.generateRandomKey(256);
    const salt = await this.generateSalt({identifier, seed});
    const keys = await this.deriveKey({
      password: password,
      salt: salt,
      iterations: iterations,
      generateItemsKey: true
    })
    const keyParams = new SNRootKeyParams004({
      version: version,
      identifier: identifier,
      iterations: iterations,
      seed: seed
    });
    return {keys: keys, keyParams: keyParams};
  }

  /**
   * @param plaintext  The plaintext to encrypt.
   * @param key  The key to use to encrypt the plaintext.
   * @param iv  The initialization vector for encryption.
   * @param aad  JavaScript object (will be stringified) representing
                'Additional authenticated data' — data you want to be included in authentication.
   */
  async encryptText({plaintext, key, iv, aad}) {
    // console.log("About to encrypt", plaintext, keyData, ivData, aadData);
    const keyData = await this.crypto.hexStringToArrayBuffer(key);
    const ivData  = await this.crypto.hexStringToArrayBuffer(iv);
    const aadData = aad ? await this.crypto.stringToArrayBuffer(JSON.stringify(aad)) : null;
    return this.crypto.aes256GcmEncrypt(plaintext, keyData, ivData, aadData);
  }

  /**
   * @param ciphertext  The encrypred text to decrypt.
   * @param key  The key to use to decrypt the ciphertext.
   * @param iv  The initialization vector for decryption.
   * @param aad  JavaScript object (will be stringified) representing
                'Additional authenticated data' — data you want to be included in authentication.
   */
  async decryptText({ciphertext, key, iv, aad}) {
    const keyData = await this.crypto.hexStringToArrayBuffer(key);
    const ivData  = await this.crypto.hexStringToArrayBuffer(iv);
    const aadData = aad ? await this.crypto.stringToArrayBuffer(JSON.stringify(aad)) : null;
    return this.crypto.aes256GcmDecrypt(ciphertext, keyData, ivData, aadData);
  }

  async encryptItem({item, keys}) {
    const EncryptionKeyLength = 256;
    const item_key = await this.crypto.generateRandomKey(EncryptionKeyLength);

    // Encrypt content with item_key
    const contentPlaintext = JSON.stringify(item.createContentJSONFromProperties());
    const encryptedPayloadString = await this.generateEncryptedPayloadString({
      plaintext: contentPlaintext,
      key: item_key,
      itemUuid: item.uuid,
    });

    // Encrypt item_key with master itemEncryptionKey
    const encryptedItemKey = await this.generateEncryptedPayloadString({
      plaintext: item_key,
      key: keys.itemsKey,
      itemUuid: item.uuid
    });

    return {
      content: encryptedPayloadString,
      enc_item_key: encryptedItemKey
    };
  }

  /**
   * Decrypts item.content in-place, meaning the passed-in item's .content property will be modified
   * to be a decrypted JSON string.
   */
  async decryptItem({item, keys}) {
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
      ciphertext: itemKeyParams.ciphertext,
      key: keys.itemsKey,
      iv: itemKeyParams.iv,
      aad: {u: item.uuid, v: itemKeyParams.version}
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
      iv: itemParams.iv,
      aad:  {u: itemUuid, v: itemParams.version}
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

  async generateEncryptedPayloadString({plaintext, key, itemUuid}) {
    const version = this.constructor.versionString();
    const iv = await this.crypto.generateRandomKey(96);
    const ciphertext = await this.encryptText({
      plaintext,
      key,
      iv,
      aad: {u: itemUuid, v: version}
    });
    const payload = [version, itemUuid, iv, ciphertext].join(":");
    return payload;
  }

  async deriveKey({password, salt, iterations, generateItemsKey} = {}) {
    const PBKDF2OutputKeyLength = 512;
    const derivedKey = await this.crypto.pbkdf2({password, salt, iterations, length: PBKDF2OutputKeyLength});
    const partitions = await this.splitKey({key: derivedKey, numParts: 2});
    const masterKey = partitions[0];
    const serverPassword = partitions[1];
    const params = {
      masterKey,
      serverPassword,
      version: this.constructor.versionString()
    };
    if(generateItemsKey) {
      params.itemsKey = await this.crypto.generateRandomKey(256);
    }
    // TODO: HKDF each key to domain-seperate.
    const keys = SNItemKey.FromRaw(params);
    return keys;
  }
}
