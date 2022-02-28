import { SNPureCrypto } from '@standardnotes/sncrypto-common'
import { CreateItemFromPayload } from '@Models/generator'
import { SNLog } from './../../../log'
import {
  ItemAuthenticatedData,
  LegacyAttachedData,
  RootKeyEncryptedAuthenticatedData,
  FillItemContent,
  PurePayload,
  CopyEncryptionParameters,
  CreateEncryptionParameters,
  CreateMaxPayloadFromAnyObject,
  PayloadFormat,
} from '@standardnotes/payloads'
import { SNItemsKey } from '@Models/app/items_key'
import {
  Create001KeyParams,
  SNRootKeyParams,
} from './../../key_params'
import { ItemsKeyContent, AsynchronousOperator } from './../operator'
import { SNRootKey } from '@Protocol/root_key'
import { V001Algorithm } from '@Protocol/operator/algorithms'
import {
  ContentType,
  KeyParamsOrigination,
  ProtocolVersion,
} from '@standardnotes/common'
import { ProtocolVersionLength } from '@standardnotes/applications'
import { UuidGenerator } from '@standardnotes/utils'
import { firstHalfOfString, secondHalfOfString, splitString } from '@standardnotes/utils'

const NO_IV = '00000000000000000000000000000000'

/**
 * @deprecated
 * A legacy operator no longer used to generate new accounts
 */
export class SNProtocolOperator001 implements AsynchronousOperator {
  protected readonly crypto: SNPureCrypto

  constructor(crypto: SNPureCrypto) {
    this.crypto = crypto
  }

  public getEncryptionDisplayName(): string {
    return 'AES-256'
  }

  get version(): string {
    return ProtocolVersion.V001
  }

  protected generateNewItemsKeyContent(): ItemsKeyContent {
    const keyLength = V001Algorithm.EncryptionKeyLength
    const itemsKey = this.crypto.generateRandomKey(keyLength)
    const response: ItemsKeyContent = {
      itemsKey: itemsKey,
      version: ProtocolVersion.V001,
    }
    return response
  }

  /**
   * Creates a new random SNItemsKey to use for item encryption.
   * The consumer must save/sync this item.
   */
  public createItemsKey(): SNItemsKey {
    const content = this.generateNewItemsKeyContent()
    const payload = CreateMaxPayloadFromAnyObject({
      uuid: UuidGenerator.GenerateUuid(),
      content_type: ContentType.ItemsKey,
      content: FillItemContent(content),
    })
    return CreateItemFromPayload(payload) as SNItemsKey
  }

  public async createRootKey(
    identifier: string,
    password: string,
    origination: KeyParamsOrigination
  ): Promise<SNRootKey> {
    const pwCost = V001Algorithm.PbkdfMinCost as number
    const pwNonce = await this.crypto.generateRandomKey(
      V001Algorithm.SaltSeedLength
    )
    const pwSalt = await this.crypto.unsafeSha1(identifier + 'SN' + pwNonce)
    const keyParams = Create001KeyParams({
      email: identifier,
      pw_cost: pwCost,
      pw_nonce: pwNonce,
      pw_salt: pwSalt,
      version: ProtocolVersion.V001,
      origination,
      created: `${Date.now()}`,
    })
    return this.deriveKey(password, keyParams)
  }

  public getPayloadAuthenticatedData(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _payload: PurePayload
  ):
    | RootKeyEncryptedAuthenticatedData
    | ItemAuthenticatedData
    | LegacyAttachedData
    | undefined {
    return undefined
  }

  public async computeRootKey(
    password: string,
    keyParams: SNRootKeyParams
  ): Promise<SNRootKey> {
    return this.deriveKey(password, keyParams)
  }

  private async decryptString(ciphertext: string, key: string) {
    return this.crypto.aes256CbcDecrypt(ciphertext, NO_IV, key)
  }

  private async encryptString(text: string, key: string) {
    return this.crypto.aes256CbcEncrypt(text, NO_IV, key)
  }

