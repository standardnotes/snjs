import { NoteContent } from './../../../Syncable/Note/NoteContent'
import { ContentType } from '@standardnotes/common'
import { DecryptedItem, EncryptedItem } from '../../../Abstract/Item'
import { DecryptedPayload, EncryptedPayload, PayloadTimestampDefaults } from '../../../Abstract/Payload'
import { ItemCollection } from './ItemCollection'
import { FillItemContent } from '../../../Abstract/Content/ItemContent'

describe('item collection', () => {
  const createEncryptedPayload = (uuid?: string) => {
    return new EncryptedPayload({
      uuid: uuid || String(Math.random()),
      content_type: ContentType.Note,
      content: '004:...',
      enc_item_key: '004:...',
      items_key_id: '123',
      waitingForKey: true,
      errorDecrypting: true,
      ...PayloadTimestampDefaults(),
    })
  }

  const createDecryptedPayload = (uuid?: string): DecryptedPayload => {
    return new DecryptedPayload({
      uuid: uuid || String(Math.random()),
      content_type: ContentType.Note,
      content: FillItemContent<NoteContent>({
        title: 'foo',
      }),
      ...PayloadTimestampDefaults(),
    })
  }

  it('should not include encrypted items as displayable', () => {
    const payload = createEncryptedPayload()
    const item = new EncryptedItem(payload)

    const collection = new ItemCollection()
    collection.setDisplayOptions(ContentType.Note, 'title')
    collection.set(item)

    const results = collection.displayElements(ContentType.Note)

    expect(results).toHaveLength(0)
  })

  it('should remove item from map if previously decrypted but now encrypted', () => {
    const collection = new ItemCollection()
    collection.setDisplayOptions(ContentType.Note, 'title')

    const decryptedItem = new DecryptedItem(createDecryptedPayload())
    collection.set(decryptedItem)

    const encryptedItem = new EncryptedItem(createEncryptedPayload(decryptedItem.uuid))
    collection.set(encryptedItem)

    const results = collection.displayElements(ContentType.Note)

    expect(results).toHaveLength(0)
  })
})
