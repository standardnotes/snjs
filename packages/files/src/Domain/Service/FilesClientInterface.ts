import { EncryptAndUploadFileOperation } from '../Operations/EncryptAndUpload'
import { SNFile, FileMetadata, FileContent } from '@standardnotes/models'
import { ClientDisplayableError } from '@standardnotes/responses'
import { FileDownloadProgress } from '../Types/FileDownloadProgress'
import { FileSystemApi, FileBackupMetadataFile, FileHandleRead, FileSystemNoSelection } from '@standardnotes/services'

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

  isFileNameFileBackupMetadataFile(name: string): boolean

  decryptBackupMetadataFile(metdataFile: FileBackupMetadataFile): Promise<FileContent | undefined>

  selectFile(fileSystem: FileSystemApi): Promise<FileHandleRead | FileSystemNoSelection>

  readBackupFileAndSaveDecrypted(
    fileHandle: FileHandleRead,
    file: FileContent,
    fileSystem: FileSystemApi,
  ): Promise<'success' | 'aborted' | 'failed'>

  readBackupFileBytesDecrypted(
    fileHandle: FileHandleRead,
    file: FileContent,
    fileSystem: FileSystemApi,
  ): Promise<Uint8Array>
}
