import {
  InternalEventBusInterface,
  SyncServiceInterface,
  ItemManagerInterface,
  AlertService,
  ApiServiceInterface,
} from '@standardnotes/services'
import { FileService } from './FileService'
import { PureCryptoInterface, StreamEncryptor } from '@standardnotes/sncrypto-common'
import { SNFile } from '@standardnotes/models'

describe('fileService', () => {
  let apiService: ApiServiceInterface
  let itemManager: ItemManagerInterface
  let syncService: SyncServiceInterface
  let alertService: AlertService
  let crypto: PureCryptoInterface
  let fileService: FileService
  let internalEventBus: InternalEventBusInterface

  beforeEach(() => {
    apiService = {} as jest.Mocked<ApiServiceInterface>
    apiService.addEventObserver = jest.fn()
    apiService.createFileValetToken = jest.fn()
    apiService.downloadFile = jest.fn()
    apiService.deleteFile = jest.fn().mockReturnValue({})

    itemManager = {} as jest.Mocked<ItemManagerInterface>
    itemManager.createItem = jest.fn()
    itemManager.createTemplateItem = jest.fn().mockReturnValue({})
    itemManager.setItemToBeDeleted = jest.fn()
    itemManager.addObserver = jest.fn()
    itemManager.changeItem = jest.fn()

    syncService = {} as jest.Mocked<SyncServiceInterface>
    syncService.sync = jest.fn()

    alertService = {} as jest.Mocked<AlertService>
    alertService.confirm = jest.fn().mockReturnValue(true)
    alertService.alert = jest.fn()

    crypto = {} as jest.Mocked<PureCryptoInterface>
    crypto.base64Decode = jest.fn()
    internalEventBus = {} as jest.Mocked<InternalEventBusInterface>
    internalEventBus.publish = jest.fn()

    fileService = new FileService(apiService, itemManager, syncService, alertService, crypto, internalEventBus)

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
