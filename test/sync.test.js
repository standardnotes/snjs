import '../dist/regenerator.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';
import MemoryStorageManager from './lib/memoryStorageManager.js';

chai.use(chaiAsPromised);
var expect = chai.expect;

describe("local storage manager", () => {
  before(async () => {
    await Factory.globalStorageManager().clearAllData();
  })

  it("should set and retrieve values", async () => {
    var key = "foo";
    var value = "bar";
    await Factory.globalStorageManager().setItem(key, value);
    expect(await Factory.globalStorageManager().getItem(key)).to.eql(value);
  })

  it("should set and retrieve items", async () => {
    var item = Factory.createItem();
    await Factory.globalStorageManager().saveModel(item);

    return Factory.globalStorageManager().getAllModels().then((models) => {
      expect(models.length).to.equal(1);
    })
  })

  it("should clear values", async () => {
    var key = "foo";
    var value = "bar";
    await Factory.globalStorageManager().setItem(key, value);
    await Factory.globalStorageManager().clearAllData();
    expect(await Factory.globalStorageManager().getItem(key)).to.not.be.ok;
  })
})

describe('offline syncing', () => {
  let modelManager = Factory.createModelManager();
  let syncManager = new SFSyncManager(modelManager, Factory.globalStorageManager(), Factory.globalHttpManager());

  syncManager.setKeyRequestHandler(async () => {
    return {
      offline: true
    };
  })

  beforeEach(async () => {
    await Factory.globalStorageManager().clearAllData();
  });

  afterEach(async () => {
    expect(syncManager.isOutOfSync()).to.equal(false);
  })

  it("should sync basic model offline", async () => {
    var item = Factory.createItem();
    modelManager.addItem(item);
    modelManager.setItemDirty(item);

    let models = await Factory.globalStorageManager().getAllModels();
    expect(models.length).to.equal(0);

    await syncManager.loadLocalItems();
    await syncManager.sync()

    expect(modelManager.getDirtyItems().length).to.equal(0);
    models = await Factory.globalStorageManager().getAllModels();
    expect(models.length).to.equal(1);
  });

  it("should allow local saving before offline data has loaded, and should not overwrite present values when finished loading", async () => {
    let localModelManager = Factory.createModelManager();
    let localSyncManager = new SFSyncManager(localModelManager, Factory.globalStorageManager(), Factory.globalHttpManager());
    localSyncManager.setKeyRequestHandler(syncManager.keyRequestHandler);

    var item = Factory.createItem();
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
    let models = await Factory.globalStorageManager().getAllModels()
    expect(models.length).to.equal(1);

    let text = `${Math.random()}`;
    item.content.text = text;
    localModelManager.setItemDirty(item);

    // wait ~latency, then check to make sure that the local data load hasn't overwritten our dirty values.

    await Factory.sleep((latency/1000) + 0.1);
    expect(localModelManager.findItem(item.uuid).content.text).to.equal(text);

    models = await Factory.globalStorageManager().getAllModels()
    expect(models.length).to.equal(1);
    expect(modelManager.allItems.length).to.equal(1);
  }).timeout(5000);
});

