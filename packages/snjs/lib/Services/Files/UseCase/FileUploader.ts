import { FilesServerInterface } from '../FilesServerInterface'

export class FileUploader {
  constructor(private apiService: FilesServerInterface) {}

  public async uploadBytes(
    encryptedBytes: Uint8Array,
    chunkId: number,
    apiToken: string,
  ): Promise<boolean> {
    const result = await this.apiService.uploadFileBytes(apiToken, chunkId, encryptedBytes)

    return result
  }
}
