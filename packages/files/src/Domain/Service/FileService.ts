import { FileMemoryCache } from '@standardnotes/filepicker'
import { ClientDisplayableError } from '@standardnotes/responses'
import { ContentType } from '@standardnotes/common'
import { DownloadAndDecryptFileOperation } from '../Operations/DownloadAndDecrypt'
import { EncryptAndUploadFileOperation } from '../Operations/EncryptAndUpload'
import {
  SNFile,
  FileProtocolV1Constants,
  FileMetadata,
  FileContentSpecialized,
  FillItemContentSpecialized,
  FileContent,
  EncryptedPayload,
  isEncryptedPayload,
} from '@standardnotes/models'
import { PureCryptoInterface } from '@standardnotes/sncrypto-common'
import { UuidGenerator } from '@standardnotes/utils'
import {
  AbstractService,
  InternalEventBusInterface,
  ItemManagerInterface,
  SyncServiceInterface,
  AlertService,
  FileSystemApi,
  FilesApiInterface,
  FileBackupMetadataFile,
} from '@standardnotes/services'
import { FilesClientInterface } from './FilesClientInterface'
import { FileDownloadProgress } from '../Types/FileDownloadProgress'
import { BackupSelectAndDecrypt } from '../Operations/BackupSelectAndDecrypt'
import { EncryptionProvider } from '@standardnotes/encryption'

const OneHundredMb = 100 * 1_000_000

export class FileService extends AbstractService implements FilesClientInterface {
  private cache: FileMemoryCache = new FileMemoryCache(OneHundredMb)

  constructor(
    private api: FilesApiInterface,
    private itemManager: ItemManagerInterface,
    private syncService: SyncServiceInterface,
    private encryptor: EncryptionProvider,
    private alertService: AlertService,
    private crypto: PureCryptoInterface,
    protected override internalEventBus: InternalEventBusInterface,
  ) {
    super(internalEventBus)
  }

  override deinit(): void {
    super.deinit()

    this.cache.clear()
    ;(this.cache as unknown) = undefined
    ;(this.api as unknown) = undefined
    ;(this.itemManager as unknown) = undefined
    ;(this.encryptor as unknown) = undefined
    ;(this.syncService as unknown) = undefined
    ;(this.alertService as unknown) = undefined
    ;(this.crypto as unknown) = undefined
  }

  public minimumChunkSize(): number {
    return 5_000_000
  }

  public async beginNewFileUpload(
    sizeInBytes: number,
  ): Promise<EncryptAndUploadFileOperation | ClientDisplayableError> {
    const remoteIdentifier = UuidGenerator.GenerateUuid()
    const tokenResult = await this.api.createFileValetToken(remoteIdentifier, 'write', sizeInBytes)

    if (tokenResult instanceof ClientDisplayableError) {
      return tokenResult
    }

    const key = this.crypto.generateRandomKey(FileProtocolV1Constants.KeySize)

    const fileParams = {
      key,
      remoteIdentifier,
      decryptedSize: sizeInBytes,
    }

    const uploadOperation = new EncryptAndUploadFileOperation(fileParams, tokenResult, this.crypto, this.api)

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

    return undefined
  }

  public async finishUpload(
    operation: EncryptAndUploadFileOperation,
    fileMetadata: FileMetadata,
  ): Promise<SNFile | ClientDisplayableError> {
    const uploadSessionClosed = await this.api.closeUploadSession(operation.getApiToken())

    if (!uploadSessionClosed) {
      return new ClientDisplayableError('Could not close upload session')
    }

    const result = operation.getResult()

    const fileContent: FileContentSpecialized = {
      decryptedSize: result.finalDecryptedSize,
      encryptedChunkSizes: operation.encryptedChunkSizes,
      encryptionHeader: result.encryptionHeader,
      key: result.key,
      mimeType: fileMetadata.mimeType,
      name: fileMetadata.name,
      remoteIdentifier: result.remoteIdentifier,
    }

    const file = await this.itemManager.createItem<SNFile>(
      ContentType.File,
      FillItemContentSpecialized(fileContent),
      true,
    )

    await this.syncService.sync()

    return file
  }

