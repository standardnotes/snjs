/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('model manager mapping', () => {
  const BASE_ITEM_COUNT = 1; /** Default items key */
  beforeEach(async function () {
    this.expectedItemCount = BASE_ITEM_COUNT;
    this.application = await Factory.createInitAppWithRandNamespace();
  });

  afterEach(async function () {
    await this.application.deinit();
  });

  it('mapping nonexistent item creates it', async function () {
    const modelManager = this.application.modelManager;
    const payload = Factory.createNotePayload();
    await modelManager.emitPayloads(
      [payload],
      PayloadSource.LocalChanged
    );
    this.expectedItemCount++;
    expect(modelManager.allItems.length).to.equal(this.expectedItemCount);
  });

  it('mapping nonexistent deleted item doesnt create it', async function () {
    const modelManager = this.application.modelManager;
    const payload = CreateMaxPayloadFromAnyObject(
      Factory.createNoteParams(),
      null,
      null,
      {
        dirty: false,
        deleted: true
      }
    );
    await modelManager.emitPayload(
      payload,
      PayloadSource.LocalChanged
    );
    expect(modelManager.allItems.length).to.equal(this.expectedItemCount);
  });

  it('mapping with omitted content should preserve item content', async function () {
    /** content is omitted to simulate handling saved_items sync success. */
    const modelManager = this.application.modelManager;
    const payload = Factory.createNotePayload();
    await modelManager.emitPayloads(
      [payload],
      PayloadSource.LocalChanged
    );
    const originalNote = modelManager.notes[0];
    expect(originalNote.content.title).to.equal(payload.content.title);
    const mutated = CreateSourcedPayloadFromObject(
      payload,
      PayloadSource.RemoteSaved
    );
    await modelManager.emitPayloads(
      [mutated],
      PayloadSource.LocalChanged
    );
    const sameNote = modelManager.notes[0];
    expect(sameNote.content.title).to.equal(payload.content.title);
  });

  it('mapping and deleting nonexistent item creates and deletes it', async function () {
    const modelManager = this.application.modelManager;
    const payload = Factory.createNotePayload();
    await modelManager.emitPayloads(
      [payload],
      PayloadSource.LocalChanged
    );
    this.expectedItemCount++;
    expect(modelManager.allItems.length).to.equal(this.expectedItemCount);

    const changedParams = CreateMaxPayloadFromAnyObject(
      payload,
      null,
      null,
      {
        dirty: false,
        deleted: true
      }
    );
    this.expectedItemCount--;
    await modelManager.emitPayloads(
      [changedParams],
      PayloadSource.LocalChanged
    );
    expect(modelManager.allItems.length).to.equal(this.expectedItemCount);
  });

  it('mapping deleted but dirty item should not delete it', async function () {
    const modelManager = this.application.modelManager;
    const payload = Factory.createNotePayload();
    await modelManager.emitPayloads(
      [payload],
      PayloadSource.LocalChanged
    );
    this.expectedItemCount++;

    const item = modelManager.allItems[0];
    item.deleted = true;
    await modelManager.setItemDirty(item, true);
    const payload2 = CreateMaxPayloadFromAnyObject(item);
    await modelManager.emitPayloads(
      [payload2],
      PayloadSource.LocalChanged
    );
    expect(modelManager.allItems.length).to.equal(this.expectedItemCount);
  });

  it('mapping existing item updates its properties', async function () {
    const modelManager = this.application.modelManager;
    const payload = Factory.createNotePayload();
    await modelManager.emitPayloads(
      [payload],
      PayloadSource.LocalChanged
    );

    const newTitle = 'updated title';
    const mutated = CreateMaxPayloadFromAnyObject(
      payload,
      null,
      null,
      { content: { title: newTitle } }
    );
    await modelManager.emitPayloads(
      [mutated],
      PayloadSource.LocalChanged
    );
    const item = modelManager.notes[0];

    expect(item.content.title).to.equal(newTitle);
  });

  it('setting an item dirty should retrieve it in dirty items', async function () {
    const modelManager = this.application.modelManager;
    const payload = Factory.createNotePayload();
    await modelManager.emitPayloads(
      [payload],
      PayloadSource.LocalChanged
    );
    const note = modelManager.notes[0];
    await modelManager.setItemDirty(note, true);
    const dirtyItems = modelManager.getDirtyItems();
    expect(dirtyItems.length).to.equal(1);
  });

  it('clearing dirty items should return no items', async function () {
    const modelManager = this.application.modelManager;
    const payload = Factory.createNotePayload();
    await modelManager.emitPayloads(
      [payload],
      PayloadSource.LocalChanged
    );
    const note = modelManager.notes[0];
    await modelManager.setItemDirty(note);
    const dirtyItems = modelManager.getDirtyItems();
    expect(dirtyItems.length).to.equal(1);

    modelManager.setItemsDirty(dirtyItems, false);
    expect(modelManager.getDirtyItems().length).to.equal(0);
  });

  it('set all items dirty', async function () {
    const modelManager = this.application.modelManager;
    const count = 10;
    this.expectedItemCount += count;
    const payloads = [];
    for (let i = 0; i < count; i++) {
      payloads.push(Factory.createNotePayload());
    }
    await modelManager.emitPayloads(
      payloads,
      PayloadSource.LocalChanged
    );
    await this.application.syncService.markAllItemsAsNeedingSync();

    const dirtyItems = modelManager.getDirtyItems();
    expect(dirtyItems.length).to.equal(this.expectedItemCount);
  });

  it('sync observers should be notified of changes', async function () {
    const modelManager = this.application.modelManager;
    const payload = Factory.createNotePayload();
    await modelManager.emitPayloads(
      [payload],
      PayloadSource.LocalChanged
    );
    const item = modelManager.allItems[0];
    return new Promise((resolve) => {
      modelManager.addChangeObserver(
        ContentType.Any,
        (items, _, __, ___, ____) => {
          expect(items[0].uuid === item.uuid);
          resolve();
        }
      );
      modelManager.emitPayloads(
        [payload],
        PayloadSource.LocalChanged
      );
    });
  });
});
