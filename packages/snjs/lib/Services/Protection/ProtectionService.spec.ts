import { ChallengeService, ChallengeReason } from '../Challenge'
import { EncryptionService } from '@standardnotes/encryption'
import { SNStorageService } from '../Storage/StorageService'
import { SNProtectionService } from './ProtectionService'
import { InternalEventBus, InternalEventBusInterface } from '@standardnotes/services'
import { UuidGenerator } from '@standardnotes/utils'
import {
  DecryptedPayload,
  FileContent,
  SNFile,
  FillItemContent,
  PayloadTimestampDefaults,
} from '@standardnotes/models'
import { ContentType } from '@standardnotes/common'

const setupRandomUuid = () => {
  UuidGenerator.SetGenerator(() => String(Math.random()))
}

describe('protectionService', () => {
  let protocolService: EncryptionService
  let challengeService: ChallengeService
  let storageService: SNStorageService
  let internalEventBus: InternalEventBusInterface
  let protectionService: SNProtectionService

  const createService = () => {
    return new SNProtectionService(
      protocolService,
      challengeService,
      storageService,
      internalEventBus,
    )
  }

  const createFile = (name: string, isProtected?: boolean) => {
    return new SNFile(
      new DecryptedPayload({
        uuid: String(Math.random()),
        content_type: ContentType.File,
        content: FillItemContent<FileContent>({
          name: name,
          protected: isProtected,
        }),
        ...PayloadTimestampDefaults(),
      }),
    )
  }

  beforeEach(() => {
    setupRandomUuid()

    internalEventBus = {} as jest.Mocked<InternalEventBus>

    challengeService = {} as jest.Mocked<ChallengeService>
    challengeService.promptForChallengeResponse = jest.fn()

    storageService = {} as jest.Mocked<SNStorageService>
    storageService.getValue = jest.fn()

    protocolService = {} as jest.Mocked<EncryptionService>
    protocolService.hasAccount = jest.fn().mockReturnValue(true)
    protocolService.hasPasscode = jest.fn().mockReturnValue(false)
  })

  describe('files', () => {
    it('unprotected file should not require auth', async () => {
      protectionService = createService()

      const unprotectedFile = createFile('protected.txt', false)

      await protectionService.authorizeProtectedActionForFiles(
        [unprotectedFile],
        ChallengeReason.AccessProtectedFile,
      )

      expect(challengeService.promptForChallengeResponse).not.toHaveBeenCalled()
    })

    it('protected file should require auth', async () => {
      protectionService = createService()

      const protectedFile = createFile('protected.txt', true)

      await protectionService.authorizeProtectedActionForFiles(
        [protectedFile],
        ChallengeReason.AccessProtectedFile,
      )

      expect(challengeService.promptForChallengeResponse).toHaveBeenCalled()
    })

    it('array of files having one protected should require auth', async () => {
      protectionService = createService()

      const protectedFile = createFile('protected.txt', true)
      const unprotectedFile = createFile('unprotected.txt', false)

      await protectionService.authorizeProtectedActionForFiles(
        [protectedFile, unprotectedFile],
        ChallengeReason.AccessProtectedFile,
      )

      expect(challengeService.promptForChallengeResponse).toHaveBeenCalled()
    })

    it('array of files having none protected should not require auth', async () => {
      protectionService = createService()

      const protectedFile = createFile('protected.txt', false)
      const unprotectedFile = createFile('unprotected.txt', false)

      await protectionService.authorizeProtectedActionForFiles(
        [protectedFile, unprotectedFile],
        ChallengeReason.AccessProtectedFile,
      )

      expect(challengeService.promptForChallengeResponse).not.toHaveBeenCalled()
    })
  })
})
