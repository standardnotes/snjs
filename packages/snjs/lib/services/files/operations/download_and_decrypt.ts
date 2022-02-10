import { FileDownloader } from './../workers/file_downloader';
import { FileDecryptor } from './../workers/file_decryptor';
import {
  FilesApi,
  RemoteFileInterface,
  EncryptedFileInterface,
} from './../types';
import { SNPureCrypto } from '@standardnotes/sncrypto-common';
import { FileProtocolV1 } from '@Lib/index';

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
    /**
     * TMP WORKAROUND TO FINALIZE WITHOUT DECRYPTION
     */
    // await this.decryptor.initialize();

    this.downloader.download();

    return new Promise((resolve) => {
      this.completionResolve = resolve;
    });
  }

  private async onDownloadedBytes(encryptedBytes: Uint8Array): Promise<void> {
    /**
     * TMP WORKAROUND TO FINALIZE WITHOUT DECRYPTION
     */
    this.onDecryptedBytes(encryptedBytes);
    if (encryptedBytes.byteLength < FileProtocolV1.ChunkSize) {
      this.completionResolve();
    }

    /**
     * PROPER DECRYPTION BELOW
     */

    // const result = await this.decryptor.decryptBytes(encryptedBytes);

    // this.onDecryptedBytes(result.decryptedBytes);

    // if (result.isFinalChunk) {
    //   this.completionResolve();
    // }
  }
}
