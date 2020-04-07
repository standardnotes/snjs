import { SNItemsKey } from '@Models/app/items_key';
import { SNRootKeyParams } from './../../key_params';
import { ItemsKeyContent } from './../operator';
import { SNProtocolOperator } from '@Protocol/operator/operator';
import { CreateKeyParams } from '@Protocol/key_params';
import { PayloadFormat } from '@Payloads/formats';
import { CreateEncryptionParameters, CopyEncryptionParameters } from '@Payloads/generator';
import { ProtocolVersion } from '@Protocol/versions';
import { SNRootKey } from '@Protocol/root_key';
import { V001Algorithm } from '@Protocol/operator/algorithms';
import { PurePayload } from '@Payloads/pure_payload';

const NO_IV = '00000000000000000000000000000000';

/**
 * @deprecated
 * A legacy operator no longer used to generate new accounts
 */
export class SNProtocolOperator001 extends SNProtocolOperator {

  get version() {
    return ProtocolVersion.V001;
  }

  protected async generateNewItemsKeyContent() {
    const keyLength = V001Algorithm.EncryptionKeyLength;
    const itemsKey = await this.crypto.generateRandomKey(keyLength);
    const response: ItemsKeyContent = {
      itemsKey: itemsKey,
      version: this.version
    }
    return response;
  }

  public async createRootKey(identifier: string, password: string) {
    const pwCost = V001Algorithm.PbkdfMinCost as number;
    const pwNonce = await this.crypto.generateRandomKey(V001Algorithm.SaltSeedLength);
    const pwSalt = await this.crypto.unsafeSha1(identifier + 'SN' + pwNonce);
    const key = await this.deriveKey(
      password,
      pwSalt,
      pwCost
    );
    const keyParams = CreateKeyParams({
      email: identifier,
      pw_cost: pwCost,
      pw_nonce: pwNonce,
      pw_salt: pwSalt,
      version: this.version
    });
    return { key: key, keyParams: keyParams };
  }

  public async computeRootKey(password: string, keyParams: SNRootKeyParams) {
    const key = await this.deriveKey(
      password,
      keyParams.salt!,
      keyParams.kdfIterations
    );
    return key;
  }

  private async decryptString(ciphertext: string, key: string) {
    return this.crypto.aes256CbcDecrypt(ciphertext, NO_IV, key);
  }

  private async encryptString(text: string, key: string) {
    return this.crypto.aes256CbcEncrypt(text, NO_IV, key);
  }

  public async generateEncryptedParameters(
    payload: PurePayload,
    format: PayloadFormat,
    key?: SNItemsKey | SNRootKey,
  ) {
    if ((
      format === PayloadFormat.DecryptedBareObject ||
      format === PayloadFormat.DecryptedBase64String
    )) {
      return super.generateEncryptedParameters(payload, format, key);
    }
    if (format !== PayloadFormat.EncryptedString) {
      throw `Unsupport format for generateEncryptedParameters ${format}`;
    }
    if (!key) {
      throw 'Attempting to generateEncryptedParameters with no itemsKey.';
    }
    /**
     * Generate new item key that is double the key size.
     * Will be split to create encryption key and authentication key.
     */
    const itemKey = await this.crypto.generateRandomKey(V001Algorithm.EncryptionKeyLength * 2);
    const encItemKey = await this.encryptString(
      itemKey,
      key.itemsKey
    );
    /** Encrypt content */
    const ek = await this.firstHalfOfKey(itemKey);
    const ak = await this.secondHalfOfKey(itemKey);
    const contentCiphertext = await this.encryptString(
      JSON.stringify(payload.content),
      ek
    );
    const ciphertext = key.version + contentCiphertext;
    const authHash = await this.crypto.hmac256(ciphertext, ak);
    return CreateEncryptionParameters(
      {
        items_key_id: key instanceof SNItemsKey ? key.uuid : undefined,
        content: ciphertext,
        enc_item_key: encItemKey!,
        auth_hash: authHash!,
      }
    );
  }

  public async generateDecryptedParameters(
    encryptedParameters: PurePayload,
    key?: SNItemsKey | SNRootKey
  ) {
    const format = encryptedParameters.format;
    if ((
      format === PayloadFormat.DecryptedBareObject ||
      format === PayloadFormat.DecryptedBase64String
    )) {
      return super.generateDecryptedParameters(encryptedParameters, key);
    }
    if (!encryptedParameters.enc_item_key) {
      console.error('Missing item encryption key, skipping decryption.');
      return encryptedParameters;
    }
    /** Decrypt encrypted key */
    let encryptedItemKey = encryptedParameters.enc_item_key;
    encryptedItemKey = this.version + encryptedItemKey;
    const itemKeyComponents = this.encryptionComponentsFromString(
      encryptedItemKey,
      key!.itemsKey
    );
    const itemKey = await this.decryptString(
      itemKeyComponents.ciphertext,
      itemKeyComponents.key
    );
    if (!itemKey) {
      console.error('Error decrypting parameters', encryptedParameters);
      return CopyEncryptionParameters(
        encryptedParameters,
        {
          errorDecrypting: true,
          errorDecryptingValueChanged: !encryptedParameters.errorDecrypting
        }
      );
    }
    const ek = await this.firstHalfOfKey(itemKey);
    const itemParams = this.encryptionComponentsFromString(
      encryptedParameters.contentString,
      ek
    );
    const content = await this.decryptString(
      itemParams.ciphertext,
      itemParams.key
    );
    if (!content) {
      return CopyEncryptionParameters(
        encryptedParameters,
        {
          errorDecrypting: true,
          errorDecryptingValueChanged: !encryptedParameters.errorDecrypting
        }
      );
    } else {
      return CopyEncryptionParameters(
        encryptedParameters,
        {
          content: JSON.parse(content),
          enc_item_key: undefined,
          errorDecrypting: false,
          errorDecryptingValueChanged: encryptedParameters.errorDecrypting === true,
          waitingForKey: false,
        }
      );
    }
  }

  private encryptionComponentsFromString(string: string, encryptionKey: string) {
    const encryptionVersion = string.substring(0, ProtocolVersion.VersionLength);
    return {
      ciphertext: string.substring(ProtocolVersion.VersionLength, string.length),
      version: encryptionVersion,
      key: encryptionKey
    };
  }

  protected async deriveKey(password: string, pwSalt: string, pwCost: number) {
    const derivedKey = await this.crypto.pbkdf2(
      password,
      pwSalt,
      pwCost,
      V001Algorithm.PbkdfOutputLength
    );
    const partitions = await this.splitKey(derivedKey!, 2);
    const key = await SNRootKey.Create(
      {
        serverPassword: partitions[0],
        masterKey: partitions[1],
        version: this.version
      }
    );
    return key;
  }
}
