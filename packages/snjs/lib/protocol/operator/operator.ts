import {
  ItemAuthenticatedData,
  LegacyAttachedData,
  RootKeyEncryptedAuthenticatedData,
  PurePayload,
  PayloadFormat,
} from '@standardnotes/payloads'
import { SNRootKey } from './../root_key'
import { SNRootKeyParams } from './../key_params'
import { KeyParamsOrigination, ProtocolVersion } from '@standardnotes/common'
import { SNItemsKey } from '@Models/app/items_key'

export type ItemsKeyContent = {
  itemsKey: string
  dataAuthenticationKey?: string
  version: ProtocolVersion
}

/**w
 * An operator is responsible for performing crypto operations, such as generating keys
 * and encrypting/decrypting payloads. Operators interact directly with
 * platform dependent SNPureCrypto implementation to directly access cryptographic primitives.
 * Each operator is versioned according to the protocol version. Functions that are common
 * across all versions appear in this generic parent class.
 */
export interface OperatorCommon {
  createItemsKey(): SNItemsKey
  /**
   * Returns encryption protocol display name
   */
  getEncryptionDisplayName(): string

  readonly version: string

  /**
   * Returns the payload's authenticated data. The passed payload must be in a
   * non-decrypted, ciphertext state.
   */
  getPayloadAuthenticatedData(
    payload: PurePayload,
  ): RootKeyEncryptedAuthenticatedData | ItemAuthenticatedData | LegacyAttachedData | undefined

  /**
   * Computes a root key given a password and previous keyParams
   * @param password - Plain string representing raw user password
   */
  computeRootKey(password: string, keyParams: SNRootKeyParams): Promise<SNRootKey>

  /**
   * Creates a new root key given an identifier and a user password
   * @param identifier - Plain string representing a unique identifier
   *    for the user
   * @param password - Plain string representing raw user password
   */
  createRootKey(
    identifier: string,
    password: string,
    origination: KeyParamsOrigination,
  ): Promise<SNRootKey>
}

export interface SynchronousOperator extends OperatorCommon {
  /**
   * Converts a bare payload into an encrypted one in the desired format.
   * @param payload - The non-encrypted payload object to encrypt
   * @param key - The key to use to encrypt the payload. Can be either
   *  a RootKey (when encrypting payloads that require root key encryption, such as encrypting
   * items keys), or an ItemsKey (if encrypted regular items)
   * @param format - The desired result format
   */
  generateEncryptedParametersSync(
    payload: PurePayload,
    format: PayloadFormat,
    _key?: SNItemsKey | SNRootKey,
  ): PurePayload

  generateDecryptedParametersSync(
    encryptedParameters: PurePayload,
    key?: SNItemsKey | SNRootKey,
  ): PurePayload
}

export interface AsynchronousOperator extends OperatorCommon {
  /**
   * Converts a bare payload into an encrypted one in the desired format.
   * @param payload - The non-encrypted payload object to encrypt
   * @param key - The key to use to encrypt the payload. Can be either
   *  a RootKey (when encrypting payloads that require root key encryption, such as encrypting
   * items keys), or an ItemsKey (if encrypted regular items)
   * @param format - The desired result format
   */
  generateEncryptedParametersAsync(
    payload: PurePayload,
    format: PayloadFormat,
    _key?: SNItemsKey | SNRootKey,
  ): Promise<PurePayload>

  generateDecryptedParametersAsync(
    encryptedParameters: PurePayload,
    key?: SNItemsKey | SNRootKey,
  ): Promise<PurePayload>
}
