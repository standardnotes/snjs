import { CreateItemFromPayload } from '@Models/generator'
import {
  lastElement,
  splitString,
  firstHalfOfString,
  secondHalfOfString,
} from '@standardnotes/utils'
import {
  ItemAuthenticatedData,
  LegacyAttachedData,
  RootKeyEncryptedAuthenticatedData,
  CopyEncryptionParameters,
  CreateEncryptionParameters,
  CreateMaxPayloadFromAnyObject,
  PayloadFormat,
  PurePayload,
  FillItemContent,
} from '@standardnotes/payloads'
import { ItemsKeyContent } from './../operator'
import { SNItemsKey } from '@Models/app/items_key'
import { Create002KeyParams, SNRootKeyParams } from './../../key_params'
import { V002Algorithm } from './../algorithms'
import { SNProtocolOperator001 } from '@Protocol/operator/001/operator_001'

import { SNRootKey } from '@Protocol/root_key'
import { SNLog } from '@Lib/log'
import {
  ContentType,
  AnyKeyParamsContent,
  KeyParamsOrigination,
  ProtocolVersion,
} from '@standardnotes/common'
import { UuidGenerator } from '@standardnotes/utils'

/**
 * @deprecated
 * A legacy operator no longer used to generate new accounts.
 */
export class SNProtocolOperator002 extends SNProtocolOperator001 {
  get version(): string {
    return ProtocolVersion.V002
  }

