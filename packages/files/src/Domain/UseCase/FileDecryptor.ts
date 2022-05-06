import { PureCryptoInterface, StreamDecryptor, SodiumConstant } from '@standardnotes/sncrypto-common'
import { EncryptedFileInterface } from '@standardnotes/models'

export class FileDecryptor {
  private decryptor: StreamDecryptor

  constructor(private file: EncryptedFileInterface, private crypto: PureCryptoInterface) {
    this.decryptor = this.crypto.xchacha20StreamInitDecryptor(this.file.encryptionHeader, this.file.key)
  }

  public decryptBytes(encryptedBytes: Uint8Array): { decryptedBytes: Uint8Array; isFinalChunk: boolean } | undefined {
    const result = this.crypto.xchacha20StreamDecryptorPush(this.decryptor, encryptedBytes, this.file.remoteIdentifier)

    if (result === false) {
      return undefined
    }

    const isFinal = result.tag === SodiumConstant.CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_TAG_FINAL

    return { decryptedBytes: result.message, isFinalChunk: isFinal }
  }
}