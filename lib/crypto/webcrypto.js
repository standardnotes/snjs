import { SFAbstractCrypto } from './abstract_crypto';

const globalScope = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null);
const subtleCrypto = globalScope.crypto ? globalScope.crypto.subtle : null;

export class SFCryptoWeb extends SFAbstractCrypto {

  /**
  Public
  */

  async pbkdf2(password, pw_salt, pw_cost, length) {
    var key = await this.webCryptoImportKey(password, "PBKDF2", ["deriveBits"]);
    if(!key) {
      console.log("Key is null, unable to continue");
      return null;
    }

    return this.webCryptoDeriveBits(key, pw_salt, pw_cost, length);
  }

  async generateRandomKey(bits) {
    let extractable = true;
    return subtleCrypto.generateKey({name: "AES-CBC", length: bits}, extractable, ["encrypt", "decrypt"]).then((keyObject) => {
      return subtleCrypto.exportKey("raw", keyObject).then(async (keyData) => {
        var key = await this.arrayBufferToHexString(new Uint8Array(keyData));
        return key;
      })
      .catch((err) => {
        console.error("Error exporting key", err);
      });
    })
    .catch((err) => {
      console.error("Error generating key", err);
    });
  }

  async generateItemEncryptionKey() {
    // Generates a key that will be split in half, each being 256 bits. So total length will need to be 512.
    var length = 256;
    return Promise.all([
      this.generateRandomKey(length),
      this.generateRandomKey(length)
    ]).then((values) => {
      return values.join("");
    });
  }

  async encryptText(text, key, iv) {
    // in 001, iv can be null, so we'll initialize to an empty array buffer instead
    var ivData = iv ? await this.hexStringToArrayBuffer(iv) : new ArrayBuffer(16);
    const alg = { name: 'AES-CBC', iv: ivData };

    const keyBuffer = await this.hexStringToArrayBuffer(key);
    var keyData = await this.webCryptoImportKey(keyBuffer, alg.name, ["encrypt"]);
    var textData = await this.stringToArrayBuffer(text);

    return crypto.subtle.encrypt(alg, keyData, textData).then(async (result) => {
      let cipher = await this.arrayBufferToBase64(result);
      return cipher;
    })
  }

  async decryptText({ciphertextToAuth, contentCiphertext, encryptionKey, iv, authHash, authKey} = {}, requiresAuth) {
    if(requiresAuth && !authHash) {
      console.error("Auth hash is required.");
      return;
    }

    if(authHash) {
      var localAuthHash = await this.hmac256(ciphertextToAuth, authKey);
      if(this.timingSafeEqual(authHash, localAuthHash) === false) {
        console.error(`Auth hash does not match, returning null. ${authHash} != ${localAuthHash}`);
        return null;
      }
    }

    // in 001, iv can be null, so we'll initialize to an empty array buffer instead
    var ivData = iv ? await this.hexStringToArrayBuffer(iv) : new ArrayBuffer(16);
    const alg = { name: 'AES-CBC', iv: ivData };

    const keyBuffer = await this.hexStringToArrayBuffer(encryptionKey);
    var keyData = await this.webCryptoImportKey(keyBuffer, alg.name, ["decrypt"]);
    var textData = await this.base64ToArrayBuffer(contentCiphertext);

    return crypto.subtle.decrypt(alg, keyData, textData).then(async (result) => {
      var decoded = await this.arrayBufferToString(result);
      return decoded;
    }).catch((error) => {
      console.error("Error decrypting:", error);
    })
  }

  async hmac256(message, key) {
    var keyHexData = await this.hexStringToArrayBuffer(key);
    var keyData = await this.webCryptoImportKey(keyHexData, "HMAC", ["sign"], {name: "SHA-256"});
    var messageData = await this.stringToArrayBuffer(message);
    return crypto.subtle.sign({name: "HMAC"}, keyData, messageData)
    .then(async (signature) => {
      var hash = await this.arrayBufferToHexString(signature);
      return hash;
    })
    .catch(function(err){
      console.error("Error computing hmac", err);
    });
  }

  /**
  Internal
  */

  async webCryptoImportKey(input, alg, actions, hash) {
    var text = typeof input === "string" ? await this.stringToArrayBuffer(input) : input;
    return subtleCrypto.importKey("raw", text, { name: alg, hash: hash }, false, actions)
    .then((key) => {
      return key;
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
  }

  async webCryptoDeriveBits(key, pw_salt, pw_cost, length) {
    var params = {
      "name": "PBKDF2",
      salt: await this.stringToArrayBuffer(pw_salt),
      iterations: pw_cost,
      hash: {name: "SHA-512"},
    }

    return subtleCrypto.deriveBits(params, key, length)
    .then(async (bits) => {
      var key = await this.arrayBufferToHexString(new Uint8Array(bits));
      return key;
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
  }

  async stringToArrayBuffer(string) {
    // Using FileReader for higher performance amongst larger files
    return new Promise((resolve, reject) => {
      var blob = new Blob([string]);
      var f = new FileReader();
      f.onload = function(e) {
        resolve(e.target.result);
      }
      f.readAsArrayBuffer(blob);
    })
  }

  async arrayBufferToString(arrayBuffer) {
    // Using FileReader for higher performance amongst larger files
    return new Promise((resolve, reject) => {
      var blob = new Blob([arrayBuffer]);
      var f = new FileReader();
      f.onload = function(e) {
        resolve(e.target.result);
      }
      f.readAsText(blob);
    })
  }

  async arrayBufferToHexString(arrayBuffer) {
    var byteArray = new Uint8Array(arrayBuffer);
    var hexString = "";
    var nextHexByte;

    for (var i=0; i<byteArray.byteLength; i++) {
      nextHexByte = byteArray[i].toString(16);
      if(nextHexByte.length < 2) {
        nextHexByte = "0" + nextHexByte;
      }
      hexString += nextHexByte;
    }
    return hexString;
  }

  async hexStringToArrayBuffer(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
    return new Uint8Array(bytes);
  }

  async base64ToArrayBuffer(base64) {
    var binary_string = await this.base64Decode(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for(var i = 0; i < len; i++)        {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  async arrayBufferToBase64(buffer) {
    return new Promise((resolve, reject) => {
      var blob = new Blob([buffer],{type:'application/octet-binary'});
      var reader = new FileReader();
      reader.onload = function(evt){
        var dataurl = evt.target.result;
        resolve(dataurl.substr(dataurl.indexOf(',') + 1));
      };
      reader.readAsDataURL(blob);
    })
  }

}
