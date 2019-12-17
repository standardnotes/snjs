const CryptoJS = require("crypto-js");
import { SFAbstractCrypto } from './abstract_crypto';

export class SFCryptoJS extends SFAbstractCrypto {

  async pbkdf2(password, pw_salt, pw_cost, length) {
    const params = {
      keySize: length/32,
      hasher: CryptoJS.algo.SHA512,
      iterations: pw_cost
    }

    return CryptoJS.PBKDF2(password, pw_salt, params).toString();
  }

  async hexStringToArrayBuffer(hex) {
    return CryptoJS.enc.Hex.parse(hex);
  }

  async aes256CbcDecrypt(ciphertext, keyData, ivData) {
    const decrypted = CryptoJS.AES.decrypt(
      ciphertext,
      keyData,
      {
        iv: ivData,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  async aes256CbcEncrypt(text, keyData, ivData) {
    const encrypted = CryptoJS.AES.encrypt(
      text,
      keyData,
      {
        iv: ivData,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    return encrypted.toString();
  }

}
