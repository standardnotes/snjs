import { ClientDisplayableError } from '@Lib/Application/ClientError'
import { EncryptedFileInterface } from '../types'
import { FilesServerInterface } from '../FilesServerInterface'

export class FileDownloader {
  private aborted = false
  constructor(
    private file: EncryptedFileInterface,
    private apiToken: string,
    private apiService: FilesServerInterface,
    private onEncryptedBytes: (encryptedBytes: Uint8Array) => Promise<void>,
  ) {}

  public async download(): Promise<ClientDisplayableError | undefined> {
    const chunkIndex = 0
    const startRange = 0
    const result = await this.apiService.downloadFile(
      this.file,
      chunkIndex,
      this.apiToken,
      startRange,
      async (bytes) => {
        if (!this.aborted) {
          await this.onEncryptedBytes(bytes)
        }
      },
    )

    return result
  }

  public abort(): void {
    this.aborted = true
  }
}
