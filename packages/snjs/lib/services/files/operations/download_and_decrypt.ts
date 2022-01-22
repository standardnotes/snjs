import { FileDownloader } from './../workers/file_downloader';
import { FileDecryptor } from './../workers/file_decryptor';
import {
  ApiServiceInterface,
  RemoteFileInterface,
  EncryptedFileInterface,
} from './../types';
import { SNPureCrypto } from '@standardnotes/sncrypto-common';

export class DownloadAndDecryptFileOperation {
  private readonly decryptor: FileDecryptor;
  private readonly downloader: FileDownloader;
  private completionResolve!: () => void;

  constructor(
    file: RemoteFileInterface & EncryptedFileInterface,
    crypto: SNPureCrypto,
    api: ApiServiceInterface,
    private onDecryptedBytes: (decryptedBytes: Uint8Array) => void
  ) {
    this.decryptor = new FileDecryptor(file, crypto);
    this.downloader = new FileDownloader(
      file,
      api,
      this.onDownloadedBytes.bind(this)
    );
  }

  public async run(): Promise<void> {
    await this.decryptor.initialize();

    this.downloader.download();

    return new Promise((resolve) => {
      this.completionResolve = resolve;
    });
  }

  private async onDownloadedBytes(encryptedBytes: Uint8Array): Promise<void> {
    const result = await this.decryptor.decryptBytes(encryptedBytes);

    this.onDecryptedBytes(result.decryptedBytes);

    if (result.isFinalChunk) {
      this.completionResolve();
    }
  }
}
