/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from '../lib/factory.js'
chai.use(chaiAsPromised)
const expect = chai.expect

describe('model manager mapping', () => {
  const BASE_ITEM_COUNT = 2 /** Default items key, user preferences */
  beforeEach(async function () {
    this.expectedItemCount = BASE_ITEM_COUNT
    this.application = await Factory.createInitAppWithFakeCrypto()
  })

  afterEach(async function () {
    await Factory.safeDeinit(this.application)
  })

  it('mapping nonexistent item creates it', async function () {
    const payload = Factory.createNotePayload()
    await this.application.itemManager.emitItemsFromPayloads([payload], PayloadSource.LocalChanged)
    this.expectedItemCount++
    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount)
  })

  it('mapping nonexistent deleted item doesnt create it', async function () {
    const payload = new DeletedPayload({
      ...Factory.createNoteParams(),
      dirty: false,
      deleted: true,
    })
    await this.application.itemManager.emitItemFromPayload(payload, PayloadSource.LocalChanged)
    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount)
  })

  it('mapping with omitted content should preserve item content', async function () {
    /** content is omitted to simulate handling saved_items sync success. */
    const payload = Factory.createNotePayload()
    await this.application.itemManager.emitItemsFromPayloads([payload], PayloadSource.LocalChanged)
    const originalNote = this.application.itemManager.notes[0]
    expect(originalNote.content.title).to.equal(payload.content.title)
    const mutated = CreateSourcedPayloadFromObject(payload, PayloadSource.RemoteSaved)
    await this.application.itemManager.emitItemsFromPayloads([mutated], PayloadSource.LocalChanged)
    const sameNote = this.application.itemManager.notes[0]
    expect(sameNote.content.title).to.equal(payload.content.title)
  })

  it('mapping and deleting nonexistent item creates and deletes it', async function () {
    const payload = Factory.createNotePayload()
    await this.application.itemManager.emitItemsFromPayloads([payload], PayloadSource.LocalChanged)
    this.expectedItemCount++
    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount)

    const changedParams = new DeletedPayload({
      ...payload,
      dirty: false,
      deleted: true,
    })
    this.expectedItemCount--
    await this.application.itemManager.emitItemsFromPayloads(
      [changedParams],
      PayloadSource.LocalChanged,
    )
    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount)
  })

  it('mapping deleted but dirty item should not delete it', async function () {
    const payload = Factory.createNotePayload()
    await this.application.itemManager.emitItemsFromPayloads([payload], PayloadSource.LocalChanged)
    this.expectedItemCount++

    let item = this.application.itemManager.items[0]
    item = await this.application.itemManager.changeItem(item, (mutator) => {
      mutator.setDeleted()
    })
    const payload2 = new DecryptedPayload(item.payload.ejected())
    await this.application.itemManager.emitItemsFromPayloads([payload2], PayloadSource.LocalChanged)
    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount)
  })

  it('mapping existing item updates its properties', async function () {
    const payload = Factory.createNotePayload()
    await this.application.itemManager.emitItemsFromPayloads([payload], PayloadSource.LocalChanged)

    const newTitle = 'updated title'
    const mutated = new DecryptedPayload({
      ...payload,
      content: {
        ...payload.content,
        title: newTitle,
      },
    })
    await this.application.itemManager.emitItemsFromPayloads([mutated], PayloadSource.LocalChanged)
    const item = this.application.itemManager.notes[0]

    expect(item.content.title).to.equal(newTitle)
  })

  it('setting an item dirty should retrieve it in dirty items', async function () {
    const payload = Factory.createNotePayload()
    await this.application.itemManager.emitItemsFromPayloads([payload], PayloadSource.LocalChanged)
    const note = this.application.itemManager.notes[0]
    await this.application.itemManager.setItemDirty(note)
    const dirtyItems = this.application.itemManager.getDirtyItems()
    expect(dirtyItems.length).to.equal(1)
  })

  it('set all items dirty', async function () {
    const count = 10
    this.expectedItemCount += count
    const payloads = []
    for (let i = 0; i < count; i++) {
      payloads.push(Factory.createNotePayload())
    }
    await this.application.itemManager.emitItemsFromPayloads(payloads, PayloadSource.LocalChanged)
    await this.application.syncService.markAllItemsAsNeedingSyncAndPersist()

    const dirtyItems = this.application.itemManager.getDirtyItems()
    expect(dirtyItems.length).to.equal(this.expectedItemCount)
  })

  it('sync observers should be notified of changes', async function () {
    const payload = Factory.createNotePayload()
    await this.application.itemManager.emitItemsFromPayloads([payload], PayloadSource.LocalChanged)
    const item = this.application.itemManager.items[0]
    return new Promise((resolve) => {
      this.application.itemManager.addObserver(
        ContentType.Any,
        (changed, inserted, removed, _ignored) => {
          expect(changed[0].uuid === item.uuid)
          resolve()
        },
      )
      this.application.itemManager.emitItemsFromPayloads([payload], PayloadSource.LocalChanged)
    })
  })
})
