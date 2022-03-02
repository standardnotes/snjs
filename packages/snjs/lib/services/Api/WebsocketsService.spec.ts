import { InternalEventBusInterface } from '@standardnotes/services'
import { StorageKey, SNStorageService } from '@Lib/index'
import { SNWebSocketsService } from './WebsocketsService'

describe('webSocketsService', () => {
  const webSocketUrl = ''

  let storageService: SNStorageService
  let internalEventBus: InternalEventBusInterface

  const createService = () => {
    return new SNWebSocketsService(storageService, webSocketUrl, internalEventBus)
  }

  beforeEach(() => {
    storageService = {} as jest.Mocked<SNStorageService>
    storageService.setValue = jest.fn()

    internalEventBus = {} as jest.Mocked<InternalEventBusInterface>
    internalEventBus.publish = jest.fn()
  })

  describe('setWebSocketUrl()', () => {
    it('saves url in local storage', async () => {
      const webSocketUrl = 'wss://test-websocket'
      await createService().setWebSocketUrl(webSocketUrl)
      expect(storageService.setValue).toHaveBeenCalledWith(StorageKey.WebSocketUrl, webSocketUrl)
    })
  })
})
