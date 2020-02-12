import { CreateKeyParams } from '@Protocol/key_params';
import { SNProtocolOperator002 } from "@Protocol/operator/002/operator_002";
import { ProtocolVersions } from '@Protocol/versions';

const PBKDF2_ITERATIONS = 110000;
const SALT_SEED_LENGTH = 256;

export class SNProtocolOperator003 extends SNProtocolOperator002 {

  static pwCost() {
    return PBKDF2_ITERATIONS;
  }

  static versionString() {
    return ProtocolVersions.V003;
  }

  /**
   * @public
   */

  async computeRootKey({ password, keyParams }) {
    if (!keyParams.isKeyParamsObject) {
      throw 'Attempting to compute root key with non params object.';
    }
    const salt = await this.generateSalt(
      keyParams.identifier,
      keyParams.version,
      keyParams.kdfIterations,
      keyParams.seed
    );
    const key = await this.deriveKey({
      password: password,
      pwSalt: salt,
      pwCost: keyParams.kdfIterations
    });
    return key;
  }

  async createRootKey({ identifier, password }) {
    const version = this.constructor.versionString();
    const pwCost = this.constructor.pwCost();
    const pwNonce = await this.crypto.generateRandomKey(SALT_SEED_LENGTH);
    const pwSalt = await this.generateSalt(identifier, version, pwCost, pwNonce);
    const key = await this.deriveKey({
      password: password,
      pwSalt: pwSalt,
      pwCost: pwCost
    });
    const keyParams = CreateKeyParams({
      identifier: identifier,
      pw_cost: pwCost,
      pw_nonce: pwNonce,
      version: version
    });
    return { key: key, keyParams: keyParams };
  }

  /** @private */
  async generateSalt(identifier, version, cost, nonce) {
    const result = await this.crypto.sha256([
      identifier,
      'SF',
      version,
      cost,
      nonce
    ].join(":"));
    return result;
  }
}
