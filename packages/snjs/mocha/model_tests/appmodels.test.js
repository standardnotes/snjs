/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from '../lib/factory.js'
chai.use(chaiAsPromised)
const expect = chai.expect

describe('app models', () => {
  const BASE_ITEM_COUNT = 2 /** Default items key, user preferences */
  const sharedApplication = Factory.createApplicationWithFakeCrypto()

  before(async function () {
    localStorage.clear()
    await Factory.initializeApplication(sharedApplication)
  })

  after(async function () {
    localStorage.clear()
    await Factory.safeDeinit(sharedApplication)
  })

  beforeEach(async function () {
    this.expectedItemCount = BASE_ITEM_COUNT
    this.application = await Factory.createInitAppWithFakeCrypto()
  })

  afterEach(async function () {
    await Factory.safeDeinit(this.application)
  })

  it('payloadManager should be defined', () => {
    expect(sharedApplication.payloadManager).to.be.ok
  })

  it('item should be defined', () => {
    expect(SNItem).to.be.ok
  })

  it('item content should be assigned', () => {
    const params = Factory.createNotePayload()
    const item = CreateItemFromPayload(params)
    expect(item.content.title).to.equal(params.content.title)
  })

  it('should default updated_at to 1970 and created_at to the present', () => {
    const params = Factory.createNotePayload()
    const item = CreateItemFromPayload(params)
    const epoch = new Date(0)
    expect(item.serverUpdatedAt - epoch).to.equal(0)
    expect(item.created_at - epoch).to.be.above(0)
    expect(new Date() - item.created_at).to.be.below(5) // < 5ms
  })

  it('handles delayed mapping', async function () {
    const params1 = Factory.createNotePayload()
    const params2 = Factory.createNotePayload()

    const mutated = CreateMaxPayloadFromAnyObject(params1, {
      content: {
        ...params1.safeContent,
        references: [
          {
            uuid: params2.uuid,
            content_type: params2.content_type,
          },
        ],
      },
    })

    await this.application.itemManager.emitItemsFromPayloads([mutated], PayloadSource.LocalChanged)
    await this.application.itemManager.emitItemsFromPayloads([params2], PayloadSource.LocalChanged)

    const item1 = this.application.itemManager.findItem(params1.uuid)
    const item2 = this.application.itemManager.findItem(params2.uuid)

    expect(item1.content.references.length).to.equal(1)
    expect(item2.content.references.length).to.equal(0)

    expect(this.application.itemManager.itemsReferencingItem(item1.uuid).length).to.equal(0)
    expect(this.application.itemManager.itemsReferencingItem(item2.uuid).length).to.equal(1)
  })

  it('mapping an item twice shouldnt cause problems', async function () {
    const payload = Factory.createNotePayload()
    const mutated = CreateMaxPayloadFromAnyObject(payload, {
      content: {
        ...payload.safeContent,
        foo: 'bar',
      },
    })

    let items = await this.application.itemManager.emitItemsFromPayloads(
      [mutated],
      PayloadSource.LocalChanged,
    )
    let item = items[0]
    expect(item).to.be.ok

    items = await this.application.itemManager.emitItemsFromPayloads(
      [mutated],
      PayloadSource.LocalChanged,
    )
    item = items[0]

    expect(item.content.foo).to.equal('bar')
    expect(this.application.itemManager.notes.length).to.equal(1)
  })

  it('mapping item twice should preserve references', async function () {
    const item1 = await Factory.createMappedNote(this.application)
    const item2 = await Factory.createMappedNote(this.application)

    await this.application.itemManager.changeItem(item1.uuid, (mutator) => {
      mutator.addItemAsRelationship(item2)
    })
    await this.application.itemManager.changeItem(item2.uuid, (mutator) => {
      mutator.addItemAsRelationship(item1)
    })

    const refreshedItem = this.application.itemManager.findItem(item1.uuid)
    expect(refreshedItem.content.references.length).to.equal(1)
  })

  it('fixes relationship integrity', async function () {
    var item1 = await Factory.createMappedNote(this.application)
    var item2 = await Factory.createMappedNote(this.application)

    await this.application.itemManager.changeItem(item1.uuid, (mutator) => {
      mutator.addItemAsRelationship(item2)
    })
    await this.application.itemManager.changeItem(item2.uuid, (mutator) => {
      mutator.addItemAsRelationship(item1)
    })

    const refreshedItem1 = this.application.itemManager.findItem(item1.uuid)
    const refreshedItem2 = this.application.itemManager.findItem(item2.uuid)

    expect(refreshedItem1.content.references.length).to.equal(1)
    expect(refreshedItem2.content.references.length).to.equal(1)

    const damagedPayload = CopyPayload(refreshedItem1.payload, {
      content: {
        ...refreshedItem1.safeContent,
        // damage references of one object
        references: [],
      },
    })
    await this.application.itemManager.emitItemsFromPayloads(
      [damagedPayload],
      PayloadSource.LocalChanged,
    )

    const refreshedItem1_2 = this.application.itemManager.findItem(item1.uuid)
    const refreshedItem2_2 = this.application.itemManager.findItem(item2.uuid)

    expect(refreshedItem1_2.content.references.length).to.equal(0)
    expect(refreshedItem2_2.content.references.length).to.equal(1)
  })

  it('creating and removing relationships between two items should have valid references', async function () {
    var item1 = await Factory.createMappedNote(this.application)
    var item2 = await Factory.createMappedNote(this.application)
    await this.application.itemManager.changeItem(item1.uuid, (mutator) => {
      mutator.addItemAsRelationship(item2)
    })
    await this.application.itemManager.changeItem(item2.uuid, (mutator) => {
      mutator.addItemAsRelationship(item1)
    })

    const refreshedItem1 = this.application.itemManager.findItem(item1.uuid)
    const refreshedItem2 = this.application.itemManager.findItem(item2.uuid)

    expect(refreshedItem1.content.references.length).to.equal(1)
    expect(refreshedItem2.content.references.length).to.equal(1)

    expect(this.application.itemManager.itemsReferencingItem(item1.uuid)).to.include(refreshedItem2)
    expect(this.application.itemManager.itemsReferencingItem(item2.uuid)).to.include(refreshedItem1)

    await this.application.itemManager.changeItem(item1.uuid, (mutator) => {
      mutator.removeItemAsRelationship(item2)
    })
    await this.application.itemManager.changeItem(item2.uuid, (mutator) => {
      mutator.removeItemAsRelationship(item1)
    })

    const refreshedItem1_2 = this.application.itemManager.findItem(item1.uuid)
    const refreshedItem2_2 = this.application.itemManager.findItem(item2.uuid)

    expect(refreshedItem1_2.content.references.length).to.equal(0)
    expect(refreshedItem2_2.content.references.length).to.equal(0)

    expect(this.application.itemManager.itemsReferencingItem(item1.uuid).length).to.equal(0)
    expect(this.application.itemManager.itemsReferencingItem(item2.uuid).length).to.equal(0)
  })

  it('properly duplicates item with no relationships', async function () {
    const item = await Factory.createMappedNote(this.application)
    const duplicate = await this.application.itemManager.duplicateItem(item.uuid)
    expect(duplicate.uuid).to.not.equal(item.uuid)
    expect(item.isItemContentEqualWith(duplicate)).to.equal(true)
    expect(item.created_at.toISOString()).to.equal(duplicate.created_at.toISOString())
    expect(item.content_type).to.equal(duplicate.content_type)
  })

  it('properly duplicates item with relationships', async function () {
    const item1 = await Factory.createMappedNote(this.application)
    const item2 = await Factory.createMappedNote(this.application)

    const refreshedItem1 = await this.application.itemManager.changeItem(item1.uuid, (mutator) => {
      mutator.addItemAsRelationship(item2)
    })

    expect(refreshedItem1.content.references.length).to.equal(1)

    const duplicate = await this.application.itemManager.duplicateItem(item1.uuid)
    expect(duplicate.uuid).to.not.equal(item1.uuid)
    expect(duplicate.content.references.length).to.equal(1)

    expect(this.application.itemManager.itemsReferencingItem(item1.uuid).length).to.equal(0)
    expect(this.application.itemManager.itemsReferencingItem(item2.uuid).length).to.equal(2)

    const refreshedItem1_2 = this.application.itemManager.findItem(item1.uuid)
    expect(refreshedItem1_2.isItemContentEqualWith(duplicate)).to.equal(true)
    expect(refreshedItem1_2.created_at.toISOString()).to.equal(duplicate.created_at.toISOString())
    expect(refreshedItem1_2.content_type).to.equal(duplicate.content_type)
  })

  it('removing references should update cross-refs', async function () {
    const item1 = await Factory.createMappedNote(this.application)
    const item2 = await Factory.createMappedNote(this.application)
    const refreshedItem1 = await this.application.itemManager.changeItem(item1.uuid, (mutator) => {
      mutator.addItemAsRelationship(item2)
    })

    const refreshedItem1_2 = await this.application.itemManager.emitItemFromPayload(
      refreshedItem1.payloadRepresentation({
        deleted: true,
        content: {
          ...refreshedItem1.payload.safeContent,
          references: [],
        },
      }),
      PayloadSource.LocalSaved,
    )

    expect(this.application.itemManager.itemsReferencingItem(item2.uuid).length).to.equal(0)
    expect(this.application.itemManager.itemsReferencingItem(item1.uuid).length).to.equal(0)
    expect(refreshedItem1_2.content.references.length).to.equal(0)
  })

  it('properly handles single item uuid alternation', async function () {
    const item1 = await Factory.createMappedNote(this.application)
    const item2 = await Factory.createMappedNote(this.application)

    const refreshedItem1 = await this.application.itemManager.changeItem(item1.uuid, (mutator) => {
      mutator.addItemAsRelationship(item2)
    })

    expect(refreshedItem1.content.references.length).to.equal(1)
    expect(this.application.itemManager.itemsReferencingItem(item2.uuid).length).to.equal(1)

    const alternatedItem = await Factory.alternateUuidForItem(this.application, item1.uuid)
    const refreshedItem1_2 = this.application.itemManager.findItem(item1.uuid)
    expect(refreshedItem1_2).to.not.be.ok

    expect(this.application.itemManager.notes.length).to.equal(2)

    expect(alternatedItem.content.references.length).to.equal(1)
    expect(this.application.itemManager.itemsReferencingItem(alternatedItem.uuid).length).to.equal(
      0,
    )

    expect(this.application.itemManager.itemsReferencingItem(item2.uuid).length).to.equal(1)

    expect(alternatedItem.hasRelationshipWithItem(item2)).to.equal(true)
    expect(alternatedItem.dirty).to.equal(true)
  })

  it('alterating uuid of item should fill its duplicateOf value', async function () {
    const item1 = await Factory.createMappedNote(this.application)
    const alternatedItem = await Factory.alternateUuidForItem(this.application, item1.uuid)
    expect(alternatedItem.duplicateOf).to.equal(item1.uuid)
  })

  it('alterating itemskey uuid should update errored items encrypted with that key', async function () {
    const item1 = await Factory.createMappedNote(this.application)
    const itemsKey = this.application.itemManager.itemsKeys()[0]
    /** Encrypt item1 and emit as errored so it persists with items_key_id */
    const encrypted = await this.application.protocolService.itemsEncryption.encryptPayload(
      item1.payload,
      EncryptionIntent.Sync,
    )
    const errored = CopyPayload(encrypted, {
      errorDecrypting: true,
      waitingForKey: true,
    })
    await this.application.itemManager.emitItemFromPayload(errored)
    expect(this.application.items.findItem(item1.uuid).errorDecrypting).to.equal(true)
    expect(this.application.items.findItem(item1.uuid).payload.items_key_id).to.equal(itemsKey.uuid)
    sinon
      .stub(this.application.protocolService.itemsEncryption, 'decryptErroredItems')
      .callsFake(() => {
        // prevent auto decryption
      })
    const alternatedKey = await Factory.alternateUuidForItem(this.application, itemsKey.uuid)
    const updatedItem = this.application.items.findItem(item1.uuid)
    expect(updatedItem.payload.items_key_id).to.equal(alternatedKey.uuid)
  })

  it('properly handles mutli item uuid alternation', async function () {
    const item1 = await Factory.createMappedNote(this.application)
    const item2 = await Factory.createMappedNote(this.application)
    this.expectedItemCount += 2

    await this.application.itemManager.changeItem(item1.uuid, (mutator) => {
      mutator.addItemAsRelationship(item2)
    })

    expect(this.application.itemManager.itemsReferencingItem(item2.uuid).length).to.equal(1)

    const alternatedItem1 = await Factory.alternateUuidForItem(this.application, item1.uuid)
    const alternatedItem2 = await Factory.alternateUuidForItem(this.application, item2.uuid)

    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount)

    expect(item1.uuid).to.not.equal(alternatedItem1.uuid)
    expect(item2.uuid).to.not.equal(alternatedItem2.uuid)

    const refreshedAltItem1 = this.application.itemManager.findItem(alternatedItem1.uuid)
    expect(refreshedAltItem1.content.references.length).to.equal(1)
    expect(refreshedAltItem1.content.references[0].uuid).to.equal(alternatedItem2.uuid)
    expect(alternatedItem2.content.references.length).to.equal(0)

    expect(this.application.itemManager.itemsReferencingItem(alternatedItem2.uuid).length).to.equal(
      1,
    )

    expect(refreshedAltItem1.hasRelationshipWithItem(alternatedItem2)).to.equal(true)
    expect(alternatedItem2.hasRelationshipWithItem(refreshedAltItem1)).to.equal(false)
    expect(refreshedAltItem1.dirty).to.equal(true)
  })

  it('maintains referencing relationships when duplicating', async function () {
    const tag = await Factory.createMappedTag(this.application)
    const note = await Factory.createMappedNote(this.application)
    const refreshedTag = await this.application.itemManager.changeItem(tag.uuid, (mutator) => {
      mutator.addItemAsRelationship(note)
    })

    expect(refreshedTag.content.references.length).to.equal(1)

    const noteCopy = await this.application.itemManager.duplicateItem(note.uuid)
    expect(note.uuid).to.not.equal(noteCopy.uuid)

    expect(this.application.itemManager.notes.length).to.equal(2)
    expect(this.application.itemManager.tags.length).to.equal(1)

    expect(note.content.references.length).to.equal(0)
    expect(noteCopy.content.references.length).to.equal(0)
    const refreshedTag_2 = this.application.itemManager.findItem(tag.uuid)
    expect(refreshedTag_2.content.references.length).to.equal(2)
  })

  it('maintains editor reference when duplicating note', async function () {
    const note = await Factory.createMappedNote(this.application)
    const editor = await this.application.mutator.createManagedItem(
      ContentType.Component,
      { area: ComponentArea.Editor },
      true,
    )
    await this.application.itemManager.changeComponent(editor.uuid, (mutator) => {
      mutator.associateWithItem(note.uuid)
    })

    expect(this.application.componentManager.editorForNote(note).uuid).to.equal(editor.uuid)

    const duplicate = await this.application.itemManager.duplicateItem(note.uuid, true)
    expect(this.application.componentManager.editorForNote(duplicate).uuid).to.equal(editor.uuid)
  })
})
