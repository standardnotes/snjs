import { FilesApi } from '../types';

export class FileDownloader {
  private aborted = false;
  constructor(
    private apiToken: string,
    private apiService: FilesApi,
    private onEncryptedBytes: (encryptedBytes: Uint8Array) => void
  ) {}

  public download(): Promise<void> {
    return this.apiService.downloadFile(this.apiToken, 0, (bytes) => {
      /** @TODO Abort apiService call instead */
      if (!this.aborted) {
        this.onEncryptedBytes(bytes);
      }
    });
  }

  public abort(): void {
    /** @TODO Abort apiService call */
    this.aborted = true;
  }
}
