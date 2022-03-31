import { Create002KeyParams } from '../../RootKey/KeyParams'
import { ItemsKeyContent } from '../Operator'
import { SNItemsKey, CreateItemFromPayload } from '@standardnotes/models'
import { SNProtocolOperator001 } from '../001/Operator001'
import { SNRootKey } from '../../RootKey/RootKey'
import { SNRootKeyParams } from '../../RootKey/RootKeyParams'
import { UuidGenerator } from '@standardnotes/utils'
import { V002Algorithm } from '../../Algorithm'
import * as Common from '@standardnotes/common'
import * as Payloads from '@standardnotes/payloads'
import * as Utils from '@standardnotes/utils'

/**
 * @deprecated
 * A legacy operator no longer used to generate new accounts.
 */
export class SNProtocolOperator002 extends SNProtocolOperator001 {
  get version(): Common.ProtocolVersion {
    return Common.ProtocolVersion.V002
  }

  protected generateNewItemsKeyContent(): ItemsKeyContent {
    const keyLength = V002Algorithm.EncryptionKeyLength
    const itemsKey = this.crypto.generateRandomKey(keyLength)
    const authKey = this.crypto.generateRandomKey(keyLength)
    const response: ItemsKeyContent = {
      itemsKey: itemsKey,
      dataAuthenticationKey: authKey,
      version: Common.ProtocolVersion.V002,
    }
    return response
  }

  /**
   * Creates a new random SNItemsKey to use for item encryption.
   * The consumer must save/sync this item.
   */
  public createItemsKey(): SNItemsKey {
    const content = this.generateNewItemsKeyContent()
    const payload = Payloads.CreateMaxPayloadFromAnyObject({
      uuid: UuidGenerator.GenerateUuid(),
      content_type: Common.ContentType.ItemsKey,
      content: Payloads.FillItemContent(content),
    })
    return CreateItemFromPayload(payload) as SNItemsKey
  }