describe('online syncing', () => {
  var email = Factory.globalCryptoManager().crypto.generateUUIDSync();
  var password = Factory.globalCryptoManager().crypto.generateUUIDSync();
  var totalItemCount = 0;

  const syncOptions = {
    performIntegrityCheck: true
  }

  before((done) => {
    Factory.globalStorageManager().clearAllData().then(() => {
      Factory.newRegisteredUser(email, password).then((user) => {
        done();
      })
    })
  })


  let authManager = Factory.globalAuthManager();
  let modelManager = Factory.createModelManager();
  let storageManager = Factory.globalStorageManager();
  let syncManager = new SFSyncManager(modelManager, Factory.globalStorageManager(), Factory.globalHttpManager());
  syncManager.MaxDiscordanceBeforeOutOfSync = 1;

  afterEach(async () => {
    expect(syncManager.isOutOfSync()).to.equal(false);
    expect(modelManager.allItems.length).to.equal(totalItemCount);
    let storageModels = await storageManager.getAllModels();
    expect(storageModels.length).to.equal(totalItemCount);
  })

  let keyRequestHandler = async () => {
    return {
      keys: await authManager.keys(),
      auth_params: await authManager.getAuthParams(),
      offline: false
    };
  };

  syncManager.setKeyRequestHandler(keyRequestHandler);

  const signout = async () => {
    await Factory.globalAuthManager().signout();
    await Factory.globalStorageManager().clearAllData();
    await syncManager.handleSignout();
    await modelManager.handleSignout();
    syncManager.setKeyRequestHandler(async () => {
      return {
        offline: true
      };
    })
  }

  const signin = async () => {
    await Factory.globalAuthManager().login(Factory.serverURL(), email, password, true, null);
    syncManager.setKeyRequestHandler(keyRequestHandler);
  }

  it("should register and sync basic model online", async () => {
    await syncManager.loadLocalItems();

    var item = Factory.createItem();
    modelManager.addItem(item);
    modelManager.setItemDirty(item);

    totalItemCount++;

    let response = await syncManager.sync(syncOptions);
    expect(response).to.be.ok;
    expect(modelManager.getDirtyItems().length).to.equal(0);
    let models = await Factory.globalStorageManager().getAllModels();
    expect(models.length).to.equal(totalItemCount);

    for(let model of models) {
      expect(model.dirty).to.not.be.ok;
    }
  }).timeout(60000);

  it("should login and retrieve synced item", async () => {
    // logout
    await Factory.globalAuthManager().signout();
    syncManager.clearSyncToken();
    await Factory.globalStorageManager().clearAllData();
    await Factory.globalAuthManager().login(Factory.serverURL(), email, password, true, null);

    await syncManager.loadLocalItems();
    let response = await syncManager.sync(syncOptions);
    expect(response).to.be.ok;
    let models = await Factory.globalStorageManager().getAllModels();
    expect(models.length).to.equal(totalItemCount);
  }).timeout(60000);

  it("every sync request should trigger a completion event", async () => {
    let syncCount = 10;
    let successes = 0;
    let events = 0;

    await syncManager.loadLocalItems();

    syncManager.addEventHandler(async (event, data) => {
      if(event == "sync:completed") {
        events++;
      }
    });

    let promises = [];
    for(let i = 0; i < syncCount; i++) {
      promises.push(syncManager.sync(syncOptions).then(() => {
        successes++;
      }));
    }

    await Promise.all(promises);

    expect(successes).to.equal(syncCount);
    // Only a fully executed sync request creates a sync:completed event.
    // We don't know how many will execute above.
    expect(events).to.be.at.least(1);

    // Since the syncs all happen after one another, extra syncs may be queued on that we are not awaiting.
    await Factory.sleep(0.5);
  }).timeout(60000);

  it("allows me to save data after I've signed out", async () => {
    let originalHandler = syncManager.keyRequestHandler;

    // useful if you run this test in isolation
    await syncManager.loadLocalItems();

    // logout
    await signout();

    let item = Factory.createItem();
    modelManager.addItem(item);
    modelManager.setItemDirty(item, true);
    totalItemCount++;

    await syncManager.sync(syncOptions);

    let models = await storageManager.getAllModels();
    expect(models.length).to.equal(1);
    expect(modelManager.allItems.length).to.equal(1);

    for(let model of models) {
      // Models saved offline have their dirty param stripped.
      expect(model.dirty).to.not.be.ok;
    }

    // set item to be merged for when sign in occurs
    modelManager.setItemDirty(item, true);

    expect(syncManager.isOutOfSync()).to.equal(false);

    expect(modelManager.getDirtyItems().length).to.equal(1);

    // Sign back in for next tests
    await signin();

    expect(modelManager.getDirtyItems().length).to.equal(1);

    await syncManager.sync(syncOptions);
    expect(syncManager.isOutOfSync()).to.equal(false);

    expect(modelManager.allItems.length).to.equal(totalItemCount);

    for(let item of modelManager.allItems)  {
      expect(item.content.title).to.be.ok;
    }

    models = await storageManager.getAllModels();
    for(let model of models) {
      // if an item comes back from the server, it is saved to disk immediately without a dirty value.
      expect(model.dirty).to.not.be.ok;
    }
  }).timeout(60000);

  it("mapping should not mutate items with error decrypting state", async () => {
    var item = Factory.createItem();
    let originalTitle = item.content.title;
    modelManager.addItem(item);
    modelManager.setItemDirty(item);
    await syncManager.loadLocalItems();
    await syncManager.sync(syncOptions);
    totalItemCount++;

    let keys = await authManager.keys();
    let authParams = await authManager.getAuthParams();
    var itemParams = await new SFItemParams(item, keys, authParams).paramsForSync();
    itemParams.errorDecrypting = true;
    let items = await modelManager.mapResponseItemsToLocalModels([itemParams]);
    let mappedItem = items[0];
    expect(typeof mappedItem.content).to.equal("string");

    await cryptoManager.decryptItem(itemParams, keys);
    items = await modelManager.mapResponseItemsToLocalModels([itemParams]);
    mappedItem = items[0];
    expect(typeof mappedItem.content).to.equal("object");
    expect(mappedItem.content.title).to.equal(originalTitle);
  }).timeout(60000);

  it("should handle sync conflicts by duplicating differing data", async () => {
    await syncManager.loadLocalItems();
    // create an item and sync it
    var item = Factory.createItem();
    modelManager.addItem(item);
    modelManager.setItemDirty(item);
    await syncManager.sync(syncOptions);
    totalItemCount++;

    let models = await Factory.globalStorageManager().getAllModels();
    expect(models.length).to.equal(totalItemCount);

    // modify this item to have stale values
    item.content.title = `${Math.random()}`;
    item.updated_at = Factory.yesterday();
    modelManager.setItemDirty(item);

    // We expect this item to be duplicated
    totalItemCount++;

    // // wait about 1s, which is the value the dev server will ignore conflicting changes
    await Factory.sleep(1.1);
    await syncManager.sync(syncOptions)

    let memModels = modelManager.allItems;
    expect(memModels.length).to.equal(totalItemCount);

    let storedModels = await Factory.globalStorageManager().getAllModels();
    expect(storedModels.length).to.equal(totalItemCount);
  }).timeout(60000);

  it("should duplicate item if saving a modified item and clearing our sync token", async () => {
    await syncManager.loadLocalItems();
    var item = Factory.createItem();
    modelManager.setItemDirty(item, true);
    modelManager.addItem(item);
    await syncManager.sync(syncOptions);
    totalItemCount++;

    // modify this item to have stale values
    let newTitle = `${Math.random()}`;
    item.content.title = newTitle;
    // Do not set updated_at to old value. We we intentionally want to avoid that scenario, since that's easily handled.
    // We're testing the case where we save something that will be retrieved.
    // Actually, as explained in sync-log, this would never happen. updated_at would always have an inferior value if it were in retrieved items and is dirty. (except if the sync token is explicitely cleared, but that never happens)
    item.updated_at = Factory.yesterday();
    modelManager.setItemDirty(item, true, true);

    // We expect this item to be duplicated
    totalItemCount++;

    await syncManager.clearSyncToken();
    // wait about 1s, which is the value the dev server will ignore conflicting changes
    await Factory.sleep(1.1);
    await syncManager.sync(syncOptions)

    // We expect the item title to be the new title, and not rolled back to original value
    expect(item.content.title).to.equal(newTitle);

    let memModels = modelManager.allItems;
    expect(memModels.length).to.equal(totalItemCount);

    let storedModels = await Factory.globalStorageManager().getAllModels();
    expect(storedModels.length).to.equal(totalItemCount);
  }).timeout(60000);


  it("should handle sync conflicts by not duplicating same data", async () => {
    await syncManager.loadLocalItems();
    // create an item and sync it
    var item = Factory.createItem();
    totalItemCount++;
    modelManager.setItemDirty(item, true);
    modelManager.addItem(item);
    await syncManager.sync(syncOptions);

    // keep item as is and set dirty
    modelManager.setItemDirty(item, true);

    // clear sync token so that all items are retrieved on next sync
    syncManager.clearSyncToken();

    // wait about 1s, which is the value the dev server will ignore conflicting changes
    await Factory.sleep(1.1);
    let response = await syncManager.sync(syncOptions);
    expect(response).to.be.ok;
    let models = await Factory.globalStorageManager().getAllModels();
    expect(models.length).to.equal(totalItemCount);
  }).timeout(60000);

  it('clearing conflict_of on two clients simultaneously should keep us in sync', async () => {
    await syncManager.loadLocalItems();
    let note = Factory.createItem();
    modelManager.addItem(note);
    modelManager.setItemDirty(note, true);
    totalItemCount += 1;

    // client A
    note.content.conflict_of = "foo";
    modelManager.setItemDirty(note, true);
    await syncManager.sync(syncOptions);

    // client B
    await syncManager.clearSyncToken();
    note.content.conflict_of = "bar";
    note.updated_at = Factory.yesterday();
    modelManager.setItemDirty(note, true);

    // We expect 1 additional duplicate
    totalItemCount += 1;

    await Factory.sleep(1.1);
    await syncManager.sync(syncOptions);

    expect(syncManager.isOutOfSync()).to.equal(false);
  }).timeout(60000);

  it('removes item from storage upon deletion', async () => {
    await syncManager.loadLocalItems();
    let note = Factory.createItem();
    modelManager.addItem(note);
    modelManager.setItemDirty(note, true);
    await syncManager.sync(syncOptions);

    totalItemCount += 1;
    expect(modelManager.allItems.length).to.equal(totalItemCount);

    modelManager.setItemToBeDeleted(note);
    totalItemCount -= 1;
    await syncManager.sync(syncOptions);

    // We expect that this item is now gone for good, and a duplicate has not been created.
    expect(modelManager.allItems.length).to.equal(totalItemCount);

    let storageModels = await storageManager.getAllModels();
    expect(storageModels.length).to.equal(totalItemCount)
  }).timeout(60000);

  it('handle case where server says item is deleted but client says its not deleted', async () => {
    await syncManager.loadLocalItems();
    let note = Factory.createItem();
    modelManager.addItem(note);
    modelManager.setItemDirty(note, true);
    await syncManager.sync(syncOptions);
    totalItemCount += 1;
    expect(modelManager.allItems.length).to.equal(totalItemCount);

    // client A
    modelManager.setItemToBeDeleted(note);
    modelManager.setItemDirty(note, true);
    await syncManager.sync(syncOptions);
    // Subtract 1
    totalItemCount -= 1;
    expect(modelManager.allItems.length).to.equal(totalItemCount);

    // client B
    await syncManager.clearSyncToken();

    // Add the item back and say it's not deleted
    modelManager.addItem(note);
    expect(modelManager.findItem(note.uuid).uuid).to.equal(note.uuid);
    note.deleted = false;
    note.updated_at = Factory.yesterday();
    modelManager.setItemDirty(note, true);

    await syncManager.sync(syncOptions);

    // We expect that this item is now gone for good, and a duplicate has not been created.
    expect(modelManager.allItems.length).to.equal(totalItemCount);

    let storageModels = await storageManager.getAllModels();
    expect(storageModels.length).to.equal(totalItemCount)
  }).timeout(60000);

  it('handle case where server says item is not deleted but client says it is deleted', async () => {
    await syncManager.loadLocalItems();
    let note = Factory.createItem();
    modelManager.addItem(note);
    modelManager.setItemDirty(note, true);
    totalItemCount += 1;

    // client A
    await syncManager.sync(syncOptions);
    expect(modelManager.allItems.length).to.equal(totalItemCount);

    // client B
    await syncManager.clearSyncToken();

    // This client says this item is deleted, but the server is saying its not deleted.
    // In this case, we want to keep the server copy.
    note.deleted = false;
    note.updated_at = Factory.yesterday();
    modelManager.setItemDirty(note, true);

    await syncManager.sync(syncOptions);

    // We expect that this item is now gone for good, and a duplicate has not been created.
    expect(modelManager.allItems.length).to.equal(totalItemCount);
  }).timeout(60000);

  it("should create conflict if syncing an item that is stale", async () => {
    // Typically if the client attempted to save an item for which the server has a newer change,
    // the server will instruct the client to duplicate it. But this only works according to the syncToken
    // sent in. However, when it comes to dealing with sync tokens and cursor tokens, it may be that
    // the subset of items sent up (limit ~150) does not match up with what the server has for a given token,
    // so the server will not determine that an incoming item has an existing change.

    // We'll simulate rogue client behavior here, which syncs up a stale note,
    // with a sync token that has already downloaded all changes. With as-of-now current server behavior, we expect it
    // to save the stale item (which is no good). After the server updates, it will
    // compare updated_at of any incoming items. If the incoming item updated_at does not match what the server has,
    // it means we're trying to save an item that hasn't been updated yet. We should conflict immediately at that point.

    await syncManager.loadLocalItems();

    var item = Factory.createItem();
    totalItemCount++;
    modelManager.setItemDirty(item, true);
    modelManager.addItem(item);
    await syncManager.sync(syncOptions);

    let yesterday = Factory.yesterday();
    item.content.text = "Stale text";
    item.updated_at = yesterday;
    modelManager.setItemDirty(item, true);
    await syncManager.sync(syncOptions);

    // We expect now that the item was conflicted
    totalItemCount++;

    let models = await Factory.globalStorageManager().getAllModels();
    expect(models.length).to.equal(totalItemCount);
    for(let model of models) {
      if(model.dirty) {
        console.error(model.uuid, "is still dirty.");
      }
      expect(model.dirty).to.not.be.ok;
    }
  }).timeout(60000);

  it('creating conflict with exactly equal content should keep us in sync', async () => {
    await syncManager.loadLocalItems();
    let note = Factory.createItem();
    modelManager.addItem(note);
    modelManager.setItemDirty(note, true);
    totalItemCount += 1;

    await syncManager.sync(syncOptions);

    note.updated_at = Factory.yesterday();
    modelManager.setItemDirty(note, true);

    await Factory.sleep(1.1);
    await syncManager.sync(syncOptions);

    expect(syncManager.isOutOfSync()).to.equal(false);
  }).timeout(60000);

  it('should keep an item dirty thats been modified after low latency sync request began', async () => {
    await syncManager.loadLocalItems();
    let note = Factory.createItem();
    note.content.text = "Initial value";
    modelManager.addItem(note);
    modelManager.setItemDirty(note, true);
    totalItemCount += 1;

    // client A. Don't await, we want to do other stuff.
    let slowSync = syncManager.sync({
      performIntegrityCheck: true,
      simulateHighLatency: true,
      simulatedLatency: 400
    });

    await Factory.sleep(0.2);

    // While that sync is going on, we want to modify this item many times.
    let text = `${Math.random()}`;
    note.content.text = text;
    // We want dirty count to be greater than 1.
    note.setDirty(true);
    note.setDirty(true);
    note.setDirty(true);

    // Now do a regular sync with no latency. As part of saving items offline presave,
    // we used to reset its dirty count back to 0. So then when the high latency request completes,
    // its dirty count is 0, and it will be cleared as dirty, causing the item to not sync again.
    let midSync = syncManager.sync(syncOptions);

    await Promise.all([slowSync, midSync]);
    // client B
    await syncManager.clearSyncToken();
    await syncManager.sync(syncOptions);

    // Expect that the server value and client value match, and no conflicts are created.
    expect(modelManager.allItems.length).to.equal(totalItemCount);
    expect(modelManager.findItem(note.uuid).content.text).to.equal(text);
  }).timeout(60000);

  it("should sync an item twice if it's marked dirty while a sync is ongoing", async () => {
    // create an item and sync it
    var item = Factory.createItem();
    modelManager.addItem(item);
    modelManager.setItemDirty(item, true);
    totalItemCount++;

    await syncManager.loadLocalItems();

    let syncRequest = syncManager.sync({
      performIntegrityCheck: true,
      simulateHighLatency: true,
      simulatedLatency: 500
    });

    setTimeout(function () {
      modelManager.setItemDirty(item, true);
    }, 100);

    await syncRequest;
    expect(modelManager.getDirtyItems().length).to.equal(1);
  }).timeout(60000);

  it.skip("marking an item dirty then saving to disk should retain that dirty state when restored", async () => {
    // This test is currently broken, but seems to have to do more with how the test was written than  an issue with the code.
    // create an item and sync it
    var item = Factory.createItem();
    modelManager.addItem(item);
    totalItemCount++;
    await syncManager.markAllItemsDirtyAndSaveOffline(false);

    modelManager.handleSignout();
    await syncManager.handleSignout();

    expect(modelManager.allItems.length).to.equal(0);

    await syncManager.loadLocalItems();
    expect(modelManager.allItems.length).to.equal(totalItemCount);

    item = modelManager.findItem(item.uuid);
    expect(item.dirty).to.equal(true);

    await syncManager.sync();
  }).timeout(60000);

  it('duplicating an item should maintian its relationships', async () => {
    await syncManager.loadLocalItems();
    var originalItem1 = Factory.createItem();
    originalItem1.content_type = "Foo";

    var originalItem2 = Factory.createItem();
    originalItem2.content_type = "Bar";

    originalItem1.addItemAsRelationship(originalItem2);
    await modelManager.mapResponseItemsToLocalModels([originalItem1, originalItem2]);

    totalItemCount += 2;

    originalItem1 = modelManager.findItem(originalItem1.uuid);
    originalItem2 = modelManager.findItem(originalItem2.uuid);

    expect(originalItem1).to.be.ok;
    expect(originalItem2).to.be.ok;

    expect(originalItem2.referencingObjects.length).to.equal(1);
    expect(originalItem2.referencingObjects).to.include(originalItem1);

    modelManager.setItemsDirty([originalItem1, originalItem2], true);

    await syncManager.sync(syncOptions);

    expect(modelManager.allItems.length).to.equal(totalItemCount);

    originalItem1.content.title = `${Math.random()}`
    originalItem1.updated_at = Factory.yesterday();
    modelManager.setItemDirty(originalItem1, true);

    // wait about 1s, which is the value the dev server will ignore conflicting changes
    await Factory.sleep(1.1);
    await syncManager.sync(syncOptions);
    // item should now be conflicted and a copy created
    totalItemCount++;
    expect(modelManager.allItems.length).to.equal(totalItemCount);
    let models = modelManager.allItemsMatchingTypes(["Foo"]);
    var item1 = models[0];
    var item2 = models[1];

    let storageModels = await storageManager.getAllModels();
    expect(storageModels.length).to.equal(totalItemCount);

    expect(item2.content.conflict_of).to.equal(item1.uuid);
    // Two items now link to this original object
    expect(originalItem2.referencingObjects.length).to.equal(2);
    expect(originalItem2.referencingObjects[0]).to.not.equal(originalItem2.referencingObjects[1]);

    expect(originalItem1.referencingObjects.length).to.equal(0);
    expect(item1.referencingObjects.length).to.equal(0);
    expect(item2.referencingObjects.length).to.equal(0);

    expect(item1.content.references.length).to.equal(1);
    expect(item2.content.references.length).to.equal(1);
    expect(originalItem2.content.references.length).to.equal(0);

    expect(modelManager.getDirtyItems().length).to.equal(0);

    for(let item of modelManager.allItems) {
      expect(item.dirty).to.not.be.ok;
    }
  }).timeout(60000);

  let largeItemCount = 160;

  it("should handle syncing pagination", async () => {
    for(var i = 0; i < largeItemCount; i++) {
      var item = Factory.createItem();
      modelManager.setItemDirty(item, true);
      modelManager.addItem(item);
    }

    totalItemCount += largeItemCount;

    let response = await syncManager.sync(syncOptions);
    expect(response).to.be.ok;
    let models = await Factory.globalStorageManager().getAllModels();
    expect(models.length).to.equal(totalItemCount);
  }).timeout(60000);

  it("should be able to download all items separate of sync", async () => {
    return expect(syncManager.stateless_downloadAllItems()).to.be.fulfilled.then(async (downloadedItems) => {
      expect(downloadedItems.length).to.equal(totalItemCount);
      // ensure it's decrypted
      expect(downloadedItems[0].content.text.length).to.be.above(1);
    })
  }).timeout(60000);

  it("load local items", async () => {
    let localModelManager = Factory.createModelManager();
    let localSyncManager = new SFSyncManager(localModelManager, Factory.globalStorageManager(), Factory.globalHttpManager());
    localSyncManager.setKeyRequestHandler(syncManager.keyRequestHandler);
    expect(localModelManager.allItems.length).to.equal(0);

    await localSyncManager.loadLocalItems();
    expect(localModelManager.allItems.length).to.equal(totalItemCount);
  }).timeout(60000);

  it("syncing a new item before local data has loaded should still persist the item to disk, even if sync is locked", async () => {
    let localModelManager = modelManager;
    let localSyncManager = syncManager;
    localSyncManager.__setLocalDataNotLoaded();
    localModelManager.handleSignout();
    localSyncManager.handleSignout();
    // localSyncManager.setKeyRequestHandler(syncManager.keyRequestHandler);
    expect(localModelManager.allItems.length).to.equal(0);

    expect(localModelManager.getDirtyItems().length).to.equal(0);

    let item = Factory.createItem();
    item.content.text = `${Math.random()}`;
    localModelManager.addItem(item);
    localModelManager.setItemDirty(item);
    totalItemCount++;

    expect(localModelManager.getDirtyItems().length).to.equal(1);

    await localSyncManager.sync(syncOptions);

    let storageModels = await storageManager.getAllModels();
    expect(storageModels.length).to.equal(totalItemCount);
    let savedModel = storageModels.find((m) => m.uuid == item.uuid);

    expect(savedModel.uuid).to.equal(item.uuid);
    expect(savedModel.dirty).equal(true);

    localSyncManager.handleSignout();
    localModelManager.handleSignout();

    await localSyncManager.loadLocalItems();
    expect(localModelManager.allItems.length).to.equal(totalItemCount);
    expect(localSyncManager.initialDataLoaded()).to.equal(true);

    await localSyncManager.sync(syncOptions);

    storageModels = await storageManager.getAllModels();
    expect(storageModels.length).to.equal(totalItemCount);

    let currentItem = localModelManager.findItem(item.uuid);
    expect(currentItem.content.text).to.equal(item.content.text);
    expect(currentItem.dirty).to.not.be.ok;
  }).timeout(60000);

  it("load local items should respect sort priority", async () => {
    let localModelManager = Factory.createModelManager();
    let localStorageManager = new MemoryStorageManager();
    let localSyncManager = new SFSyncManager(localModelManager, localStorageManager, Factory.globalHttpManager());
    localSyncManager.setKeyRequestHandler(async () => {
      return {
        offline: true
      };
    })

    let contentTypes = ["A", "B", "C"];
    let itemCount = 6;
    for(var i = 0; i < itemCount; i++) {
      var item = Factory.createItem();
      item.content_type = contentTypes[Math.floor(i/2)];
      modelManager.setItemDirty(item, true);
      localModelManager.addItem(item);
    }

    await localSyncManager.loadLocalItems();
    await localSyncManager.sync(syncOptions);
    let models = await localStorageManager.getAllModels();

    expect(models.length).to.equal(itemCount);

    // reset items
    localSyncManager.handleSignout();
    localModelManager.handleSignout();

    localSyncManager.contentTypeLoadPriority = ["C", "A", "B"];
    await localSyncManager.loadLocalItems();

    let items = localModelManager.allItems;

    expect(items[0].content_type).to.equal("C");
    expect(items[2].content_type).to.equal("A");
    expect(items[4].content_type).to.equal("B");
  }).timeout(60000);

  it("handles stale data in bulk", async () => {
    await syncManager.loadLocalItems();
    let itemCount = 160;
    // syncManager.PerSyncItemUploadLimit = 1;
    // syncManager.ServerItemDownloadLimit = 2;

    for(var i = 0; i < itemCount; i++) {
      var item = Factory.createItem();
      modelManager.setItemDirty(item, true);
      modelManager.addItem(item);
    }

    totalItemCount += itemCount;
    await syncManager.loadLocalItems();
    await syncManager.sync(syncOptions);
    let items = modelManager.allItems;
    expect(items.length).to.equal(totalItemCount);

    // We want to see what will happen if we upload everything we have to the server as dirty,
    // with no sync token, so that the server also gives us everything it has. Where I expect some awkwardness
    // is with subsets. That is, sync requests are broken up, so if I'm sending up 150/400, will the server know to conflict it?

    // With rails-engine behavior 0.3.1, we expect syncing up stale data with old updated_at dates
    // to overwrite whatever is on the server. With the 0.3.2 update, we expect this data will be conflicted
    // since what the server has for updated_at doesn't match what we're sending it.

    // In the test below, we expect all models to double. We'll modify the content, and act as if the change
    // were from yesterday. The server would have the current time as its updated_at. This test succeeds
    // when you're only dealing with 100 items. But if you go up to 300 where pagination is required, you can see
    // that the server can't properly handle conflicts. 0.3.2 of the server will add an additional conflict check
    // by comparing the incoming updated_at with the existing, and if it's in the past, we'll conflict it.

    let yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    for(let item of items) {
      item.content.text = `${Math.random()}`;
      item.updated_at = yesterday;
      modelManager.setItemDirty(item, true);
    }

    await syncManager.sync(syncOptions);

    // We expect all the models to have been duplicated now, exactly.
    totalItemCount *= 2;

    items = modelManager.allItems;
    expect(items.length).to.equal(totalItemCount);

    let storage = await Factory.globalStorageManager().getAllModels();
    expect(storage.length).to.equal(totalItemCount);
  }).timeout(60000);

  it("should sign in and retrieve large number of items", async () => {
    // logout
    await Factory.globalAuthManager().signout();
    syncManager.handleSignout();
    modelManager.handleSignout();

    await Factory.globalStorageManager().clearAllData();
    await Factory.globalAuthManager().login(Factory.serverURL(), email, password, true, null);

    let models = await Factory.globalStorageManager().getAllModels();
    expect(models.length).to.equal(0);

    await syncManager.loadLocalItems();
    await syncManager.sync(syncOptions);

    models = await Factory.globalStorageManager().getAllModels();
    expect(models.length).to.equal(totalItemCount);
  }).timeout(60000);

  it('when a note is conflicted, its tags should not be duplicated.', async () => {
    await syncManager.loadLocalItems();
    /*
      If you have a note and a tag, and the tag has 1 reference to the note,
      and you import the same two items, except modify the note value so that a duplicate is created,
      we expect only the note to be duplicated, and the tag not to.
      However, if only the note changes, and you duplicate the note, which causes the tag's references content to change,
      then when the incoming tag is being processed, it will also think it has changed, since our local value now doesn't match
      what's coming in. The solution is to get all values ahead of time before any changes are made.
    */
    var tag = Factory.createItem();
    tag.content_type = "Tag";

    var note = Factory.createItem();
    modelManager.addItem(note);
    modelManager.addItem(tag);
    tag.addItemAsRelationship(note);
    modelManager.setItemDirty(tag, true);
    modelManager.setItemDirty(note, true);
    totalItemCount += 2;

    await syncManager.sync(syncOptions);

    // conflict the note
    let newText = `${Math.random()}`;
    note.updated_at = Factory.yesterday();
    note.content.text = newText;
    modelManager.setItemDirty(note, true);

    // conflict the tag but keep its content the same
    tag.updated_at = Factory.yesterday();
    modelManager.setItemDirty(tag, true);

    await Factory.sleep(1.1);
    await syncManager.sync(syncOptions);

    // We expect now that the total item count has went up by just 1 (the note), and not 2 (the note and tag)
    totalItemCount += 1;
    expect(modelManager.allItems.length).to.equal(totalItemCount);
    expect(tag.content.references.length).to.equal(2);
  }).timeout(60000);

});

