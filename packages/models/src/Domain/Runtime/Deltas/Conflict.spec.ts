import { ContentType } from '@standardnotes/common'
import { FillItemContent } from '../../Abstract/Content/ItemContent'
import { ConflictStrategy } from '../../Abstract/Item'
import {
  DecryptedPayload,
  EncryptedPayload,
  FullyFormedPayloadInterface,
} from '../../Abstract/Payload'
import { ItemsKeyContent } from '../../Syncable/ItemsKey/ItemsKeyInterface'
import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import { PayloadCollection } from '../Collection/Payload/PayloadCollection'
import { HistoryMap } from '../History'
import { ConflictDelta } from './Conflict'

describe('conflict delta', () => {
  const historyMap = {} as HistoryMap

  const createBaseCollection = (payload: FullyFormedPayloadInterface) => {
    const baseCollection = new PayloadCollection()
    baseCollection.set(payload)
    return ImmutablePayloadCollection.FromCollection(baseCollection)
  }

  const createDecryptedItemsKey = (uuid: string, key: string, timestamp = 0) => {
    return new DecryptedPayload<ItemsKeyContent>({
      uuid: uuid,
      content_type: ContentType.ItemsKey,
      content: FillItemContent<ItemsKeyContent>({
        itemsKey: key,
      }),
      updated_at_timestamp: timestamp,
    })
  }

  const createErroredItemsKey = (uuid: string, timestamp = 0) => {
    return new EncryptedPayload({
      uuid: uuid,
      content_type: ContentType.ItemsKey,
      content: '004:...',
      enc_item_key: '004:...',
      items_key_id: undefined,
      errorDecrypting: true,
      waitingForKey: false,
      updated_at_timestamp: timestamp,
    })
  }

  it('when apply is an items key, logic should be diverted to items key delta', () => {
    const basePayload = createDecryptedItemsKey('123', 'secret')

    const baseCollection = createBaseCollection(basePayload)

    const applyPayload = createDecryptedItemsKey('123', 'secret', 2)

    const delta = new ConflictDelta(baseCollection, basePayload, applyPayload, historyMap)

    const mocked = (delta.getConflictStrategy = jest.fn())

    delta.result()

    expect(mocked).toBeCalledTimes(0)
  })

  it('if either payload is errored, should keep base duplicate apply', () => {
    const basePayload = createDecryptedItemsKey('123', 'secret')

    const baseCollection = createBaseCollection(basePayload)

    const applyPayload = createErroredItemsKey('123', 2)

    const delta = new ConflictDelta(baseCollection, basePayload, applyPayload, historyMap)

    expect(delta.getConflictStrategy()).toBe(ConflictStrategy.KeepBaseDuplicateApply)
  })
})
