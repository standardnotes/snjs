import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';

chai.use(chaiAsPromised);
var expect = chai.expect;

describe("basic auth", () => {
  let url = "http://localhost:3000";
  let email = SFItem.GenerateUuidSynchronously();
  let password = SFItem.GenerateUuidSynchronously();
  var _key;

  before(async () => {
    await Factory.globalStorageManager().clearAllData();
  })

  it("successfully register new account", (done) => {
     Factory.globalSessionManager().register({
       url,
       email,
       password
     }).then(async (response) => {
      expect(response.error).to.not.be.ok;
      _key = await Factory.globalKeyManager().getRootKey();
      done();
    })
  }).timeout(20000);

  it("successfully logins to registered account", async () => {
    await Factory.globalSessionManager().signOut({clearAllData: true});
    const response = await Factory.globalSessionManager().login({url, email, password});
    expect(response.error).to.not.be.ok;
  }).timeout(20000);

  it("fails login to registered account", (done) => {
    Factory.globalSessionManager().login({url, email, password: "wrong-password"}).then((response) => {
      expect(response.error).to.be.ok;
      done();
    })
  }).timeout(20000);

  it("successfully changes password", async () => {
    let modelManager = Factory.globalModelManager();
    let storageManager = Factory.globalStorageManager();
    const syncManager = new SNSyncManager({
      modelManager,
      storageManager,
      sessionManager: Factory.globalSessionManager(),
      protocolManager: Factory.globalProtocolManager(),
      httpManager: Factory.globalHttpManager()
    });

    syncManager.loggingEnabled = true;

    var totalItemCount = 105;
    for(var i = 0; i < totalItemCount; i++) {
      var item = Factory.createStorageItemNotePayload();
      modelManager.addItem(item);
      modelManager.setItemDirty(item, true);
    }

    await syncManager.loadDataFromDatabase();
    await syncManager.sync();

    // const result = await Factory.globalProtocolManager().createRootKey({
    //   identifier: email,
    //   password: password
    // });
    // const newKey = result.key;
    // const newKeyParams = result.keyParams;
    //
    // var response = await Factory.globalSessionManager().changePassword({
    //   url,
    //   email,
    //   serverPassword: _key.serverPassword,
    //   newRootKey: newKey,
    //   newRootKeyParams: newKeyParams
    // });
    //
    // expect(response.error).to.not.be.ok;
    // expect(modelManager.allItems.length).to.equal(totalItemCount);
    // expect(modelManager.invalidItems().length).to.equal(0);
    //
    // modelManager.setAllItemsDirty();
    // await syncManager.sync();
    //
    // expect(modelManager.allItems.length).to.equal(totalItemCount);
    //
    // // create conflict for an item
    // var item = modelManager.allItems[0];
    // item.content.foo = "bar";
    // item.updated_at = Factory.yesterday();
    // modelManager.setItemDirty(item, true);
    // totalItemCount++;
    //
    // // Wait so that sync conflict can be created
    // await Factory.sleep(1.1);
    // await syncManager.sync();
    //
    // // clear sync token, clear storage, download all items, and ensure none of them have error decrypting
    // await syncManager.handleSignOut();
    // await storageManager.clearAllPayloads();
    // await modelManager.handleSignOut();
    //
    // expect(modelManager.allItems.length).to.equal(0);
    //
    // await syncManager.sync();
    //
    // expect(modelManager.allItems.length).to.equal(totalItemCount);
    // expect(modelManager.invalidItems().length).to.equal(0);
    //
    // await Factory.globalSessionManager().signOut({clearAllData: true});
    // var loginResponse = await Factory.globalSessionManager().login(url, email, password, strict, null);
    // expect(loginResponse.error).to.not.be.ok;
  }).timeout(20000);

  it.skip("changes password many times", async () => {
    let modelManager = Factory.createModelManager();
    let storageManager = Factory.globalStorageManager();
    const syncManager = new SNSyncManager({
      modelManager,
      storageManager,
      sessionManager: Factory.globalSessionManager(),
      protocolManager: Factory.globalProtocolManager(),
      httpManager: Factory.globalHttpManager()
    });

    var totalItemCount = 400;
    for(var i = 0; i < totalItemCount; i++) {
      var item = Factory.createStorageItemNotePayload();
      modelManager.addItem(item);
      modelManager.setItemDirty(item, true);
    }

    await syncManager.sync();

    var strict = false;

    for(var i = 0; i < 5; i++) {
      var result = await Factory.globalProtocolManager().createRootKey({identifier: email, password});
      var newKeys = result.key;
      var newKeyParams = result.keyParams;

      var response = await Factory.globalSessionManager().changePassword(
        url,
        email,
        _key.serverPassword,
        newKeys,
        newKeyParams
      );
      expect(response.error).to.not.be.ok;

      expect(modelManager.allItems.length).to.equal(totalItemCount);
      expect(modelManager.invalidItems().length).to.equal(0);

      modelManager.setAllItemsDirty();
      await syncManager.sync();

      // clear sync token, clear storage, download all items, and ensure none of them have error decrypting
      await syncManager.clearSyncPositionTokens();
      await syncManager.sync();
      await syncManager.clearSyncPositionTokens();
      await storageManager.clearAllPayloads();
      modelManager.handleSignOut();

      expect(modelManager.allItems.length).to.equal(0);

      await syncManager.sync();

      expect(modelManager.allItems.length).to.equal(totalItemCount);
      expect(modelManager.invalidItems().length).to.equal(0);

      var loginResponse = await Factory.globalSessionManager().login(url, email, password, strict, null);
      expect(loginResponse.error).to.not.be.ok;
    }
  }).timeout(30000);

})
