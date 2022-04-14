/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js'
chai.use(chaiAsPromised)
const expect = chai.expect

describe('note display criteria', function () {
  beforeEach(async function () {
    this.payloadManager = new PayloadManager()
    this.itemManager = new ItemManager(this.payloadManager)

    this.createNote = async (title = 'hello', text = 'world') => {
      return this.itemManager.createItem(ContentType.Note, {
        title: title,
        text: text,
      })
    }

    this.createTag = async (notes = [], title = 'thoughts') => {
      const references = notes.map((note) => {
        return {
          uuid: note.uuid,
          content_type: note.content_type,
        }
      })
      return this.itemManager.createItem(ContentType.Tag, {
        title: title,
        references: references,
      })
    }
  })

  const emptyCollection = function () {
    const collection = new ItemCollection()
    collection.setDisplayOptions(ContentType.Note, CollectionSort.CreatedAt, 'asc')
    return collection
  }

  const collectionWithNotes = function (titles = [], bodies = []) {
    const collection = emptyCollection()
    const notes = []
    titles.forEach((title, index) => {
      notes.push(CreateDecryptedItemFromPayload(Factory.createNotePayload(title, bodies[index])))
    })
    collection.set(notes)
    return collection
  }

  it('display criteria copying', async function () {
    const criteria = NotesDisplayCriteria.Create({ includeArchived: true })
    const copy = NotesDisplayCriteria.Copy(criteria, { includeTrashed: true })
    expect(copy.includeArchived).to.equal(true)
    expect(copy.includeTrashed).to.equal(true)
  })

  it('string query title', async function () {
    const query = 'foo'
    const criteria = NotesDisplayCriteria.Create({
      searchQuery: { query: query },
    })
    const collection = collectionWithNotes(['hello', 'fobar', 'foobar', 'foo'])
    expect(notesMatchingCriteria(criteria, collection).length).to.equal(2)
  })

  it('string query text', async function () {
    const query = 'foo'
    const criteria = NotesDisplayCriteria.Create({
      searchQuery: { query: query },
    })
    const collection = collectionWithNotes(
      [undefined, undefined, undefined, undefined],
      ['hello', 'fobar', 'foobar', 'foo'],
    )
    expect(notesMatchingCriteria(criteria, collection).length).to.equal(2)
  })

  it('string query title and text', async function () {
    const query = 'foo'
    const criteria = NotesDisplayCriteria.Create({
      searchQuery: { query: query },
    })
    const collection = collectionWithNotes(['hello', 'foobar'], ['foo', 'fobar'])
    expect(notesMatchingCriteria(criteria, collection).length).to.equal(2)
  })

  it('includePinned off', async function () {
    await this.createNote()
    const pendingPin = await this.createNote()
    await this.itemManager.changeItem(pendingPin, (mutator) => {
      mutator.pinned = true
    })
    const criteria = NotesDisplayCriteria.Create({
      includePinned: false,
    })
    expect(notesMatchingCriteria(criteria, this.itemManager.collection).length).to.equal(1)
  })

  it('includePinned on', async function () {
    await this.createNote()
    const pendingPin = await this.createNote()
    await this.itemManager.changeItem(pendingPin, (mutator) => {
      mutator.pinned = true
    })
    const criteria = NotesDisplayCriteria.Create({ includePinned: true })
    expect(notesMatchingCriteria(criteria, this.itemManager.collection).length).to.equal(2)
  })

  it('includeTrashed off', async function () {
    await this.createNote()
    const pendingTrash = await this.createNote()
    await this.itemManager.changeItem(pendingTrash, (mutator) => {
      mutator.trashed = true
    })
    const criteria = NotesDisplayCriteria.Create({ includeTrashed: false })
    expect(notesMatchingCriteria(criteria, this.itemManager.collection).length).to.equal(1)
  })

  it('includeTrashed on', async function () {
    await this.createNote()
    const pendingTrash = await this.createNote()
    await this.itemManager.changeItem(pendingTrash, (mutator) => {
      mutator.trashed = true
    })
    const criteria = NotesDisplayCriteria.Create({ includeTrashed: true })
    expect(notesMatchingCriteria(criteria, this.itemManager.collection).length).to.equal(2)
  })

  it('includeArchived off', async function () {
    await this.createNote()
    const pendingArchive = await this.createNote()
    await this.itemManager.changeItem(pendingArchive, (mutator) => {
      mutator.archived = true
    })
    const criteria = NotesDisplayCriteria.Create({ includeArchived: false })
    expect(notesMatchingCriteria(criteria, this.itemManager.collection).length).to.equal(1)
  })

  it('includeArchived on', async function () {
    await this.createNote()
    const pendingArchive = await this.createNote()
    await this.itemManager.changeItem(pendingArchive, (mutator) => {
      mutator.archived = true
    })
    const criteria = NotesDisplayCriteria.Create({
      includeArchived: true,
    })
    expect(notesMatchingCriteria(criteria, this.itemManager.collection).length).to.equal(2)
  })

  it('includeProtected off', async function () {
    await this.createNote()
    const pendingProtected = await this.createNote()
    await this.itemManager.changeItem(pendingProtected, (mutator) => {
      mutator.protected = true
    })
    const criteria = NotesDisplayCriteria.Create({ includeProtected: false })
    expect(notesMatchingCriteria(criteria, this.itemManager.collection).length).to.equal(1)
  })

  it('includeProtected on', async function () {
    await this.createNote()
    const pendingProtected = await this.createNote()
    await this.itemManager.changeItem(pendingProtected, (mutator) => {
      mutator.protected = true
    })
    const criteria = NotesDisplayCriteria.Create({
      includeProtected: true,
    })
    expect(notesMatchingCriteria(criteria, this.itemManager.collection).length).to.equal(2)
  })

  it('protectedSearchEnabled false', async function () {
    const normal = await this.createNote('hello', 'world')
    await this.itemManager.changeItem(normal, (mutator) => {
      mutator.protected = true
    })
    const criteria = NotesDisplayCriteria.Create({
      searchQuery: { query: 'world', includeProtectedNoteText: false },
    })
    expect(notesMatchingCriteria(criteria, this.itemManager.collection).length).to.equal(0)
  })

  it('protectedSearchEnabled true', async function () {
    const normal = await this.createNote()
    await this.itemManager.changeItem(normal, (mutator) => {
      mutator.protected = true
    })
    const criteria = NotesDisplayCriteria.Create({
      searchQuery: { query: 'world', includeProtectedNoteText: true },
    })
    expect(notesMatchingCriteria(criteria, this.itemManager.collection).length).to.equal(1)
  })

  it('tags', async function () {
    const note = await this.createNote()
    const tag = await this.createTag([note])
    const looseTag = await this.createTag([], 'loose')

    const matchingCriteria = NotesDisplayCriteria.Create({
      tags: [tag],
    })
    expect(notesMatchingCriteria(matchingCriteria, this.itemManager.collection).length).to.equal(1)

    const nonmatchingCriteria = NotesDisplayCriteria.Create({
      tags: [looseTag],
    })
    expect(notesMatchingCriteria(nonmatchingCriteria, this.itemManager.collection).length).to.equal(
      0,
    )
  })

  describe('smart views', function () {
    it('normal note', async function () {
      await this.createNote()
      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.allNotesSmartView],
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(1)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.trashSmartView],
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(0)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.archivedSmartView],
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(0)
    })

    it('trashed note', async function () {
      const normal = await this.createNote()
      await this.itemManager.changeItem(normal, (mutator) => {
        mutator.trashed = true
      })

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.allNotesSmartView],
            includeTrashed: false,
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(0)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.trashSmartView],
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(1)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.archivedSmartView],
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(0)
    })

    it('archived note', async function () {
      const normal = await this.createNote()
      await this.itemManager.changeItem(normal, (mutator) => {
        mutator.trashed = false
        mutator.archived = true
      })
      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.allNotesSmartView],
            includeArchived: false,
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(0)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.trashSmartView],
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(0)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.archivedSmartView],
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(1)
    })

    it('archived + trashed note', async function () {
      const normal = await this.createNote()
      await this.itemManager.changeItem(normal, (mutator) => {
        mutator.trashed = true
        mutator.archived = true
      })

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.allNotesSmartView],
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(1)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.trashSmartView],
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(1)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.archivedSmartView],
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(1)
    })
  })

  describe('includeTrash', function () {
    it('normal note', async function () {
      await this.createNote()

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.allNotesSmartView],
            includeTrashed: true,
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(1)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.trashSmartView],
            includeTrashed: true,
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(0)
    })

    it('trashed note', async function () {
      const normal = await this.createNote()

      await this.itemManager.changeItem(normal, (mutator) => {
        mutator.trashed = true
      })

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.allNotesSmartView],
            includeTrashed: false,
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(0)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.allNotesSmartView],
            includeTrashed: true,
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(1)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.trashSmartView],
            includeTrashed: true,
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(1)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.archivedSmartView],
            includeTrashed: true,
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(0)
    })

    it('archived + trashed note', async function () {
      const normal = await this.createNote()

      await this.itemManager.changeItem(normal, (mutator) => {
        mutator.trashed = true
        mutator.archived = true
      })

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.allNotesSmartView],
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(1)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.trashSmartView],
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(1)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.archivedSmartView],
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(1)
    })
  })

  describe('includeArchived', function () {
    it('normal note', async function () {
      await this.createNote()

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.allNotesSmartView],
            includeArchived: true,
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(1)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.trashSmartView],
            includeArchived: true,
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(0)
    })

    it('archived note', async function () {
      const normal = await this.createNote()
      await this.itemManager.changeItem(normal, (mutator) => {
        mutator.archived = true
      })

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.allNotesSmartView],
            includeArchived: false,
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(0)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.allNotesSmartView],
            includeArchived: true,
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(1)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.trashSmartView],
            includeArchived: true,
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(0)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.archivedSmartView],
            includeArchived: false,
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(1)
    })

    it('archived + trashed note', async function () {
      const normal = await this.createNote()
      await this.itemManager.changeItem(normal, (mutator) => {
        mutator.trashed = true
        mutator.archived = true
      })

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.allNotesSmartView],
            includeArchived: true,
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(1)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.trashSmartView],
            includeArchived: true,
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(1)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.archivedSmartView],
            includeArchived: true,
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(1)
    })
  })

  describe.skip('multiple tags', function () {
    it('normal note', async function () {
      await this.createNote()

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [
              this.itemManager.allNotesSmartView,
              this.itemManager.archivedSmartView,
              this.itemManager.trashSmartView,
            ],
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(1)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.trashSmartView],
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(0)
    })

    it('archived note', async function () {
      const normal = await this.createNote()
      await this.itemManager.changeItem(normal, (mutator) => {
        mutator.archived = true
      })

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.allNotesSmartView],
            includeArchived: false,
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(0)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.allNotesSmartView],
            includeArchived: true,
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(1)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.trashSmartView],
            includeArchived: true,
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(0)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.archivedSmartView],
            includeArchived: false,
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(1)
    })

    it('archived + trashed note', async function () {
      const normal = await this.createNote()
      await this.itemManager.changeItem(normal, (mutator) => {
        mutator.trashed = true
        mutator.archived = true
      })

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.allNotesSmartView],
            includeArchived: true,
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(0)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.trashSmartView],
            includeArchived: true,
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(1)

      expect(
        notesMatchingCriteria(
          NotesDisplayCriteria.Create({
            views: [this.itemManager.archivedSmartView],
            includeArchived: true,
          }),
          this.itemManager.collection,
        ).length,
      ).to.equal(0)
    })
  })
})