describe('sync params', () => {

  var _identifier = "hello@test.com";
  var _password = "password";
  var _authParams, _keys;

  before((done) => {
    // runs once before all tests in this block
    Factory.globalCryptoManager().generateInitialKeysAndAuthParamsForUser(_identifier, _password).then((result) => {
      _authParams = result.authParams;
      _keys = result.keys;
      done();
    })
  });

  it("returns valid encrypted params for syncing", async () => {
    var item = Factory.createItem();
    var itemParams = await new SFItemParams(item, _keys, _authParams).paramsForSync();
    expect(itemParams.enc_item_key).to.not.be.null;
    expect(itemParams.uuid).to.not.be.null;
    expect(itemParams.auth_hash).to.be.null;
    expect(itemParams.content_type).to.not.be.null;
    expect(itemParams.created_at).to.not.be.null;
    expect(itemParams.content).to.satisfy((string) => {
      return string.startsWith(Factory.globalCryptoManager().version());
    });
  });

  it("returns unencrypted params with no keys", async () => {
    var item = Factory.createItem();
    var itemParams = await new SFItemParams(item, null).paramsForSync();
    expect(itemParams.enc_item_key).to.be.null;
    expect(itemParams.auth_hash).to.be.null;
    expect(itemParams.uuid).to.not.be.null;
    expect(itemParams.content_type).to.not.be.null;
    expect(itemParams.created_at).to.not.be.null;
    expect(itemParams.content).to.satisfy((string) => {
      return string.startsWith("000");
    });
  });

  it("returns additional fields for local storage", async () => {
    var item = Factory.createItem();
    var itemParams = await new SFItemParams(item, _keys, _authParams).paramsForLocalStorage();
    expect(itemParams.enc_item_key).to.not.be.null;
    expect(itemParams.auth_hash).to.be.null;
    expect(itemParams.uuid).to.not.be.null;
    expect(itemParams.content_type).to.not.be.null;
    expect(itemParams.created_at).to.not.be.null;
    expect(itemParams.updated_at).to.not.be.null;
    expect(itemParams.deleted).to.not.be.null;
    expect(itemParams.errorDecrypting).to.not.be.null;
    expect(itemParams.content).to.satisfy((string) => {
      return string.startsWith(Factory.globalCryptoManager().version());
    });
  });

  it("omits deleted for export file", async () => {
    var item = Factory.createItem();
    var itemParams = await new SFItemParams(item, _keys, _authParams).paramsForExportFile();
    expect(itemParams.enc_item_key).to.not.be.null;
    expect(itemParams.uuid).to.not.be.null;
    expect(itemParams.content_type).to.not.be.null;
    expect(itemParams.created_at).to.not.be.null;
    expect(itemParams.deleted).to.not.be.ok;
    expect(itemParams.content).to.satisfy((string) => {
      return string.startsWith(Factory.globalCryptoManager().version());
    });
  });

  it("items with error decrypting should remain as is", async () => {
    var item = Factory.createItem();
    item.errorDecrypting = true;
    var itemParams = await new SFItemParams(item, _keys, _authParams).paramsForSync();
    expect(itemParams.content).to.eql(item.content);
    expect(itemParams.enc_item_key).to.not.be.null;
    expect(itemParams.uuid).to.not.be.null;
    expect(itemParams.content_type).to.not.be.null;
    expect(itemParams.created_at).to.not.be.null;
  });
});

