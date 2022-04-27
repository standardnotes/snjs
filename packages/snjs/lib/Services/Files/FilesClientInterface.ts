import { EncryptAndUploadFileOperation } from './Operations/EncryptAndUpload'
import { SNFile, FileMetadata } from '@standardnotes/models'
import { ClientDisplayableError } from '@standardnotes/responses'

export interface FilesClientInterface {
  beginNewFileUpload(sizeInBytes: number): Promise<EncryptAndUploadFileOperation | ClientDisplayableError>

  pushBytesForUpload(
    operation: EncryptAndUploadFileOperation,
    bytes: Uint8Array,
    chunkId: number,
    isFinalChunk: boolean,
  ): Promise<ClientDisplayableError | undefined>

  finishUpload(
    operation: EncryptAndUploadFileOperation,
    fileMetadata: FileMetadata,
  ): Promise<SNFile | ClientDisplayableError>

  downloadFile(
    file: SNFile,
    onDecryptedBytes: (bytes: Uint8Array) => Promise<void>,
  ): Promise<ClientDisplayableError | undefined>

  deleteFile(file: SNFile): Promise<ClientDisplayableError | undefined>

  minimumChunkSize(): number
}
