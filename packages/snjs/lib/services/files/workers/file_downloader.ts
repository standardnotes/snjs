import { ApiServiceInterface, RemoteFileInterface } from '../types';

export class FileDownloader {
  constructor(
    private readonly file: RemoteFileInterface,
    private apiService: ApiServiceInterface,
    private onEncryptedBytes: (encryptedBytes: Uint8Array) => void
  ) {}

  public download(): Promise<void> {
    return this.apiService.downloadFile(this.file.remoteIdentifier, (bytes) => {
      this.onEncryptedBytes(bytes);
    });
  }
}
