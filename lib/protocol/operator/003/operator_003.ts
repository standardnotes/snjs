import { V003Algorithm } from './../algorithms';
import { SNRootKeyParams } from './../../key_params';
import { CreateKeyParams } from '@Protocol/key_params';
import { SNProtocolOperator002 } from '@Protocol/operator/002/operator_002';
import { ProtocolVersion } from '@Protocol/versions';

/**
 * @deprecated
 * Non-expired operator but no longer used for generating new accounts.
 * This operator subclasses the 002 operator to share functionality that has not
 * changed, and overrides functions where behavior may differ.
 */
export class SNProtocolOperator003 extends SNProtocolOperator002 {

  get version() {
    return ProtocolVersion.V003;
  }

  public async computeRootKey(password: string, keyParams: SNRootKeyParams) {
    /** Unlike 002, 003 uses a hardcoded cost and not a variable one.
     * Therefore, we always use our own hardcoded value and not what is offered by
     * input keyParams. */
    const pwCost = V003Algorithm.PbkdfCost;
    const version = this.version;
    const salt = await this.generateSalt(
      keyParams.identifier!,
      version,
      pwCost,
      keyParams.seed!
    );
    const key = await this.deriveKey(
      password,
      salt,
      pwCost
    );
    return key;
  }

  public async createRootKey(identifier: string, password: string) {
    const version = this.version;
    const pwCost = V003Algorithm.PbkdfCost;
    const pwNonce = await this.crypto.generateRandomKey(V003Algorithm.SaltSeedLength);
    const pwSalt = await this.generateSalt(identifier, version, pwCost, pwNonce);
    const key = await this.deriveKey(
      password,
      pwSalt,
      pwCost
    );
    const keyParams = CreateKeyParams(
      {
        identifier: identifier,
        pw_cost: pwCost,
        pw_nonce: pwNonce,
        version: version
      }
    );
    return { key: key, keyParams: keyParams };
  }

  private async generateSalt(
    identifier: string,
    version: ProtocolVersion,
    cost: number,
    nonce: string
  ) {
    const result = await this.crypto.sha256([
      identifier,
      'SF',
      version,
      cost,
      nonce
    ].join(':'));
    return result;
  }
}
