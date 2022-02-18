import { FilesApi, DecryptedFileInterface } from './../types';
import { FileUploader } from './../workers/file_uploader';
import { SNPureCrypto } from '@standardnotes/sncrypto-common';
import { FileEncryptor } from './../workers/file_encryptor';

export class EncryptAndUploadFileOperation {
  private readonly encryptor: FileEncryptor;
  private readonly uploader: FileUploader;
  private encryptionHeader!: string;
  private rawSize = 0;
  public encryptedSize = 0;
  public chunkSizes: number[] = [];

  constructor(
    private file: DecryptedFileInterface,
    private apiToken: string,
    private crypto: SNPureCrypto,
    private api: FilesApi
  ) {
    this.encryptor = new FileEncryptor(file, this.crypto);
    this.uploader = new FileUploader(file, this.api);
  }

  public initializeHeader(): string {
    const header = this.encryptor.initializeHeader();
    this.encryptionHeader = header;

    return header;
  }

  public getEncryptionHeader(): string {
    return this.encryptionHeader;
  }

  public getApiToken(): string {
    return this.apiToken;
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

  public pushBytes(
    decryptedBytes: Uint8Array,
    chunkId: number,
    isFinalChunk: boolean
  ): Promise<boolean> {
    this.rawSize += decryptedBytes.byteLength;

    const encryptedBytes = this.encryptor.pushBytes(
      decryptedBytes,
      isFinalChunk
    );

    this.chunkSizes.push(encryptedBytes.length);

    this.encryptedSize += encryptedBytes.length;

    return this.uploader.uploadBytes(encryptedBytes, chunkId, this.apiToken);
  }
}
