import { HexString, Utf8String } from '.'
import { Base64String } from './pure_crypto'

/**
 * Either a plaintext (UTF-8 string) or a `string` with an `encoding`.
 */
export type Unencrypted<EncodingType> = Utf8String | { string: string; encoding: EncodingType }

/**
 * @param unencrypted -- UTF-8 string or a `string` with `encoding`
 * @param iv initialization vector as a hex string
 * @param key encryption key as a hex string
 * @param aad additional authenticated data as a hex string
 */
export type Aes256GcmInput<EncodingType> = {
  unencrypted: Unencrypted<EncodingType>
  iv: HexString
  key: HexString
  aad?: HexString
}

/**
 * @param iv initialization vector as a hex string
 * @param tag authentication tag as a hex string
 * @param ciphertext as a base64 string
 * @param encoding that will be applied after decrypting
 * @param aad additional authenticated data as a hex string
 */
export type Aes256GcmEncrypted<EncodingType> = {
  iv: HexString
  tag: HexString
  ciphertext: Base64String
  encoding: EncodingType
  aad: HexString
}

export interface SnCryptoAes256Gcm<EncodingType> {
  /**
   * Encrypts a string using AES-GCM.
   * @param input
   * @returns An object which can be run through aes256GcmDecrypt to retrieve the input text.
   */
  aes256GcmEncrypt(input: Aes256GcmInput<EncodingType>): Promise<Aes256GcmEncrypted<EncodingType>>

  /**
   * Decrypts a string using AES-GCM.
   * @param encrypted
   * @param key - encryption key as a hex string
   * @returns A string encoded with encoding provided in the input
   */
  aes256GcmDecrypt(encrypted: Aes256GcmEncrypted<EncodingType>, key: HexString): Promise<string>
}
