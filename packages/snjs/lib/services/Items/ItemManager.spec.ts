import { SNFile } from '../../models/app/file'
import { ItemManager, SNItem } from '@Lib/index'
import { SNNote, NoteMutator } from '@Lib/models'
import { SmartView, SystemViewId } from '@Lib/models/app/SmartView'
import { SNTag, TagMutator } from '@Models/app/tag'
import {
  FillItemContent,
  CreateMaxPayloadFromAnyObject,
  predicateFromJson,
} from '@standardnotes/payloads'
import { UuidGenerator } from '@standardnotes/utils'
import { ContentType } from '@standardnotes/common'
import { NotesDisplayCriteria } from '../../protocol/collection/notes_display_criteria'
import { PayloadManager } from '../PayloadManager'
import { InternalEventBusInterface } from '@standardnotes/services'

const setupRandomUuid = () => {
  UuidGenerator.SetGenerator(() => String(Math.random()))
}

const VIEW_NOT_PINNED = '!["Not Pinned", "pinned", "=", false]'
const VIEW_LAST_DAY = '!["Last Day", "updated_at", ">", "1.days.ago"]'
const VIEW_LONG = '!["Long", "text.length", ">", 500]'

const NotPinnedPredicate = predicateFromJson<SNTag>({
  keypath: 'pinned',
  operator: '=',
  value: false,
})

const LastDayPredicate = predicateFromJson<SNTag>({
  keypath: 'updated_at',
  operator: '>',
  value: '1.days.ago',
})

const LongTextPredicate = predicateFromJson<SNTag>({
  keypath: 'text.length' as never,
  operator: '>',
  value: 500,
})

