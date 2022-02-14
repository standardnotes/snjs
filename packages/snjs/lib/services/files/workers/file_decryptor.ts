import {
  SNPureCrypto,
  StreamDecryptor,
  SodiumConstant,
} from '@standardnotes/sncrypto-common';
import { EncryptedFileInterface } from '../types';

export class FileDecryptor {
  private decryptor!: StreamDecryptor;

  constructor(
    private file: EncryptedFileInterface,
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
  ): Promise<
    { decryptedBytes: Uint8Array; isFinalChunk: boolean } | undefined
  > {
    const result = await this.crypto.xchacha20StreamDecryptorPush(
      this.decryptor,
      encryptedBytes,
      this.file.remoteIdentifier
    );

    if (result === false) {
      return undefined;
    }

    const isFinal =
      result.tag ===
      SodiumConstant.CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_TAG_FINAL;

    return { decryptedBytes: result.message, isFinalChunk: isFinal };
  }
}
