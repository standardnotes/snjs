import { EncryptAndUploadFileOperation } from '../Operations/EncryptAndUpload'
import { SNFile, FileMetadata, FileContent } from '@standardnotes/models'
import { ClientDisplayableError } from '@standardnotes/responses'
import { FileDownloadProgress } from '../Types/FileDownloadProgress'
import { FileSystemApi } from '@standardnotes/services'

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
    onDecryptedBytes: (bytes: Uint8Array, progress: FileDownloadProgress | undefined) => Promise<void>,
  ): Promise<ClientDisplayableError | undefined>

  deleteFile(file: SNFile): Promise<ClientDisplayableError | undefined>

  minimumChunkSize(): number

  selectFileBackupAndStream(
    file: FileContent,
    fileSystem: FileSystemApi,
    onDecryptedBytes: (bytes: Uint8Array) => Promise<void>,
  ): Promise<'success' | 'aborted' | 'failed'>

  selectFileBackupAndReadAllBytes(file: FileContent, fileSystem: FileSystemApi): Promise<Uint8Array>

  selectFileBackupAndSaveDecrypted(
    file: FileContent,
    fileSystem: FileSystemApi,
  ): Promise<'success' | 'aborted' | 'failed'>
}
