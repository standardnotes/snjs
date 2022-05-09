import { CreateItemDelta } from './../Index/ItemDelta'
import { DeletedPayload } from './../../Abstract/Payload/Implementations/DeletedPayload'
import { createTag, mockUuid, pinnedContent } from './../../Utilities/Test/SpecUtils'
import { ContentType } from '@standardnotes/common'
import { DeletedItem, EncryptedItem } from '../../Abstract/Item'
import { EncryptedPayload, PayloadTimestampDefaults } from '../../Abstract/Payload'
import { createNoteWithContent } from '../../Utilities/Test/SpecUtils'
import { ItemCollection } from './../Collection/Item/ItemCollection'
import { ItemDisplayController } from './ItemDisplayController'
import { SNNote } from '../../Syncable/Note'

describe('item display controller', () => {
  it('should sort items', () => {
    const collection = new ItemCollection()
    const noteA = createNoteWithContent({ title: 'a' })
    const noteB = createNoteWithContent({ title: 'b' })
    collection.set([noteA, noteB])

    const controller = new ItemDisplayController(collection, [ContentType.Note], 'title', 'asc')

    expect(controller.items()[0]).toEqual(noteA)
    expect(controller.items()[1]).toEqual(noteB)

    controller.setSortDirection('dsc')

    expect(controller.items()[0]).toEqual(noteB)
    expect(controller.items()[1]).toEqual(noteA)
  })

  it('should filter items', () => {
    const collection = new ItemCollection()
    const noteA = createNoteWithContent({ title: 'a' })
    const noteB = createNoteWithContent({ title: 'b' })
    collection.set([noteA, noteB])

    const controller = new ItemDisplayController(collection, [ContentType.Note], 'title', 'asc')
    controller.setCustomFilter((note) => {
      return note.title !== 'a'
    })

    expect(controller.items()).toHaveLength(1)
    expect(controller.items()[0].title).toEqual('b')
  })

  it('should resort items after collection change', () => {
    const collection = new ItemCollection()
    const noteA = createNoteWithContent({ title: 'a' })
    collection.set([noteA])

    const controller = new ItemDisplayController(collection, [ContentType.Note], 'title', 'asc')
    expect(controller.items()).toHaveLength(1)

    const noteB = createNoteWithContent({ title: 'b' })

    const delta = CreateItemDelta({ changed: [noteB] })
    collection.onChange(delta)
    controller.onCollectionChange(delta)

    expect(controller.items()).toHaveLength(2)
  })

  it('should not display encrypted items', () => {
    const collection = new ItemCollection()
    const noteA = new EncryptedItem(
      new EncryptedPayload({
        uuid: mockUuid(),
        content_type: ContentType.Note,
        content: '004:...',
        enc_item_key: '004:...',
        items_key_id: mockUuid(),
        errorDecrypting: true,
        waitingForKey: false,
        ...PayloadTimestampDefaults(),
      }),
    )
    collection.set([noteA])

    const controller = new ItemDisplayController(collection, [ContentType.Note], 'title', 'asc')

    expect(controller.items()).toHaveLength(0)
  })

  it('pinned items should come first', () => {
    const collection = new ItemCollection()
    const noteA = createNoteWithContent({ title: 'a' })
    const noteB = createNoteWithContent({ title: 'b' })
    collection.set([noteA, noteB])

    const controller = new ItemDisplayController(collection, [ContentType.Note], 'title', 'asc')

    expect(controller.items()[0]).toEqual(noteA)
    expect(controller.items()[1]).toEqual(noteB)

    expect(collection.all()).toHaveLength(2)

    const pinnedNoteB = new SNNote(
      noteB.payload.copy({
        content: {
          ...noteB.content,
          ...pinnedContent(),
        },
      }),
    )
    expect(pinnedNoteB.pinned).toBeTruthy()

    const delta = CreateItemDelta({ changed: [pinnedNoteB] })
    collection.onChange(delta)
    controller.onCollectionChange(delta)

    expect(controller.items()[0]).toEqual(pinnedNoteB)
    expect(controller.items()[1]).toEqual(noteA)
  })

  it('should not display deleted items', () => {
    const collection = new ItemCollection()
    const noteA = createNoteWithContent({ title: 'a' })
    collection.set([noteA])

    const controller = new ItemDisplayController(collection, [ContentType.Note], 'title', 'asc')

    const deletedItem = new DeletedItem(
      new DeletedPayload({
        ...noteA.payload,
        content: undefined,
        deleted: true,
      }),
    )

    const delta = CreateItemDelta({ changed: [deletedItem] })
    collection.onChange(delta)
    controller.onCollectionChange(delta)

    expect(controller.items()).toHaveLength(0)
  })

  it('discarding elements should remove from display', () => {
    const collection = new ItemCollection()
    const noteA = createNoteWithContent({ title: 'a' })
    collection.set([noteA])

    const controller = new ItemDisplayController(collection, [ContentType.Note], 'title', 'asc')

    const delta = CreateItemDelta({ discarded: [noteA] as unknown as DeletedItem[] })
    collection.onChange(delta)
    controller.onCollectionChange(delta)

    expect(controller.items()).toHaveLength(0)
  })

  it('should ignore items not matching content type on construction', () => {
    const collection = new ItemCollection()
    const note = createNoteWithContent({ title: 'a' })
    const tag = createTag()
    collection.set([note, tag])

    const controller = new ItemDisplayController(collection, [ContentType.Note], 'title', 'asc')
    expect(controller.items()).toHaveLength(1)
  })

  it('should ignore items not matching content type on sort change', () => {
    const collection = new ItemCollection()
    const note = createNoteWithContent({ title: 'a' })
    const tag = createTag()
    collection.set([note, tag])

    const controller = new ItemDisplayController(collection, [ContentType.Note], 'title', 'asc')
    controller.setSortBy('created_at')
    expect(controller.items()).toHaveLength(1)
  })

  it('should ignore collection deltas with items not matching content types', () => {
    const collection = new ItemCollection()
    const note = createNoteWithContent({ title: 'a' })
    collection.set([note])

    const controller = new ItemDisplayController(collection, [ContentType.Note], 'title', 'asc')
    const tag = createTag()

    const delta = CreateItemDelta({ inserted: [tag], changed: [note] })
    collection.onChange(delta)
    controller.onCollectionChange(delta)

    expect(controller.items()).toHaveLength(1)
  })
})
