import { ClientDisplayableError, MinimalHttpResponse, StartUploadSessionResponse } from '@standardnotes/responses'
import { AbstractService } from '../Service/AbstractService'
import { EncryptedFileInterface } from '@standardnotes/models'
import { Uuid } from '@standardnotes/common'
import { Role } from '@standardnotes/auth'

/* istanbul ignore file */

export enum ApiServiceEvent {
  MetaReceived = 'MetaReceived',
}

export type MetaReceivedData = {
  userUuid: Uuid
  userRoles: Role[]
}

export interface ApiServiceInterface extends AbstractService<ApiServiceEvent.MetaReceived, MetaReceivedData> {
  createFileValetToken(
    remoteIdentifier: string,
    operation: 'write' | 'read' | 'delete',
    unencryptedFileSize?: number,
  ): Promise<string | ClientDisplayableError>

  downloadFile(
    file: EncryptedFileInterface,
    chunkIndex: number,
    apiToken: string,
    contentRangeStart: number,
    onBytesReceived: (bytes: Uint8Array) => Promise<void>,
  ): Promise<ClientDisplayableError | undefined>

  deleteFile(apiToken: string): Promise<MinimalHttpResponse>

  startUploadSession(apiToken: string): Promise<StartUploadSessionResponse>

  uploadFileBytes(apiToken: string, chunkId: number, encryptedBytes: Uint8Array): Promise<boolean>

  closeUploadSession(apiToken: string): Promise<boolean>

  getFilesDownloadUrl(): string
}
