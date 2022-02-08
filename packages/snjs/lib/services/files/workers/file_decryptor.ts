import {
  SNPureCrypto,
  StreamDecryptor,
  SodiumConstant,
} from '@standardnotes/sncrypto-common';

export class FileDecryptor {
  private decryptor!: StreamDecryptor;

  constructor(
    private remoteIdentifier: string,
    private encryptionHeader: string,
    private encryptionKey: string,
    private crypto: SNPureCrypto
  ) {}

  public async initialize(): Promise<void> {
    console.log('encryption header', this.encryptionHeader)
    console.log('encryption key', this.encryptionKey)
    this.decryptor = await this.crypto.xchacha20StreamInitDecryptor(
      this.encryptionHeader,
      this.encryptionKey
    );
  }

  public async decryptBytes(
    encryptedBytes: Uint8Array
  ): Promise<{ decryptedBytes: Uint8Array; isFinalChunk: boolean }> {
    const result = await this.crypto.xchacha20StreamDecryptorPush(
      this.decryptor,
      encryptedBytes,
      this.remoteIdentifier
    );

    const isFinal =
      result.tag ===
      SodiumConstant.CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_TAG_FINAL;

    return { decryptedBytes: result.message, isFinalChunk: isFinal };
  }
}
