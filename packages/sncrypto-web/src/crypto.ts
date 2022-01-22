import {
  StreamEncryptor,
  StreamDecryptor,
  SodiumConstant,
} from '@standardnotes/sncrypto-common'
import * as Utils from './utils'
import * as sodium from './libsodium'

import {
  Base64String,
  HexString,
  SNPureCrypto,
  Utf8String,
  timingSafeEqual,
} from '@standardnotes/sncrypto-common'

enum WebCryptoAlgs {
  AesCbc = 'AES-CBC',
  Sha512 = 'SHA-512',
  Sha256 = 'SHA-256',
  Pbkdf2 = 'PBKDF2',
  Sha1 = 'SHA-1',
  Hmac = 'HMAC',
}

enum WebCryptoActions {
  DeriveBits = 'deriveBits',
  Encrypt = 'encrypt',
  Decrypt = 'decrypt',
  Sign = 'sign',
}

type WebCryptoParams = {
  name: string
  hash?: string
}

/**
 * The web crypto class allows access to a set of cryptographic primitives available
 * in a web environment, consisting of two main sources:
 * — Built-in browser WebCrypto
 * — Libsodium.js library integration
 */
export class SNWebCrypto implements SNPureCrypto {
  private ready: Promise<void> | null

  constructor() {
    /** Functions using Libsodium must await this
     * promise before performing any library functions */
    this.ready = sodium.ready
  }

  deinit(): void {
    this.ready = null
  }

  public generateUUIDSync(): string {
    return Utils.generateUUIDSync()
  }

  public async generateUUID(): Promise<string> {
    return Utils.generateUUIDSync()
  }

  public timingSafeEqual(a: string, b: string): boolean {
    return timingSafeEqual(a, b)
  }

  public async base64Encode(text: Utf8String): Promise<string> {
    return Utils.base64Encode(text)
  }

  public async base64Decode(base64String: Base64String): Promise<string> {
    return Utils.base64Decode(base64String)
  }

  public async pbkdf2(
    password: Utf8String,
    salt: Utf8String,
    iterations: number,
    length: number,
  ): Promise<HexString | null> {
    const keyData = await Utils.stringToArrayBuffer(password)
    const key = await this.webCryptoImportKey(keyData, WebCryptoAlgs.Pbkdf2, [
      WebCryptoActions.DeriveBits,
    ])
    if (!key) {
      console.error('Key is null, unable to continue')
      return null
    }
    return this.webCryptoDeriveBits(key, salt, iterations, length)
  }

  public async generateRandomKey(bits: number): Promise<string> {
    const bytes = bits / 8
    const arrayBuffer = Utils.getGlobalScope().crypto.getRandomValues(
      new Uint8Array(bytes),
    )
    return Utils.arrayBufferToHexString(arrayBuffer)
  }

  public async aes256CbcEncrypt(
    plaintext: Utf8String,
    iv: HexString,
    key: HexString,
  ): Promise<Base64String> {
    const keyData = await Utils.hexStringToArrayBuffer(key)
    const ivData = await Utils.hexStringToArrayBuffer(iv)
    const alg = { name: WebCryptoAlgs.AesCbc, iv: ivData }
    const importedKeyData = await this.webCryptoImportKey(keyData, alg.name, [
      WebCryptoActions.Encrypt,
    ])
    const textData = await Utils.stringToArrayBuffer(plaintext)
    const result = await crypto.subtle.encrypt(alg, importedKeyData, textData)
    return Utils.arrayBufferToBase64(result)
  }

  public async aes256CbcDecrypt(
    ciphertext: Base64String,
    iv: HexString,
    key: HexString,
  ): Promise<Utf8String | null> {
    const keyData = await Utils.hexStringToArrayBuffer(key)
    const ivData = await Utils.hexStringToArrayBuffer(iv)
    const alg = { name: WebCryptoAlgs.AesCbc, iv: ivData }
    const importedKeyData = await this.webCryptoImportKey(keyData, alg.name, [
      WebCryptoActions.Decrypt,
    ])
    const textData = await Utils.base64ToArrayBuffer(ciphertext)

    try {
      const result = await crypto.subtle.decrypt(alg, importedKeyData, textData)

      return Utils.arrayBufferToString(result)
    } catch {
      return null
    }
  }

  public async hmac256(
    message: Utf8String,
    key: HexString,
  ): Promise<HexString | null> {
    const keyHexData = await Utils.hexStringToArrayBuffer(key)
    const keyData = await this.webCryptoImportKey(
      keyHexData,
      WebCryptoAlgs.Hmac,
      [WebCryptoActions.Sign],
      { name: WebCryptoAlgs.Sha256 },
    )
    const messageData = await Utils.stringToArrayBuffer(message)
    const funcParams = { name: WebCryptoAlgs.Hmac }

    try {
      const signature = await crypto.subtle.sign(
        funcParams,
        keyData,
        messageData,
      )

      return Utils.arrayBufferToHexString(signature)
    } catch (error) {
      console.error('Error computing HMAC:', error)

      return null
    }
  }

