import { FilesApi } from '../types';

export class FileDownloader {
  constructor(
    private apiToken: string,
    private apiService: FilesApi,
    private onEncryptedBytes: (encryptedBytes: Uint8Array) => void
  ) {}

  public download(): Promise<void> {
    return this.apiService.downloadFile(this.apiToken, 0, (bytes) => {
      this.onEncryptedBytes(bytes);
    });
  }
}
