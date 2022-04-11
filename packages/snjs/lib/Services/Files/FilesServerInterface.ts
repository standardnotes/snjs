import {
  StartUploadSessionResponse,
  MinimalHttpResponse,
  ClientDisplayableError,
} from '@standardnotes/responses'
import { EncryptedFileInterface } from './Types'

export interface FilesServerInterface {
  startUploadSession(apiToken: string): Promise<StartUploadSessionResponse>

  uploadFileBytes(apiToken: string, chunkId: number, encryptedBytes: Uint8Array): Promise<boolean>

  closeUploadSession(apiToken: string): Promise<boolean>

  downloadFile(
    file: EncryptedFileInterface,
    chunkIndex: number,
    apiToken: string,
    contentRangeStart: number,
    onBytesReceived: (bytes: Uint8Array) => Promise<void>,
  ): Promise<ClientDisplayableError | undefined>

  deleteFile(apiToken: string): Promise<MinimalHttpResponse>

  createFileValetToken(
    remoteIdentifier: string,
    operation: 'write' | 'read' | 'delete',
    unencryptedFileSize?: number,
  ): Promise<string | ClientDisplayableError>
}
