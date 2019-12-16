/*
  Abstract class with default implementations of some crypto functions.
  Instantiate an instance of either SFCryptoJS (uses cryptojs) or SFCryptoWeb (uses web crypto)
  These subclasses may override some of the functions in this abstract class.
*/

const CryptoJS = require("crypto-js");

const globalScope = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null);

export class SFAbstractCrypto {

  constructor() {
    this.DefaultPBKDF2Length = 768;
  }

  generateUUIDSync() {
    var crypto = globalScope.crypto || globalScope.msCrypto;
    if(crypto) {
      var buf = new Uint32Array(4);
      crypto.getRandomValues(buf);
      var idx = -1;
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          idx++;
          var r = (buf[idx>>3] >> ((idx%8)*4))&15;
          var v = c == 'x' ? r : (r&0x3|0x8);
          return v.toString(16);
      });
    } else {
      var d = new Date().getTime();
      if(globalScope.performance && typeof globalScope.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
      }
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
      });
      return uuid;
    }
  }

  async generateUUID()  {
    return this.generateUUIDSync();
  }

  /* Constant-time string comparison */
  timingSafeEqual(a, b) {
    var strA = String(a);
    var strB = String(b);
    var lenA = strA.length;
    var result = 0;

    if(lenA !== strB.length) {
      strB = strA;
      result = 1;
    }

    for(var i = 0; i < lenA; i++) {
      result |= (strA.charCodeAt(i) ^ strB.charCodeAt(i));
    }

    return result === 0;
  }

  async decryptText({ciphertextToAuth, contentCiphertext, encryptionKey, iv, authHash, authKey} = {}, requiresAuth) {
    if(requiresAuth && !authHash) {
      console.error("Auth hash is required.");
      return;
    }

    if(authHash) {
      var localAuthHash = await this.hmac256(ciphertextToAuth, authKey);
      if(this.timingSafeEqual(authHash, localAuthHash) === false) {
        console.error("Auth hash does not match, returning null.");
        return null;
      }
    }

    var keyData = CryptoJS.enc.Hex.parse(encryptionKey);
    var ivData  = CryptoJS.enc.Hex.parse(iv || "");
    var decrypted = CryptoJS.AES.decrypt(contentCiphertext, keyData, { iv: ivData,  mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  async encryptText(text, key, iv) {
    var keyData = CryptoJS.enc.Hex.parse(key);
    var ivData  = CryptoJS.enc.Hex.parse(iv || "");
    var encrypted = CryptoJS.AES.encrypt(text, keyData, { iv: ivData,  mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.toString();
  }

  async generateRandomKey(bits) {
    return CryptoJS.lib.WordArray.random(bits/8).toString();
  }

  async generateItemEncryptionKey() {
    // Generates a key that will be split in half, each being 256 bits. So total length will need to be 512.
    let length = 512; let cost = 1;
    var salt = await this.generateRandomKey(length);
    var passphrase = await this.generateRandomKey(length);
    return this.pbkdf2(passphrase, salt, cost, length);
  }

  async firstHalfOfKey(key) {
    return key.substring(0, key.length/2);
  }

  async secondHalfOfKey(key) {
    return key.substring(key.length/2, key.length);
  }

  async base64(text) {
    return globalScope.btoa(encodeURIComponent(text).replace(/%([0-9A-F]{2})/g,
      function toSolidBytes(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
  }

  async base64Decode(base64String) {
    return globalScope.atob(base64String);
  }

  async sha256(text) {
    return CryptoJS.SHA256(text).toString();
  }

  async hmac256(message, key) {
    var keyData = CryptoJS.enc.Hex.parse(key);
    var messageData = CryptoJS.enc.Utf8.parse(message);
    var result = CryptoJS.HmacSHA256(messageData, keyData).toString();
    return result;
  }

  async generateSalt(identifier, version, cost, nonce) {
    var result = await this.sha256([identifier, "SF", version, cost, nonce].join(":"));
    return result;
  }

  /** Generates two deterministic keys based on one input */
  async generateSymmetricKeyPair({password, pw_salt, pw_cost} = {}) {
    var output = await this.pbkdf2(password, pw_salt, pw_cost, this.DefaultPBKDF2Length);
    var outputLength = output.length;
    var splitLength = outputLength/3;
    var firstThird = output.slice(0, splitLength);
    var secondThird = output.slice(splitLength, splitLength * 2);
    var thirdThird = output.slice(splitLength * 2, splitLength * 3);
    return [firstThird, secondThird, thirdThird];
  }

  async computeEncryptionKeysForUser(password, authParams) {
    var pw_salt;

    if(authParams.version == "003") {
      if(!authParams.identifier) {
        console.error("authParams is missing identifier.");
        return;
      }
      // Salt is computed from identifier + pw_nonce from server
      pw_salt = await this.generateSalt(authParams.identifier, authParams.version, authParams.pw_cost, authParams.pw_nonce);
    } else {
      // Salt is returned from server
      pw_salt = authParams.pw_salt;
    }

    return this.generateSymmetricKeyPair({password: password, pw_salt: pw_salt, pw_cost: authParams.pw_cost})
    .then((keys) => {
      let userKeys = {pw: keys[0], mk: keys[1], ak: keys[2]};
      return userKeys;
     });
   }

   // Unlike computeEncryptionKeysForUser, this method always uses the latest SF Version
  async generateInitialKeysAndAuthParamsForUser(identifier, password) {
    let version = this.defaults.version;
    var pw_cost = this.defaults.defaultPasswordGenerationCost;
    var pw_nonce = await this.generateRandomKey(256);
    var pw_salt = await this.generateSalt(identifier, version, pw_cost, pw_nonce);

    return this.generateSymmetricKeyPair({password: password, pw_salt: pw_salt, pw_cost: pw_cost})
    .then((keys) => {
      let authParams = {pw_nonce: pw_nonce, pw_cost: pw_cost, identifier: identifier, version: version};
      let userKeys = {pw: keys[0], mk: keys[1], ak: keys[2]};
      return {keys: userKeys, authParams: authParams};
    });
  }

}
