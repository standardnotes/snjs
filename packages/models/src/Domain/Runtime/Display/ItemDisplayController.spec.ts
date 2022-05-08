import { ContentType } from '@standardnotes/common'
import { createNoteWithContent } from '../../Utilities/Test/SpecUtils'
import { ItemCollection } from './../Collection/Item/ItemCollection'
import { ItemDisplayController } from './ItemDisplayController'

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
})
