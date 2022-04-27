import { InternalEventBusInterface } from '@standardnotes/services'
import { SNFileService } from './FileService'
import { SNSyncService } from '../Sync/SyncService'
import { ItemManager, SNAlertService, SNApiService } from '@Lib/index'
import { SNPureCrypto, StreamEncryptor } from '@standardnotes/sncrypto-common'
import { SNFile } from '@standardnotes/models'

describe('fileService', () => {
  let apiService: SNApiService
  let itemManager: ItemManager
  let syncService: SNSyncService
  let alertService: SNAlertService
  let crypto: SNPureCrypto
  let fileService: SNFileService
  let internalEventBus: InternalEventBusInterface

  beforeEach(() => {
    apiService = {} as jest.Mocked<SNApiService>
    apiService.addEventObserver = jest.fn()
    apiService.createFileValetToken = jest.fn()
    apiService.downloadFile = jest.fn()
    apiService.deleteFile = jest.fn().mockReturnValue({})

    itemManager = {} as jest.Mocked<ItemManager>
    itemManager.createItem = jest.fn()
    itemManager.createTemplateItem = jest.fn().mockReturnValue({})
    itemManager.setItemToBeDeleted = jest.fn()
    itemManager.addObserver = jest.fn()
    itemManager.changeItem = jest.fn()

    syncService = {} as jest.Mocked<SNSyncService>
    syncService.sync = jest.fn()

    alertService = {} as jest.Mocked<SNAlertService>
    alertService.confirm = jest.fn().mockReturnValue(true)
    alertService.alert = jest.fn()

    crypto = {} as jest.Mocked<SNPureCrypto>
    crypto.base64Decode = jest.fn()
    internalEventBus = {} as jest.Mocked<InternalEventBusInterface>
    internalEventBus.publish = jest.fn()

    fileService = new SNFileService(apiService, itemManager, syncService, alertService, crypto, internalEventBus)

    crypto.xchacha20StreamInitDecryptor = jest.fn().mockReturnValue({
      state: {},
    } as StreamEncryptor)

    crypto.xchacha20StreamDecryptorPush = jest.fn().mockReturnValue({ message: new Uint8Array([0xaa]), tag: 0 })

    crypto.xchacha20StreamInitEncryptor = jest.fn().mockReturnValue({
      header: 'some-header',
      state: {},
    } as StreamEncryptor)

    crypto.xchacha20StreamEncryptorPush = jest.fn().mockReturnValue(new Uint8Array())
  })

  it('should cache file after download', async () => {
    const file = {
      uuid: '1',
      decryptedSize: 100_000,
    } as jest.Mocked<SNFile>

    let downloadMock = apiService.downloadFile as jest.Mock

    await fileService.downloadFile(file, async () => {
      return Promise.resolve()
    })

    expect(downloadMock).toHaveBeenCalledTimes(1)

    downloadMock = apiService.downloadFile = jest.fn()

    await fileService.downloadFile(file, async () => {
      return Promise.resolve()
    })

    expect(downloadMock).toHaveBeenCalledTimes(0)

    expect(fileService['cache'].get(file.uuid)).toBeTruthy()
  })

  it('deleting file should remove it from cache', async () => {
    const file = {
      uuid: '1',
      decryptedSize: 100_000,
    } as jest.Mocked<SNFile>

    await fileService.downloadFile(file, async () => {
      return Promise.resolve()
    })

    await fileService.deleteFile(file)

    expect(fileService['cache'].get(file.uuid)).toBeFalsy()
  })
})
