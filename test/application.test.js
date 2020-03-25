/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('application instances', () => {
  const BASE_ITEM_COUNT = 1; /** Default items key */

  before(async () => {
    localStorage.clear();
  });

  after(async () => {
    localStorage.clear();
  });

  it('two distinct applications should not share model manager state', async () => {
    const app1 = await Factory.createAndInitializeApplication('app1');
    const app2 = await Factory.createAndInitializeApplication('app2');
    expect(app1.modelManager).to.equal(app1.modelManager);
    expect(app1.modelManager).to.not.equal(app2.modelManager);

    await Factory.createMappedNote(app1);
    expect(app1.modelManager.allItems.length).length.to.equal(BASE_ITEM_COUNT + 1);
    expect(app2.modelManager.allItems.length).to.equal(BASE_ITEM_COUNT);
    await app1.deinit();
    await app2.deinit();
  });

  it('two distinct applications should not share storage manager state', async () => {
    const app1 = await Factory.createAndInitializeApplication('app1');
    const app2 = await Factory.createAndInitializeApplication('app2');

    await Factory.createMappedNote(app1);
    await app1.syncService.sync();

    expect((await app1.storageService.getAllRawPayloads()).length).length.to.equal(BASE_ITEM_COUNT + 1);
    expect((await app2.storageService.getAllRawPayloads()).length).length.to.equal(BASE_ITEM_COUNT);

    await Factory.createMappedNote(app2);
    await app2.syncService.sync();

    expect((await app1.storageService.getAllRawPayloads()).length).length.to.equal(BASE_ITEM_COUNT + 1);
    expect((await app2.storageService.getAllRawPayloads()).length).length.to.equal(BASE_ITEM_COUNT + 1);
    await app1.deinit();
    await app2.deinit();
  });
});
