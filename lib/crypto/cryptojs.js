const CryptoJS = require("crypto-js");
import { SFAbstractCrypto } from './abstract_crypto';

export class SFCryptoJS extends SFAbstractCrypto {

  async pbkdf2(password, pw_salt, pw_cost, length) {
    var params = {
      keySize: length/32,
      hasher: CryptoJS.algo.SHA512,
      iterations: pw_cost
    }

    return CryptoJS.PBKDF2(password, pw_salt, params).toString();
  }

}
