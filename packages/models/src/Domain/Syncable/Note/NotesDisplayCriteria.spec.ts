import { createNoteWithContent } from './../../Utilities/Test/SpecUtils'
import { ItemCollection } from '../../Runtime/Collection/Item/ItemCollection'
import { NotesDisplayCriteria, notesMatchingCriteria } from './NotesDisplayCriteria'
import { SNNote } from './Note'

describe('notes display criteria', () => {
  const collectionWithNotes = function (titles: (string | undefined)[] = [], bodies: string[] = []) {
    const collection = new ItemCollection()
    const notes: SNNote[] = []
    titles.forEach((title, index) => {
      notes.push(
        createNoteWithContent({
          title: title,
          text: bodies[index],
        }),
      )
    })
    collection.set(notes)
    return collection
  }

  it('display criteria copying', async function () {
    const criteria = NotesDisplayCriteria.Create({ includeArchived: true })
    const copy = NotesDisplayCriteria.Copy(criteria, { includeTrashed: true })
    expect(copy.includeArchived).toBeTruthy()
    expect(copy.includeTrashed).toBeTruthy()
  })

  it('string query title', () => {
    const query = 'foo'

    const criteria = NotesDisplayCriteria.Create({
      searchQuery: { query: query, includeProtectedNoteText: true },
    })
    const collection = collectionWithNotes(['hello', 'fobar', 'foobar', 'foo'])
    expect(notesMatchingCriteria(criteria, collection.all() as SNNote[], collection)).toHaveLength(2)
  })

  it('string query text', async function () {
    const query = 'foo'
    const criteria = NotesDisplayCriteria.Create({
      searchQuery: { query: query, includeProtectedNoteText: true },
    })
    const collection = collectionWithNotes(
      [undefined, undefined, undefined, undefined],
      ['hello', 'fobar', 'foobar', 'foo'],
    )
    expect(notesMatchingCriteria(criteria, collection.all() as SNNote[], collection)).toHaveLength(2)
  })

  it('string query title and text', async function () {
    const query = 'foo'
    const criteria = NotesDisplayCriteria.Create({
      searchQuery: { query: query, includeProtectedNoteText: true },
    })
    const collection = collectionWithNotes(['hello', 'foobar'], ['foo', 'fobar'])
    expect(notesMatchingCriteria(criteria, collection.all() as SNNote[], collection)).toHaveLength(2)
  })
})
