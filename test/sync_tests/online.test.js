import '../../node_modules/regenerator-runtime/runtime.js';
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import '../vendor/chai-as-promised-built.js';
import Factory from '../lib/factory.js';
import MemoryStorageManager from '../lib/persist/storage/memoryStorageManager.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('online syncing', () => {
  const BASE_ITEM_COUNT = 1; /** Default items key */
  let sharedNoteCount = 0;

  const syncOptions = {
    checkIntegrity: true
  }
  let _key, _keyParams;
  let sharedApplication;

  before(async function() {
    localStorage.clear();
    sharedApplication = await Factory.createInitAppWithRandNamespace();
    sharedApplication.syncManager.MaxDiscordanceBeforeOutOfSync = 1;
    const sharedEmail = SFItem.GenerateUuidSynchronously();
    const sharedPassword = SFItem.GenerateUuidSynchronously();
    await Factory.registerUserToApplication({
      application: sharedApplication,
      email: sharedEmail,
      password: sharedPassword
    });
  })

  after(async function() {
    localStorage.clear();
  })

  beforeEach(async function() {
    this.application = await Factory.createInitAppWithRandNamespace();
    this.email = SFItem.GenerateUuidSynchronously();
    this.password = SFItem.GenerateUuidSynchronously();
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password
    });
  })

  afterEach(async function() {
    expect(sharedApplication.syncManager.isOutOfSync()).to.equal(false);
    expect(sharedApplication.modelManager.notes.length).to.equal(sharedNoteCount);
    const storageModels = await sharedApplication.storageManager.getAllRawPayloads();
    const storageNotes = noteObjectsFromObjects(storageModels);
    expect(storageNotes.length).to.equal(sharedNoteCount);
  })

  function noteObjectsFromObjects(items) {
    return items.filter((item) => item.content_type === 'Note');
  }

  const signOut = async function() {
    await sharedApplication.signOut();
  }

  const signin = async function() {
    await Factory.globalSessionManager().login(Factory.serverURL(), email, password, true, null);
  }

  it("should register and sync basic model online", async function() {
    const note = await Factory.createMappedNote(this.application);
    this.application.modelManager.setItemDirty(note);
    this.application.syncManager.loggingEnabled = true;
    await this.application.syncManager.sync(syncOptions);
    expect(this.application.modelManager.getDirtyItems().length).to.equal(0);
    expect(note.dirty).to.not.be.ok;

    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    const notePayloads = noteObjectsFromObjects(rawPayloads);
    expect(notePayloads.length).to.equal(1);
    for(const rawNote of notePayloads) {
      expect(rawNote.dirty).to.not.be.ok;
    }
    /** Items key and note */
    expect(rawPayloads.length).to.equal(2);
  }).timeout(60000);

  it("should login and retrieve synced item", async function() {
    const note = await Factory.createSyncedNote(this.application);
    await this.application.signOut({clearAllData: true});

    await Factory.loginToApplication({
      application: this.application,
      email: this.email,
      password: this.password
    })

    await this.application.syncManager.sync(syncOptions);
    const notes = this.application.modelManager.notes;
    expect(notes.length).to.equal(1);
    expect(notes[0].title).to.equal(note.title);
  }).timeout(60000);

  it("resolve on next timing strategy", async function() {
    const syncCount = 7;
    let successes = 0;
    let events = 0;

    this.application.syncManager.beginLatencySimulator(250);
    this.application.syncManager.addEventObserver({callback: (event, data) => {
      if(event === SYNC_EVENT_FULL_SYNC_COMPLETED) {
        events++;
      }
    }});

    const promises = [];
    for(let i = 0; i < syncCount; i++) {
      promises.push(this.application.syncManager.sync({
        timingStrategy: TIMING_STRATEGY_RESOLVE_ON_NEXT
      }).then(() => {
        successes++;
      }));
    }

    await Promise.all(promises);
    expect(successes).to.equal(syncCount);
    // Only a fully executed sync request creates a sync:completed event.
    // We don't know how many will execute above.
    expect(events).to.be.at.least(1);

    this.application.syncManager.endLatencySimulator();
    // Since the syncs all happen after one another, extra syncs may be queued on that we are not awaiting.
    await Factory.sleep(0.5);
  }).timeout(60000);

  it("force spawn new timing strategy", async function() {
    const syncCount = 7;
    let successes = 0;
    let events = 0;

    this.application.syncManager.beginLatencySimulator(250);

    this.application.syncManager.addEventObserver({callback: (event, data) => {
      if(event === SYNC_EVENT_FULL_SYNC_COMPLETED) {
        events++;
      }
    }});

    const promises = [];
    for(let i = 0; i < syncCount; i++) {
      promises.push(
        this.application.syncManager.sync({
          timingStrategy: TIMING_STRATEGY_FORCE_SPAWN_NEW
        }).then(() => {
          successes++;
        })
      );
    }
    await Promise.all(promises);
    expect(successes).to.equal(syncCount);
    expect(events).to.equal(syncCount);
    this.application.syncManager.endLatencySimulator();
  }).timeout(60000);

  it("allows me to save data after I've signed out", async function() {
    expect(this.application.modelManager.itemsKeys.length).to.equal(1);
    await this.application.signOut();
    let note = await Factory.createMappedNote(this.application);
    this.application.modelManager.setItemDirty(note, true);
    await this.application.syncManager.sync(syncOptions);
    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    const notePayload = noteObjectsFromObjects(rawPayloads);
    expect(notePayload.length).to.equal(1);
    expect(this.application.modelManager.notes.length).to.equal(1);

    note = this.application.modelManager.notes[0];

    // set item to be merged for when sign in occurs
    await this.application.syncManager.markAllItemsAsNeedingSync();
    expect(this.application.syncManager.isOutOfSync()).to.equal(false);
    expect(this.application.modelManager.getDirtyItems().length).to.equal(1);

    // Sign back in for next tests
    await Factory.loginToApplication({
      application: this.application,
      email: this.email,
      password: this.password
    })

    expect(this.application.modelManager.getDirtyItems().length).to.equal(0);
    expect(this.application.modelManager.itemsKeys.length).to.equal(1);
    expect(this.application.syncManager.isOutOfSync()).to.equal(false);
    expect(this.application.modelManager.notes.length).to.equal(1);

    for(let item of this.application.modelManager.notes)  {
      expect(item.content.title).to.be.ok;
    }

    const updatedRawPayloads = await this.application.storageManager.getAllRawPayloads();
    for(let payload of updatedRawPayloads) {
      // if an item comes back from the server, it is saved to disk immediately without a dirty value.
      expect(payload.dirty).to.not.be.ok;
    }
  }).timeout(60000);

  it("mapping should not mutate items with error decrypting state", async function() {
    const note = await Factory.createMappedNote(this.application);
    const originalTitle = note.content.title;
    this.application.modelManager.setItemDirty(note, true);
    await this.application.syncManager.sync(syncOptions);

    const encrypted = await this.application.protocolManager.payloadByEncryptingPayload({
      payload: note.payloadRepresentation(),
      intent: ENCRYPTION_INTENT_SYNC
    });
    const errorred = CreateMaxPayloadFromAnyObject({
      object: encrypted,
      override: {
        errorDecrypting: true
      }
    })
    const items = await this.application.modelManager.mapPayloadsToLocalItems({
      payloads: [errorred]
    });
    const mappedItem = items[0];
    expect(typeof mappedItem.content).to.equal("string");

    const decryptedPayload = await this.application.protocolManager
    .payloadByDecryptingPayload({
      payload: errorred
    });
    const mappedItems2 = await this.application.modelManager.mapPayloadsToLocalItems({
      payloads: [decryptedPayload]
    });
    const mappedItem2 = mappedItems2[0];
    expect(typeof mappedItem2.content).to.equal("object");
    expect(mappedItem2.content.title).to.equal(originalTitle);
  }).timeout(60000);

  it.only("should create conflicted copy if incoming server item attempts to overwrite local dirty item",
  async function() {
    let expectedItemCount = BASE_ITEM_COUNT;
    // create an item and sync it
    const note = await Factory.createMappedNote(this.application);
    expectedItemCount++;
    this.application.modelManager.setItemDirty(note);
    await this.application.syncManager.sync(syncOptions);

    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(expectedItemCount);

    const originalValue = note.title;
    const dirtyValue = `${Math.random()}`;

    // modify this item locally to have differing contents from server
    note.title = dirtyValue;
    // Intentionally don't change updated_at. We want to simulate a chaotic case where
    // for some reason we receive an item with different content but the same updated_at.
    // item.updated_at = Factory.yesterday();
    await this.application.modelManager.setItemDirty(note);

    // Download all items from the server, which will include this item.
    await this.application.syncManager.clearSyncPositionTokens();
    await this.application.syncManager.sync(syncOptions);

    // We expect this item to be duplicated
    expectedItemCount++;
    expect(this.application.modelManager.notes.length).to.equal(2);

    const allItems = this.application.modelManager.allItems;
    expect(allItems.length).to.equal(expectedItemCount);

    const originalItem = this.application.modelManager.findItem(note.uuid);
    const duplicateItem = allItems.find((i) => i.content.conflict_of === note.uuid);

    expect(originalItem.title).to.equal(dirtyValue);
    expect(duplicateItem.title).to.equal(originalValue);
    expect(originalItem.title).to.not.equal(duplicateItem.title);

    const newRawPayloads = await this.application.storageManager.getAllRawPayloads();
    expect(newRawPayloads.length).to.equal(expectedItemCount);
  }).timeout(60000);

  it("should handle sync conflicts by duplicating differing data", async function() {
    await this.application.syncManager.loadDataFromDatabase();
    // create an item and sync it
    var item = Factory.createStorageItemNotePayload();
    this.application.modelManager.addItem(item);
    this.application.modelManager.setItemDirty(item);
    await this.application.syncManager.sync(syncOptions);
    sharedNoteCount++;

    let models = await this.application.storageManager.getAllRawPayloads();
    expect(models.length).to.equal(sharedNoteCount);

    // modify this item to have stale values
    item.title = `${Math.random()}`;
    item.updated_at = Factory.yesterday();
    this.application.modelManager.setItemDirty(item);

    // We expect this item to be duplicated
    sharedNoteCount++;

    // // wait about 1s, which is the value the dev server will ignore conflicting changes
    await Factory.sleep(1.1);
    await this.application.syncManager.sync(syncOptions)

    let memModels = this.application.modelManager.allItems;
    expect(memModels.length).to.equal(sharedNoteCount);

    let storedModels = await this.application.storageManager.getAllRawPayloads();
    expect(storedModels.length).to.equal(sharedNoteCount);
  }).timeout(60000);

  it("should duplicate item if saving a modified item and clearing our sync token", async function() {
    await this.application.syncManager.loadDataFromDatabase();
    var item = Factory.createStorageItemNotePayload();
    this.application.modelManager.setItemDirty(item, true);
    this.application.modelManager.addItem(item);
    await this.application.syncManager.sync(syncOptions);
    sharedNoteCount++;

    // modify this item to have stale values
    let newTitle = `${Math.random()}`;
    item.title = newTitle;
    // Do not set updated_at to old value. We we intentionally want to avoid that scenario, since that's easily handled.
    // We're testing the case where we save something that will be retrieved.
    // Actually, as explained in sync-log, this would never happen. updated_at would always have an inferior value if it were in retrieved items and is dirty. (except if the sync token is explicitely cleared, but that never happens)
    item.updated_at = Factory.yesterday();
    this.application.modelManager.setItemDirty(item, true, true);

    // We expect this item to be duplicated
    sharedNoteCount++;

    await this.application.syncManager.clearSyncPositionTokens();
    await this.application.syncManager.sync(syncOptions)

    // We expect the item title to be the new title, and not rolled back to original value
    expect(item.content.title).to.equal(newTitle);

    let memModels =this.application.modelManager.allItems;
    expect(memModels.length).to.equal(sharedNoteCount);

    let storedModels = await this.application.storageManager.getAllRawPayloads();
    expect(storedModels.length).to.equal(sharedNoteCount);
  }).timeout(60000);


  it("should handle sync conflicts by not duplicating same data", async function() {
    await this.application.syncManager.loadDataFromDatabase();
    // create an item and sync it
    var item = Factory.createStorageItemNotePayload();
    sharedNoteCount++;
   this.application.modelManager.setItemDirty(item, true);
    this.application.modelManager.addItem(item);
    await this.application.syncManager.sync(syncOptions);

    // keep item as is and set dirty
    this.application.modelManager.setItemDirty(item, true);

    // clear sync token so that all items are retrieved on next sync
    this.application.syncManager.clearSyncPositionTokens();

    // wait about 1s, which is the value the dev server will ignore conflicting changes
    await Factory.sleep(1.1);
    let response = await this.application.syncManager.sync(syncOptions);
    expect(response).to.be.ok;
    let models = await this.application.storageManager.getAllRawPayloads();
    expect(models.length).to.equal(sharedNoteCount);
  }).timeout(60000);

  it('clearing conflict_of on two clients simultaneously should keep us in sync', async function() {
    await this.application.syncManager.loadDataFromDatabase();
    let note = Factory.createStorageItemNotePayload();
    this.application.modelManager.addItem(note);
    this.application.modelManager.setItemDirty(note, true);
    sharedNoteCount += 1;

    // client A
    note.content.conflict_of = "foo";
    this.application.modelManager.setItemDirty(note, true);
    await this.application.syncManager.sync(syncOptions);

    // client B
    await this.application.syncManager.clearSyncPositionTokens();
    note.content.conflict_of = "bar";
    note.updated_at = Factory.yesterday();
    this.application.modelManager.setItemDirty(note, true);

    // We expect 1 additional duplicate
    sharedNoteCount += 1;

    await Factory.sleep(1.1);
    await this.application.syncManager.sync(syncOptions);

    expect(syncManager.isOutOfSync()).to.equal(false);
  }).timeout(60000);

  it('removes item from storage upon deletion', async function() {
    await this.application.syncManager.loadDataFromDatabase();
    let note = Factory.createStorageItemNotePayload();
    this.application.modelManager.addItem(note);
    this.application.modelManager.setItemDirty(note, true);
    await this.application.syncManager.sync(syncOptions);

    sharedNoteCount += 1;
    expect(modelManager.allItems.length).to.equal(sharedNoteCount);

    this.application.modelManager.setItemToBeDeleted(note);
    sharedNoteCount -= 1;
    await this.application.syncManager.sync(syncOptions);

    // We expect that this item is now gone for good, and a duplicate has not been created.
    expect(modelManager.allItems.length).to.equal(sharedNoteCount);

    let storageModels = await storageManager.getAllRawPayloads();
    expect(storageModels.length).to.equal(sharedNoteCount)
  }).timeout(60000);

  it('handle case where server says item is deleted but client says its not deleted', async function() {
    await this.application.syncManager.loadDataFromDatabase();
    let note = Factory.createStorageItemNotePayload();
    this.application.modelManager.addItem(note);
    this.application.modelManager.setItemDirty(note, true);
    await this.application.syncManager.sync(syncOptions);
    sharedNoteCount += 1;
    expect(modelManager.allItems.length).to.equal(sharedNoteCount);

    // client A
    this.application.modelManager.setItemToBeDeleted(note);
    this.application.modelManager.setItemDirty(note, true);
    await this.application.syncManager.sync(syncOptions);
    // Subtract 1
    sharedNoteCount -= 1;
    expect(modelManager.allItems.length).to.equal(sharedNoteCount);

    // client B
    await this.application.syncManager.clearSyncPositionTokens();

    // Add the item back and say it's not deleted
    this.application.modelManager.addItem(note);
    expect(modelManager.findItem(note.uuid).uuid).to.equal(note.uuid);
    note.deleted = false;
    note.updated_at = Factory.yesterday();
    this.application.modelManager.setItemDirty(note, true);

    await this.application.syncManager.sync(syncOptions);

    // We expect that this item is now gone for good, and a duplicate has not been created.
    expect(modelManager.allItems.length).to.equal(sharedNoteCount);

    let storageModels = await storageManager.getAllRawPayloads();
    expect(storageModels.length).to.equal(sharedNoteCount)
  }).timeout(60000);

  it('handle case where server says item is not deleted but client says it is deleted', async function() {
    await this.application.syncManager.loadDataFromDatabase();
    let note = Factory.createStorageItemNotePayload();
    this.application.modelManager.addItem(note);
    this.application.modelManager.setItemDirty(note, true);
    sharedNoteCount += 1;

    // client A
    await this.application.syncManager.sync(syncOptions);
    expect(modelManager.allItems.length).to.equal(sharedNoteCount);

    // client B
    await this.application.syncManager.clearSyncPositionTokens();

    // This client says this item is deleted, but the server is saying its not deleted.
    // In this case, we want to keep the server copy.
    note.deleted = false;
    note.updated_at = Factory.yesterday();
    this.application.modelManager.setItemDirty(note, true);

    await this.application.syncManager.sync(syncOptions);

    // We expect that this item is now gone for good, and a duplicate has not been created.
    expect(modelManager.allItems.length).to.equal(sharedNoteCount);
  }).timeout(60000);

  it("should create conflict if syncing an item that is stale", async function() {
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

    await this.application.syncManager.loadDataFromDatabase();

    var item = Factory.createStorageItemNotePayload();
    sharedNoteCount++;
    this.application.modelManager.setItemDirty(item, true);
    this.application.modelManager.addItem(item);
    await this.application.syncManager.sync(syncOptions);

    let yesterday = Factory.yesterday();
    item.text = "Stale text";
    item.updated_at = yesterday;
    this.application.modelManager.setItemDirty(item, true);
    await this.application.syncManager.sync(syncOptions);

    // We expect now that the item was conflicted
    sharedNoteCount++;

    let models = await this.application.storageManager.getAllRawPayloads();
    expect(models.length).to.equal(sharedNoteCount);
    for(let model of models) {
      if(model.dirty) {
        console.error(model.uuid, "is still dirty.");
      }
      expect(model.dirty).to.not.be.ok;
    }
  }).timeout(60000);

  it('creating conflict with exactly equal content should keep us in sync', async function() {
    await this.application.syncManager.loadDataFromDatabase();
    let note = Factory.createStorageItemNotePayload();
    this.application.modelManager.addItem(note);
    this.application.modelManager.setItemDirty(note, true);
    sharedNoteCount += 1;

    await this.application.syncManager.sync(syncOptions);

    note.updated_at = Factory.yesterday();
    this.application.modelManager.setItemDirty(note, true);

    await Factory.sleep(1.1);
    await this.application.syncManager.sync(syncOptions);

    expect(syncManager.isOutOfSync()).to.equal(false);
  }).timeout(60000);

  it('should keep an item dirty thats been modified after low latency sync request began', async function() {
    await this.application.syncManager.loadDataFromDatabase();
    let note = Factory.createStorageItemNotePayload();
    note.text = "Initial value";
    this.application.modelManager.addItem(note);
    this.application.modelManager.setItemDirty(note, true);
    sharedNoteCount += 1;

    // client A. Don't await, we want to do other stuff.
    let slowSync = this.application.syncManager.sync({
      checkIntegrity: true,
      simulateHighLatency: true,
      simulatedLatency: 400
    });

    await Factory.sleep(0.2);

    // While that sync is going on, we want to modify this item many times.
    let text = `${Math.random()}`;
    note.text = text;
    // We want dirty count to be greater than 1.
    await this.application.modelManager.setItemDirty(note);
    await this.application.modelManager.setItemDirty(note);
    await this.application.modelManager.setItemDirty(note);

    // Now do a regular sync with no latency. As part of saving items offline presave,
    // we used to reset its dirty count back to 0. So then when the high latency request completes,
    // its dirty count is 0, and it will be cleared as dirty, causing the item to not sync again.
    let midSync = this.application.syncManager.sync(syncOptions);

    await Promise.all([slowSync, midSync]);

    // Awaiting above may not properly wait for 2 distinct requests. See Known Issues #1
    await Factory.sleep(0.5);

    // client B
    await this.application.syncManager.clearSyncPositionTokens();
    await this.application.syncManager.sync(syncOptions);

    // Expect that the server value and client value match, and no conflicts are created.
    expect(modelManager.allItems.length).to.equal(sharedNoteCount);
    expect(modelManager.findItem(note.uuid).content.text).to.equal(text);
    expect(modelManager.findItem(note.uuid).text).to.equal(text);
  }).timeout(60000);

  it("should sync an item twice if it's marked dirty while a sync is ongoing", async function() {
    // create an item and sync it
    var item = Factory.createStorageItemNotePayload();
    this.application.modelManager.addItem(item);
    this.application.modelManager.setItemDirty(item, true);
    sharedNoteCount++;

    await this.application.syncManager.loadDataFromDatabase();

    let syncRequest = this.application.syncManager.sync({
      checkIntegrity: true,
      simulateHighLatency: true,
      simulatedLatency: 500
    });

    setTimeout(function () {
      this.application.modelManager.setItemDirty(item, true);
    }, 100);

    await syncRequest;
    expect(modelManager.getDirtyItems().length).to.equal(1);
  }).timeout(60000);

  it.skip("marking an item dirty then saving to disk should retain that dirty state when restored", async function() {
    // This test is currently broken, but seems to have to do more with how the test was written than  an issue with the code.
    // create an item and sync it
    var item = Factory.createStorageItemNotePayload();
    this.application.modelManager.addItem(item);
    sharedNoteCount++;
    await this.application.syncManager.markAllItemsAsNeedingSync({
      alternateUuids: false
    });

    this.application.modelManager.handleSignOut();
    await this.application.syncManager.handleSignOut();

    expect(modelManager.allItems.length).to.equal(0);

    await this.application.syncManager.loadDataFromDatabase();
    expect(modelManager.allItems.length).to.equal(sharedNoteCount);

    item = this.application.modelManager.findItem(item.uuid);
    expect(item.dirty).to.equal(true);

    await this.application.syncManager.sync();
  }).timeout(60000);

  it('duplicating an item should maintian its relationships', async function() {
    await this.application.syncManager.loadDataFromDatabase();
    var originalItem1 = Factory.createStorageItemPayload("Foo");
    var originalItem2 = Factory.createStorageItemPayload("Bar");

    originalItem1.addItemAsRelationship(originalItem2);
    await this.application.modelManager.mapPayloadsToLocalItems({payloads: [originalItem1, originalItem2]});

    sharedNoteCount += 2;

    originalItem1 = this.application.modelManager.findItem(originalItem1.uuid);
    originalItem2 = this.application.modelManager.findItem(originalItem2.uuid);

    expect(originalItem1).to.be.ok;
    expect(originalItem2).to.be.ok;

    expect(originalItem2.referencingItemsCount).to.equal(1);
    expect(originalItem2.allReferencingItems).to.include(originalItem1);

    this.application.modelManager.setItemsDirty([originalItem1, originalItem2], true);

    await this.application.syncManager.sync(syncOptions);

    expect(modelManager.allItems.length).to.equal(sharedNoteCount);

    // Non-Note items should set .content directly
    originalItem1.content.title = `${Math.random()}`
    originalItem1.updated_at = Factory.yesterday();
    this.application.modelManager.setItemDirty(originalItem1, true);

    await this.application.syncManager.sync(syncOptions);
    // item should now be conflicted and a copy created
    sharedNoteCount++;
    expect(modelManager.allItems.length).to.equal(sharedNoteCount);
    let models = this.application.modelManager.allItemsMatchingTypes(["Foo"]);
    var item1 = models[0];
    var item2 = models[1];

    let storageModels = await storageManager.getAllRawPayloads();
    expect(storageModels.length).to.equal(sharedNoteCount);

    expect(item2.content.conflict_of).to.equal(item1.uuid);
    // Two items now link to this original object
    expect(originalItem2.referencingItemsCount).to.equal(2);
    expect(originalItem2.allReferencingItems[0]).to.not.equal(originalItem2.allReferencingItems[1]);

    expect(originalItem1.referencingItemsCount).to.equal(0);
    expect(item1.referencingItemsCount).to.equal(0);
    expect(item2.referencingItemsCount).to.equal(0);

    expect(item1.content.references.length).to.equal(1);
    expect(item2.content.references.length).to.equal(1);
    expect(originalItem2.content.references.length).to.equal(0);

    expect(modelManager.getDirtyItems().length).to.equal(0);

    for(let item of this.application.modelManager.allItems) {
      expect(item.dirty).to.not.be.ok;
    }
  }).timeout(60000);

  let largeItemCount = 160;

  it("should handle syncing pagination", async function() {
    for(var i = 0; i < largeItemCount; i++) {
      var item = Factory.createStorageItemNotePayload();
      this.application.modelManager.setItemDirty(item, true);
      this.application.modelManager.addItem(item);
    }

    sharedNoteCount += largeItemCount;

    let response = await this.application.syncManager.sync(syncOptions);
    expect(response).to.be.ok;
    let models = await this.application.storageManager.getAllRawPayloads();
    expect(models.length).to.equal(sharedNoteCount);
  }).timeout(60000);

  it("should be able to download all items separate of sync", async function() {
    return expect(syncManager.stateless_downloadAllItems()).to.be.fulfilled.then(async (downloadedItems) => {
      expect(downloadedItems.length).to.equal(sharedNoteCount);
      // ensure it's decrypted
      expect(downloadedItems[0].content.text.length).to.be.above(1);
      expect(downloadedItems[0].text.length).to.be.above(1);
    })
  }).timeout(60000);

  it("syncing a new item before local data has loaded should still persist the item to disk, even if sync is locked", async function() {
    let modelManager = this.application.modelManager;
    let syncManager = this.application.syncManager;
    this.application.syncManager.__setLocalDataNotLoaded();
    this.application.modelManager.handleSignOut();
    this.application.syncManager.handleSignOut();
    expect(this.application.modelManager.allItems.length).to.equal(0);

    expect(this.application.modelManager.getDirtyItems().length).to.equal(0);

    let item = Factory.createStorageItemNotePayload();
    item.text = `${Math.random()}`;
    this.application.modelManager.addItem(item);
    this.application.modelManager.setItemDirty(item);
    sharedNoteCount++;

    expect(this.application.modelManager.getDirtyItems().length).to.equal(1);

    await this.application.syncManager.sync(syncOptions);

    let storageModels = await storageManager.getAllRawPayloads();
    expect(storageModels.length).to.equal(sharedNoteCount);
    let savedModel = storageModels.find((m) => m.uuid == item.uuid);

    expect(savedModel.uuid).to.equal(item.uuid);
    expect(savedModel.dirty).equal(true);

    this.application.syncManager.handleSignOut();
    this.application.modelManager.handleSignOut();

    await this.application.syncManager.loadDataFromDatabase();
    expect(this.application.modelManager.allItems.length).to.equal(sharedNoteCount);
    expect(this.application.syncManager.initialDataLoaded()).to.equal(true);

    await this.application.syncManager.sync(syncOptions);

    storageModels = await storageManager.getAllRawPayloads();
    expect(storageModels.length).to.equal(sharedNoteCount);

    let currentItem = this.application.modelManager.findItem(item.uuid);
    expect(currentItem.content.text).to.equal(item.content.text);
    expect(currentItem.text).to.equal(item.text);
    expect(currentItem.dirty).to.not.be.ok;
  }).timeout(60000);

  it("load local items should respect sort priority", async function() {
    let contentTypes = ["A", "B", "C"];
    let itemCount = 6;
    for(var i = 0; i < itemCount; i++) {
      var item = Factory.createStorageItemPayload(contentTypes[Math.floor(i/2)]);
      this.application.modelManager.setItemDirty(item, true);
      this.application.modelManager.addItem(item);
    }

    await this.application.syncManager.loadDataFromDatabase();
    await this.application.syncManager.sync(syncOptions);
    let models = await localStorageManager.getAllRawPayloads();

    expect(models.length).to.equal(itemCount);

    // reset items
    this.application.syncManager.handleSignOut();
    this.application.modelManager.handleSignOut();

    this.application.syncManager.contentTypeLoadPriority = ["C", "A", "B"];
    await this.application.syncManager.loadDataFromDatabase();

    let items = this.application.modelManager.allItems;

    expect(items[0].content_type).to.equal("C");
    expect(items[2].content_type).to.equal("A");
    expect(items[4].content_type).to.equal("B");
  }).timeout(60000);

  it("handles stale data in bulk", async function() {
    await this.application.syncManager.loadDataFromDatabase();
    await this.application.syncManager.sync(syncOptions);
    let items = this.application.modelManager.allItems;
    expect(items.length).to.equal(sharedNoteCount);

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
      // Use .text here, assuming it's a Note
      if(item.content_type === "Note") {
        item.text = `${Math.random()}`;
        item.updated_at = yesterday;
        this.application.modelManager.setItemDirty(item, true);
        // We expect all the notes to be duplicated.
        sharedNoteCount++;
      }
    }

    await this.application.syncManager.sync(syncOptions);

    items = this.application.modelManager.allItems;
    expect(items.length).to.equal(sharedNoteCount);

    let storage = await this.application.storageManager.getAllRawPayloads();
    expect(storage.length).to.equal(sharedNoteCount);
  }).timeout(60000);

  it("should sign in and retrieve large number of items", async function() {
    // logout
    await Factory.globalSessionManager().signOut();
    this.application.syncManager.handleSignOut();
    this.application.modelManager.handleSignOut();

    await this.application.storageManager.clearAllData();
    await Factory.globalSessionManager().login(Factory.serverURL(), email, password, true, null);

    let models = await this.application.storageManager.getAllRawPayloads();
    expect(models.length).to.equal(0);

    await this.application.syncManager.loadDataFromDatabase();
    await this.application.syncManager.sync(syncOptions);

    models = await this.application.storageManager.getAllRawPayloads();
    expect(models.length).to.equal(sharedNoteCount);
  }).timeout(60000);

  it('when a note is conflicted, its tags should not be duplicated.', async function() {
    await this.application.syncManager.loadDataFromDatabase();
    /*
      If you have a note and a tag, and the tag has 1 reference to the note,
      and you import the same two items, except modify the note value so that a duplicate is created,
      we expect only the note to be duplicated, and the tag not to.
      However, if only the note changes, and you duplicate the note, which causes the tag's references content to change,
      then when the incoming tag is being processed, it will also think it has changed, since our local value now doesn't match
      what's coming in. The solution is to get all values ahead of time before any changes are made.
    */
    var tag = Factory.createStorageItemPayload("Tag");

    var note = Factory.createStorageItemNotePayload();
    this.application.modelManager.addItem(note);
    this.application.modelManager.addItem(tag);
    tag.addItemAsRelationship(note);
    this.application.modelManager.setItemDirty(tag, true);
    this.application.modelManager.setItemDirty(note, true);
    sharedNoteCount += 2;

    await this.application.syncManager.sync(syncOptions);

    // conflict the note
    let newText = `${Math.random()}`;
    note.updated_at = Factory.yesterday();
    note.text = newText;
    this.application.modelManager.setItemDirty(note, true);

    // conflict the tag but keep its content the same
    tag.updated_at = Factory.yesterday();
    this.application.modelManager.setItemDirty(tag, true);

    await Factory.sleep(1.1);
    await this.application.syncManager.sync(syncOptions);

    // We expect now that the total item count has went up by just 1 (the note), and not 2 (the note and tag)
    sharedNoteCount += 1;
    expect(modelManager.allItems.length).to.equal(sharedNoteCount);
    expect(tag.content.references.length).to.equal(2);
  }).timeout(60000);
});
