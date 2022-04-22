import { ClientDisplayableError } from '@standardnotes/responses'
import { AbortFunction, FileDownloader } from '../UseCase/FileDownloader'
import { FileDecryptor } from '../UseCase/FileDecryptor'
import { RemoteFileInterface, EncryptedFileInterface } from '../Types'
import { FilesServerInterface } from '../FilesServerInterface'
import { SNPureCrypto } from '@standardnotes/sncrypto-common'

type Result = { success: boolean; error?: ClientDisplayableError; aborted?: boolean }

export class DownloadAndDecryptFileOperation {
  constructor(
    private readonly file: RemoteFileInterface & EncryptedFileInterface,
    private readonly crypto: SNPureCrypto,
    private readonly api: FilesServerInterface,
    private readonly apiToken: string,
  ) {}

  public async run(onDecryptedBytes: (decryptedBytes: Uint8Array) => Promise<void>): Promise<Result> {
    const decryptor = new FileDecryptor(this.file, this.crypto)

    decryptor.initialize()

    let decryptError: ClientDisplayableError | undefined

    const downloader = new FileDownloader(
      this.file,
      this.apiToken,
      this.api,
      async (encryptedBytes: Uint8Array, abortDownload: AbortFunction) => {
        const result = decryptor.decryptBytes(encryptedBytes)

        if (!result || result.decryptedBytes.length === 0) {
          decryptError = new ClientDisplayableError('Failed to decrypt chunk')

          abortDownload()

          return
        }

        await onDecryptedBytes(result.decryptedBytes)
      },
    )

    const downloadResult = await downloader.download()

    return {
      success: downloadResult instanceof ClientDisplayableError ? false : true,
      error: downloadResult === 'aborted' ? undefined : downloadResult || decryptError,
      aborted: downloadResult === 'aborted',
    }
  }
}
