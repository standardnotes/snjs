import { FilesServerInterface } from './FilesServerInterface'
import { ClientDisplayableError } from '../../ClientError'
import { ContentType } from '@standardnotes/common'
import { DownloadAndDecryptFileOperation } from './Operations/DownloadAndDecrypt'
import { DecryptedFileInterface } from './types'
import { EncryptAndUploadFileOperation } from './Operations/EncryptAndUpload'
import { SNFile, FileProtocolV1Constants, FileContent, FileMetadata } from '../../Models/File/File'
import { SNPureCrypto } from '@standardnotes/sncrypto-common'
import { SNAlertService } from '../AlertService'
import { SNSyncService } from '../Sync/SyncService'
import { ItemManager } from '@Lib/services/Items/ItemManager'
import { UuidGenerator } from '@standardnotes/utils'
import { FillItemContent } from '@standardnotes/payloads'
import { AbstractService, InternalEventBusInterface } from '@standardnotes/services'
import { FilesClientInterface } from './FilesClientInterface'

export class SNFileService extends AbstractService implements FilesClientInterface {
  constructor(
    private api: FilesServerInterface,
    private itemManager: ItemManager,
    private syncService: SNSyncService,
    private alertService: SNAlertService,
    private crypto: SNPureCrypto,
    protected internalEventBus: InternalEventBusInterface,
  ) {
    super(internalEventBus)
  }

  deinit(): void {
    super.deinit()
    ;(this.api as unknown) = undefined
    ;(this.itemManager as unknown) = undefined
    ;(this.syncService as unknown) = undefined
    ;(this.alertService as unknown) = undefined
    ;(this.crypto as unknown) = undefined
  }

  public minimumChunkSize(): number {
    return 5_000_000
  }

  public async beginNewFileUpload(): Promise<
    EncryptAndUploadFileOperation | ClientDisplayableError
  > {
    const remoteIdentifier = UuidGenerator.GenerateUuid()
    const tokenResult = await this.api.createFileValetToken(remoteIdentifier, 'write')

    if (tokenResult instanceof ClientDisplayableError) {
      return tokenResult
    }

    const key = this.crypto.generateRandomKey(FileProtocolV1Constants.KeySize)
    const fileParams: DecryptedFileInterface = {
      key,
      remoteIdentifier,
    }

    const uploadOperation = new EncryptAndUploadFileOperation(
      fileParams,
      tokenResult,
      this.crypto,
      this.api,
    )

    uploadOperation.initializeHeader()

    const uploadSessionStarted = await this.api.startUploadSession(tokenResult)
    if (!uploadSessionStarted.uploadId) {
      return new ClientDisplayableError('Could not start upload session')
    }

    return uploadOperation
  }

  public async pushBytesForUpload(
    operation: EncryptAndUploadFileOperation,
    bytes: Uint8Array,
    chunkId: number,
    isFinalChunk: boolean,
  ): Promise<ClientDisplayableError | undefined> {
    const success = await operation.pushBytes(bytes, chunkId, isFinalChunk)

    if (!success) {
      return new ClientDisplayableError('Failed to push file bytes to server')
    }
  }

  public async finishUpload(
    operation: EncryptAndUploadFileOperation,
    fileMetadata: FileMetadata,
  ): Promise<SNFile | ClientDisplayableError> {
    const uploadSessionClosed = await this.api.closeUploadSession(operation.getApiToken())
    if (!uploadSessionClosed) {
      return new ClientDisplayableError('Could not close upload session')
    }

    const fileContent: FileContent = {
      chunkSizes: operation.chunkSizes,
      encryptionHeader: operation.getEncryptionHeader(),
      key: operation.getKey(),
      name: fileMetadata.name,
      remoteIdentifier: operation.getRemoteIdentifier(),
      size: operation.getRawSize(),
      mimeType: fileMetadata.mimeType,
    }

    const file = await this.itemManager.createItem<SNFile>(
      ContentType.File,
      FillItemContent(fileContent),
      true,
    )

    await this.syncService.sync()

    return file
  }

  public async downloadFile(
    file: SNFile,
    onDecryptedBytes: (bytes: Uint8Array) => Promise<void>,
  ): Promise<ClientDisplayableError | undefined> {
    const tokenResult = await this.api.createFileValetToken(file.remoteIdentifier, 'read')

    if (tokenResult instanceof ClientDisplayableError) {
      return tokenResult
    }

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const operation = new DownloadAndDecryptFileOperation(
        file,
        this.crypto,
        this.api,
        tokenResult,
        onDecryptedBytes,
        (error) => {
          resolve(error)
        },
      )

      await operation.run().then(() => resolve(undefined))
    })
  }

  public async deleteFile(file: SNFile): Promise<ClientDisplayableError | undefined> {
    const tokenResult = await this.api.createFileValetToken(file.remoteIdentifier, 'delete')

    if (tokenResult instanceof ClientDisplayableError) {
      return tokenResult
    }

    const result = await this.api.deleteFile(tokenResult)

    if (result.error) {
      return ClientDisplayableError.FromError(result.error)
    }

    await this.itemManager.setItemToBeDeleted(file.uuid)
    await this.syncService.sync()
  }
}
