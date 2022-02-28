import {
  StorageKey,
  SNStorageService,
} from '@Lib/index'
import { SNWebSocketsService } from './websockets_service'

describe('webSocketsService', () => {
  const webSocketUrl = ''

  let storageService: SNStorageService

  const createService = () => {
    return new SNWebSocketsService(
      storageService,
      webSocketUrl,
    )
  }

  beforeEach(() => {
    storageService = {} as jest.Mocked<SNStorageService>
    storageService.setValue = jest.fn()
  })

  describe('setWebSocketUrl()', () => {
    it('saves url in local storage', async () => {
      const webSocketUrl = 'wss://test-websocket'
      await createService().setWebSocketUrl(webSocketUrl)
      expect(storageService.setValue).toHaveBeenCalledWith(StorageKey.WebSocketUrl, webSocketUrl)
    }) 
  })
})
