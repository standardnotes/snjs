import { FilesApi, DecryptedFileInterface } from './../types';
import { FileUploader } from './../workers/file_uploader';
import { SNPureCrypto } from '@standardnotes/sncrypto-common';
import { FileEncryptor } from './../workers/file_encryptor';

export class EncryptAndUploadFileOperation {
  private readonly encryptor: FileEncryptor;
  private readonly uploader: FileUploader;
  private encryptionHeader!: string;
  private rawSize = 0;
  private encryptedSize = 0;

  constructor(
    private file: DecryptedFileInterface,
    crypto: SNPureCrypto,
    api: FilesApi
  ) {
    this.encryptor = new FileEncryptor(file, crypto);
    this.uploader = new FileUploader(file, api);
  }

  public async initializeHeader(): Promise<string> {
    const header = await this.encryptor.initializeHeader();
    this.encryptionHeader = header;
    return header;
  }

  public getEncryptionHeader(): string {
    return this.encryptionHeader;
  }

  public getRawSize(): number {
    return this.rawSize;
  }

  public getKey(): string {
    return this.file.key;
  }

  public getRemoteIdentifier(): string {
    return this.file.remoteIdentifier;
  }

  public async pushBytes(
    decryptedBytes: Uint8Array,
    isFinalChunk: boolean
  ): Promise<boolean> {
    this.rawSize += decryptedBytes.length;

    const encryptedBytes = await this.encryptor.pushBytes(
      decryptedBytes,
      isFinalChunk
    );

    this.encryptedSize += encryptedBytes.length;

    return this.uploader.uploadBytes(encryptedBytes);
  }
}
