import { FileDownloader } from './../workers/file_downloader';
import { FileDecryptor } from './../workers/file_decryptor';
import {
  FilesApi,
  RemoteFileInterface,
  EncryptedFileInterface,
} from './../types';
import { SNPureCrypto } from '@standardnotes/sncrypto-common';

export class DownloadAndDecryptFileOperation {
  private readonly decryptor: FileDecryptor;
  private readonly downloader: FileDownloader;
  private completionResolve!: () => void;

  constructor(
    remoteIdentifier: string,
    encryptionHeader: string,
    encryptionKey: string,
    crypto: SNPureCrypto,
    api: FilesApi,
    apiToken: string,
    private onDecryptedBytes: (decryptedBytes: Uint8Array) => void
  ) {
    this.decryptor = new FileDecryptor(remoteIdentifier, encryptionHeader, encryptionKey, crypto);
    this.downloader = new FileDownloader(
      apiToken,
      api,
      this.onDownloadedBytes.bind(this)
    );
  }

  public async run(): Promise<void> {
    console.log('operation run')
    await this.decryptor.initialize();

    console.log('operation decryptor initialized')

    this.downloader.download();

    console.log('operation downloader triggered')

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
