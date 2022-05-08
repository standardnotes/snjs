import { sortTwoItems } from './SortTwoItems'
import { createNoteWithContent } from '../../Utilities/Test/SpecUtils'
import { SNNote } from '../../Syncable/Note'

describe('sort two items', () => {
  it('should sort correctly by title', () => {
    const noteA = createNoteWithContent({ title: 'a' })
    const noteB = createNoteWithContent({ title: 'b' })

    expect(sortTwoItems(noteA, noteB, 'title', 'asc')).toEqual(-1)
    expect(sortTwoItems(noteA, noteB, 'title', 'dsc')).toEqual(1)
  })

  it('should sort correctly by title and pinned', () => {
    const noteA = createNoteWithContent({ title: 'a' })
    const noteB = { ...createNoteWithContent({ title: 'b' }), pinned: true } as jest.Mocked<SNNote>

    expect(sortTwoItems(noteA, noteB, 'title', 'asc')).toEqual(1)
    expect(sortTwoItems(noteA, noteB, 'title', 'dsc')).toEqual(1)
  })
})