  public async downloadFile(
    file: SNFile,
    onDecryptedBytes: (decryptedBytes: Uint8Array, progress?: FileDownloadProgress) => Promise<void>,
  ): Promise<ClientDisplayableError | undefined> {
    const cachedFile = this.cache.get(file.uuid)

    if (cachedFile) {
      await onDecryptedBytes(cachedFile, undefined)

      return undefined
    }

    const addToCache = file.decryptedSize < this.cache.maxSize
    let cacheEntryAggregate = new Uint8Array()

    const bytesWrapper = async (bytes: Uint8Array, progress: FileDownloadProgress): Promise<void> => {
      if (addToCache) {
        cacheEntryAggregate = new Uint8Array([...cacheEntryAggregate, ...bytes])
      }
      return onDecryptedBytes(bytes, progress)
    }

    const operation = new DownloadAndDecryptFileOperation(file, this.crypto, this.api)

    const result = await operation.run(bytesWrapper)

    if (addToCache) {
      this.cache.add(file.uuid, cacheEntryAggregate)
    }

    return result.error
  }

  public async deleteFile(file: SNFile): Promise<ClientDisplayableError | undefined> {
    this.cache.remove(file.uuid)

    const tokenResult = await this.api.createFileValetToken(file.remoteIdentifier, 'delete')

    if (tokenResult instanceof ClientDisplayableError) {
      return tokenResult
    }

    const result = await this.api.deleteFile(tokenResult)

    if (result.error) {
      return ClientDisplayableError.FromError(result.error)
    }

    await this.itemManager.setItemToBeDeleted(file)
    await this.syncService.sync()

    return undefined
  }

  public async decryptBackupMetadataFile(metdataFile: FileBackupMetadataFile): Promise<FileContent | undefined> {
    const encryptedItemsKey = new EncryptedPayload(metdataFile.itemsKey)

    const decryptedItemsKey = await this.encryptor.decryptSplitSingle({
      usesRootKeyWithKeyLookup: {
        items: [encryptedItemsKey],
      },
    })

    if (isEncryptedPayload(decryptedItemsKey)) {
      return undefined
    }

    const encryptedFile = new EncryptedPayload(metdataFile.file)

    const decryptedFile = await this.encryptor.decryptSplitSingle({
      usesItemsKeyWithKeyLookup: {
        items: [encryptedFile],
      },
    })

    if (isEncryptedPayload(decryptedFile)) {
      return undefined
    }

    return decryptedFile.content as FileContent
  }

  public async selectFileBackupAndStream(
    file: FileContent,
    fileSystem: FileSystemApi,
    onDecryptedBytes: (bytes: Uint8Array) => Promise<void>,
  ): Promise<'success' | 'aborted' | 'failed'> {
    const operation = new BackupSelectAndDecrypt(file, fileSystem, this.crypto)

    const result = await operation.runSelectAndRead(onDecryptedBytes)

    return result
  }

  public async selectFileBackupAndSaveDecrypted(
    file: FileContent,
    fileSystem: FileSystemApi,
  ): Promise<'success' | 'aborted' | 'failed'> {
    const operation = new BackupSelectAndDecrypt(file, fileSystem, this.crypto)

    const encryptedFilePickStatus = await operation.runSelect()

    if (encryptedFilePickStatus === 'aborted' || encryptedFilePickStatus === 'failed') {
      return encryptedFilePickStatus
    }

    const destinationDirectoryHandle = await fileSystem.selectDirectory()

    if (destinationDirectoryHandle === 'aborted' || destinationDirectoryHandle === 'failed') {
      return destinationDirectoryHandle
    }

    const destinationFileHandle = await fileSystem.createFile(destinationDirectoryHandle, file.name)

    if (destinationFileHandle === 'aborted' || destinationFileHandle === 'failed') {
      return destinationFileHandle
    }

    const result = await operation.runRead(async (decryptedBytes) => {
      await fileSystem.saveBytes(destinationFileHandle, decryptedBytes)
    })

    await fileSystem.closeFileWriteStream(destinationFileHandle)

    return result
  }

  public async selectFileBackupAndReadAllBytes(file: FileContent, fileSystem: FileSystemApi): Promise<Uint8Array> {
    const operation = new BackupSelectAndDecrypt(file, fileSystem, this.crypto)

    let bytes = new Uint8Array()

    await operation.runSelectAndRead(async (decryptedBytes) => {
      bytes = new Uint8Array([...bytes, ...decryptedBytes])
    })

    return bytes
  }
}
