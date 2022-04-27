import { ClientDisplayableError } from '@standardnotes/responses'
import { AbortFunction, FileDownloader } from '../UseCase/FileDownloader'
import { FileDecryptor } from '../UseCase/FileDecryptor'
import { RemoteFileInterface, EncryptedFileInterface, FileDownloadProgress } from '../Types'
import { FilesServerInterface } from '../FilesServerInterface'
import { SNPureCrypto } from '@standardnotes/sncrypto-common'

type Result = { success: boolean; error?: ClientDisplayableError; aborted?: boolean }

export class DownloadAndDecryptFileOperation {
  private downloader: FileDownloader

  constructor(
    private readonly file: RemoteFileInterface & EncryptedFileInterface,
    private readonly crypto: SNPureCrypto,
    private readonly api: FilesServerInterface,
    private readonly apiToken: string,
  ) {
    this.downloader = new FileDownloader(this.file, this.apiToken, this.api)
  }

  private createDecryptor(): FileDecryptor {
    return new FileDecryptor(this.file, this.crypto)
  }

  public async run(
    onDecryptedBytes: (decryptedBytes: Uint8Array, progress: FileDownloadProgress) => Promise<void>,
  ): Promise<Result> {
    const decryptor = this.createDecryptor()

    let decryptError: ClientDisplayableError | undefined

    const onDownloadBytes = async (
      encryptedBytes: Uint8Array,
      progress: FileDownloadProgress,
      abortDownload: AbortFunction,
    ) => {
      const result = decryptor.decryptBytes(encryptedBytes)

      if (!result || result.decryptedBytes.length === 0) {
        decryptError = new ClientDisplayableError('Failed to decrypt chunk')

        abortDownload()

        return
      }

      await onDecryptedBytes(result.decryptedBytes, progress)
    }

    const downloadResult = await this.downloader.beginDownload(onDownloadBytes)

    return {
      success: downloadResult instanceof ClientDisplayableError ? false : true,
      error: downloadResult === 'aborted' ? undefined : downloadResult || decryptError,
      aborted: downloadResult === 'aborted',
    }
  }

  abort(): void {
    this.downloader.abort()
  }
}
