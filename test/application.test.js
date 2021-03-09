/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('application instances', () => {
  const BASE_ITEM_COUNT = 2; /** Default items key, user preferences */

  const syncOptions = {
    checkIntegrity: true,
    awaitAll: true,
  };

  beforeEach(async () => {
    localStorage.clear();
  });

  afterEach(async () => {
    localStorage.clear();
  });

  it('two distinct applications should not share model manager state', async () => {
    const app1 = await Factory.createAndInitializeApplication('app1');
    const app2 = await Factory.createAndInitializeApplication('app2');
    expect(app1.payloadManager).to.equal(app1.payloadManager);
    expect(app1.payloadManager).to.not.equal(app2.payloadManager);

    await Factory.createMappedNote(app1);
    expect(app1.itemManager.items.length).length.to.equal(BASE_ITEM_COUNT + 1);
    expect(app2.itemManager.items.length).to.equal(BASE_ITEM_COUNT);
    await app1.deinit();
    await app2.deinit();
  });

  it('two distinct applications should not share storage manager state', async () => {
    const app1 = await Factory.createAndInitializeApplication('app1');
    const app2 = await Factory.createAndInitializeApplication('app2');

    await Factory.createMappedNote(app1);
    await app1.syncService.sync(syncOptions);

    expect(
      (await app1.storageService.getAllRawPayloads()).length
    ).length.to.equal(BASE_ITEM_COUNT + 1);
    expect(
      (await app2.storageService.getAllRawPayloads()).length
    ).length.to.equal(BASE_ITEM_COUNT);

    await Factory.createMappedNote(app2);
    await app2.syncService.sync(syncOptions);

    expect(
      (await app1.storageService.getAllRawPayloads()).length
    ).length.to.equal(BASE_ITEM_COUNT + 1);
    expect(
      (await app2.storageService.getAllRawPayloads()).length
    ).length.to.equal(BASE_ITEM_COUNT + 1);
    await app1.deinit();
    await app2.deinit();
  });

  it('deinit application while storage persisting should be handled gracefully', async () => {
    /** This test will always succeed but should be observed for console exceptions */
    const app = await Factory.createAndInitializeApplication('app');
    /** Don't await */
    app.storageService.persistValuesToDisk();
    await app.prepareForDeinit();
    app.deinit();
  });

  it('signing out application should delete snjs_version', async () => {
    const identifier = 'app';
    const app = await Factory.createAndInitializeApplication(identifier);
    expect(localStorage.getItem(`${identifier}-snjs_version`)).to.be.ok;
    await app.signOut();
    expect(localStorage.getItem(`${identifier}-snjs_version`)).to.not.be.ok;
  });

  it('locking application while critical func in progress should wait up to a limit', async () => {
    /** This test will always succeed but should be observed for console exceptions */
    const app = await Factory.createAndInitializeApplication('app');
    /** Don't await */
    const MaximumWaitTime = 0.5;
    app.storageService.executeCriticalFunction(async () => {
      /** If we sleep less than the maximum, locking should occur safely.
       * If we sleep more than the maximum, locking should occur with exception on
       * app deinit. */
      await Factory.sleep(MaximumWaitTime - 0.05);
      /** Access any deviceInterface function */
      app.storageService.deviceInterface.getAllRawDatabasePayloads(
        app.identifier
      );
    });
    await app.lock();
  });
});
