import { SNProtocolOperator } from '@Protocol/versions/operator';
import { SNRootKeyParams003 } from "@Protocol/versions/003/key_params_003";
import { SNProtocolOperator002 } from "@Protocol/versions/002/operator_002";

export class SNProtocolOperator003 extends SNProtocolOperator002 {

  static pwCost() {
    return 110000;
  }

  static versionString() {
    return "003";
  }

  /**
   * @public
   */

  async computeRootKey({password, keyParams}) {
    // Salt is computed from identifier + pw_nonce from server
    const pw_salt = await this.generateSalt(keyParams.identifier, keyParams.version, keyParams.pw_cost, keyParams.pw_nonce);
    const keys = await this.deriveKey({password: password, pw_salt: pw_salt, pw_cost: keyParams.pw_cost});
    return keys;
  }

  async createRootKey({identifier, password}) {
    const version = this.constructor.versionString();
    const pw_cost = this.constructor.pwCost();
    const pw_nonce = await this.crypto.generateRandomKey(256);
    const pw_salt = await this.generateSalt(identifier, version, pw_cost, pw_nonce);
    const keys = await this.deriveKey({password: password, pw_salt: pw_salt, pw_cost: pw_cost})
    const keyParams = new SNRootKeyParams003({pw_nonce: pw_nonce, pw_cost: pw_cost, identifier: identifier, version: version});
    return {keys: keys, keyParams: keyParams};
  }

  /**
   * @private
   */

  async generateSalt(identifier, version, cost, nonce) {
    const result = await this.crypto.sha256([identifier, "SF", version, cost, nonce].join(":"));
    return result;
  }
}
