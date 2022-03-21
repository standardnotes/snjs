import { ClientDisplayableError } from '@Lib/ClientError'
import { FileDownloader } from '../UseCase/FileDownloader'
import { FileDecryptor } from '../UseCase/FileDecryptor'
import { RemoteFileInterface, EncryptedFileInterface } from '../types'
import { FilesServerInterface } from '../FilesServerInterface'
import { SNPureCrypto } from '@standardnotes/sncrypto-common'

export class DownloadAndDecryptFileOperation {
  private readonly decryptor: FileDecryptor
  private readonly downloader: FileDownloader

  constructor(
    file: RemoteFileInterface & EncryptedFileInterface,
    crypto: SNPureCrypto,
    api: FilesServerInterface,
    apiToken: string,
    private onDecryptedBytes: (decryptedBytes: Uint8Array) => Promise<void>,
    private onError: (error: ClientDisplayableError) => void,
  ) {
    this.decryptor = new FileDecryptor(file, crypto)
    this.downloader = new FileDownloader(file, apiToken, api, this.onDownloadedBytes.bind(this))
  }

  public async run(): Promise<void> {
    this.decryptor.initialize()

    const result = await this.downloader.download()

    if (result instanceof ClientDisplayableError) {
      this.onError(result)
    }
  }

  private async onDownloadedBytes(encryptedBytes: Uint8Array): Promise<void> {
    const result = this.decryptor.decryptBytes(encryptedBytes)

    if (!result || result.decryptedBytes.length === 0) {
      this.downloader.abort()
      this.onError(new ClientDisplayableError('Failed to decrypt chunk'))
      return
    }

    await this.onDecryptedBytes(result.decryptedBytes)
  }
}
