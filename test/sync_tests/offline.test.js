import '../../node_modules/regenerator-runtime/runtime.js';
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import '../vendor/chai-as-promised-built.js';
import Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('offline syncing', () => {
  const BASE_ITEM_COUNT = 1; /** Default items key */

  beforeEach(async function() {
    this.expectedItemCount = BASE_ITEM_COUNT;
    this.application = await Factory.createInitAppWithRandNamespace();
  })

  afterEach(async function() {
    expect(this.application.syncManager.isOutOfSync()).to.equal(false);
  })

  before(async function() {
    localStorage.clear();
  });

  after(async function() {
    localStorage.clear();
  })

  it("should sync item with no passcode", async function() {
    const item = await Factory.createMappedNote(this.application);
    expect(this.application.modelManager.getDirtyItems().length).to.equal(1);
    const rawPayloads1 = await this.application.storageManager.getAllRawPayloads();
    expect(rawPayloads1.length).to.equal(this.expectedItemCount);

    await this.application.syncManager.sync()
    this.expectedItemCount++;

    expect(this.application.modelManager.getDirtyItems().length).to.equal(0);
    const rawPayloads2 = await this.application.storageManager.getAllRawPayloads();
    expect(rawPayloads2.length).to.equal(this.expectedItemCount);

    const itemsKeyRP = (await Factory.getStoragePayloadsOfType(
      this.application, CONTENT_TYPE_ITEMS_KEY
    ))[0];
    const noteRP = (await Factory.getStoragePayloadsOfType(
      this.application, CONTENT_TYPE_NOTE
    ))[0];

    /** Encrypts with default items key */
    expect(typeof noteRP.content).to.equal('string');
    /** Not encrypted as no passcode/root key */
    expect(typeof itemsKeyRP.content).to.equal('object');
  });

  it("should sync item encrypted with passcode", async function() {
    await this.application.setPasscode('foobar');
    const item = await Factory.createMappedNote(this.application);
    expect(this.application.modelManager.getDirtyItems().length).to.equal(1);
    const rawPayloads1 = await this.application.storageManager.getAllRawPayloads();
    expect(rawPayloads1.length).to.equal(this.expectedItemCount);

    await this.application.syncManager.sync()
    this.expectedItemCount++;

    expect(this.application.modelManager.getDirtyItems().length).to.equal(0);
    const rawPayloads2 = await this.application.storageManager.getAllRawPayloads();
    expect(rawPayloads2.length).to.equal(this.expectedItemCount);

    const payload = rawPayloads2[0];
    expect(typeof payload.content).to.equal('string');
    expect(payload.content.startsWith(this.application.protocolService.getLatestVersion())).to.equal(true);
  });

});

describe.skip('offline deprecated', () => {
  /**
   * This test is no longer valid, as we take a "snapshot" of local database
   * state before allowing any UI input, then begin mapping that snapshot locally.
   * Therefore, the idea of "saving an item" THEN loading database is not allowed at all.
  */
  /*
  it.skip("should allow local saving before offline data has loaded, and should not overwrite present values when finished loading",
  async function() {
    const payload = Factory.createNotePayload();
    const items = await this.application.modelManager.mapPayloadsToLocalItems({
      payloads: [payload]
    });
    const item = items[0];
    this.application.modelManager.setItemDirty(item);

    // Beginning this sync will begin data load, and this latency will be applied to the data load.
    // What we expect is that this local item will be saved to storage right away, then after the delay,
    // local data will be loaded, and the value will be mapped onto our existing value.
    // This test is to ensure that when that mapping happens, it doesn't overwrite any pending changes we may have made
    // since the load.
    const latency = 1000;
    this.application.syncManager.ut_beginLatencySimulator(latency);
    await this.application.syncManager.sync();
    this.application.syncManager.ut_endLatencySimulator();

    // This item should be saved to disk at this point.
    const models = await this.application.storageManager.getAllRawPayloads()
    expect(models.length).to.equal(1);

    let text = `${Math.random()}`;
    item.text = text;
    this.application.modelManager.setItemDirty(item);

    // wait ~latency, then check to make sure that the local data load hasn't overwritten our dirty values.

    await Factory.sleep((latency/1000) + 0.1);
    await this.application.syncManager.sync();
    expect(this.application.modelManager.findItem(item.uuid).text).to.equal(text);
    expect(this.application.modelManager.findItem(item.uuid).content.text).to.equal(text);

    const updatedModels = await this.application.storageManager.getAllRawPayloads()
    expect(updatedModels.length).to.equal(1);
    expect(this.application.modelManager.allItems.length).to.equal(1);
  }).timeout(5000);
  */
});
