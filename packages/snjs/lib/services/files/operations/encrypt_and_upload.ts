import { ApiServiceInterface, DecryptedFileInterface } from './../types';
import { FileUploader } from './../workers/file_uploader';
import { SNPureCrypto } from '@standardnotes/sncrypto-common';
import { FileEncryptor } from './../workers/file_encryptor';

export class EncryptAndUploadFileOperation {
  private readonly encryptor: FileEncryptor;
  private readonly uploader: FileUploader;

  constructor(
    file: DecryptedFileInterface,
    crypto: SNPureCrypto,
    api: ApiServiceInterface
  ) {
    this.encryptor = new FileEncryptor(file, crypto);
    this.uploader = new FileUploader(file, api);
  }

  public async initializeHeader(): Promise<string> {
    const header = this.encryptor.initializeHeader();
    return header;
  }

  public async addBytes(
    decryptedBytes: Uint8Array,
    isFinalChunk: boolean
  ): Promise<void> {
    const encryptedBytes = await this.encryptor.pushBytes(
      decryptedBytes,
      isFinalChunk
    );

    await this.uploader.uploadBytes(encryptedBytes);
  }
}
