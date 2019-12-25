import { SNProtocolOperator } from '@Protocol/versions/operator';
import { SNAuthParams003 } from "@Protocol/versions/003/auth_params_003";
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

  async computeEncryptionKeys({password, authParams}) {
    // Salt is computed from identifier + pw_nonce from server
    const pw_salt = await this.generateSalt(authParams.identifier, authParams.version, authParams.pw_cost, authParams.pw_nonce);
    const keys = await this.deriveKeys({password: password, pw_salt: pw_salt, pw_cost: authParams.pw_cost});
    return keys;
  }

  async createKeysAndAuthParams({identifier, password}) {
    const version = this.constructor.versionString();
    const pw_cost = this.constructor.pwCost();
    const pw_nonce = await this.crypto.generateRandomKey(256);
    const pw_salt = await this.generateSalt(identifier, version, pw_cost, pw_nonce);
    const keys = await this.deriveKeys({password: password, pw_salt: pw_salt, pw_cost: pw_cost})
    const authParams = new SNAuthParams003({pw_nonce: pw_nonce, pw_cost: pw_cost, identifier: identifier, version: version});
    return {keys: keys, authParams: authParams};
  }

  /**
   * @private
   */

  async generateSalt(identifier, version, cost, nonce) {
    const result = await this.crypto.sha256([identifier, "SF", version, cost, nonce].join(":"));
    return result;
  }
}
