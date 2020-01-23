import '../../node_modules/regenerator-runtime/runtime.js';
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import './../vendor/chai-as-promised-built.js';
import Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("model manager mapping", () => {
  const BASE_ITEM_COUNT = 1; /** Default items key */
  beforeEach(async function() {
    this.expectedItemCount = BASE_ITEM_COUNT;
    this.application = await Factory.createInitAppWithRandNamespace();
  })

  it('mapping nonexistent item creates it', async function () {
    const modelManager = this.application.modelManager;
    const payload = Factory.createNotePayload();
    await modelManager.mapPayloadsToLocalItems({payloads: [payload]});
    this.expectedItemCount++;
    expect(modelManager.allItems.length).to.equal(this.expectedItemCount);
  });

  it('mapping nonexistent deleted item doesnt create it', async function () {
    const modelManager = this.application.modelManager;
    const payload = CreateMaxPayloadFromAnyObject({
      object: Factory.createNoteParams(),
      override: {
        dirty: false,
        deleted: true
      }
    });
    await modelManager.mapPayloadToLocalItem({payload: payload});
    expect(modelManager.allItems.length).to.equal(this.expectedItemCount);
  });

  it('mapping with omitted content should preserve item content', async function () {
    /** content is omitted to simulate handling saved_items sync success. */
    const modelManager = this.application.modelManager;
    const payload = Factory.createNotePayload();
    await modelManager.mapPayloadsToLocalItems({payloads: [payload]});
    const originalNote = modelManager.notes[0];
    expect(originalNote.content.title).to.equal(payload.content.title);
    const mutated = CreateSourcedPayloadFromObject({
      object: payload,
      source: PAYLOAD_SOURCE_REMOTE_SAVED
    })
    await modelManager.mapPayloadsToLocalItems({payloads: [mutated]});
    const sameNote = modelManager.notes[0];
    expect(sameNote.content.title).to.equal(payload.content.title);
  })

  it('mapping and deleting nonexistent item creates and deletes it', async function () {
    const modelManager = this.application.modelManager;
    const payload = Factory.createNotePayload();
    await modelManager.mapPayloadsToLocalItems({payloads: [payload]});
    this.expectedItemCount++;
    expect(modelManager.allItems.length).to.equal(this.expectedItemCount);

    const changedParams = CreateMaxPayloadFromAnyObject({
      object: payload,
      override: {
        dirty: false,
        deleted: true
      }
    });
    this.expectedItemCount--;
    await modelManager.mapPayloadsToLocalItems({payloads: [changedParams]});
    expect(modelManager.allItems.length).to.equal(this.expectedItemCount);
  });

  it('mapping deleted but dirty item should not delete it', async function () {
    const modelManager = this.application.modelManager;
    const payload = Factory.createNotePayload();
    await modelManager.mapPayloadsToLocalItems({payloads: [payload]});
    this.expectedItemCount++;

    const item = modelManager.allItems[0];
    item.deleted = true;
    await modelManager.setItemDirty(item, true);
    const payload2 = CreateMaxPayloadFromAnyObject({object: item});
    await modelManager.mapPayloadsToLocalItems({payloads: [payload2]});
    expect(modelManager.allItems.length).to.equal(this.expectedItemCount);
  });

  it('mapping existing item updates its properties', async function () {
    const modelManager = this.application.modelManager;
    const payload = Factory.createNotePayload();
    await modelManager.mapPayloadsToLocalItems({payloads: [payload]});

    const newTitle = "updated title";
    const mutated = CreateMaxPayloadFromAnyObject({
      object: payload,
      override: {content: {title: newTitle}}
    })
    await modelManager.mapPayloadsToLocalItems({payloads: [mutated]});
    const item = modelManager.notes[0];

    expect(item.content.title).to.equal(newTitle);
  });

  it('setting an item dirty should retrieve it in dirty items', async function () {
    const modelManager = this.application.modelManager;
    const payload = Factory.createNotePayload();
    await modelManager.mapPayloadsToLocalItems({payloads: [payload]});
    const note = modelManager.notes[0];
    await modelManager.setItemDirty(note, true);
    const dirtyItems = modelManager.getDirtyItems();
    expect(dirtyItems.length).to.equal(1);
  });

  it('clearing dirty items should return no items', async function () {
    const modelManager = this.application.modelManager;
    const payload = Factory.createNotePayload();
    await modelManager.mapPayloadsToLocalItems({payloads: [payload]});
    const note = modelManager.notes[0];
    await modelManager.setItemDirty(note);
    const dirtyItems = modelManager.getDirtyItems();
    expect(dirtyItems.length).to.equal(1);

    modelManager.clearDirtyItems(dirtyItems);
    expect(modelManager.getDirtyItems().length).to.equal(0);
  });

  it('set all items dirty', async function () {
    const modelManager = this.application.modelManager;
    const count = 10;
    this.expectedItemCount += count;
    const payloads = [];
    for(let i = 0; i < count; i++) {
      payloads.push(Factory.createNotePayload());
    }
    await modelManager.mapPayloadsToLocalItems({payloads: payloads});
    await modelManager.setAllItemsDirty();

    const dirtyItems = modelManager.getDirtyItems();
    expect(dirtyItems.length).to.equal(this.expectedItemCount);
  });

  it('sync observers should be notified of changes', async function () {
    const modelManager = this.application.modelManager;
    const payload = Factory.createNotePayload();
    await modelManager.mapPayloadsToLocalItems({payloads: [payload]});
    const item = modelManager.allItems[0];
    return new Promise(async (resolve, reject) => {
      modelManager.addMappingObserver("test", "*", (items, validItems, deletedItems, source, sourceKey) => {
        expect(items[0].uuid == item.uuid);
        resolve();
      })
      await modelManager.mapPayloadsToLocalItems({payloads: [payload]});
    })
  });
})
