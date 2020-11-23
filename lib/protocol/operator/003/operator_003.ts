import { ItemsKeyContent } from './../operator';
import { SNRootKey } from './../../root_key';
import { V003Algorithm } from './../algorithms';
import { Create003KeyParams, KeyParamsOrigination, SNRootKeyParams } from './../../key_params';
import { SNProtocolOperator002 } from '@Protocol/operator/002/operator_002';
import { ProtocolVersion } from '@Protocol/versions';

/**
 * @legacy
 * Non-expired operator but no longer used for generating new accounts.
 * This operator subclasses the 002 operator to share functionality that has not
 * changed, and overrides functions where behavior may differ.
 */
export class SNProtocolOperator003 extends SNProtocolOperator002 {

  get version() {
    return ProtocolVersion.V003;
  }

  protected async generateNewItemsKeyContent() {
    const keyLength = V003Algorithm.EncryptionKeyLength;
    const itemsKey = await this.crypto.generateRandomKey(keyLength);
    const authKey = await this.crypto.generateRandomKey(keyLength);
    const response: ItemsKeyContent = {
      itemsKey: itemsKey,
      dataAuthenticationKey: authKey,
      version: ProtocolVersion.V003
    }
    return response;
  }

  public async computeRootKey(password: string, keyParams: SNRootKeyParams) {
    return this.deriveKey(password, keyParams);
  }

  protected async deriveKey(
    password: string,
    keyParams: SNRootKeyParams
  ) {
    const salt = await this.generateSalt(
      keyParams.content003.identifier!,
      ProtocolVersion.V003,
      V003Algorithm.PbkdfCost,
      keyParams.content003.pw_nonce
    );
    const derivedKey = await this.crypto.pbkdf2(
      password,
      salt,
      V003Algorithm.PbkdfCost,
      V003Algorithm.PbkdfOutputLength
    );
    const partitions = this.splitKey(derivedKey!, 3);
    const key = await SNRootKey.Create(
      {
        serverPassword: partitions[0],
        masterKey: partitions[1],
        dataAuthenticationKey: partitions[2],
        version: ProtocolVersion.V003,
        keyParams: keyParams.getPortableValue()
      }
    );
    return key;
  }

  public async createRootKey(
    identifier: string,
    password: string,
    origination: KeyParamsOrigination
  ) {
    const version = ProtocolVersion.V003;
    const pwNonce = await this.crypto.generateRandomKey(V003Algorithm.SaltSeedLength);
    const keyParams = Create003KeyParams(
      {
        identifier: identifier,
        pw_nonce: pwNonce,
        version: version,
        origination: origination,
        created: `${Date.now()}`
      }
    );
    return this.deriveKey(
      password,
      keyParams
    );
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
