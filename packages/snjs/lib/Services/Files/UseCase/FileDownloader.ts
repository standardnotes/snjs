import { ClientDisplayableError } from '@standardnotes/responses'
import { EncryptedFileInterface, FileDownloadProgress } from '../Types'
import { FilesServerInterface } from '../FilesServerInterface'
import { Deferred } from './Deferred'

export type AbortSignal = 'aborted'
export type AbortFunction = () => void

export class FileDownloader {
  private aborted = false
  private abortDeferred = Deferred<AbortSignal>()

  private totalBytesDownloaded = 0

  constructor(
    private file: EncryptedFileInterface,
    private apiToken: string,
    private apiService: FilesServerInterface,
  ) {}

  private getProgress(): FileDownloadProgress {
    const encryptedSize = this.file.encryptedSize

    return {
      encryptedFileSize: encryptedSize,
      encryptedBytesDownloaded: this.totalBytesDownloaded,
      encryptedBytesRemaining: encryptedSize - this.totalBytesDownloaded,
      percentComplete: (this.totalBytesDownloaded / encryptedSize) * 100.0,
    }
  }

  public async beginDownload(
    onEncryptedBytes: (
      encryptedBytes: Uint8Array,
      progress: FileDownloadProgress,
      abort: AbortFunction,
    ) => Promise<void>,
  ): Promise<ClientDisplayableError | AbortSignal | undefined> {
    const chunkIndex = 0
    const startRange = 0

    const downloadPromise = this.apiService.downloadFile(
      this.file,
      chunkIndex,
      this.apiToken,
      startRange,
      async (bytes) => {
        if (this.aborted) {
          return
        }

        this.totalBytesDownloaded += bytes.byteLength

        await onEncryptedBytes(bytes, this.getProgress(), this.abort)
      },
    )

    const result = await Promise.race([this.abortDeferred.promise, downloadPromise])

    return result
  }

  public abort(): void {
    this.aborted = true

    this.abortDeferred.resolve('aborted')
  }
}