  public async createRootKey(
    identifier: string,
    password: string,
    origination: Common.KeyParamsOrigination,
  ): Promise<SNRootKey> {
    const pwCost = Utils.lastElement(V002Algorithm.PbkdfCostsUsed) as number
    const pwNonce = this.crypto.generateRandomKey(V002Algorithm.SaltSeedLength)
    const pwSalt = await this.crypto.unsafeSha1(identifier + ':' + pwNonce)

    const keyParams = Create002KeyParams({
      email: identifier,
      pw_nonce: pwNonce,
      pw_cost: pwCost,
      pw_salt: pwSalt,
      version: Common.ProtocolVersion.V002,
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
    version: Common.ProtocolVersion,
    keyParams?: SNRootKeyParams,
  ) {
    const iv = this.crypto.generateRandomKey(V002Algorithm.EncryptionIvLength)
    const contentCiphertext = await this.encryptString002(string, encryptionKey, iv)
    const ciphertextToAuth = [version, uuid, iv, contentCiphertext].join(':')
    const authHash = await this.crypto.hmac256(ciphertextToAuth, authKey)

    if (!authHash) {
      throw Error('Error generating hmac256 authHash')
    }

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
    if (!localAuthHash) {
      throw Error('Error generating hmac256 localAuthHash')
    }

    if (this.crypto.timingSafeEqual(authHash, localAuthHash) === false) {
      console.error(Error('Auth hash does not match.'))
      return null
    }
    return this.decryptString002(contentCiphertext, encryptionKey, iv)
  }

  public getPayloadAuthenticatedData(
    encrypted: Payloads.EncryptedParameters,
  ):
    | Payloads.RootKeyEncryptedAuthenticatedData
    | Payloads.ItemAuthenticatedData
    | Payloads.LegacyAttachedData
    | undefined {
    const itemKeyComponents = this.encryptionComponentsFromString002(encrypted.enc_item_key)
    const authenticatedData = itemKeyComponents.keyParams

    if (!authenticatedData) {
      return undefined
    }

    const decoded = JSON.parse(this.crypto.base64Decode(authenticatedData))
    const data: Payloads.LegacyAttachedData = {
      ...(decoded as Common.AnyKeyParamsContent),
    }
    return data
  }

  public async generateEncryptedParametersAsync(
    payload: Payloads.PurePayload,
    key: SNItemsKey | SNRootKey,
  ): Promise<Payloads.EncryptedParameters> {
    /**
     * Generate new item key that is double the key size.
     * Will be split to create encryption key and authentication key.
     */
    const itemKey = this.crypto.generateRandomKey(V002Algorithm.EncryptionKeyLength * 2)
    const encItemKey = await this.encryptTextParams(
      itemKey,
      key.itemsKey,
      key.dataAuthenticationKey as string,
      payload.uuid,
      key.keyVersion,
      key instanceof SNRootKey ? (key as SNRootKey).keyParams : undefined,
    )

    const ek = Utils.firstHalfOfString(itemKey)
    const ak = Utils.secondHalfOfString(itemKey)
    const ciphertext = await this.encryptTextParams(
      JSON.stringify(payload.content),
      ek,
      ak,
      payload.uuid,
      key.keyVersion,
      key instanceof SNRootKey ? (key as SNRootKey).keyParams : undefined,
    )

    return {
      uuid: payload.uuid,
      items_key_id: key instanceof SNItemsKey ? key.uuid : undefined,
      content: ciphertext,
      enc_item_key: encItemKey,
      version: this.version,
    }
  }

  public async generateDecryptedParametersAsync(
    encrypted: Payloads.EncryptedParameters,
    key: SNItemsKey | SNRootKey,
  ): Promise<Payloads.DecryptedParameters | Payloads.ErroredDecryptingParameters> {
    if (!encrypted.enc_item_key) {
      console.error(Error('Missing item encryption key, skipping decryption.'))
      return {
        uuid: encrypted.uuid,
        errorDecrypting: true,
      }
    }

    const encryptedItemKey = encrypted.enc_item_key
    const itemKeyComponents = this.encryptionComponentsFromString002(
      encryptedItemKey,
      key.itemsKey,
      key.dataAuthenticationKey,
    )

    const itemKey = await this.decryptTextParams(
      itemKeyComponents.ciphertextToAuth,
      itemKeyComponents.contentCiphertext,
      itemKeyComponents.encryptionKey as string,
      itemKeyComponents.iv,
      itemKeyComponents.authHash,
      itemKeyComponents.authKey as string,
    )
    if (!itemKey) {
      console.error('Error decrypting item_key parameters', encrypted)
      return {
        uuid: encrypted.uuid,
        errorDecrypting: true,
      }
    }

    const ek = Utils.firstHalfOfString(itemKey)
    const ak = Utils.secondHalfOfString(itemKey)
    const itemParams = this.encryptionComponentsFromString002(encrypted.content, ek, ak)
    const content = await this.decryptTextParams(
      itemParams.ciphertextToAuth,
      itemParams.contentCiphertext,
      itemParams.encryptionKey as string,
      itemParams.iv,
      itemParams.authHash,
      itemParams.authKey as string,
    )

    if (!content) {
      return {
        uuid: encrypted.uuid,
        errorDecrypting: true,
      }
    } else {
      let keyParams
      try {
        keyParams = JSON.parse(this.crypto.base64Decode(itemParams.keyParams))
        // eslint-disable-next-line no-empty
      } catch (e) {}
      return {
        uuid: encrypted.uuid,
        content: JSON.parse(content),
        items_key_id: undefined,
        enc_item_key: undefined,
        auth_hash: undefined,
        auth_params: keyParams,
        errorDecrypting: false,
        waitingForKey: false,
      }
    }
  }

  protected async deriveKey(password: string, keyParams: SNRootKeyParams): Promise<SNRootKey> {
    const derivedKey = await this.crypto.pbkdf2(
      password,
      keyParams.content002.pw_salt,
      keyParams.content002.pw_cost,
      V002Algorithm.PbkdfOutputLength,
    )

    if (!derivedKey) {
      throw Error('Error deriving PBKDF2 key')
    }

    const partitions = Utils.splitString(derivedKey, 3)
    const key = SNRootKey.Create({
      serverPassword: partitions[0],
      masterKey: partitions[1],
      dataAuthenticationKey: partitions[2],
      version: Common.ProtocolVersion.V002,
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
