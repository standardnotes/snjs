import { CrypterInterface } from './CrypterInterface'
import { SnCryptoNode } from '@standardnotes/sncrypto-node'
import { createHash, randomBytes } from 'crypto'
import { HexString } from '@standardnotes/sncrypto-common'

export class Crypter implements CrypterInterface {
  private readonly IV_BYTES = 16

  /**
   * @param crypto SnCryptoNode instance
   * @param hexIv must be a 16-byte hex string suitable for AES 256 GCM initialization vector.
   */
  constructor(
    private crypto: SnCryptoNode,
    private hexIv?: HexString
  ) {
    if (this.hexIv === undefined) {
      this.hexIv = randomBytes(this.IV_BYTES).toString('hex')
    }
  }

  async encrypt(plaintext: string, secretKey: string): Promise<string> {
    const key = createHash('sha256').update(secretKey).digest('hex')

    const encrypted = await this.crypto.aes256GcmEncrypt({
      unencrypted: plaintext,
      iv: this.hexIv as HexString,
      key,
    })

    return JSON.stringify(encrypted)
  }

  async decrypt(encryptedString: string, secretKey: string): Promise<string> {
    const encrypted = JSON.parse(encryptedString)
    const decrypted = await this.crypto.aes256GcmDecrypt(
      encrypted,
      createHash('sha256').update(secretKey).digest('hex'),
    )

    return decrypted
  }
}
