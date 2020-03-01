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

  it('restarting should clear stream observers', async () => {
    const app = await Factory.createAndInitializeApplication();
    let actualEventCount = 0;
    const expectedEventCount = 1;
    app.streamItems({
      contentType: ContentTypes.Note,
      stream: ({ items }) => {
        actualEventCount++;
      }
    });
    /** Should trigger stream observer */
    await Factory.createMappedNote(app);
    await app.restart();
    /** Should not trigger stream observer as application should have reset observers on restart */
    await Factory.createMappedNote(app);
    await Factory.sleep(0.1);
    expect(actualEventCount).to.equal(expectedEventCount);
    expect(app.streamObservers.length).to.equal(0);
  });

  it('onStart should be called twice after restart', async () => {
    const app = await Factory.createApplication();
    let actualEventCount = 0;
    const expectedEventCount = 2;
    app.addEventObserver((event) => {
      if(event === ApplicationEvents.Started) {
        actualEventCount++;
      }
    });
    await Factory.initializeApplication(app);
    await app.restart();
    expect(actualEventCount).to.equal(expectedEventCount);
  });
});
