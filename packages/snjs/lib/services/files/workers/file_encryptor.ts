import { DecryptedFileInterface } from './../types';
import { SNPureCrypto, StreamEncryptor, SodiumConstant } from '@standardnotes/sncrypto-common';

export class FileEncryptor {
  private stream!: StreamEncryptor;

  constructor(
    private readonly file: DecryptedFileInterface,
    private crypto: SNPureCrypto
  ) {}

  public async initializeHeader(): Promise<string> {
    this.stream = await this.crypto.xchacha20StreamInitEncryptor(
      this.file.key
    );

    return this.stream.header;
  }

  public async pushBytes(
    decryptedBytes: Uint8Array,
    isFinalChunk: boolean
  ): Promise<Uint8Array> {
    if (!this.stream) {
      throw new Error('FileEncryptor must call initializeHeader first');
    }

    const tag = isFinalChunk
      ? SodiumConstant.CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_TAG_FINAL
      : undefined;

    const encryptedBytes = await this.crypto.xchacha20StreamEncryptorPush(
      this.stream,
      decryptedBytes,
      this.file.remoteIdentifier,
      tag
    );

    return encryptedBytes;
  }
}
