import { FilesApi, RemoteFileInterface } from '../types';

export class FileUploader {
  constructor(
    private readonly file: RemoteFileInterface,
    private apiService: FilesApi
  ) {}

  public async uploadBytes(encryptedBytes: Uint8Array, chunkId: number, apiToken: string): Promise<boolean> {
    const result = await this.apiService.uploadFileBytes(
      apiToken,
      chunkId,
      encryptedBytes
    );

    return result;
  }
}
