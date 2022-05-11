import { ContentType, Uuid } from '@standardnotes/common'
import { EncryptionProvider } from '@standardnotes/encryption'
import { PayloadEmitSource, SNFile } from '@standardnotes/models'
import { ClientDisplayableError } from '@standardnotes/responses'
import {
  ItemManagerInterface,
  FileBackupsDevice,
  FileBackupsMapping,
  AbstractService,
  InternalEventBusInterface,
  StatusServiceInterface,
} from '@standardnotes/services'
import { FilesServerInterface } from './FilesServerInterface'

export class FilesBackupService extends AbstractService {
  private itemsObserverDisposer: () => void
  private pendingFiles = new Set<Uuid>()

  constructor(
    private items: ItemManagerInterface,
    private api: FilesServerInterface,
    private encryptor: EncryptionProvider,
    private device: FileBackupsDevice,
    private status: StatusServiceInterface,
    protected override internalEventBus: InternalEventBusInterface,
  ) {
    super(internalEventBus)

    this.itemsObserverDisposer = items.addObserver<SNFile>(ContentType.File, ({ changed, inserted, source }) => {
      const applicableSources = [
        PayloadEmitSource.LocalDatabaseLoaded,
        PayloadEmitSource.RemoteSaved,
        PayloadEmitSource.RemoteRetrieved,
      ]
      if (applicableSources.includes(source)) {
        void this.handleChangedFiles([...changed, ...inserted])
      }
    })
  }

  override deinit() {
    this.itemsObserverDisposer()
  }

  public isFilesBackupsEnabled(): Promise<boolean> {
    return this.device.isFilesBackupsEnabled()
  }

  public async enableFilesBackups(): Promise<void> {
    await this.device.enableFilesBackups()

    if (!(await this.isFilesBackupsEnabled())) {
      return
    }

    this.backupAllFiles()
  }

  private backupAllFiles(): void {
    const files = this.items.getItems<SNFile>(ContentType.File)

    void this.handleChangedFiles(files)
  }

  public disableFilesBackups(): Promise<void> {
    return this.device.disableFilesBackups()
  }

  public changeFilesBackupsLocation(): Promise<string> {
    return this.device.changeFilesBackupsLocation()
  }

  public getFilesBackupsLocation(): Promise<string> {
    return this.device.getFilesBackupsLocation()
  }

  private async getBackupsMapping(): Promise<FileBackupsMapping['files']> {
    return (await this.device.getFilesBackupsMappingFile()).files
  }

  private async handleChangedFiles(files: SNFile[]): Promise<void> {
    if (files.length === 0) {
      return
    }

    if (!(await this.isFilesBackupsEnabled())) {
      return
    }

    const mapping = await this.getBackupsMapping()

    for (const file of files) {
      if (this.pendingFiles.has(file.uuid)) {
        continue
      }

      const record = mapping[file.uuid]

      if (record == undefined) {
        this.pendingFiles.add(file.uuid)

        await this.performBackupOperation(file)

        this.pendingFiles.delete(file.uuid)
      }
    }
  }

  private async performBackupOperation(file: SNFile): Promise<'success' | 'failed' | 'aborted'> {
    const removeStatus = this.status.addMessage(`Backing up file ${file.name}...`)

    const encryptedMetadata = await this.encryptor.encryptSplitSingle({
      usesItemsKeyWithKeyLookup: {
        items: [file.payload],
      },
    })

    const token = await this.api.createFileValetToken(file.remoteIdentifier, 'read')

    if (token instanceof ClientDisplayableError) {
      return 'failed'
    }

    const metaFile = JSON.stringify(encryptedMetadata.ejected(), null, 2)

    const result = await this.device.saveFilesBackupsFile(file.uuid, metaFile, {
      chunkSizes: file.encryptedChunkSizes,
      url: this.api.getFilesDownloadUrl(),
      valetToken: token,
    })

    removeStatus()

    if (result === 'failed') {
      const removeFail = this.status.addMessage(`Failed to back up ${file.name}...`)
      setTimeout(() => {
        removeFail()
      }, 2000)
    }

    return result
  }
}