describe('itemManager', () => {
  let payloadManager: PayloadManager
  let itemManager: ItemManager
  let items: SNItem[]
  let internalEventBus: InternalEventBusInterface

  const createService = () => {
    return new ItemManager(payloadManager, internalEventBus)
  }

  beforeEach(() => {
    setupRandomUuid()

    internalEventBus = {} as jest.Mocked<InternalEventBusInterface>
    internalEventBus.publish = jest.fn()

    payloadManager = new PayloadManager(internalEventBus)

    items = [] as jest.Mocked<SNItem[]>
    itemManager = {} as jest.Mocked<ItemManager>
    itemManager.getItems = jest.fn().mockReturnValue(items)
    itemManager.createItem = jest.fn()
    itemManager.changeComponent = jest.fn().mockReturnValue({} as jest.Mocked<SNItem>)
    itemManager.setItemsToBeDeleted = jest.fn()
    itemManager.addObserver = jest.fn()
    itemManager.changeItem = jest.fn()
    itemManager.changeFeatureRepo = jest.fn()
  })

  const createTag = (title: string) => {
    return new SNTag(
      CreateMaxPayloadFromAnyObject({
        uuid: String(Math.random()),
        content_type: ContentType.Tag,
        content: FillItemContent({
          title: title,
        }),
      }),
    )
  }

  const createNote = (title: string) => {
    return new SNNote(
      CreateMaxPayloadFromAnyObject({
        uuid: String(Math.random()),
        content_type: ContentType.Note,
        content: FillItemContent({
          title: title,
        }),
      }),
    )
  }

  const createFile = (name: string) => {
    return new SNFile(
      CreateMaxPayloadFromAnyObject({
        uuid: String(Math.random()),
        content_type: ContentType.File,
        content: FillItemContent({
          name: name,
        }),
      }),
    )
  }

  describe('note display criteria', () => {
    it('viewing notes with tag', async () => {
      itemManager = createService()
      const tag = createTag('parent')
      const note = createNote('note')
      await itemManager.insertItems([tag, note])
      await itemManager.addNoteReferenceToTag(note, tag)

      const criteria = NotesDisplayCriteria.Create({
        tags: [tag],
      })
      itemManager.setNotesDisplayCriteria(criteria)

      const notes = itemManager.getDisplayableItems(ContentType.Note)
      expect(notes).toHaveLength(1)
    })
  })

  describe('tag relationships', () => {
    it('updates parentId of child tag', async () => {
      itemManager = createService()
      const parent = createTag('parent')
      const child = createTag('child')
      await itemManager.insertItems([parent, child])
      await itemManager.setTagParent(parent, child)

      const changedChild = itemManager.findItem(child.uuid) as SNTag
      expect(changedChild.parentId).toBe(parent.uuid)
    })

    it('forbids a tag to be its own parent', async () => {
      itemManager = createService()
      const tag = createTag('tag')
      await itemManager.insertItems([tag])

      expect(() => itemManager.setTagParent(tag, tag)).toThrow()
      expect(itemManager.getTagParent(tag.uuid)).toBeUndefined()
    })

    it('forbids a tag to be its own ancestor', async () => {
      itemManager = createService()
      const grandParent = createTag('grandParent')
      const parent = createTag('parent')
      const child = createTag('child')

      await itemManager.insertItems([child, parent, grandParent])
      await itemManager.setTagParent(parent, child)
      await itemManager.setTagParent(grandParent, parent)

      expect(() => itemManager.setTagParent(child, grandParent)).toThrow()
      expect(itemManager.getTagParent(grandParent.uuid)).toBeUndefined()
    })

    it('getTagParent', async () => {
      itemManager = createService()
      const parent = createTag('parent')
      const child = createTag('child')
      await itemManager.insertItems([parent, child])
      await itemManager.setTagParent(parent, child)

      expect(itemManager.getTagParent(child.uuid)?.uuid).toBe(parent.uuid)
    })

    it('findTagByTitleAndParent', async () => {
      itemManager = createService()
      const parent = createTag('name1')
      const child = createTag('childName')
      const duplicateNameChild = createTag('name1')

      await itemManager.insertItems([parent, child, duplicateNameChild])
      await itemManager.setTagParent(parent, child)
      await itemManager.setTagParent(parent, duplicateNameChild)

      const a = await itemManager.findTagByTitleAndParent('name1', undefined)
      const b = await itemManager.findTagByTitleAndParent('name1', parent?.uuid)
      const c = await itemManager.findTagByTitleAndParent('name1', child?.uuid)

      expect(a?.uuid).toEqual(parent.uuid)
      expect(b?.uuid).toEqual(duplicateNameChild.uuid)
      expect(c?.uuid).toEqual(undefined)
    })

    it('findOrCreateTagByTitle', async () => {
      setupRandomUuid()
      itemManager = createService()
      const parent = createTag('parent')
      const child = createTag('child')
      await itemManager.insertItems([parent, child])
      await itemManager.setTagParent(parent, child)

      const childA = await itemManager.findOrCreateTagByTitle('child')
      const childB = await itemManager.findOrCreateTagByTitle('child', parent.uuid)
      const childC = await itemManager.findOrCreateTagByTitle('child-bis', parent.uuid)
      const childD = await itemManager.findOrCreateTagByTitle('child-bis', parent.uuid)

      expect(childA.uuid).not.toEqual(child.uuid)
      expect(childB.uuid).toEqual(child.uuid)
      expect(childD.uuid).toEqual(childC.uuid)

      expect(itemManager.getTagParent(childA.uuid)?.uuid).toBe(undefined)
      expect(itemManager.getTagParent(childB.uuid)?.uuid).toBe(parent.uuid)
      expect(itemManager.getTagParent(childC.uuid)?.uuid).toBe(parent.uuid)
      expect(itemManager.getTagParent(childD.uuid)?.uuid).toBe(parent.uuid)
    })

    it('findOrCreateTagParentChain', async () => {
      itemManager = createService()
      const parent = createTag('parent')
      const child = createTag('child')

      await itemManager.insertItems([parent, child])
      await itemManager.setTagParent(parent, child)

      const a = await itemManager.findOrCreateTagParentChain(['parent'])
      const b = await itemManager.findOrCreateTagParentChain(['parent', 'child'])
      const c = await itemManager.findOrCreateTagParentChain(['parent', 'child2'])
      const d = await itemManager.findOrCreateTagParentChain(['parent2', 'child1'])

      expect(a?.uuid).toEqual(parent.uuid)
      expect(b?.uuid).toEqual(child.uuid)

      expect(c?.uuid).not.toEqual(parent.uuid)
      expect(c?.uuid).not.toEqual(child.uuid)
      expect(c?.parentId).toEqual(parent.uuid)

      expect(d?.uuid).not.toEqual(parent.uuid)
      expect(d?.uuid).not.toEqual(child.uuid)
      expect(d?.parentId).not.toEqual(parent.uuid)
    })

    it('isAncestor', async () => {
      itemManager = createService()
      const grandParent = createTag('grandParent')
      const parent = createTag('parent')
      const child = createTag('child')
      const another = createTag('another')

      await itemManager.insertItems([child, parent, grandParent, another])
      await itemManager.setTagParent(parent, child)
      await itemManager.setTagParent(grandParent, parent)

      expect(itemManager.isTagAncestor(grandParent.uuid, parent.uuid)).toEqual(true)
      expect(itemManager.isTagAncestor(grandParent.uuid, child.uuid)).toEqual(true)
      expect(itemManager.isTagAncestor(parent.uuid, child.uuid)).toEqual(true)

      expect(itemManager.isTagAncestor(parent.uuid, grandParent.uuid)).toBeFalsy()
      expect(itemManager.isTagAncestor(child.uuid, grandParent.uuid)).toBeFalsy()
      expect(itemManager.isTagAncestor(grandParent.uuid, grandParent.uuid)).toBeFalsy()

      expect(itemManager.isTagAncestor(another.uuid, grandParent.uuid)).toBeFalsy()
      expect(itemManager.isTagAncestor(child.uuid, another.uuid)).toBeFalsy()
      expect(itemManager.isTagAncestor(grandParent.uuid, another.uuid)).toBeFalsy()
    })

    it('unsetTagRelationship', async () => {
      itemManager = createService()
      const parent = createTag('parent')
      const child = createTag('child')
      await itemManager.insertItems([parent, child])
      await itemManager.setTagParent(parent, child)
      expect(itemManager.getTagParent(child.uuid)?.uuid).toBe(parent.uuid)

      await itemManager.unsetTagParent(child)

      expect(itemManager.getTagParent(child.uuid)).toBeUndefined()
    })

    it('getTagParentChain', async () => {
      itemManager = createService()
      const greatGrandParent = createTag('greatGrandParent')
      const grandParent = createTag('grandParent')
      const parent = createTag('parent')
      const child = createTag('child')
      await itemManager.insertItems([greatGrandParent, grandParent, parent, child])
      await itemManager.setTagParent(parent, child)
      await itemManager.setTagParent(grandParent, parent)
      await itemManager.setTagParent(greatGrandParent, grandParent)

      const uuidChain = itemManager.getTagParentChain(child.uuid).map((tag) => tag.uuid)

      expect(uuidChain).toHaveLength(3)
      expect(uuidChain).toEqual([greatGrandParent.uuid, grandParent.uuid, parent.uuid])
    })

    it('viewing notes for parent tag should not display notes of children', async () => {
      itemManager = createService()
      const parentTag = createTag('parent')
      const childTag = createTag('child')
      await itemManager.insertItems([parentTag, childTag])
      await itemManager.setTagParent(parentTag, childTag)

      const parentNote = createNote('parentNote')
      const childNote = createNote('childNote')
      await itemManager.insertItems([parentNote, childNote])

      await itemManager.addNoteReferenceToTag(parentNote, parentTag)
      await itemManager.addNoteReferenceToTag(childNote, childTag)

      const criteria = NotesDisplayCriteria.Create({
        tags: [parentTag],
      })
      itemManager.setNotesDisplayCriteria(criteria)

      const notes = itemManager.getDisplayableItems(ContentType.Note)
      expect(notes).toHaveLength(1)
    })

    it('adding a note to a tag hierarchy should add the note to its parent too', async () => {
      itemManager = createService()
      const parentTag = createTag('parent')
      const childTag = createTag('child')
      const note = createNote('note')

      await itemManager.insertItems([parentTag, childTag, note])
      await itemManager.setTagParent(parentTag, childTag)

      await itemManager.addTagToNote(note, childTag, true)

      const tags = itemManager.getSortedTagsForNote(note)

      expect(tags).toHaveLength(2)
      expect(tags[0].uuid).toEqual(childTag.uuid)
      expect(tags[1].uuid).toEqual(parentTag.uuid)
    })

    it('adding a note to a tag hierarchy should not add the note to its parent if hierarchy option is disabled', async () => {
      itemManager = createService()
      const parentTag = createTag('parent')
      const childTag = createTag('child')
      const note = createNote('note')

      await itemManager.insertItems([parentTag, childTag, note])
      await itemManager.setTagParent(parentTag, childTag)

      await itemManager.addTagToNote(note, childTag, false)

      const tags = itemManager.getSortedTagsForNote(note)

      expect(tags).toHaveLength(1)
      expect(tags[0].uuid).toEqual(childTag.uuid)
    })
  })

  describe('template items', () => {
    it('create template item', async () => {
      itemManager = createService()
      setupRandomUuid()

      const item = await itemManager.createTemplateItem(ContentType.Note, {
        title: 'hello',
        references: [],
      })

      expect(!!item).toEqual(true)
      /* Template items should never be added to the record */
      expect(itemManager.items).toHaveLength(0)
      expect(itemManager.notes).toHaveLength(0)
    })

    it('isTemplateItem return the correct value', async () => {
      itemManager = createService()
      setupRandomUuid()

      const item = await itemManager.createTemplateItem(ContentType.Note, {
        title: 'hello',
        references: [],
      })

      expect(itemManager.isTemplateItem(item)).toEqual(true)

      await itemManager.insertItem(item)

      expect(itemManager.isTemplateItem(item)).toEqual(false)
    })

    it('isTemplateItem return the correct value for system smart views', () => {
      itemManager = createService()
      setupRandomUuid()

      const [systemTag1, ...restOfSystemViews] = itemManager
        .getSmartViews()
        .filter((view) => Object.values(SystemViewId).includes(view.uuid as SystemViewId))

      const isSystemTemplate = itemManager.isTemplateItem(systemTag1)
      expect(isSystemTemplate).toEqual(false)

      const areTemplates = restOfSystemViews
        .map((tag) => itemManager.isTemplateItem(tag))
        .every((value) => !!value)
      expect(areTemplates).toEqual(false)
    })
  })

  describe('tags', () => {
    it('lets me create a regular tag with a clear API', async () => {
      itemManager = createService()
      setupRandomUuid()

      const tag = await itemManager.createTag('this is my new tag')

      expect(tag).toBeTruthy()
      expect(itemManager.isTemplateItem(tag)).toEqual(false)
    })

    it('should search tags correctly', async () => {
      itemManager = createService()
      setupRandomUuid()

      const foo = await itemManager.createTag('foo[')
      const foobar = await itemManager.createTag('foo[bar]')
      const bar = await itemManager.createTag('bar[')
      const barfoo = await itemManager.createTag('bar[foo]')
      const fooDelimiter = await itemManager.createTag('bar.foo')
      const barFooDelimiter = await itemManager.createTag('baz.bar.foo')
      const fooAttached = await itemManager.createTag('Foo')
      const note = createNote('note')
      await itemManager.insertItems([
        foo,
        foobar,
        bar,
        barfoo,
        fooDelimiter,
        barFooDelimiter,
        fooAttached,
        note,
      ])
      await itemManager.addNoteReferenceToTag(note, fooAttached)

      const fooResults = itemManager.searchTags('foo')
      expect(fooResults).toContainEqual(foo)
      expect(fooResults).toContainEqual(foobar)
      expect(fooResults).toContainEqual(barfoo)
      expect(fooResults).toContainEqual(fooDelimiter)
      expect(fooResults).toContainEqual(barFooDelimiter)
      expect(fooResults).not.toContainEqual(bar)
      expect(fooResults).not.toContainEqual(fooAttached)
    })
  })

  describe('tags notes index', () => {
    it('counts countable notes', async () => {
      itemManager = createService()

      const parentTag = createTag('parent')
      const childTag = createTag('child')
      await itemManager.insertItems([parentTag, childTag])
      await itemManager.setTagParent(parentTag, childTag)

      const parentNote = createNote('parentNote')
      const childNote = createNote('childNote')
      await itemManager.insertItems([parentNote, childNote])

      await itemManager.addNoteReferenceToTag(parentNote, parentTag)
      await itemManager.addNoteReferenceToTag(childNote, childTag)

      expect(itemManager.countableNotesForTag(parentTag)).toBe(1)
      expect(itemManager.countableNotesForTag(childTag)).toBe(1)
      expect(itemManager.allCountableNotesCount()).toBe(2)
    })

    it('archiving a note should update count index', async () => {
      itemManager = createService()

      const tag1 = createTag('tag 1')
      await itemManager.insertItems([tag1])

      const note1 = createNote('note 1')
      const note2 = createNote('note 2')
      await itemManager.insertItems([note1, note2])

      await itemManager.addNoteReferenceToTag(note1, tag1)
      await itemManager.addNoteReferenceToTag(note2, tag1)

      expect(itemManager.countableNotesForTag(tag1)).toBe(2)
      expect(itemManager.allCountableNotesCount()).toBe(2)

      await itemManager.changeItem<NoteMutator>(note1.uuid, (m) => {
        m.archived = true
      })

      expect(itemManager.allCountableNotesCount()).toBe(1)
      expect(itemManager.countableNotesForTag(tag1)).toBe(1)

      await itemManager.changeItem<NoteMutator>(note1.uuid, (m) => {
        m.archived = false
      })

      expect(itemManager.allCountableNotesCount()).toBe(2)
      expect(itemManager.countableNotesForTag(tag1)).toBe(2)
    })
  })

  describe('smart views', () => {
    it('lets me create a smart view', async () => {
      itemManager = createService()
      setupRandomUuid()

      const [view1, view2, view3] = await Promise.all([
        itemManager.createSmartView('Not Pinned', NotPinnedPredicate),
        itemManager.createSmartView('Last Day', LastDayPredicate),
        itemManager.createSmartView('Long', LongTextPredicate),
      ])

      expect(view1).toBeTruthy()
      expect(view2).toBeTruthy()
      expect(view3).toBeTruthy()

      expect(view1.content_type).toEqual(ContentType.SmartView)
      expect(view2.content_type).toEqual(ContentType.SmartView)
      expect(view3.content_type).toEqual(ContentType.SmartView)
    })

    it('lets me use a smart view', async () => {
      itemManager = createService()
      setupRandomUuid()

      const view = await itemManager.createSmartView('Not Pinned', NotPinnedPredicate)

      const notes = itemManager.notesMatchingSmartView(view)

      expect(notes).toEqual([])
    })

    it('lets me test if a title is a smart view', () => {
      itemManager = createService()
      setupRandomUuid()

      expect(itemManager.isSmartViewTitle(VIEW_NOT_PINNED)).toEqual(true)
      expect(itemManager.isSmartViewTitle(VIEW_LAST_DAY)).toEqual(true)
      expect(itemManager.isSmartViewTitle(VIEW_LONG)).toEqual(true)

      expect(itemManager.isSmartViewTitle('Helloworld')).toEqual(false)
      expect(itemManager.isSmartViewTitle('@^![ some title')).toEqual(false)
    })

    it('lets me create a smart view from the DSL', async () => {
      itemManager = createService()
      setupRandomUuid()

      const [tag1, tag2, tag3] = await Promise.all([
        itemManager.createSmartViewFromDSL(VIEW_NOT_PINNED),
        itemManager.createSmartViewFromDSL(VIEW_LAST_DAY),
        itemManager.createSmartViewFromDSL(VIEW_LONG),
      ])

      expect(tag1).toBeTruthy()
      expect(tag2).toBeTruthy()
      expect(tag3).toBeTruthy()

      expect(tag1.content_type).toEqual(ContentType.SmartView)
      expect(tag2.content_type).toEqual(ContentType.SmartView)
      expect(tag3.content_type).toEqual(ContentType.SmartView)
    })

    it('will create smart view or tags from the generic method', async () => {
      itemManager = createService()
      setupRandomUuid()

      const someTag = await itemManager.createTagOrSmartView('some-tag')
      const someView = await itemManager.createTagOrSmartView(VIEW_LONG)

      expect(someTag.content_type).toEqual(ContentType.Tag)
      expect(someView.content_type).toEqual(ContentType.SmartView)
    })
  })

  it('lets me rename a smart view', async () => {
    itemManager = createService()
    setupRandomUuid()

    const tag = await itemManager.createSmartView('Not Pinned', NotPinnedPredicate)

    await itemManager.changeItem<TagMutator>(tag.uuid, (m) => {
      m.title = 'New Title'
    })

    const view = itemManager.findItem(tag.uuid) as SmartView
    const views = itemManager.getSmartViews()

    expect(view.title).toEqual('New Title')
    expect(views.some((tag: SmartView) => tag.title === 'New Title')).toEqual(true)
  })

  it('lets me find a smart view', async () => {
    itemManager = createService()
    setupRandomUuid()

    const tag = await itemManager.createSmartView('Not Pinned', NotPinnedPredicate)

    const view = itemManager.findItem(tag.uuid) as SmartView

    expect(view).toBeDefined()
  })

  it('untagged notes smart view', async () => {
    itemManager = createService()
    setupRandomUuid()

    const view = itemManager.untaggedNotesSmartView

    const tag = createTag('tag')
    const untaggedNote = createNote('note')
    const taggedNote = createNote('taggedNote')
    await itemManager.insertItems([tag, untaggedNote, taggedNote])

    expect(itemManager.notesMatchingSmartView(view)).toHaveLength(2)

    await itemManager.addNoteReferenceToTag(taggedNote, tag)

    expect(itemManager.notesMatchingSmartView(view)).toHaveLength(1)

    expect(view).toBeDefined()
  })

  describe('files', () => {
    it('associates with note', async () => {
      itemManager = createService()
      const note = createNote('invoices')
      const file = createFile('invoice_1.pdf')
      await itemManager.insertItems([note, file])

      const resultingFile = await itemManager.associateFileWithNote(file, note)
      const references = resultingFile.references

      expect(references).toHaveLength(1)
      expect(references[0].uuid).toEqual(note.uuid)
    })

    it('disassociates with note', async () => {
      itemManager = createService()
      const note = createNote('invoices')
      const file = createFile('invoice_1.pdf')
      await itemManager.insertItems([note, file])

      const associatedFile = await itemManager.associateFileWithNote(file, note)
      const disassociatedFile = await itemManager.disassociateFileWithNote(associatedFile, note)
      const references = disassociatedFile.references

      expect(references).toHaveLength(0)
    })

    it('should get files associated with note', async () => {
      itemManager = createService()
      const note = createNote('invoices')
      const file = createFile('invoice_1.pdf')
      const secondFile = createFile('unrelated-file.xlsx')
      await itemManager.insertItems([note, file, secondFile])

      await itemManager.associateFileWithNote(file, note)

      const filesAssociatedWithNote = itemManager.getFilesForNote(note)

      expect(filesAssociatedWithNote).toHaveLength(1)
      expect(filesAssociatedWithNote[0].uuid).toBe(file.uuid)
    })

    it('should correctly rename file to filename that has extension', async () => {
      itemManager = createService()
      const file = createFile('initialName.ext')
      await itemManager.insertItems([file])

      const renamedFile = await itemManager.renameFile(file, 'anotherName.anotherExt')

      expect(renamedFile.name).toBe('anotherName.anotherExt')
    })

    it('should correctly rename extensionless file to filename that has extension', async () => {
      itemManager = createService()
      const file = createFile('initialName')
      await itemManager.insertItems([file])

      const renamedFile = await itemManager.renameFile(file, 'anotherName.anotherExt')

      expect(renamedFile.name).toBe('anotherName.anotherExt')
    })

    it('should correctly rename file to filename that does not have extension', async () => {
      itemManager = createService()
      const file = createFile('initialName.ext')
      await itemManager.insertItems([file])

      const renamedFile = await itemManager.renameFile(file, 'anotherName')

      expect(renamedFile.name).toBe('anotherName')
    })
  })
})
