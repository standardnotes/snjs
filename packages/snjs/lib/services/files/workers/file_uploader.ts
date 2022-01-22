import { ApiServiceInterface, RemoteFileInterface } from '../types';

export class FileUploader {
  constructor(
    private readonly file: RemoteFileInterface,
    private apiService: ApiServiceInterface
  ) {}

  public async uploadBytes(encryptedBytes: Uint8Array): Promise<boolean> {
    const result = await this.apiService.uploadFileBytes(
      encryptedBytes,
      this.file.remoteIdentifier
    );

    return result.success;
  }
}
