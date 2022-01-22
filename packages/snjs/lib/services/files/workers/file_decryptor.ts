import { EncryptedFileInterface } from './../types';
import { SodiumConstants } from '@standardnotes/sncrypto-web';
import { SNPureCrypto, StreamDecryptor } from '@standardnotes/sncrypto-common';

export class FileDecryptor {
  private decryptor!: StreamDecryptor;

  constructor(
    private readonly file: EncryptedFileInterface,
    private crypto: SNPureCrypto
  ) {}

  public async initialize(): Promise<void> {
    this.decryptor = await this.crypto.xchacha20StreamInitDecryptor(
      this.file.encryptionHeader,
      this.file.key
    );
  }

  public async decryptBytes(
    encryptedBytes: Uint8Array
  ): Promise<{ decryptedBytes: Uint8Array; isFinalChunk: boolean }> {
    const result = await this.crypto.xchacha20StreamDecryptorPush(
      this.decryptor,
      encryptedBytes,
      this.file.remoteIdentifier
    );

    const isFinal =
      result.tag ===
      SodiumConstants.CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_TAG_FINAL;

    return { decryptedBytes: result.message, isFinalChunk: isFinal };
  }
}
