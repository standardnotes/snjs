/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("singletons", () => {

  const syncOptions = {
    checkIntegrity: true
  };

  const BASE_ITEM_COUNT = 1; /** Default items key */

  function createPrivsPayload() {
    const params = {
      uuid: Uuid.GenerateUuidSynchronously(),
      content_type: 'SN|Privileges',
      content: {
        foo: 'bar'
      }
    };
    return CreateMaxPayloadFromAnyObject({
      object: params
    });
  }

  before(async function () {
    localStorage.clear();
  });

  after(async function () {
    localStorage.clear();
  });

  beforeEach(async function () {
    this.expectedItemCount = BASE_ITEM_COUNT;
    this.application = await Factory.createInitAppWithRandNamespace();
    this.email = Uuid.GenerateUuidSynchronously();
    this.password = Uuid.GenerateUuidSynchronously();
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password
    });
    this.signOut = async () => {
      await this.application.signOut();
    };
    this.signIn = async () => {
      await this.application.signIn({
        email: this.email,
        password: this.password
      });
    };
    this.extManagerId = 'org.standardnotes.extensions-manager';
    this.extPred = SFPredicate.CompoundPredicate([
      new SFPredicate('content_type', '=', ContentTypes.Component),
      new SFPredicate('package_info.identifier', '=', this.extManagerId)
    ]);
    this.createExtMgr = async () => {
      return this.application.createItem({
        add: true,
        needsSync: true,
        contentType: ContentTypes.Component,
        content: {
          package_info: {
            name: 'Extensions',
            identifier: this.extManagerId
          }
        }
      });
    };
  });

  afterEach(async function () {
    expect(this.application.syncManager.isOutOfSync()).to.equal(false);
    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);
    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(this.expectedItemCount);
    await this.application.deinit();
  });

  it("only resolves to 1 item", async function () {
    /** Privileges are an item we know to always return true for isSingleton */
    const privs1 = createPrivsPayload();
    const privs2 = createPrivsPayload();
    const privs3 = createPrivsPayload();

    this.expectedItemCount++;
    const items = await this.application.modelManager.mapPayloadsToLocalItems({
      payloads: [privs1, privs2, privs3]
    });
    await this.application.modelManager.setItemsDirty(items);
    await this.application.syncManager.sync(syncOptions);
    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);
  });

  it("resolves registered predicate", async function () {
    this.application.singletonManager.registerPredicate(this.extPred);
    const extManager = await this.createExtMgr();
    this.expectedItemCount += 1;

    /** Call needlessly */
    await this.createExtMgr();
    await this.createExtMgr();
    await this.createExtMgr();

    expect(extManager).to.be.ok;
    const refreshedExtMgr = this.application.findItem({ uuid: extManager.uuid });
    expect(refreshedExtMgr).to.be.ok;
    await this.application.sync(syncOptions);
    expect(this.application.modelManager.itemsMatchingPredicate(this.extPred).length).to.equal(1);
  });

  it("resolves registered predicate with signing in/out", async function () {
    await this.signOut();
    this.email = Uuid.GenerateUuidSynchronously();
    this.password = Uuid.GenerateUuidSynchronously();
    this.application.singletonManager.registerPredicate(this.extPred);
    await this.createExtMgr();
    this.expectedItemCount += 1;
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password
    });
    await this.signOut();
    this.application.singletonManager.registerPredicate(this.extPred);
    await this.createExtMgr();
    await this.application.sync(syncOptions);
    this.application.sync(syncOptions);
    await this.signIn();
    await Factory.sleep(0.5);
  });

  it('singletons that are deleted after download first sync should not sync to server', async function () {
    this.application.singletonManager.registerPredicate(this.extPred);
    await this.createExtMgr();
    await this.createExtMgr();
    await this.createExtMgr();
    this.expectedItemCount++;

    let didCompleteRelevantSync = false;
    let beginCheckingResponse = false;
    this.application.syncManager.addEventObserver(async (eventName, data) => {
      if (eventName === SyncEvents.DownloadFirstSyncCompleted) {
        beginCheckingResponse = true;
      }
      if (!beginCheckingResponse) {
        return;
      }
      if (!didCompleteRelevantSync && eventName === SyncEvents.SingleSyncCompleted) {
        didCompleteRelevantSync = true;
        const saved = data.savedPayloads;
        expect(saved.length).to.equal(1);
        const matching = saved.find((p) => p.content_type === ContentTypes.Component && p.deleted);
        expect(matching).to.not.be.ok;
      }
    });
    await this.application.syncManager.sync({ mode: SyncModes.DownloadFirst });
    expect(didCompleteRelevantSync).to.equal(true);
  }).timeout(10000);

  it("signing into account and retrieving singleton shouldn't put us in deadlock", async function () {
    /** Create privs */
    const ogPrivs = await this.application.privilegesManager.getPrivileges();
    this.expectedItemCount++;
    await this.application.sync(syncOptions);
    await this.application.signOut();
    /** Create another instance while signed out */
    await this.application.privilegesManager.getPrivileges();
    await Factory.loginToApplication({
      application: this.application,
      email: this.email,
      password: this.password
    });
    /** After signing in, the instance retrieved from the server should be the one kept */
    const latestPrivs = await this.application.privilegesManager.getPrivileges();
    expect(latestPrivs.uuid).to.equal(ogPrivs.uuid);
    const allPrivs = this.application.modelManager.validItemsForContentType(ogPrivs.content_type);
    expect(allPrivs.length).to.equal(1);
  });

  it("if only result is errorDecrypting, create new item", async function () {
    const payload = createPrivsPayload();
    const item = await this.application.modelManager.mapPayloadToLocalItem({
      payload: payload
    });
    this.expectedItemCount++;
    await this.application.syncManager.sync(syncOptions);
    /** Set after sync so that it syncs properly */
    item.errorDecrypting = true;

    const predicate = new SFPredicate("content_type", "=", item.content_type);
    const resolvedItem = await this.application.singletonManager.findOrCreateSingleton({
      predicate: predicate,
      createPayload: payload
    });
    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);
    expect(resolvedItem.uuid).to.not.equal(item.uuid);
    expect(resolvedItem.errorDecrypting).to.not.be.ok;
  });

  it("alternating the uuid of a singleton should return correct result", async function () {
    const payload = createPrivsPayload();
    const item = await this.application.modelManager.mapPayloadToLocalItem({
      payload: payload
    });
    this.expectedItemCount++;
    await this.application.syncManager.sync(syncOptions);
    const predicate = new SFPredicate("content_type", "=", item.content_type);
    const resolvedItem = await this.application.singletonManager.findOrCreateSingleton({
      predicate: predicate,
      createPayload: payload
    });
    await this.application.syncManager.alternateUuidForItem(resolvedItem);
    await this.application.syncManager.sync(syncOptions);
    const resolvedItem2 = await this.application.singletonManager.findOrCreateSingleton({
      predicate: predicate,
      createPayload: payload
    });
    expect(resolvedItem.uuid).to.equal(item.uuid);
    expect(resolvedItem2.uuid).to.not.equal(resolvedItem.uuid);
    expect(resolvedItem.deleted).to.equal(true);
    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);
  });
});