  public async generateEncryptedParametersAsync(
    payload: PurePayload,
    format: PayloadFormat,
    key?: SNItemsKey | SNRootKey
  ): Promise<PurePayload> {
    if (format === PayloadFormat.DecryptedBareObject) {
      return CreateEncryptionParameters({
        content: payload.content,
      })
    }
    if (format !== PayloadFormat.EncryptedString) {
      throw `Unsupport format for generateEncryptedParameters ${format}`
    }
    if (!key) {
      throw 'Attempting to generateEncryptedParameters with no itemsKey.'
    }
    /**
     * Generate new item key that is double the key size.
     * Will be split to create encryption key and authentication key.
     */
    const itemKey = this.crypto.generateRandomKey(
      V001Algorithm.EncryptionKeyLength * 2
    )
    const encItemKey = await this.encryptString(itemKey, key.itemsKey)
    /** Encrypt content */
    const ek = firstHalfOfString(itemKey)
    const ak = secondHalfOfString(itemKey)
    const contentCiphertext = await this.encryptString(
      JSON.stringify(payload.content),
      ek
    )
    const ciphertext = key.keyVersion + contentCiphertext
    const authHash = await this.crypto.hmac256(ciphertext, ak)
    return CreateEncryptionParameters({
      uuid: payload.uuid,
      items_key_id: key instanceof SNItemsKey ? key.uuid : undefined,
      content: ciphertext,
      enc_item_key: encItemKey!,
      auth_hash: authHash!,
    })
  }

  public async generateDecryptedParametersAsync(
    encryptedParameters: PurePayload,
    key?: SNItemsKey | SNRootKey
  ): Promise<PurePayload> {
    const format = encryptedParameters.format
    if (format === PayloadFormat.DecryptedBareObject) {
      /** No decryption required */
      return encryptedParameters
    }
    if (!encryptedParameters.enc_item_key) {
      SNLog.error(Error('Missing item encryption key, skipping decryption.'))
      return CopyEncryptionParameters(encryptedParameters, {
        errorDecrypting: true,
        errorDecryptingValueChanged: !encryptedParameters.errorDecrypting,
      })
    }
    /** Decrypt encrypted key */
    let encryptedItemKey = encryptedParameters.enc_item_key
    encryptedItemKey = this.version + encryptedItemKey
    const itemKeyComponents = this.encryptionComponentsFromString(
      encryptedItemKey,
      key!.itemsKey
    )
    const itemKey = await this.decryptString(
      itemKeyComponents.ciphertext,
      itemKeyComponents.key
    )
    if (!itemKey) {
      console.error('Error decrypting parameters', encryptedParameters)
      return CopyEncryptionParameters(encryptedParameters, {
        errorDecrypting: true,
        errorDecryptingValueChanged: !encryptedParameters.errorDecrypting,
      })
    }
    const ek = firstHalfOfString(itemKey)
    const itemParams = this.encryptionComponentsFromString(
      encryptedParameters.contentString,
      ek
    )
    const content = await this.decryptString(
      itemParams.ciphertext,
      itemParams.key
    )
    if (!content) {
      return CopyEncryptionParameters(encryptedParameters, {
        errorDecrypting: true,
        errorDecryptingValueChanged: !encryptedParameters.errorDecrypting,
      })
    } else {
      return CopyEncryptionParameters(encryptedParameters, {
        content: JSON.parse(content),
        items_key_id: undefined,
        enc_item_key: undefined,
        auth_hash: undefined,
        errorDecrypting: false,
        errorDecryptingValueChanged:
          encryptedParameters.errorDecrypting === true,
        waitingForKey: false,
      })
    }
  }

  private encryptionComponentsFromString(
    string: string,
    encryptionKey: string
  ) {
    const encryptionVersion = string.substring(0, ProtocolVersionLength)
    return {
      ciphertext: string.substring(ProtocolVersionLength, string.length),
      version: encryptionVersion,
      key: encryptionKey,
    }
  }

  protected async deriveKey(
    password: string,
    keyParams: SNRootKeyParams
  ): Promise<SNRootKey> {
    const derivedKey = await this.crypto.pbkdf2(
      password,
      keyParams.content001.pw_salt,
      keyParams.content001.pw_cost,
      V001Algorithm.PbkdfOutputLength
    )
    const partitions = splitString(derivedKey!, 2)
    const key = await SNRootKey.Create({
      serverPassword: partitions[0],
      masterKey: partitions[1],
      version: ProtocolVersion.V001,
      keyParams: keyParams.getPortableValue(),
    })
    return key
  }
}
