import '../../node_modules/regenerator-runtime/runtime.js';
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import '../vendor/chai-as-promised-built.js';
import Factory from '../lib/factory.js';
import MemoryStorageManager from '../lib/persist/storage/memoryStorageManager.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('offline syncing', () => {
  let modelManager = Factory.createModelManager();
  const syncManager = new SNSyncManager({
    modelManager,
    authManager: Factory.globalAuthManager(),
    storageManager: Factory.globalStorageManager(),
    protocolManager: Factory.globalProtocolManager(),
    httpManager: Factory.globalHttpManager()
  });


  beforeEach(async () => {
    await Factory.globalStorageManager().clearAllData();
  });

  afterEach(async () => {
    expect(syncManager.isOutOfSync()).to.equal(false);
  })

  it("should sync basic model offline", async () => {
    var item = Factory.createStorageItemNotePayload();
    modelManager.addItem(item);
    modelManager.setItemDirty(item);

    let models = await Factory.globalStorageManager().getAllPayloads();
    expect(models.length).to.equal(0);

    await syncManager.loadLocalItems();
    await syncManager.sync()

    expect(modelManager.getDirtyItems().length).to.equal(0);
    models = await Factory.globalStorageManager().getAllPayloads();
    expect(models.length).to.equal(1);
  });

  it("should allow local saving before offline data has loaded, and should not overwrite present values when finished loading", async () => {
    let localModelManager = Factory.createModelManager();
    const syncManager = new SNSyncManager({
      modelManager,
      authManager: Factory.globalAuthManager(),
      storageManager: Factory.globalStorageManager(),
      protocolManager: Factory.globalProtocolManager(),
      httpManager: Factory.globalHttpManager()
    });

    var item = Factory.createStorageItemNotePayload();
    localModelManager.addItem(item);
    localModelManager.setItemDirty(item);
    // Beginning this sync will begin data load, and this latency will be applied to the data load.
    // What we expect is that this local item will be saved to storage right away, then after the delay,
    // local data will be loaded, and the value will be mapped onto our existing value.
    // This test is to ensure that when that mapping happens, it doesn't overwrite any pending changes we may have made
    // since the load.
    let latency = 1000;
    await localSyncManager.sync({
      simulateHighLatency: true,
      simulatedLatency: latency
    });

    // This item should be saved to disk at this point.
    let models = await Factory.globalStorageManager().getAllPayloads()
    expect(models.length).to.equal(1);

    let text = `${Math.random()}`;
    item.text = text;
    localModelManager.setItemDirty(item);

    // wait ~latency, then check to make sure that the local data load hasn't overwritten our dirty values.

    await Factory.sleep((latency/1000) + 0.1);
    await localSyncManager.sync();
    expect(localModelManager.findItem(item.uuid).text).to.equal(text);
    expect(localModelManager.findItem(item.uuid).content.text).to.equal(text);

    models = await Factory.globalStorageManager().getAllPayloads()
    expect(models.length).to.equal(1);
    expect(localModelManager.allItems.length).to.equal(1);
  }).timeout(5000);
});
