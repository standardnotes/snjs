import { EncryptionProvider } from '@standardnotes/encryption'
import { ContentType } from '@standardnotes/common'
import { SNFile, Predicate, PrefKey } from '@standardnotes/models'
import { ClientDisplayableError } from '@standardnotes/responses'
import {
  ItemManagerInterface,
  PreferenceServiceInterface,
  PreferencesServiceEvent,
  StorageServiceInterface,
  StorageKey,
  FileSystemApi,
  DirectoryHandle,
} from '@standardnotes/services'
import { naturalSort } from '@standardnotes/utils'
import { FilesServerInterface } from './FilesServerInterface'
import { FileDownloader } from './UseCase/FileDownloader'

export type BackupOperationResult = 'success' | 'failed' | 'aborted'

export class FilesBackupService {
  private timestampLastThisDeviceBackup = 0
  private timestampLastAnyDeviceBackup = 0
  private preferencesObserverDisposer: () => void

  constructor(
    private items: ItemManagerInterface,
    private api: FilesServerInterface,
    private disk: FileSystemApi,
    private encryptor: EncryptionProvider,
    private preferences: PreferenceServiceInterface,
    private storage: StorageServiceInterface,
  ) {
    this.preferencesObserverDisposer = preferences.addEventObserver((event) => {
      if (event === PreferencesServiceEvent.PreferencesChanged) {
        this.timestampLastAnyDeviceBackup = this.preferences.getValue(
          PrefKey.TimestampOfLastFileBackedUpLocallyOnAnyDevice,
          0,
        ) as number
      }
    })

    this.timestampLastThisDeviceBackup = this.storage.getValue(StorageKey.TimestampOfLastFileBackedUpOnThisDevice)
  }

  deinit(): void {
    this.preferencesObserverDisposer()
  }

  private getFilesSince(timestamp: number): SNFile[] {
    const predicate = new Predicate<SNFile>('serverUpdatedAtTimestamp', '>', timestamp)
    const files = this.items.itemsMatchingPredicate<SNFile>(ContentType.File, predicate)
    return files
  }

  public async performBackupSinceLastBackupOnThisDevice(): Promise<BackupOperationResult> {
    const files = this.getFilesSince(this.timestampLastThisDeviceBackup)
    return this.runBackupWithFiles(this.sortFilesByOldestModifiedFirst(files))
  }

  public async performBackupSinceLastBackupOnAnyDevice(): Promise<BackupOperationResult> {
    const files = this.getFilesSince(this.timestampLastAnyDeviceBackup)
    return this.runBackupWithFiles(this.sortFilesByOldestModifiedFirst(files))
  }

  private sortFilesByOldestModifiedFirst(files: SNFile[]): SNFile[] {
    return naturalSort(files, 'serverUpdatedAtTimestamp', 'asc')
  }

  private async runBackupWithFiles(files: SNFile[]): Promise<BackupOperationResult> {
    const directory = await this.disk.selectDirectory()

    const maxNumErrors = 2
    let errorCount = 0

    for (const file of files) {
      const result = await this.performBackupOperation(file, directory)

      if (result === 'aborted') {
        return 'aborted'
      }

      if (result === 'failed') {
        errorCount++

        if (errorCount === maxNumErrors) {
          return 'failed'
        }
      }
    }

    return 'success'
  }

  private async performBackupOperation(file: SNFile, rootDirectory: DirectoryHandle): Promise<BackupOperationResult> {
    const fileDirectory = await this.disk.createDirectory(rootDirectory, `${file.uuid}`)

    const metadataResult = await this.saveFileMetadataFile(file, fileDirectory)

    if (metadataResult !== 'success') {
      return metadataResult
    }

    const binaryResult = await this.saveFileBinaryFile(file, fileDirectory)

    if (binaryResult === 'success') {
      this.markFileAsSuccessfullyBackedUp(file)
    }

    return binaryResult
  }

  private async saveFileBinaryFile(file: SNFile, directory: DirectoryHandle): Promise<BackupOperationResult> {
    const fileHandle = await this.disk.createFile(directory, `${file.uuid}`)

    if (fileHandle === 'aborted' || fileHandle === 'failed') {
      return fileHandle
    }

    const operation = new FileDownloader(file, this.api)

    const downloaderResult = await operation.run(async (bytes: Uint8Array): Promise<void> => {
      await this.disk.saveBytes(fileHandle, bytes)
    })

    if (downloaderResult === 'aborted') {
      return 'aborted'
    } else if (downloaderResult instanceof ClientDisplayableError) {
      return 'failed'
    }

    return 'success'
  }

  private async saveFileMetadataFile(file: SNFile, directory: DirectoryHandle): Promise<BackupOperationResult> {
    const fileHandle = await this.disk.createFile(directory, `${file.uuid}.json`)

    if (fileHandle === 'aborted' || fileHandle === 'failed') {
      return fileHandle
    }

    const encryptedMetadata = await this.encryptor.encryptSplitSingle({
      usesItemsKeyWithKeyLookup: {
        items: [file.payload],
      },
    })

    const dataToWrite = JSON.stringify(encryptedMetadata.ejected(), null, 2)

    const writeResult = await this.disk.saveString(fileHandle, dataToWrite)

    return writeResult
  }

  private markFileAsSuccessfullyBackedUp(file: SNFile): void {
    const timestamp = file.serverUpdatedAtTimestamp || 0

    this.preferences.setValue(PrefKey.TimestampOfLastFileBackedUpLocallyOnAnyDevice, timestamp)
    this.storage.setValue(StorageKey.TimestampOfLastFileBackedUpOnThisDevice, timestamp)

    this.timestampLastAnyDeviceBackup = timestamp
    this.timestampLastThisDeviceBackup = timestamp
  }
}
