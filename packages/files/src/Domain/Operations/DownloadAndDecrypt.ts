import { ClientDisplayableError } from '@standardnotes/responses'
import { AbortFunction, FileDownloader } from '../UseCase/FileDownloader'
import { FileDecryptor } from '../UseCase/FileDecryptor'
import { FileDownloadProgress } from '../Types/FileDownloadProgress'
import { FilesApiInterface } from '@standardnotes/services'
import { PureCryptoInterface } from '@standardnotes/sncrypto-common'
import { FileContent } from '@standardnotes/models'

export type DownloadAndDecryptResult = { success: boolean; error?: ClientDisplayableError; aborted?: boolean }

export class DownloadAndDecryptFileOperation {
  private downloader: FileDownloader

  constructor(
    private readonly file: {
      encryptedChunkSizes: FileContent['encryptedChunkSizes']
      encryptionHeader: FileContent['encryptionHeader']
      remoteIdentifier: FileContent['remoteIdentifier']
      key: FileContent['key']
    },
    private readonly crypto: PureCryptoInterface,
    private readonly api: FilesApiInterface,
  ) {
    this.downloader = new FileDownloader(this.file, this.api)
  }

  private createDecryptor(): FileDecryptor {
    return new FileDecryptor(this.file, this.crypto)
  }

  public async run(
    onDecryptedBytes: (decryptedBytes: Uint8Array, progress: FileDownloadProgress) => Promise<void>,
  ): Promise<DownloadAndDecryptResult> {
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

    const downloadResult = await this.downloader.run(onDownloadBytes)

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
