import { ClientDisplayableError } from '@standardnotes/responses'
import { FileDownloadProgress } from '../Types/FileDownloadProgress'
import { FilesServerInterface } from '../FilesServerInterface'
import { Deferred } from '@standardnotes/utils'
import { EncryptedFileInterface } from '@standardnotes/models'

export type AbortSignal = 'aborted'
export type AbortFunction = () => void
type OnEncryptedBytes = (
  encryptedBytes: Uint8Array,
  progress: FileDownloadProgress,
  abort: AbortFunction,
) => Promise<void>

export type FileDownloaderResult = ClientDisplayableError | AbortSignal | undefined

export class FileDownloader {
  private aborted = false
  private abortDeferred = Deferred<AbortSignal>()
  private totalBytesDownloaded = 0

  constructor(private file: EncryptedFileInterface, private readonly api: FilesServerInterface) {}

  private getProgress(): FileDownloadProgress {
    const encryptedSize = this.file.encryptedSize

    return {
      encryptedFileSize: encryptedSize,
      encryptedBytesDownloaded: this.totalBytesDownloaded,
      encryptedBytesRemaining: encryptedSize - this.totalBytesDownloaded,
      percentComplete: (this.totalBytesDownloaded / encryptedSize) * 100.0,
    }
  }

  public async run(onEncryptedBytes: OnEncryptedBytes): Promise<FileDownloaderResult> {
    const tokenResult = await this.getValetToken()

    if (tokenResult instanceof ClientDisplayableError) {
      return tokenResult
    }

    return this.performDownload(tokenResult, onEncryptedBytes)
  }

  private async getValetToken(): Promise<string | ClientDisplayableError> {
    const tokenResult = await this.api.createFileValetToken(this.file.remoteIdentifier, 'read')

    return tokenResult
  }

  private async performDownload(valetToken: string, onEncryptedBytes: OnEncryptedBytes): Promise<FileDownloaderResult> {
    const chunkIndex = 0
    const startRange = 0

    const onRemoteBytesReceived = async (bytes: Uint8Array) => {
      if (this.aborted) {
        return
      }

      this.totalBytesDownloaded += bytes.byteLength

      await onEncryptedBytes(bytes, this.getProgress(), this.abort)
    }

    const downloadPromise = this.api.downloadFile(this.file, chunkIndex, valetToken, startRange, onRemoteBytesReceived)

    const result = await Promise.race([this.abortDeferred.promise, downloadPromise])

    return result
  }

  public abort(): void {
    this.aborted = true

    this.abortDeferred.resolve('aborted')
  }
}
