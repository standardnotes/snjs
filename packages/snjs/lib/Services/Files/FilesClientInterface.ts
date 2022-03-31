import { EncryptAndUploadFileOperation } from './Operations/EncryptAndUpload'
import { SNFile, FileMetadata } from '../../Models/File/File'
import { ClientDisplayableError } from '@Lib/Application/ClientError'

export interface FilesClientInterface {
  beginNewFileUpload(): Promise<EncryptAndUploadFileOperation | ClientDisplayableError>

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

  isFileTypePreviewable(fileType: string): boolean
}