  public async sha256(text: string): Promise<string> {
    const textData = await Utils.stringToArrayBuffer(text)
    const digest = await crypto.subtle.digest(WebCryptoAlgs.Sha256, textData)
    return Utils.arrayBufferToHexString(digest)
  }

  public async hmac1(
    message: Utf8String,
    key: HexString,
  ): Promise<HexString | null> {
    const keyHexData = await Utils.hexStringToArrayBuffer(key)
    const keyData = await this.webCryptoImportKey(
      keyHexData,
      WebCryptoAlgs.Hmac,
      [WebCryptoActions.Sign],
      { name: WebCryptoAlgs.Sha1 },
    )
    const messageData = await Utils.stringToArrayBuffer(message)
    const funcParams = { name: WebCryptoAlgs.Hmac }

    try {
      const signature = await crypto.subtle.sign(
        funcParams,
        keyData,
        messageData,
      )

      return Utils.arrayBufferToHexString(signature)
    } catch (error) {
      console.error('Error computing HMAC:', error)

      return null
    }
  }

  public async unsafeSha1(text: string): Promise<string> {
    const textData = await Utils.stringToArrayBuffer(text)
    const digest = await crypto.subtle.digest(WebCryptoAlgs.Sha1, textData)
    return Utils.arrayBufferToHexString(digest)
  }

  /**
   * Converts a raw string key to a WebCrypto CryptoKey object.
   * @param rawKey
   *    A plain utf8 string or an array buffer
   * @param alg
   *    The name of the algorithm this key will be used for (i.e 'AES-CBC' or 'HMAC')
   * @param actions
   *    The actions this key will be used for (i.e 'deriveBits' or 'encrypt')
   * @param hash
   *    An optional object representing the hashing function this key is intended to be
   *    used for. This option is only supplied when the `alg` is HMAC.
   * @param hash.name
   *    The name of the hashing function to use with HMAC.
   * @returns A WebCrypto CryptoKey object
   */
  private async webCryptoImportKey(
    keyData: Uint8Array,
    alg: WebCryptoAlgs,
    actions: Array<WebCryptoActions>,
    hash?: WebCryptoParams,
  ): Promise<CryptoKey> {
    return Utils.getSubtleCrypto().importKey(
      'raw',
      keyData,
      {
        name: alg,
        hash: hash,
      },
      false,
      actions,
    )
  }

  /**
   * Performs WebCrypto PBKDF2 derivation.
   * @param key - A WebCrypto CryptoKey object
   * @param length - In bits
   */
  private async webCryptoDeriveBits(
    key: CryptoKey,
    salt: Utf8String,
    iterations: number,
    length: number,
  ): Promise<HexString> {
    const params = {
      name: WebCryptoAlgs.Pbkdf2,
      salt: await Utils.stringToArrayBuffer(salt),
      iterations: iterations,
      hash: { name: WebCryptoAlgs.Sha512 },
    }

    return Utils.getSubtleCrypto()
      .deriveBits(params, key, length)
      .then((bits) => {
        return Utils.arrayBufferToHexString(new Uint8Array(bits))
      })
  }

  public async argon2(
    password: Utf8String,
    salt: HexString,
    iterations: number,
    bytes: number,
    length: number,
  ): Promise<HexString> {
    await this.ready
    const result = sodium.crypto_pwhash(
      length,
      await Utils.stringToArrayBuffer(password),
      await Utils.hexStringToArrayBuffer(salt),
      iterations,
      bytes,
      sodium.crypto_pwhash_ALG_DEFAULT,
      'hex',
    )
    return result
  }

