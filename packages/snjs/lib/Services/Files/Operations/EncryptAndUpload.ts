import { DecryptedFileInterface, FileUploadProgress, FileUploadResult } from '../Types'
import { FilesServerInterface } from '../FilesServerInterface'
import { FileUploader } from '../UseCase/FileUploader'
import { SNPureCrypto } from '@standardnotes/sncrypto-common'
import { FileEncryptor } from '../UseCase/FileEncryptor'

export class EncryptAndUploadFileOperation {
  public readonly encryptedChunkSizes: number[] = []

  private readonly encryptor: FileEncryptor
  private readonly uploader: FileUploader
  private readonly encryptionHeader: string

  private totalBytesPushedInDecryptedTerms = 0
  private totalBytesUploadedInDecryptedTerms = 0

  constructor(
    private file: DecryptedFileInterface,
    private apiToken: string,
    private crypto: SNPureCrypto,
    private api: FilesServerInterface,
  ) {
    this.encryptor = new FileEncryptor(file, this.crypto)
    this.uploader = new FileUploader(this.api)

    this.encryptionHeader = this.encryptor.initializeHeader()
  }

  public getApiToken(): string {
    return this.apiToken
  }

  public getProgress(): FileUploadProgress {
    const reportedDecryptedSize = this.file.decryptedSize

    return {
      decryptedFileSize: reportedDecryptedSize,
      decryptedBytesUploaded: this.totalBytesUploadedInDecryptedTerms,
      decryptedBytesRemaining: reportedDecryptedSize - this.totalBytesUploadedInDecryptedTerms,
      percentComplete: (this.totalBytesUploadedInDecryptedTerms / reportedDecryptedSize) * 100.0,
    }
  }

  public getResult(): FileUploadResult {
    return {
      encryptionHeader: this.encryptionHeader,
      finalDecryptedSize: this.totalBytesPushedInDecryptedTerms,
      key: this.file.key,
      remoteIdentifier: this.file.remoteIdentifier,
    }
  }

  public async pushBytes(decryptedBytes: Uint8Array, chunkId: number, isFinalChunk: boolean): Promise<boolean> {
    this.totalBytesPushedInDecryptedTerms += decryptedBytes.byteLength

    const encryptedBytes = this.encryptBytes(decryptedBytes, isFinalChunk)

    this.encryptedChunkSizes.push(encryptedBytes.length)

    const uploadSuccess = await this.uploadBytes(encryptedBytes, chunkId)

    if (uploadSuccess) {
      this.totalBytesUploadedInDecryptedTerms += decryptedBytes.byteLength
    }

    return uploadSuccess
  }

  private encryptBytes(decryptedBytes: Uint8Array, isFinalChunk: boolean): Uint8Array {
    const encryptedBytes = this.encryptor.pushBytes(decryptedBytes, isFinalChunk)

    return encryptedBytes
  }

  private async uploadBytes(encryptedBytes: Uint8Array, chunkId: number): Promise<boolean> {
    const success = await this.uploader.uploadBytes(encryptedBytes, chunkId, this.apiToken)

    return success
  }
}
