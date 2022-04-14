import {
  DecryptedPayload,
  EncryptedPayload,
  FillItemContent,
  ItemsKeyContent,
} from '@standardnotes/models'
import { PayloadManager } from './PayloadManager'
import { InternalEventBusInterface } from '@standardnotes/services'
import { ContentType } from '@Lib/../../common/dist'

describe('payload manager', () => {
  let payloadManager: PayloadManager
  let internalEventBus: InternalEventBusInterface

  beforeEach(() => {
    internalEventBus = {} as jest.Mocked<InternalEventBusInterface>
    internalEventBus.publish = jest.fn()

    payloadManager = new PayloadManager(internalEventBus)
  })

  it('emitting ignored payload should merge timestamps to keep client in sync', async () => {
    const decrypted = new DecryptedPayload({
      uuid: '123',
      content_type: ContentType.ItemsKey,
      content: FillItemContent<ItemsKeyContent>({
        itemsKey: 'secret',
      }),
      updated_at_timestamp: 1,
    })

    await payloadManager.emitPayload(decrypted)

    const errored = new EncryptedPayload({
      uuid: '123',
      content_type: ContentType.ItemsKey,
      content: '004:...',
      updated_at_timestamp: 2,
      enc_item_key: '004:...',
      items_key_id: '456',
      errorDecrypting: true,
      waitingForKey: false,
    })

    await payloadManager.emitPayload(errored)

    const result = payloadManager.findOne('123')

    expect(result?.updated_at_timestamp).toBe(2)
    expect(result?.content).toBeInstanceOf(Object)
  })
})
