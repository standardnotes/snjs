import { ContentType } from '@standardnotes/common'
import { EncryptionProvider } from '@standardnotes/encryption'
import { SNFile } from '@standardnotes/models'
import { ClientDisplayableError } from '@standardnotes/responses'
import {
  ItemManagerInterface,
  FileBackupsDevice,
  FileBackupsMapping,
  AbstractService,
  InternalEventBusInterface,
} from '@standardnotes/services'
import { FilesServerInterface } from './FilesServerInterface'

export class FilesBackupService extends AbstractService {
  private itemsObserverDisposer: () => void

  constructor(
    items: ItemManagerInterface,
    private api: FilesServerInterface,
    private encryptor: EncryptionProvider,
    private device: FileBackupsDevice,
    protected override internalEventBus: InternalEventBusInterface,
  ) {
    super(internalEventBus)

    this.itemsObserverDisposer = items.addObserver<SNFile>(ContentType.File, ({ changed, inserted }) => {
      void this.handleChangedFiles([...changed, ...inserted])
    })
  }

  override deinit() {
    this.itemsObserverDisposer()
  }

  private async getBackupsMapping(): Promise<FileBackupsMapping['files']> {
    return (await this.device.getFilesBackupsMappingFile()).files
  }

  private async handleChangedFiles(files: SNFile[]): Promise<void> {
    const mapping = await this.getBackupsMapping()

    for (const file of files) {
      const record = mapping[file.uuid]
      if (record == undefined) {
        await this.performBackupOperation(file)
      }
    }
  }

  private async performBackupOperation(file: SNFile): Promise<'success' | 'failed' | 'aborted'> {
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

    return result
  }
}
