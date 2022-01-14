import {
  Aes256GcmEncrypted,
  Aes256GcmInput,
  HexString,
  SnCryptoAes256Gcm,
  Unencrypted,
} from '@standardnotes/sncrypto-common'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

export class SnCryptoNode implements SnCryptoAes256Gcm<BufferEncoding> {
  public async aes256GcmEncrypt({
    unencrypted,
    iv,
    key,
    aad = '',
  }: Aes256GcmInput<BufferEncoding>): Promise<Aes256GcmEncrypted<BufferEncoding>> {
    const { buffer: dataBuffer, encoding } = getBufferWithEncoding(unencrypted)
    const ivBuffer = Buffer.from(iv, 'hex')
    const keyBuffer = Buffer.from(key, 'hex')
    const cipher = createCipheriv('aes-256-gcm', keyBuffer, ivBuffer)
    const aadBuffer = Buffer.from(aad, 'hex')
    cipher.setAAD(aadBuffer)

    const ciphertext = Buffer.concat([
      cipher.update(dataBuffer),
      cipher.final(),
    ]).toString('base64')

    const tag = cipher.getAuthTag().toString('hex')

    return { iv, tag, aad, ciphertext, encoding }
  }

  public async aes256GcmDecrypt(
    encrypted: Aes256GcmEncrypted<BufferEncoding>,
    key: HexString,
  ): Promise<string> {
    const { iv, tag, ciphertext, encoding, aad } = encrypted

    const decipher = createDecipheriv(
      'aes-256-gcm',
      Buffer.from(key, 'hex'),
      Buffer.from(iv, 'hex'),
    )
    decipher.setAuthTag(Buffer.from(tag, 'hex'))

    decipher.setAAD(Buffer.from(aad, 'hex'))

    const decrypted = Buffer.concat([
      decipher.update(
        Buffer.from(ciphertext, 'base64')
      ),
      decipher.final(),
    ])

    return decrypted.toString(encoding)
  }

  public async generateRandomKey(bits: number): Promise<HexString> {
    const bytes = bits / 8
    const buf = randomBytes(bytes)
    return buf.toString('hex')
  }
}

/**
 * Turns `unencrypted` into a `buffer` with `encoding`.
 * @param unencrypted
 */
function getBufferWithEncoding(unencrypted: Unencrypted<BufferEncoding>): {
  buffer: Buffer,
  encoding: BufferEncoding,
} {
  if (typeof unencrypted === 'string') {
    const encoding: BufferEncoding = 'utf-8'
    const buffer = Buffer.from(unencrypted, encoding)
    return { buffer, encoding }
  }

  const { string, encoding } = unencrypted
  const buffer = Buffer.from(string, encoding)
  return { buffer, encoding }
}
