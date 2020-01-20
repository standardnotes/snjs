import '../../node_modules/regenerator-runtime/runtime.js';
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import './../vendor/chai-as-promised-built.js';
import Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
var expect = chai.expect;

describe("model manager mapping", () => {
  const createModelManager = async () => {
    const isolatedApplication = await Factory.createInitAppWithRandNamespace();
    return isolatedApplication.modelManager;
  }

  it('mapping nonexistent item creates it', async () => {
    let modelManager = await createModelManager();
    const payload = Factory.createNotePayload();
    await modelManager.mapPayloadsToLocalItems({payloads: [payload]});
    expect(modelManager.items.length).to.equal(1);
  });

  it('mapping nonexistent deleted item doesnt create it', async () => {
    let modelManager = await createModelManager();
    const payload = CreateMaxPayloadFromAnyObject({
      object: Factory.createNoteParams(),
      override: {
        deleted: true
      }
    });
    await modelManager.mapPayloadsToLocalItems({payloads: [payload]});
    expect(modelManager.items.length).to.equal(0);
  });

  it('mapping with omitted content should preserve item content', async () => {
    /** content is omitted to simulate handling saved_items sync success. */
    const modelManager = await createModelManager();
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

  it('mapping and deleting nonexistent item creates and deletes it', async () => {
    const modelManager = await createModelManager();
    const payload = Factory.createNotePayload();
    await modelManager.mapPayloadsToLocalItems({payloads: [payload]});
    expect(modelManager.items.length).to.equal(1);

    const changedParams = CreateMaxPayloadFromAnyObject({
      object: payload,
      override: {
        deleted: true
      }
    });
    await modelManager.mapPayloadsToLocalItems({payloads: [changedParams]});
    expect(modelManager.items.length).to.equal(0);
  });

  it('mapping deleted but dirty item should not delete it', async () => {
    const modelManager = await createModelManager();
    const payload = Factory.createNotePayload();
    await modelManager.mapPayloadsToLocalItems({payloads: [payload]});

    const item = modelManager.items[0];
    item.deleted = true;
    await modelManager.setItemDirty(item, true);
    const payload2 = CreateMaxPayloadFromAnyObject({object: item});
    await modelManager.mapPayloadsToLocalItems({payloads: [payload2]});
    expect(modelManager.items.length).to.equal(1);
  });

  it('mapping existing item updates its properties', async () => {
    let modelManager = await createModelManager();
    const payload = Factory.createNotePayload();
    await modelManager.mapPayloadsToLocalItems({payloads: [payload]});

    const newTitle = "updated title";
    const mutated = CreateMaxPayloadFromAnyObject({
      object: payload,
      override: {content: {title: newTitle}}
    })
    await modelManager.mapPayloadsToLocalItems({payloads: [mutated]});
    let item = modelManager.items[0];

    expect(item.content.title).to.equal(newTitle);
  });

  it('setting an item dirty should retrieve it in dirty items', async () => {
    let modelManager = await createModelManager();
    const payload = Factory.createNotePayload();
    await modelManager.mapPayloadsToLocalItems({payloads: [payload]});
    let item = modelManager.items[0];
    await modelManager.setItemDirty(item, true);
    let dirtyItems = modelManager.getDirtyItems();
    expect(dirtyItems.length).to.equal(1);
  });

  it('clearing dirty items should return no items', async () => {
    let modelManager = await createModelManager();
    const payload = Factory.createNotePayload();
    await modelManager.mapPayloadsToLocalItems({payloads: [payload]});
    let item = modelManager.items[0];
    await modelManager.setItemDirty(item, true);
    let dirtyItems = modelManager.getDirtyItems();
    expect(dirtyItems.length).to.equal(1);

    modelManager.clearDirtyItems(dirtyItems);
    expect(modelManager.getDirtyItems().length).to.equal(0);
  });

  it('set all items dirty', async () => {
    const modelManager = await createModelManager();
    const count = 10;
    const payloads = [];
    for(let i = 0; i < count; i++) {
      payloads.push(Factory.createNotePayload());
    }
    await modelManager.mapPayloadsToLocalItems({payloads: payloads});
    await modelManager.setAllItemsDirty();

    const dirtyItems = modelManager.getDirtyItems();
    expect(dirtyItems.length).to.equal(10);
  });

  it('sync observers should be notified of changes', async () => {
    let modelManager = await createModelManager();
    const payload = Factory.createNotePayload();
    await modelManager.mapPayloadsToLocalItems({payloads: [payload]});
    let item = modelManager.items[0];
    return new Promise(async (resolve, reject) => {
      modelManager.addMappingObserver("test", "*", (items, validItems, deletedItems, source, sourceKey) => {
        expect(items[0].uuid == item.uuid);
        resolve();
      })
      await modelManager.mapPayloadsToLocalItems({payloads: [payload]});
    })
  });
})
