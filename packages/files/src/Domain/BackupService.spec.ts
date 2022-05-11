import { ContentType } from '@standardnotes/common'
import { EncryptionProvider } from '@standardnotes/encryption'
import { DecryptedPayload, FileContent, PayloadTimestampDefaults, SNFile } from '@standardnotes/models'
import {
  FileSystemApi,
  ItemManagerInterface,
  PreferenceServiceInterface,
  StorageServiceInterface,
} from '@standardnotes/services'
import { FilesBackupService } from './BackupService'
import { FilesServerInterface } from './FilesServerInterface'
import { MockFileSysten } from './MockFileSystem'
import { FileDownloader } from './UseCase/FileDownloader'

const mockFileDownloaderRun = jest.fn().mockImplementation((callback) => {
  callback()
})

jest.mock('./UseCase/FileDownloader', () => {
  return {
    FileDownloader: jest.fn().mockImplementationOnce(() => {
      return {
        run: mockFileDownloaderRun,
      }
    }),
  }
})

let currentUuid = 0
const mockUuid = () => {
  return `${currentUuid++}`
}

describe('backup service', () => {
  const MockedFileDownloader = jest.mocked(FileDownloader, true)

  const createFile = (timestamp: number, name?: string) => {
    const uuid = mockUuid()
    return new SNFile(
      new DecryptedPayload({
        uuid,
        content_type: ContentType.File,
        content: {
          name: name || uuid,
          key: 'secret',
          encryptedChunkSizes: [1, 2, 3],
          encryptionHeader: 'header',
          remoteIdentifier: uuid,
          mimeType: 'image/png',
          decryptedSize: 6,
        } as FileContent,
        ...PayloadTimestampDefaults(),
        updated_at_timestamp: timestamp,
      }),
    )
  }

  let items: ItemManagerInterface
  let api: FilesServerInterface
  let disk: FileSystemApi
  let encryptor: EncryptionProvider
  let preferences: PreferenceServiceInterface
  let storage: StorageServiceInterface
  let backupService: FilesBackupService
  let files: SNFile[]

  beforeEach(() => {
    files = [createFile(1), createFile(0), createFile(2)]

    items = {} as jest.Mocked<ItemManagerInterface>
    items.itemsMatchingPredicate = jest.fn().mockReturnValue(files)

    api = {} as jest.Mocked<FilesServerInterface>

    disk = new MockFileSysten()

    encryptor = {} as jest.Mocked<EncryptionProvider>
    encryptor.encryptSplitSingle = jest.fn().mockReturnValue({
      ejected: () => {
        return {}
      },
    })

    preferences = {} as jest.Mocked<PreferenceServiceInterface>
    preferences.getValue = jest.fn().mockReturnValue(10)
    preferences.setValue = jest.fn()
    preferences.addEventObserver = jest.fn()

    storage = {} as jest.Mocked<StorageServiceInterface>
    storage.getValue = jest.fn().mockReturnValue(20)
    storage.setValue = jest.fn()

    backupService = new FilesBackupService(items, api, disk, encryptor, preferences, storage)

    MockedFileDownloader.mockClear()
    mockFileDownloaderRun.mockClear()
  })

  it('should populate timestamps on construction', () => {
    expect(backupService['timestampLastThisDeviceBackup']).toEqual(20)
    expect(backupService['timestampLastAnyDeviceBackup']).toEqual(10)
  })

  it('should run backup since last device backup with sorted files', async () => {
    const runBackupWithFiles = (backupService['runBackupWithFiles'] = jest.fn())
    preferences.getValue = jest.fn().mockReturnValue(0)
    storage.getValue = jest.fn().mockReturnValue(0)

    await backupService.performBackupSinceLastBackupOnThisDevice()

    expect(runBackupWithFiles).toHaveBeenCalledWith([files[1], files[0], files[2]])
  })

  it('should run backup since last account backup with sorted files', async () => {
    const runBackupWithFiles = (backupService['runBackupWithFiles'] = jest.fn())
    preferences.getValue = jest.fn().mockReturnValue(0)
    storage.getValue = jest.fn().mockReturnValue(0)

    await backupService.performBackupSinceLastBackupOnAnyDevice()

    expect(runBackupWithFiles).toHaveBeenCalledWith([files[1], files[0], files[2]])
  })

  it('should sort files', () => {
    const result = backupService['sortFilesByOldestModifiedFirst'](files)

    expect(result).toEqual([files[1], files[0], files[2]])
  })

  it('should get files since timetstamp', () => {
    const result = backupService['getFilesSince'](0)

    expect(result).toEqual(files)
  })

  describe('runBackupWithFiles', () => {
    it('should backup multiple files', async () => {
      const performBackupOperation = (backupService['performBackupOperation'] = jest.fn())
      await backupService['runBackupWithFiles'](files)

      expect(performBackupOperation).toHaveBeenCalledTimes(3)
    })

    it('should abort after 2 errors', async () => {
      const performBackupOperation = (backupService['performBackupOperation'] = jest.fn().mockReturnValue('failed'))
      await backupService['runBackupWithFiles'](files)

      expect(performBackupOperation).toHaveBeenCalledTimes(2)
    })

    it('should abort after single cancelation', async () => {
      const performBackupOperation = (backupService['performBackupOperation'] = jest.fn().mockReturnValue('aborted'))
      await backupService['runBackupWithFiles'](files)

      expect(performBackupOperation).toHaveBeenCalledTimes(1)
    })

    it('should return success if no errors', async () => {
      const performBackupOperation = (backupService['performBackupOperation'] = jest.fn().mockReturnValue('success'))
      const result = await backupService['runBackupWithFiles'](files)

      expect(performBackupOperation).toHaveBeenCalledTimes(3)
      expect(result).toEqual('success')
    })

    it('should select root directory when beginning', async () => {
      const selectDirectory = (disk.selectDirectory = jest.fn())
      await backupService['runBackupWithFiles'](files)

      expect(selectDirectory).toHaveBeenCalledTimes(1)
    })
  })

  describe('performBackupOperation', () => {
    const rootDirectory = '/Users/Backups'

    beforeEach(() => {
      disk.selectDirectory = jest.fn().mockReturnValue(rootDirectory)
    })

    it('should create new directory for file', async () => {
      const createDirectory = (disk.createDirectory = jest.fn())
      await backupService['performBackupOperation'](files[0], rootDirectory)

      expect(createDirectory).toHaveBeenCalledWith(rootDirectory, files[0].uuid)
    })

    it('should save file metadata to new directory', async () => {
      const saveFileMetadataFile = (backupService['saveFileMetadataFile'] = jest.fn())
      await backupService['performBackupOperation'](files[0], rootDirectory)

      expect(saveFileMetadataFile).toHaveBeenCalledWith(files[0], `${rootDirectory}/${files[0].uuid}`)
    })

    it('should abort if save file metadata fails', async () => {
      backupService['saveFileMetadataFile'] = jest.fn().mockReturnValue('failed')
      const result = await backupService['performBackupOperation'](files[0], rootDirectory)

      expect(result).toEqual('failed')
    })

    it('should save file binary to new directory', async () => {
      const saveFileBinaryFile = (backupService['saveFileBinaryFile'] = jest.fn())
      await backupService['performBackupOperation'](files[0], rootDirectory)

      expect(saveFileBinaryFile).toHaveBeenCalledWith(files[0], `${rootDirectory}/${files[0].uuid}`)
    })

    it('should return result of file binary save', async () => {
      backupService['saveFileBinaryFile'] = jest.fn().mockReturnValue('success')
      const result = await backupService['performBackupOperation'](files[0], rootDirectory)

      expect(result).toEqual('success')
    })
  })

  describe('saveFileBinaryFile', () => {
    let file: SNFile
    const rootDirectory = '/Users/Backups'

    beforeEach(() => {
      file = files[0]
    })

    it('should create new file', async () => {
      const createFile = (disk.createFile = jest.fn())
      await backupService['saveFileBinaryFile'](file, rootDirectory)

      expect(createFile).toHaveBeenCalledWith(rootDirectory, file.uuid)
    })

    it('should download file remotely', async () => {
      await backupService['saveFileBinaryFile'](file, rootDirectory)

      expect(mockFileDownloaderRun).toHaveBeenCalledTimes(1)
    })

    it.only('save bytes to disk on download chunk', async () => {
      const saveBytes = (disk.saveBytes = jest.fn())
      await backupService['saveFileBinaryFile'](file, rootDirectory)

      expect(saveBytes).toHaveBeenCalled()
    })
  })
})
