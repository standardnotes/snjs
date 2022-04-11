/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js'
chai.use(chaiAsPromised)
const expect = chai.expect

describe('payload collections', () => {
  before(async () => {
    localStorage.clear()
  })

  after(async () => {
    localStorage.clear()
  })

  const copyNote = (note, timestamp, changeUuid) => {
    return new SNNote(
      note.payload.copy({
        uuid: changeUuid ? Factory.generateUuidish() : note.payload.uuid,
        created_at: timestamp ? new Date(timestamp) : new Date(),
      }),
    )
  }

  it('find', async () => {
    const payload = Factory.createNotePayload()
    const collection = ImmutablePayloadCollection.WithPayloads([payload])
    expect(collection.find(payload.uuid)).to.be.ok
  })

  it('references', async () => {
    const payloads = Factory.createRelatedNoteTagPairPayload()
    const notePayload = payloads[0]
    const tagPayload = payloads[1]
    const collection = ImmutablePayloadCollection.WithPayloads([notePayload, tagPayload])
    const referencing = collection.elementsReferencingElement(notePayload)
    expect(referencing.length).to.equal(1)
  })

  it('references by content type', async () => {
    const [notePayload1, tagPayload1] = Factory.createRelatedNoteTagPairPayload()
    const collection = ImmutablePayloadCollection.WithPayloads([notePayload1, tagPayload1])
    const referencingTags = collection.elementsReferencingElement(notePayload1, ContentType.Tag)
    expect(referencingTags.length).to.equal(1)
    expect(referencingTags[0].uuid).to.equal(tagPayload1.uuid)

    const referencingNotes = collection.elementsReferencingElement(notePayload1, ContentType.Note)
    expect(referencingNotes.length).to.equal(0)
  })

  it('conflict map', async () => {
    const payload = Factory.createNotePayload()
    const collection = new PayloadCollection()
    collection.set([payload])
    const conflict = payload.copy({
      content: {
        conflict_of: payload.uuid,
        ...payload.content,
      },
    })
    collection.set([conflict])

    expect(collection.conflictsOf(payload.uuid)).to.eql([conflict])

    const manualResults = collection.all().find((p) => {
      return p.content.conflict_of === payload.uuid
    })
    expect(collection.conflictsOf(payload.uuid)).to.eql([manualResults])
  })

  it('setting same element twice should not yield duplicates', async () => {
    const collection = new PayloadCollection()
    const payload = Factory.createNotePayload()

    const copy = payload.copy()
    collection.set([payload, copy])
    collection.set([payload])
    collection.set([payload, copy])

    const sorted = collection.all(ContentType.Note)
    expect(sorted.length).to.equal(1)
  })

  it('display sort asc', async () => {
    const collection = new ItemCollection()

    collection.setDisplayOptions(ContentType.Note, CollectionSort.CreatedAt, 'asc')

    const present = Factory.createNote()

    const oldest = new SNNote(
      present.payload.copy({
        uuid: Factory.generateUuidish(),
        created_at: Factory.yesterday(),
      }),
    )

    const newest = new SNNote(
      present.payload.copy({
        uuid: Factory.generateUuidish(),
        created_at: Factory.tomorrow(),
      }),
    )

    collection.set([newest, oldest, present])
    const sorted = collection.displayElements(ContentType.Note)

    expect(sorted[0].uuid).to.equal(oldest.uuid)
    expect(sorted[1].uuid).to.equal(present.uuid)
    expect(sorted[2].uuid).to.equal(newest.uuid)
  })

  it('display sort dsc', async () => {
    const collection = new ItemCollection()

    collection.setDisplayOptions(ContentType.Note, CollectionSort.CreatedAt, 'dsc')

    const present = Factory.createNote()

    const oldest = new SNNote(
      present.payload.copy({
        uuid: Factory.generateUuidish(),
        created_at: Factory.yesterday(),
      }),
    )

    const newest = new SNNote(
      present.payload.copy({
        uuid: Factory.generateUuidish(),
        created_at: Factory.tomorrow(),
      }),
    )

    collection.set([oldest, newest, present])
    const sorted = collection.displayElements(ContentType.Note)

    expect(sorted[0].uuid).to.equal(newest.uuid)
    expect(sorted[1].uuid).to.equal(present.uuid)
    expect(sorted[2].uuid).to.equal(oldest.uuid)
  })

  it('display sort filter asc', async () => {
    const collection = new ItemCollection()
    const filterFor = 'fo'

    collection.setDisplayOptions(ContentType.Note, CollectionSort.CreatedAt, 'asc', (element) => {
      return element.content.title.includes(filterFor)
    })

    const passes1 = Factory.createNote('fo')
    const passes2 = Factory.createNote('foo')
    const fails = Factory.createNote('bar')

    collection.set([passes1, passes2, fails])
    const filtered = collection.displayElements(ContentType.Note)
    expect(filtered.length).to.equal(2)

    expect(filtered[0].content.title.includes(filterFor)).to.equal(true)
    expect(filtered[1].content.title.includes(filterFor)).to.equal(true)
  })

  it('deleting should remove from displayed elements', async () => {
    const collection = new ItemCollection()
    collection.setDisplayOptions(ContentType.Note, CollectionSort.CreatedAt, 'asc')

    const present = Factory.createNote()
    collection.set([present])

    expect(collection.all(ContentType.Note).length).to.equal(1)
    expect(collection.displayElements(ContentType.Note).length).to.equal(1)

    const deleted = new DeletedItem(
      new DeletedPayload(
        present.payload.copy({
          deleted: true,
        }),
      ),
    )

    collection.set([deleted])

    expect(collection.all(ContentType.Note).filter((n) => !n.deleted).length).to.equal(0)
    expect(collection.displayElements(ContentType.Note).length).to.equal(0)
  })

  it('changing element should update sort order', async () => {
    const collection = new ItemCollection()
    collection.setDisplayOptions(ContentType.Note, CollectionSort.CreatedAt, 'asc')
    const base = Factory.createNote()

    const note1 = copyNote(base, 1000, true)
    const note2 = copyNote(base, 2000, true)
    const note3 = copyNote(base, 3000, true)

    collection.set([note2, note1, note3])
    let displayed = collection.displayElements(ContentType.Note)

    expect(displayed[0].uuid).to.equal(note1.uuid)
    expect(displayed[1].uuid).to.equal(note2.uuid)
    expect(displayed[2].uuid).to.equal(note3.uuid)

    const changed2 = copyNote(note2, 4000, false)
    collection.set([changed2])

    displayed = collection.displayElements(ContentType.Note)
    expect(displayed.length).to.equal(3)

    expect(displayed[0].uuid).to.equal(note1.uuid)
    expect(displayed[1].uuid).to.equal(note3.uuid)
    expect(displayed[2].uuid).to.equal(note2.uuid)
  })

  it('pinning note should update sort', async () => {
    const collection = new ItemCollection()

    collection.setDisplayOptions(ContentType.Note, CollectionSort.CreatedAt, 'asc')

    const unpinned1 = Factory.createNote('fo')
    const unpinned2 = Factory.createNote('foo')

    collection.set([unpinned1, unpinned2])

    const sorted = collection.displayElements(ContentType.Note)

    expect(sorted[0].uuid).to.equal(unpinned1.uuid)
    expect(sorted[1].uuid).to.equal(unpinned2.uuid)

    const pinned2 = new SNNote(
      unpinned2.payload.copy({
        content: {
          ...unpinned1.content,
          appData: {
            [DecryptedItem.DefaultAppDomain()]: {
              pinned: true,
            },
          },
        },
      }),
    )

    collection.set(pinned2)

    const resorted = collection.displayElements(ContentType.Note)

    expect(resorted[0].uuid).to.equal(unpinned2.uuid)
    expect(resorted[1].uuid).to.equal(unpinned1.uuid)
  })

  it('encrypted items should not be returned in display elements', async () => {
    const collection = new ItemCollection()

    const regularNote1 = Factory.createNote('foo', 'noteText')

    const regularNote2 = Factory.createNote('foo', 'noteText2')

    const encryptedNote = new EncryptedItem(
      new EncryptedPayload({
        ...regularNote1.payload,
        errorDecrypting: true,
        content: '004:123',
        uuid: Factory.generateUuidish(),
      }),
    )

    collection.set([regularNote1, encryptedNote, regularNote2])
    collection.setDisplayOptions(ContentType.Note, CollectionSort.UpdatedAt, 'asc')

    const displayed = collection.displayElements(ContentType.Note)

    expect(displayed.length).to.equal(2)

    expect(displayed[0].text).to.equal('noteText')
    expect(displayed[1].text).to.equal('noteText2')
  })
})
