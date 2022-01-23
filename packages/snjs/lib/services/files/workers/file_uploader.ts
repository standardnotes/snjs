import { FilesApi, RemoteFileInterface } from '../types';

export class FileUploader {
  constructor(
    private readonly file: RemoteFileInterface,
    private apiService: FilesApi
  ) {}

  public async uploadBytes(encryptedBytes: Uint8Array): Promise<boolean> {
    const result = await this.apiService.uploadFileBytes(
      this.file.remoteIdentifier,
      encryptedBytes
    );

    return result.success;
  }
}
