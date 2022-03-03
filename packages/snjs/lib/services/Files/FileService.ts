import { ContentType } from '@standardnotes/common'
import { DownloadAndDecryptFileOperation } from './Operations/DownloadAndDecrypt'
import { DecryptedFileInterface } from './types'
import { EncryptAndUploadFileOperation } from './Operations/EncryptAndUpload'
import { SNFile, FileProtocolV1, FileContent } from '../../models/app/file'
import { SNPureCrypto } from '@standardnotes/sncrypto-common'
import { SNAlertService } from '../AlertService'
import { SNSyncService } from '../Sync/SyncService'
import { ItemManager } from '@Lib/services/Items/ItemManager'
import { SNApiService } from '../Api/ApiService'
import { isErrorObject, UuidGenerator } from '@standardnotes/utils'
import { PayloadContent, FillItemContent } from '@standardnotes/payloads'
import { AbstractService, InternalEventBusInterface } from '@standardnotes/services'

export interface FilesClientInterface {
  beginNewFileUpload(): Promise<EncryptAndUploadFileOperation>

  pushBytesForUpload(
    operation: EncryptAndUploadFileOperation,
    bytes: Uint8Array,
    chunkId: number,
    isFinalChunk: boolean,
  ): Promise<boolean>

  finishUpload(
    operation: EncryptAndUploadFileOperation,
    fileName: string,
    fileExt: string,
  ): Promise<SNFile>

  downloadFile(file: SNFile, onDecryptedBytes: (bytes: Uint8Array) => void): Promise<void>

  minimumChunkSize(): number
}

export class SNFileService extends AbstractService implements FilesClientInterface {
  constructor(
    private apiService: SNApiService,
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
    ;(this.apiService as unknown) = undefined
    ;(this.itemManager as unknown) = undefined
    ;(this.syncService as unknown) = undefined
    ;(this.alertService as unknown) = undefined
    ;(this.crypto as unknown) = undefined
  }

  public minimumChunkSize(): number {
    return 5_000_000
  }

  public async beginNewFileUpload(): Promise<EncryptAndUploadFileOperation> {
    const remoteIdentifier = UuidGenerator.GenerateUuid()
    const apiToken = await this.apiService.createFileValetToken(remoteIdentifier, 'write')
    if (isErrorObject(apiToken)) {
      throw new Error('Could not obtain files api valet token')
    }

    const key = this.crypto.generateRandomKey(FileProtocolV1.KeySize)
    const fileParams: DecryptedFileInterface = {
      key,
      remoteIdentifier,
    }

    const uploadOperation = new EncryptAndUploadFileOperation(
      fileParams,
      apiToken,
      this.crypto,
      this.apiService,
    )

    uploadOperation.initializeHeader()

    const uploadSessionStarted = await this.apiService.startUploadSession(apiToken)
    if (!uploadSessionStarted) {
      throw new Error('Could not start upload session')
    }

    return uploadOperation
  }

  public async pushBytesForUpload(
    operation: EncryptAndUploadFileOperation,
    bytes: Uint8Array,
    chunkId: number,
    isFinalChunk: boolean,
  ): Promise<boolean> {
    return operation.pushBytes(bytes, chunkId, isFinalChunk)
  }

  public async finishUpload(
    operation: EncryptAndUploadFileOperation,
    fileName: string,
    fileExt: string,
  ): Promise<SNFile> {
    const uploadSessionClosed = await this.apiService.closeUploadSession(operation.getApiToken())
    if (!uploadSessionClosed) {
      throw new Error('Could not close upload session')
    }

    console.log('Finished upload with sizes', operation.chunkSizes)

    const fileContent: FileContent = {
      chunkSizes: operation.chunkSizes,
      encryptionHeader: operation.getEncryptionHeader(),
      ext: fileExt,
      key: operation.getKey(),
      name: fileName,
      remoteIdentifier: operation.getRemoteIdentifier(),
      size: operation.getRawSize(),
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
    onDecryptedBytes: (bytes: Uint8Array) => void,
  ): Promise<void> {
    const apiToken = await this.apiService.createFileValetToken(
      (file.content as PayloadContent).remoteIdentifier,
      'read',
    )
    if (isErrorObject(apiToken)) {
      throw new Error('Could not obtain files api valet token')
    }

    const operation = new DownloadAndDecryptFileOperation(
      file,
      this.crypto,
      this.apiService,
      apiToken,
      onDecryptedBytes,
      () => {
        console.error('Error downloading/decrypting file')
      },
    )

    return operation.run()
  }
}