describe('sync discordance', () => {
  var email = Factory.globalCryptoManager().crypto.generateUUIDSync();
  var password = Factory.globalCryptoManager().crypto.generateUUIDSync();
  var totalItemCount = 0;

  let localStorageManager = new MemoryStorageManager();
  let localAuthManager = new SFAuthManager(localStorageManager, Factory.globalHttpManager());
  let localHttpManager = new SFHttpManager();
  localHttpManager.setJWTRequestHandler(async () => {
    return localStorageManager.getItem("jwt");;
  })
  let localModelManager = Factory.createModelManager();
  let localSyncManager = new SFSyncManager(localModelManager, localStorageManager, localHttpManager);

  before((done) => {
    localStorageManager.clearAllData().then(() => {
      Factory.newRegisteredUser(email, password, localAuthManager).then((user) => {
        done();
      })
    })
  })

  beforeEach(async () => {
    await localSyncManager.loadLocalItems();
  });

  let itemCount = 0;

  localSyncManager.setKeyRequestHandler(async () => {
    return {
      keys: await localAuthManager.keys(),
      auth_params: await localAuthManager.getAuthParams(),
      offline: false
    };
  })

  it("should begin discordance upon instructions", async () => {
    let response = await localSyncManager.sync({performIntegrityCheck: false});
    expect(response.integrity_hash).to.not.be.ok;

    response = await localSyncManager.sync({performIntegrityCheck: true});
    expect(response.integrity_hash).to.not.be.null;

    // integrity should be valid
    expect(localSyncManager.syncDiscordance).to.equal(0);

    // sync should no longer request integrity hash from server
    response = await localSyncManager.sync({performIntegrityCheck: false});
    expect(response.integrity_hash).to.not.be.ok;

    // we expect another integrity check here
    response = await localSyncManager.sync({performIntegrityCheck: true});
    expect(response.integrity_hash).to.not.be.null;

    // integrity should be valid
    expect(localSyncManager.syncDiscordance).to.equal(0);
  }).timeout(10000);

  it("should increase discordance as client server mismatches", async () => {
    let response = await localSyncManager.sync();

    var item = Factory.createItem();
    localModelManager.setItemDirty(item, true);
    localModelManager.addItem(item);
    itemCount++;

    await localSyncManager.sync({performIntegrityCheck: true});

    // Expect no discordance
    expect(localSyncManager.syncDiscordance).to.equal(0);

    // Delete item locally only without notifying server. We should then be in discordance.
    await localModelManager.removeItemLocally(item);

    // wait for integrity check interval
    await localSyncManager.sync({performIntegrityCheck: true});

    // repeat syncs for sync discordance are not waited for, so we have to sleep for a bit here
    await Factory.sleep(0.2);

    // We expect now to be in discordance. What the client has is different from what the server has
    // The above sync will not resolve until it syncs enough time to meet discordance threshold
    expect(localSyncManager.syncDiscordance).to.equal(localSyncManager.MaxDiscordanceBeforeOutOfSync);

    // We now expect out of sync to be true, since we have reached MaxDiscordanceBeforeOutOfSync
    expect(localSyncManager.isOutOfSync()).to.equal(true);

    // Integrity checking should now be disabled until the next interval
    response = await localSyncManager.sync();
    expect(response.integrity_hash).to.not.be.ok;

    // We should still be in discordance and out of sync at this point
    expect(localSyncManager.syncDiscordance).to.equal(localSyncManager.MaxDiscordanceBeforeOutOfSync);
    expect(localSyncManager.isOutOfSync()).to.equal(true);

    // We will now reinstate the item and sync, which should repair everything
    localModelManager.addItem(item);
    localModelManager.setItemDirty(item, true);
    await localSyncManager.sync({performIntegrityCheck: true});

    expect(localSyncManager.isOutOfSync()).to.equal(false);
    expect(localSyncManager.syncDiscordance).to.equal(0);
  }).timeout(10000);

  it("should perform sync resolution in which differing items are duplicated instead of merged", async () => {
    var item = Factory.createItem();
    localModelManager.addItem(item);
    localModelManager.setItemDirty(item, true);
    itemCount++;

    await localSyncManager.sync();

    // Delete item locally only without notifying server. We should then be in discordance.
    // Don't use localModelManager.removeItemLocally(item), as it saves some state about itemsPendingDeletion. Use internal API

    localModelManager.items = localModelManager.items.filter((candidate) => candidate.uuid != item.uuid);
    delete localModelManager.itemsHash[item.uuid]

    await localSyncManager.sync({performIntegrityCheck: true});
    // repeat syncs for sync discordance are not waited for, so we have to sleep for a bit here
    await Factory.sleep(0.2);
    expect(localSyncManager.isOutOfSync()).to.equal(true);

    // lets resolve sync where content does not differ
    await localSyncManager.resolveOutOfSync();
    expect(localSyncManager.isOutOfSync()).to.equal(false);

    // expect a clean merge
    expect(localModelManager.allItems.length).to.equal(itemCount);

    // lets enter back into out of sync
    item = localModelManager.allItems[0];
    // now lets change the local content without syncing it.
    item.content.text = "discordance";

    // When we resolve out of sync now (even though we're not currently officially out of sync)
    // we expect that the remote content coming in doesn't wipe out our pending change. A conflict should be created
    await localSyncManager.resolveOutOfSync();
    expect(localSyncManager.isOutOfSync()).to.equal(false);
    expect(localModelManager.allItems.length).to.equal(itemCount + 1);

    for(let item of localModelManager.allItems) {
      expect(item.uuid).not.be.null;
    }

    // now lets sync the item, just to make sure it doesn't cause any problems
    localModelManager.setItemDirty(item, true);
    await localSyncManager.sync({performIntegrityCheck: true});
    expect(localSyncManager.isOutOfSync()).to.equal(false);
    expect(localModelManager.allItems.length).to.equal(itemCount + 1);
  });
});

describe('http manager', () => {

  const httpManager = Factory.globalHttpManager();

  it("formats urls properly 1", async () => {
    let url = "http://example.org";
    let params = {foo: "bar"};
    let result = url + "?foo=bar";

    expect(httpManager.urlForUrlAndParams(url, params)).to.equal(result);
  });

  it("formats urls properly 2", async () => {
    let url = "http://example.org?name=java";
    let params = {foo: "bar"};
    let result = url + "&foo=bar";

    expect(httpManager.urlForUrlAndParams(url, params)).to.equal(result);
  });

});
