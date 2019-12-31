import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';
chai.use(chaiAsPromised);
var expect = chai.expect;

describe('application instances', () => {
  before(async () => {
    localStorage.clear();
  });

  after(async () => {
    localStorage.clear();
  })

  it('two distinct applications should not share model manager state', async () => {
    const app1 = await Factory.createAndInitializeApplication('app1');
    const app2 = await Factory.createAndInitializeApplication('app2');
    expect(app1.modelManager).to.equal(app1.modelManager);
    expect(app1.modelManager).to.not.equal(app2.modelManager);

    const app1Item = await Factory.createStorageItemNotePayload();
    app1.modelManager.addItem(app1Item);
    expect(app1.modelManager.allItems.length).length.to.equal(1);
    expect(app2.modelManager.allItems.length).to.equal(0);
  });

  it('two distinct applications should not share storage manager state', async () => {
    const app1 = await Factory.createAndInitializeApplication('app1');
    const app2 = await Factory.createAndInitializeApplication('app2');

    const app1Item = await Factory.createMappedNote(app1.modelManager);
    app1Item.setDirty(true);
    app1.modelManager.addItem(app1Item);
    await app1.syncManager.sync();

    expect((await app1.storageManager.getAllPayloads()).length).length.to.equal(1);
    expect((await app2.storageManager.getAllPayloads()).length).length.to.equal(0);

    const app2Item = await Factory.createMappedNote(app2.modelManager);
    app2Item.setDirty(true);
    app2.modelManager.addItem(app2Item);
    await app2.syncManager.sync();

    expect((await app1.storageManager.getAllPayloads()).length).length.to.equal(1);
    expect((await app2.storageManager.getAllPayloads()).length).length.to.equal(1);
  });
})
