import { ChallengeService } from '../Challenge/ChallengeService'
import { ItemManager } from '../Items/ItemManager'
import { SNProtocolService } from '../ProtocolService'
import { SNStorageService } from '../StorageService'
import { SNProtectionService } from './ProtectionService'
import {
  DeviceInterface,
  InternalEventBus,
  InternalEventBusInterface,
} from '@standardnotes/services'
import { UuidGenerator } from '@standardnotes/utils'
import { PayloadManager } from '../PayloadManager'
import { SNPureCrypto } from '@standardnotes/sncrypto-common'
import { SNFile } from '@Lib/models'
import { ContentType } from '@standardnotes/common'
import { FillItemContent, CreateMaxPayloadFromAnyObject } from '@standardnotes/payloads'

const setupRandomUuid = () => {
  UuidGenerator.SetGenerator(() => String(Math.random()))
}

describe('protectionService', () => {
  let protocolService: SNProtocolService
  let challengeService: ChallengeService
  let storageService: SNStorageService
  let itemManager: ItemManager
  let internalEventBus: InternalEventBusInterface
  let payloadManager: PayloadManager
  let deviceInterface: DeviceInterface
  let fakeCrypto: SNPureCrypto
  let protectionService: SNProtectionService

  const createService = () => {
    return new SNProtectionService(
      protocolService,
      challengeService,
      storageService,
      itemManager,
      internalEventBus,
    )
  }

  const createFile = (name: string, isProtected?: boolean) => {
    return new SNFile(
      CreateMaxPayloadFromAnyObject({
        uuid: String(Math.random()),
        content_type: ContentType.File,
        content: FillItemContent({
          name: name,
          protected: isProtected,
        }),
      }),
    )
  }

  beforeEach(() => {
    setupRandomUuid()

    internalEventBus = new InternalEventBus()

    payloadManager = new PayloadManager(internalEventBus)

    itemManager = new ItemManager(payloadManager, internalEventBus)

    deviceInterface = {} as jest.Mocked<DeviceInterface>

    storageService = {} as jest.Mocked<SNStorageService>
    storageService.getValue = jest.fn()

    fakeCrypto = {} as jest.Mocked<SNPureCrypto>

    protocolService = new SNProtocolService(
      itemManager,
      payloadManager,
      deviceInterface,
      storageService,
      'test',
      fakeCrypto,
      internalEventBus,
    )
  })

  describe('files', () => {
    it('only protected file should require auth', () => {
      protectionService = createService()

      const protectedFile = createFile('protected.txt', true)
      const unprotectedFile = createFile('unprotected.txt', false)

      const protectedFileNeedsAuthorization =
        protectedFile.protected && !protectionService.hasUnprotectedAccessSession()
      const unprotectedFileNeedsAuthorization =
        unprotectedFile.protected && !protectionService.hasUnprotectedAccessSession()

      expect(protectedFileNeedsAuthorization).toBe(true)
      expect(unprotectedFileNeedsAuthorization).toBe(false)
    })
  })
})
