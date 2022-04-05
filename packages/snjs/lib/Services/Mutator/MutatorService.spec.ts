import { NoteContent, SNNote } from '@standardnotes/models'
import { EncryptionService } from '@standardnotes/encryption'
import { ContentType } from '@standardnotes/common'
import { FillItemContent } from '@standardnotes/models'
import { InternalEventBusInterface } from '@standardnotes/services'
import {
  ChallengeService,
  MutatorService,
  PayloadManager,
  SNComponentManager,
  SNProtectionService,
  ItemManager,
  SNSyncService,
} from '../'
import { UuidGenerator } from '@standardnotes/utils'

const setupRandomUuid = () => {
  UuidGenerator.SetGenerator(() => String(Math.random()))
}

describe('mutator service', () => {
  let mutatorService: MutatorService
  let payloadManager: PayloadManager
  let itemManager: ItemManager
  let syncService: SNSyncService
  let protectionService: SNProtectionService
  let protocolService: EncryptionService
  let challengeService: ChallengeService
  let componentManager: SNComponentManager

  let internalEventBus: InternalEventBusInterface

  beforeEach(() => {
    setupRandomUuid()
    internalEventBus = {} as jest.Mocked<InternalEventBusInterface>
    internalEventBus.publish = jest.fn()

    payloadManager = new PayloadManager(internalEventBus)
    itemManager = new ItemManager(payloadManager, internalEventBus)

    mutatorService = new MutatorService(
      itemManager,
      syncService,
      protectionService,
      protocolService,
      payloadManager,
      challengeService,
      componentManager,
      internalEventBus,
    )
  })

  const insertNote = (title: string) => {
    const note = new SNNote(
      CreateMaxPayloadFromAnyObject({
        uuid: String(Math.random()),
        content_type: ContentType.Note,
        content: FillItemContent<NoteContent>({
          title: title,
        }),
      }),
    )
    return mutatorService.insertItem(note)
  }

  describe('note modifications', () => {
    it('pinning should not update timestamps', async () => {
      const note = await insertNote('hello')
      const pinnedNote = await mutatorService.changeItem(
        note,
        (mutator) => {
          mutator.pinned = true
        },
        false,
      )

      expect(note.userModifiedDate).toEqual(pinnedNote?.userModifiedDate)
    })
  })
})
