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
    var params = Factory.createStorageItemNotePayload();
    await modelManager.mapPayloadsToLocalModels({payloads: [params]});
    expect(modelManager.items.length).to.equal(1);
  });

  it('mapping string content correctly parses it', async () => {
    let modelManager = await createModelManager();
    var params = Factory.createStorageItemNotePayload();
    let originalTitle = params.content.title;
    params.content = JSON.stringify(params.content);
    await modelManager.mapPayloadsToLocalModels({payloads: [params]});
    var item = modelManager.items[0];
    expect(params.content.title).to.not.be.a('string');
    expect(item.content.title).to.be.a('string');
    expect(item.content.title).to.equal(originalTitle);
  });

  it('mapping nonexistent deleted item doesnt create it', async () => {
    let modelManager = await createModelManager();
    var params = Factory.createStorageItemNotePayload();
    params.deleted = true;
    await modelManager.mapPayloadsToLocalModels({payloads: [params]});
    expect(modelManager.items.length).to.equal(0);
  });

  it('mapping and deleting nonexistent item creates and deletes it', async () => {
    let modelManager = await createModelManager();
    var params = Factory.createStorageItemNotePayload();
    await modelManager.mapPayloadsToLocalModels({payloads: [params]});
    expect(modelManager.items.length).to.equal(1);

    params.deleted = true;
    await modelManager.mapPayloadsToLocalModels({payloads: [params]});
    expect(modelManager.items.length).to.equal(0);
  });

  it('mapping deleted but dirty item should not delete it', async () => {
    let modelManager = await createModelManager();
    var params = Factory.createStorageItemNotePayload();
    await modelManager.mapPayloadsToLocalModels({payloads: [params]});

    let item = modelManager.items[0];
    item.deleted = true;
    modelManager.setItemDirty(item, true);
    await modelManager.mapPayloadsToLocalModels({payloads: [item]});
    expect(modelManager.items.length).to.equal(1);
  });

  it('mapping existing item updates its properties', async () => {
    let modelManager = await createModelManager();
    var params = Factory.createStorageItemNotePayload();
    await modelManager.mapPayloadsToLocalModels({payloads: [params]});

    var newTitle = "updated title";
    params.content.title = newTitle;
    await modelManager.mapPayloadsToLocalModels({payloads: [params]});
    let item = modelManager.items[0];

    expect(item.content.title).to.equal(newTitle);
  });

  it('setting an item dirty should retrieve it in dirty items', async () => {
    let modelManager = await createModelManager();
    var params = Factory.createStorageItemNotePayload();
    await modelManager.mapPayloadsToLocalModels({payloads: [params]});
    let item = modelManager.items[0];
    modelManager.setItemDirty(item, true);
    let dirtyItems = modelManager.getDirtyItems();
    expect(dirtyItems.length).to.equal(1);
  });

  it('clearing dirty items should return no items', async () => {
    let modelManager = await createModelManager();
    var params = Factory.createStorageItemNotePayload();
    await modelManager.mapPayloadsToLocalModels({payloads: [params]});
    let item = modelManager.items[0];
    modelManager.setItemDirty(item, true);
    let dirtyItems = modelManager.getDirtyItems();
    expect(dirtyItems.length).to.equal(1);

    modelManager.clearDirtyItems(dirtyItems);
    expect(modelManager.getDirtyItems().length).to.equal(0);
  });

  it('set all items dirty', async () => {
    let modelManager = await createModelManager();
    let count = 10;
    var items = [];
    for(var i = 0; i < count; i++) {
      items.push(Factory.createStorageItemNotePayload);
    }
    await modelManager.mapPayloadsToLocalModels({payloads: [items]});
    modelManager.setAllItemsDirty();

    let dirtyItems = modelManager.getDirtyItems();
    expect(dirtyItems.length).to.equal(10);
  });

  it('sync observers should be notified of changes', async () => {
    let modelManager = await createModelManager();
    var params = Factory.createStorageItemNotePayload();
    modelManager.mapPayloadsToLocalModels({payloads: [params]});
    let item = modelManager.items[0];
    return new Promise((resolve, reject) => {
      modelManager.addItemSyncObserver("test", "*", (items, validItems, deletedItems, source, sourceKey) => {
        expect(items[0].uuid == item.uuid);
        resolve();
      })
      modelManager.mapPayloadsToLocalModels({payloads: [params]});
    })
  });
})