  public async xchacha20Encrypt(
    plaintext: Utf8String,
    nonce: HexString,
    key: HexString,
    assocData: Utf8String,
  ): Promise<Base64String> {
    await this.ready
    if (nonce.length !== 48) {
      throw Error('Nonce must be 24 bytes')
    }
    const arrayBuffer = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      plaintext,
      assocData,
      null,
      await Utils.hexStringToArrayBuffer(nonce),
      await Utils.hexStringToArrayBuffer(key),
    )
    return Utils.arrayBufferToBase64(arrayBuffer)
  }

  public async xchacha20Decrypt(
    ciphertext: Base64String,
    nonce: HexString,
    key: HexString,
    assocData: Utf8String | Uint8Array,
  ): Promise<Utf8String | null> {
    await this.ready
    if (nonce.length !== 48) {
      throw Error('Nonce must be 24 bytes')
    }
    try {
      return sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null,
        await Utils.base64ToArrayBuffer(ciphertext),
        assocData,
        await Utils.hexStringToArrayBuffer(nonce),
        await Utils.hexStringToArrayBuffer(key),
        'text',
      )
    } catch {
      return null
    }
  }

  public async xchacha20StreamInitEncryptor(
    key: HexString,
  ): Promise<StreamEncryptor> {
    await this.ready
    const res = sodium.crypto_secretstream_xchacha20poly1305_init_push(
      await Utils.hexStringToArrayBuffer(key),
    )
    return {
      state: res.state,
      header: await Utils.arrayBufferToBase64(res.header),
    }
  }

  public async xchacha20StreamEncryptorPush(
    encryptor: StreamEncryptor,
    plainBuffer: Uint8Array,
    assocData: Utf8String,
    tag: SodiumConstant = SodiumConstant.CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_TAG_PUSH,
  ): Promise<Uint8Array> {
    await this.ready
    const encryptedBuffer = sodium.crypto_secretstream_xchacha20poly1305_push(
      encryptor.state as sodium.StateAddress,
      plainBuffer,
      assocData.length > 0 ? await Utils.stringToArrayBuffer(assocData) : null,
      tag,
    )
    return encryptedBuffer
  }

  public async xchacha20StreamInitDecryptor(
    header: Base64String,
    key: HexString,
  ): Promise<StreamDecryptor> {
    await this.ready

    if (
      header.length !==
      SodiumConstant.CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_HEADERBYTES
    ) {
      throw new Error(
        `Header must be ${SodiumConstant.CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_HEADERBYTES} bytes long`,
      )
    }

    const state = sodium.crypto_secretstream_xchacha20poly1305_init_pull(
      await Utils.base64ToArrayBuffer(header),
      await Utils.hexStringToArrayBuffer(key),
    )

    return { state }
  }

  public async xchacha20StreamDecryptorPush(
    decryptor: StreamDecryptor,
    encryptedBuffer: Uint8Array,
    assocData: Utf8String,
  ): Promise<{ message: Uint8Array; tag: SodiumConstant }> {
    if (
      encryptedBuffer.length <
      SodiumConstant.CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_ABYTES
    ) {
      throw new Error('Invalid ciphertext size')
    }

    const result = sodium.crypto_secretstream_xchacha20poly1305_pull(
      decryptor.state as sodium.StateAddress,
      encryptedBuffer,
      assocData.length > 0 ? await Utils.stringToArrayBuffer(assocData) : null,
    )

    return result
  }

  /**
   * Generates a random secret for TOTP authentication
   *
   * RFC4226 reccomends a length of at least 160 bits = 32 b32 chars
   * https://datatracker.ietf.org/doc/html/rfc4226#section-4
   */
  public async generateOtpSecret(): Promise<string> {
    const bits = 160
    const bytes = bits / 8
    const secretBytes = Utils.getGlobalScope().crypto.getRandomValues(
      new Uint8Array(bytes),
    )
    const secret = Utils.base32Encode(secretBytes)
    return secret
  }

  /**
   * Generates a HOTP code as per RFC4226 specification
   * using HMAC-SHA1
   * https://datatracker.ietf.org/doc/html/rfc4226
   *
   * @param secret OTP shared secret
   * @param counter HOTP counter
   * @returns HOTP auth code
   */
  public async hotpToken(
    secret: string,
    counter: number,
    tokenLength = 6,
  ): Promise<string> {
    const bytes = new Uint8Array(Utils.base32Decode(secret))

    const key = await this.webCryptoImportKey(
      bytes,
      WebCryptoAlgs.Hmac,
      [WebCryptoActions.Sign],
      { name: WebCryptoAlgs.Sha1 },
    )

    const counterArray = Utils.padStart(counter)
    const hs = await Utils.getSubtleCrypto().sign('HMAC', key, counterArray)
    const sNum = Utils.truncateOTP(hs)
    const padded = ('0'.repeat(tokenLength) + (sNum % 10 ** tokenLength)).slice(
      -tokenLength,
    )

    return padded
  }

  /**
   * Generates a TOTP code as per RFC6238 specification
   * using HMAC-SHA1
   * https://datatracker.ietf.org/doc/html/rfc6238
   *
   * @param secret OTP shared secret
   * @param timestamp time specified in milliseconds since UNIX epoch
   * @param step time step specified in seconds
   * @returns TOTP auth code
   */
  public async totpToken(
    secret: string,
    timestamp: number,
    tokenLength = 6,
    step = 30,
  ): Promise<string> {
    const time = Math.floor(timestamp / step / 1000.0)
    const token = await this.hotpToken(secret, time, tokenLength)
    return token
  }
}