  protected generateNewItemsKeyContent(): ItemsKeyContent {
    const keyLength = V002Algorithm.EncryptionKeyLength
    const itemsKey = this.crypto.generateRandomKey(keyLength)
    const authKey = this.crypto.generateRandomKey(keyLength)
    const response: ItemsKeyContent = {
      itemsKey: itemsKey,
      dataAuthenticationKey: authKey,
      version: ProtocolVersion.V002,
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
    origination: KeyParamsOrigination,
  ): Promise<SNRootKey> {
    const pwCost = lastElement(V002Algorithm.PbkdfCostsUsed)
    const pwNonce = this.crypto.generateRandomKey(V002Algorithm.SaltSeedLength)
    const pwSalt = await this.crypto.unsafeSha1(identifier + ':' + pwNonce)
    const keyParams = Create002KeyParams({
      email: identifier,
      pw_nonce: pwNonce,
      pw_cost: pwCost!,
      pw_salt: pwSalt,
      version: ProtocolVersion.V002,
      origination,
      created: `${Date.now()}`,
    })
    return this.deriveKey(password, keyParams)
  }

  /**
   * Note that version 002 supported "dynamic" iteration counts. Some accounts
   * may have had costs of 5000, and others of 101000. Therefore, when computing
   * the root key, we must use the value returned by the server.
   */
  public async computeRootKey(password: string, keyParams: SNRootKeyParams): Promise<SNRootKey> {
    return this.deriveKey(password, keyParams)
  }

  private async decryptString002(text: string, key: string, iv: string) {
    return this.crypto.aes256CbcDecrypt(text, iv, key)
  }

  private async encryptString002(text: string, key: string, iv: string) {
    return this.crypto.aes256CbcEncrypt(text, iv, key)
  }

  /**
   * @param keyParams Supplied only when encrypting an items key
   */
  private async encryptTextParams(
    string: string,
    encryptionKey: string,
    authKey: string,
    uuid: string,
    version: ProtocolVersion,
    keyParams?: SNRootKeyParams,
  ) {
    const iv = this.crypto.generateRandomKey(V002Algorithm.EncryptionIvLength)
    const contentCiphertext = await this.encryptString002(string, encryptionKey, iv)
    const ciphertextToAuth = [version, uuid, iv, contentCiphertext].join(':')
    const authHash = (await this.crypto.hmac256(ciphertextToAuth, authKey))!
    const components: string[] = [version as string, authHash, uuid, iv, contentCiphertext]
    if (keyParams) {
      const keyParamsString = this.crypto.base64Encode(JSON.stringify(keyParams.content))
      components.push(keyParamsString)
    }
    const fullCiphertext = components.join(':')
    return fullCiphertext
  }

  private async decryptTextParams(
    ciphertextToAuth: string,
    contentCiphertext: string,
    encryptionKey: string,
    iv: string,
    authHash: string,
    authKey: string,
  ) {
    if (!encryptionKey) {
      throw 'Attempting to decryptTextParams with null encryptionKey'
    }
    const localAuthHash = await this.crypto.hmac256(ciphertextToAuth, authKey)
    if (this.crypto.timingSafeEqual(authHash, localAuthHash!) === false) {
      SNLog.error(Error('Auth hash does not match.'))
      return null
    }
    return this.decryptString002(contentCiphertext, encryptionKey, iv)
  }

  public getPayloadAuthenticatedData(
    payload: PurePayload,
  ): RootKeyEncryptedAuthenticatedData | ItemAuthenticatedData | LegacyAttachedData | undefined {
    const itemKeyComponents = this.encryptionComponentsFromString002(payload.enc_item_key!)
    const authenticatedData = itemKeyComponents.keyParams
    if (!authenticatedData) {
      return undefined
    }
    const decoded = JSON.parse(this.crypto.base64Decode(authenticatedData))
    const data: LegacyAttachedData = {
      ...(decoded as AnyKeyParamsContent),
    }
    return data
  }

  public async generateEncryptedParametersAsync(
    payload: PurePayload,
    format: PayloadFormat,
    key?: SNItemsKey | SNRootKey,
  ): Promise<PurePayload> {
    if (format === PayloadFormat.DecryptedBareObject) {
      return CreateEncryptionParameters({
        content: payload.content,
      })
    }
    if (format !== PayloadFormat.EncryptedString) {
      throw `Unsupport format for generateEncryptedParameters ${format}`
    }
    if (!key || !key.itemsKey) {
      throw 'Attempting to generateEncryptedParameters with no itemsKey.'
    }
    /**
     * Generate new item key that is double the key size.
     * Will be split to create encryption key and authentication key.
     */
    const itemKey = this.crypto.generateRandomKey(V002Algorithm.EncryptionKeyLength * 2)
    const encItemKey = await this.encryptTextParams(
      itemKey,
      key.itemsKey,
      key.dataAuthenticationKey,
      payload.uuid!,
      key.keyVersion,
      key instanceof SNRootKey ? (key as SNRootKey).keyParams : undefined,
    )
    /** Encrypt content */
    const ek = firstHalfOfString(itemKey)
    const ak = secondHalfOfString(itemKey)
    const ciphertext = await this.encryptTextParams(
      JSON.stringify(payload.content),
      ek,
      ak,
      payload.uuid!,
      key.keyVersion,
      key instanceof SNRootKey ? (key as SNRootKey).keyParams : undefined,
    )
    return CreateEncryptionParameters({
      uuid: payload.uuid,
      items_key_id: key instanceof SNItemsKey ? key.uuid : undefined,
      content: ciphertext,
      enc_item_key: encItemKey,
    })
  }

  public async generateDecryptedParametersAsync(
    encryptedParameters: PurePayload,
    key?: SNItemsKey | SNRootKey,
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
    if (!key || !key.itemsKey) {
      throw Error('Attempting to generateDecryptedParameters with no itemsKey.')
    }
    /* Decrypt encrypted key */
    const encryptedItemKey = encryptedParameters.enc_item_key
    const itemKeyComponents = this.encryptionComponentsFromString002(
      encryptedItemKey,
      key.itemsKey,
      key.dataAuthenticationKey,
    )
    const itemKey = await this.decryptTextParams(
      itemKeyComponents.ciphertextToAuth,
      itemKeyComponents.contentCiphertext,
      itemKeyComponents.encryptionKey!,
      itemKeyComponents.iv,
      itemKeyComponents.authHash,
      itemKeyComponents.authKey!,
    )
    if (!itemKey) {
      console.error('Error decrypting item_key parameters', encryptedParameters)
      return CopyEncryptionParameters(encryptedParameters, {
        errorDecrypting: true,
        errorDecryptingValueChanged: !encryptedParameters.errorDecrypting,
      })
    }
    /* Decrypt content */
    const ek = firstHalfOfString(itemKey)
    const ak = secondHalfOfString(itemKey)
    const itemParams = this.encryptionComponentsFromString002(
      encryptedParameters.contentString,
      ek,
      ak,
    )
    const content = await this.decryptTextParams(
      itemParams.ciphertextToAuth,
      itemParams.contentCiphertext,
      itemParams.encryptionKey!,
      itemParams.iv,
      itemParams.authHash,
      itemParams.authKey!,
    )
    if (!content) {
      return CopyEncryptionParameters(encryptedParameters, {
        errorDecrypting: true,
        errorDecryptingValueChanged: !encryptedParameters.errorDecrypting,
      })
    } else {
      let keyParams
      try {
        keyParams = JSON.parse(this.crypto.base64Decode(itemParams.keyParams))
        // eslint-disable-next-line no-empty
      } catch (e) {}
      return CopyEncryptionParameters(encryptedParameters, {
        content: JSON.parse(content),
        items_key_id: undefined,
        enc_item_key: undefined,
        auth_hash: undefined,
        auth_params: keyParams,
        errorDecrypting: false,
        errorDecryptingValueChanged: encryptedParameters.errorDecrypting === true,
        waitingForKey: false,
      })
    }
  }

  protected async deriveKey(password: string, keyParams: SNRootKeyParams): Promise<SNRootKey> {
    const derivedKey = await this.crypto.pbkdf2(
      password,
      keyParams.content002.pw_salt,
      keyParams.content002.pw_cost,
      V002Algorithm.PbkdfOutputLength,
    )
    const partitions = splitString(derivedKey!, 3)
    const key = await SNRootKey.Create({
      serverPassword: partitions[0],
      masterKey: partitions[1],
      dataAuthenticationKey: partitions[2],
      version: ProtocolVersion.V002,
      keyParams: keyParams.getPortableValue(),
    })
    return key
  }

  private encryptionComponentsFromString002(
    string: string,
    encryptionKey?: string,
    authKey?: string,
  ) {
    const components = string.split(':')
    return {
      encryptionVersion: components[0],
      authHash: components[1],
      uuid: components[2],
      iv: components[3],
      contentCiphertext: components[4],
      keyParams: components[5],
      ciphertextToAuth: [components[0], components[2], components[3], components[4]].join(':'),
      encryptionKey: encryptionKey,
      authKey: authKey,
    }
  }
}
