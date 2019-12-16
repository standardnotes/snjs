import '../dist/regenerator.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';

chai.use(chaiAsPromised);
var expect = chai.expect;

describe("basic auth", () => {
  let url = "http://localhost:3000";
  let email = Factory.globalStandardNotes().crypto.generateUUIDSync();
  let password = Factory.globalStandardNotes().crypto.generateUUIDSync();
  var _keys;

  before(async () => {
    await Factory.globalStorageManager().clearAllData();
  })

  it("successfully register new account", (done) => {
     Factory.globalAuthManager().register(url, email, password, false).then((response) => {
      expect(response.error).to.not.be.ok;
      done();
    })
  }).timeout(20000);

  it("successfully logins to registered account", async () => {
    await Factory.globalAuthManager().signout(true);
    var strict = false;
    var response = await Factory.globalAuthManager().login(url, email, password, strict, null);
    _keys = await Factory.globalAuthManager().keys();
    expect(response.error).to.not.be.ok;
  }).timeout(20000);

  it("fails login to registered account", (done) => {
    var strict = false;
    Factory.globalAuthManager().login(url, email, "wrong-password", strict, null).then((response) => {
      expect(response.error).to.be.ok;
      done();
    })
  }).timeout(20000);

  it("successfully changes password", async () => {
    let modelManager = Factory.createModelManager();
    let storageManager = Factory.globalStorageManager();
    let syncManager = new SFSyncManager(modelManager, storageManager, Factory.globalHttpManager());

    syncManager.setKeyRequestHandler(async () => {
      return {
        offline: false,
        keys: await Factory.globalAuthManager().keys(),
        auth_params: await Factory.globalAuthManager().getAuthParams(),
      };
    })

    var totalItemCount = 105;
    for(var i = 0; i < totalItemCount; i++) {
      var item = Factory.createItem();
      modelManager.addItem(item);
      modelManager.setItemDirty(item, true);
    }

    await syncManager.loadLocalItems();

    await syncManager.sync();

    var strict = false;

    var result = await Factory.globalStandardNotes().crypto.generateInitialKeysAndAuthParamsForUser(email, password);
    var newKeys = result.keys;
    var newAuthParams = result.authParams;

    var response = await Factory.globalAuthManager().changePassword(url, email, _keys.pw, newKeys, newAuthParams);
    expect(response.error).to.not.be.ok;

    expect(modelManager.allItems.length).to.equal(totalItemCount);
    expect(modelManager.invalidItems().length).to.equal(0);

    modelManager.setAllItemsDirty();
    await syncManager.sync();

    expect(modelManager.allItems.length).to.equal(totalItemCount);

    // create conflict for an item
    var item = modelManager.allItems[0];
    item.content.foo = "bar";
    item.updated_at = Factory.yesterday();
    modelManager.setItemDirty(item, true);
    totalItemCount++;

    // Wait so that sync conflict can be created
    await Factory.sleep(1.1);
    await syncManager.sync();

    // clear sync token, clear storage, download all items, and ensure none of them have error decrypting
    await syncManager.handleSignout();
    await storageManager.clearAllModels();
    modelManager.handleSignout();

    expect(modelManager.allItems.length).to.equal(0);

    await syncManager.sync();

    expect(modelManager.allItems.length).to.equal(totalItemCount);
    expect(modelManager.invalidItems().length).to.equal(0);

    await Factory.globalAuthManager().signout(true);
    var loginResponse = await Factory.globalAuthManager().login(url, email, password, strict, null);
    expect(loginResponse.error).to.not.be.ok;
  }).timeout(20000);

  it.skip("changes password many times", async () => {
    let modelManager = Factory.createModelManager();
    let storageManager = Factory.globalStorageManager();
    let syncManager = new SFSyncManager(modelManager, storageManager, Factory.globalHttpManager());

    syncManager.setKeyRequestHandler(async () => {
      return {
        offline: false,
        keys: await Factory.globalAuthManager().keys(),
        auth_params: await Factory.globalAuthManager().getAuthParams(),
      };
    })

    var totalItemCount = 400;
    for(var i = 0; i < totalItemCount; i++) {
      var item = Factory.createItem();
      modelManager.addItem(item);
      modelManager.setItemDirty(item, true);
    }

    await syncManager.sync();

    var strict = false;

    for(var i = 0; i < 5; i++) {
      var result = await Factory.globalStandardNotes().crypto.generateInitialKeysAndAuthParamsForUser(email, password);
      var newKeys = result.keys;
      var newAuthParams = result.authParams;

      var response = await Factory.globalAuthManager().changePassword(url, email, _keys.pw, newKeys, newAuthParams);
      expect(response.error).to.not.be.ok;

      expect(modelManager.allItems.length).to.equal(totalItemCount);
      expect(modelManager.invalidItems().length).to.equal(0);

      modelManager.setAllItemsDirty();
      await syncManager.sync();

      // clear sync token, clear storage, download all items, and ensure none of them have error decrypting
      await syncManager.clearSyncToken();
      await syncManager.sync();
      await syncManager.clearSyncToken();
      await storageManager.clearAllModels();
      modelManager.handleSignout();

      expect(modelManager.allItems.length).to.equal(0);

      await syncManager.sync();

      expect(modelManager.allItems.length).to.equal(totalItemCount);
      expect(modelManager.invalidItems().length).to.equal(0);

      var loginResponse = await Factory.globalAuthManager().login(url, email, password, strict, null);
      expect(loginResponse.error).to.not.be.ok;

      _keys = await Factory.globalAuthManager().keys();
    }
  }).timeout(30000);

})
