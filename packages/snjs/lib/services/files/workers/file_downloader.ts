import { FilesApi } from '../types';

export class FileDownloader {
  constructor(
    private apiToken: string,
    private apiService: FilesApi,
    private onEncryptedBytes: (encryptedBytes: Uint8Array) => void
  ) {}

  public download(): Promise<void> {
    console.log('file downloader download')
    return this.apiService.downloadFile(this.apiToken, (bytes) => {
      this.onEncryptedBytes(bytes);
    });
  }
}
