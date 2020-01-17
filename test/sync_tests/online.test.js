import '../../node_modules/regenerator-runtime/runtime.js';
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import '../vendor/chai-as-promised-built.js';
import Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('online syncing', () => {
  const BASE_ITEM_COUNT = 1; /** Default items key */

  const syncOptions = {
    checkIntegrity: true
  }

  before(async function() {
    localStorage.clear();
  })

  after(async function() {
    localStorage.clear();
  })

  beforeEach(async function() {
    this.expectedItemCount = BASE_ITEM_COUNT;
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
    expect(this.application.syncManager.isOutOfSync()).to.equal(false);
    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(this.expectedItemCount);
  })

  function noteObjectsFromObjects(items) {
    return items.filter((item) => item.content_type === 'Note');
  }

  const signin = async function() {
    await Factory.globalSessionManager().login(Factory.serverURL(), email, password, true, null);
  }

  it("should register and sync basic model online", async function() {
    const note = await Factory.createMappedNote(this.application);
    this.expectedItemCount++;
    await this.application.modelManager.setItemDirty(note);
    await this.application.syncManager.sync(syncOptions);
    expect(this.application.modelManager.getDirtyItems().length).to.equal(0);
    expect(note.dirty).to.not.be.ok;

    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    const notePayloads = noteObjectsFromObjects(rawPayloads);
    expect(notePayloads.length).to.equal(1);
    for(const rawNote of notePayloads) {
      expect(rawNote.dirty).to.not.be.ok;
    }
  }).timeout(10000);

  it("should login and retrieve synced item", async function() {
    const note = await Factory.createSyncedNote(this.application);
    this.expectedItemCount++;
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
  }).timeout(10000);

  it("resolve on next timing strategy", async function() {
    const syncCount = 7;
    let successes = 0;
    let events = 0;

    this.application.syncManager.ut_beginLatencySimulator(250);
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

    this.application.syncManager.ut_endLatencySimulator();
    // Since the syncs all happen after one another, extra syncs may be queued on that we are not awaiting.
    await Factory.sleep(0.5);
  }).timeout(10000);

  it("force spawn new timing strategy", async function() {
    const syncCount = 7;
    let successes = 0;
    let events = 0;

    this.application.syncManager.ut_beginLatencySimulator(250);

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
    this.application.syncManager.ut_endLatencySimulator();
  }).timeout(10000);

  it("allows me to save data after I've signed out", async function() {
    expect(this.application.modelManager.itemsKeys.length).to.equal(1);
    await this.application.signOut();
    const note = await Factory.createMappedNote(this.application);
    this.expectedItemCount++;
    await this.application.modelManager.setItemDirty(note, true);
    await this.application.syncManager.sync(syncOptions);
    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    const notePayload = noteObjectsFromObjects(rawPayloads);
    expect(notePayload.length).to.equal(1);
    expect(this.application.modelManager.notes.length).to.equal(1);

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
      expect(note.content.title).to.be.ok;
    }

    const updatedRawPayloads = await this.application.storageManager.getAllRawPayloads();
    for(let payload of updatedRawPayloads) {
      // if an item comes back from the server, it is saved to disk immediately without a dirty value.
      expect(payload.dirty).to.not.be.ok;
    }
  }).timeout(10000);

  it("mapping should not mutate items with error decrypting state", async function() {
    const note = await Factory.createMappedNote(this.application);
    this.expectedItemCount++;
    const originalTitle = note.content.title;
    await this.application.modelManager.setItemDirty(note, true);
    await this.application.syncManager.sync(syncOptions);

    const encrypted = await this.application.protocolService.payloadByEncryptingPayload({
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

    const decryptedPayload = await this.application.protocolService
    .payloadByDecryptingPayload({
      payload: errorred
    });
    const mappedItems2 = await this.application.modelManager.mapPayloadsToLocalItems({
      payloads: [decryptedPayload]
    });
    const mappedItem2 = mappedItems2[0];
    expect(typeof mappedItem2.content).to.equal("object");
    expect(mappedItem2.content.title).to.equal(originalTitle);
  }).timeout(10000);

  it("should create conflicted copy if incoming server item attempts to overwrite local dirty item",
  async function() {

    // create an item and sync it
    const note = await Factory.createMappedNote(this.application);
    this.expectedItemCount++;
    await this.application.modelManager.setItemDirty(note);
    await this.application.syncManager.sync(syncOptions);

    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(this.expectedItemCount);

    const originalValue = note.title;
    const dirtyValue = `${Math.random()}`;

    // modify this item locally to have differing contents from server
    note.title = dirtyValue;
    // Intentionally don't change updated_at. We want to simulate a chaotic case where
    // for some reason we receive an item with different content but the same updated_at.
    // note.updated_at = Factory.yesterday();
    await await this.application.modelManager.setItemDirty(note);

    // Download all items from the server, which will include this note.
    await this.application.syncManager.clearSyncPositionTokens();
    await this.application.syncManager.sync(syncOptions);

    // We expect this item to be duplicated
    this.expectedItemCount++;
    expect(this.application.modelManager.notes.length).to.equal(2);

    const allItems = this.application.modelManager.allItems;
    expect(allItems.length).to.equal(this.expectedItemCount);

    const originalItem = this.application.modelManager.findItem(note.uuid);
    const duplicateItem = allItems.find((i) => i.content.conflict_of === note.uuid);

    expect(originalItem.title).to.equal(dirtyValue);
    expect(duplicateItem.title).to.equal(originalValue);
    expect(originalItem.title).to.not.equal(duplicateItem.title);

    const newRawPayloads = await this.application.storageManager.getAllRawPayloads();
    expect(newRawPayloads.length).to.equal(this.expectedItemCount);
  }).timeout(10000);

  it("should handle sync conflicts by duplicating differing data", async function() {
    // create an item and sync it
    const note = await Factory.createMappedNote(this.application);
    await this.application.modelManager.setItemDirty(note);
    await this.application.syncManager.sync(syncOptions);
    this.expectedItemCount++;

    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(this.expectedItemCount);

    // modify this item to have stale values
    note.title = `${Math.random()}`;
    note.updated_at = Factory.yesterday();
    await this.application.modelManager.setItemDirty(note);
    await this.application.syncManager.sync(syncOptions)

    // We expect this item to be duplicated
    this.expectedItemCount++;
    const allItems = this.application.modelManager.allItems;
    expect(allItems.length).to.equal(this.expectedItemCount);

    const note1 = this.application.modelManager.notes[0];
    const note2 = this.application.modelManager.notes[1];
    expect(note1.content.title).to.not.equal(note2.content.title);
  }).timeout(10000);

  it("should duplicate item if saving a modified item and clearing our sync token", async function() {
    const note = await Factory.createMappedNote(this.application);
    await this.application.modelManager.setItemDirty(note, true);
    await this.application.syncManager.sync(syncOptions);
    this.expectedItemCount++;

    // modify this item to have stale values
    let newTitle = `${Math.random()}`;
    note.title = newTitle;
    note.updated_at = Factory.yesterday();
    await this.application.modelManager.setItemDirty(note, true, true);

    // We expect this item to be duplicated
    this.expectedItemCount++;

    await this.application.syncManager.clearSyncPositionTokens();
    await this.application.syncManager.sync(syncOptions)

    // We expect the item title to be the new title, and not rolled back to original value
    expect(note.content.title).to.equal(newTitle);

    const allItems =this.application.modelManager.allItems;
    expect(allItems.length).to.equal(this.expectedItemCount);
  }).timeout(10000);

  it("should handle sync conflicts by not duplicating same data", async function() {
    const note = await Factory.createMappedNote(this.application);
    this.expectedItemCount++;
    await this.application.modelManager.setItemDirty(note, true);
    await this.application.syncManager.sync(syncOptions);

    // keep item as is and set dirty
    await this.application.modelManager.setItemDirty(note, true);

    // clear sync token so that all items are retrieved on next sync
    this.application.syncManager.clearSyncPositionTokens();

    await this.application.syncManager.sync(syncOptions);
    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);
  }).timeout(10000);

  it('clearing conflict_of on two clients simultaneously should keep us in sync', async function() {
    const note = await Factory.createMappedNote(this.application);
    await this.application.modelManager.setItemDirty(note, true);
    this.expectedItemCount++;

    // client A
    note.content.conflict_of = "foo";
    await this.application.modelManager.setItemDirty(note, true);
    await this.application.syncManager.sync(syncOptions);

    // client B
    await this.application.syncManager.clearSyncPositionTokens();
    note.content.conflict_of = "bar";
    note.updated_at = Factory.yesterday();
    await this.application.modelManager.setItemDirty(note, true);

    // conflict_of is a key to ignore when comparing content, so item should
    // not be duplicated.
    await this.application.syncManager.sync(syncOptions);
  }).timeout(10000);

  it('setting property on two clients simultaneously should create conflict', async function() {
    const note = await Factory.createMappedNote(this.application);
    await this.application.modelManager.setItemDirty(note, true);
    this.expectedItemCount++;

    // client A
    note.content.foo = "foo";
    await this.application.modelManager.setItemDirty(note, true);
    await this.application.syncManager.sync(syncOptions);

    // client B
    await this.application.syncManager.clearSyncPositionTokens();
    note.content.foo = "bar";
    note.updated_at = Factory.yesterday();
    await this.application.modelManager.setItemDirty(note, true);
    await this.application.syncManager.sync(syncOptions);
    this.expectedItemCount++;
  }).timeout(10000);

  it('removes item from storage upon deletion', async function() {
    const note = await Factory.createMappedNote(this.application);
    this.expectedItemCount++;
    await this.application.modelManager.setItemDirty(note, true);
    await this.application.syncManager.sync(syncOptions);

    expect(note.dirty).to.equal(false);
    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);

    await this.application.modelManager.setItemToBeDeleted(note);
    this.expectedItemCount--;
    await this.application.syncManager.sync(syncOptions);
    expect(note.dirty).to.equal(false);
    expect(this.application.syncManager.state.currentSyncDiscordance).to.equal(0);

    // We expect that this item is now gone for good, and no duplicate has been created.
    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);

    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(this.expectedItemCount)
  }).timeout(10000);

  it('retrieving item with no content should correctly map local state', async function() {
    const note = await Factory.createMappedNote(this.application);
    await this.application.modelManager.setItemDirty(note, true);
    await this.application.syncManager.sync(syncOptions);
    const syncToken = await this.application.syncManager.getLastSyncToken();
    this.expectedItemCount++;
    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);

    // client A
    await this.application.modelManager.setItemToBeDeleted(note);
    await this.application.modelManager.setItemDirty(note, true);
    await this.application.syncManager.sync(syncOptions);

    // Subtract 1
    this.expectedItemCount--;

    // client B
    // Clearing sync tokens wont work as server wont return deleted items.
    // Set saved sync token instead
    await this.application.syncManager.setLastSyncToken(syncToken);
    await this.application.syncManager.sync(syncOptions);

    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);
  }).timeout(10000);

  it('if server says deleted but client says not deleted, keep server state', async function() {
    const note = await Factory.createMappedNote(this.application);
    const originalPayload = note.payloadRepresentation();
    this.expectedItemCount++;
    await this.application.modelManager.setItemDirty(note, true);
    await this.application.syncManager.sync(syncOptions);
    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);

    // client A
    await this.application.modelManager.setItemToBeDeleted(note);
    await this.application.modelManager.setItemDirty(note, true);
    await this.application.syncManager.sync(syncOptions);
    this.expectedItemCount--;
    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);

    // client B
    await this.application.syncManager.clearSyncPositionTokens();
    // Add the item back and say it's not deleted
    const mutatedPayload = CreateMaxPayloadFromAnyObject({
      object: originalPayload ,
      override: {
        deleted: false,
        updated_at: Factory.yesterday()
      }
    })
    await this.application.modelManager.mapPayloadsToLocalItems({
      payloads: [mutatedPayload]
    })
    const resultNote = this.application.modelManager.findItem(note.uuid);
    expect(resultNote.uuid).to.equal(note.uuid);
    await this.application.modelManager.setItemDirty(resultNote);
    await this.application.syncManager.sync(syncOptions);

    // We expect that this item is now gone for good, and a duplicate has not been created.
    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);
  }).timeout(10000);

  it('if server says not deleted but client says deleted, keep server state', async function() {
    const note = await Factory.createMappedNote(this.application);
    await this.application.modelManager.setItemDirty(note, true);
    this.expectedItemCount++;

    // client A
    await this.application.syncManager.sync(syncOptions);
    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);

    // client B
    await this.application.syncManager.clearSyncPositionTokens();

    // This client says this item is deleted, but the server is saying its not deleted.
    // In this case, we want to keep the server copy.
    note.deleted = true;
    note.updated_at = Factory.yesterday();
    await this.application.modelManager.setItemDirty(note, true);
    await this.application.syncManager.sync(syncOptions);

    // We expect that this item maintained.
    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);
  }).timeout(10000);

  it("should create conflict if syncing an item that is stale", async function() {
    const note = await Factory.createMappedNote(this.application);
    await this.application.modelManager.setItemDirty(note, true);
    await this.application.syncManager.sync(syncOptions);
    expect(note.dirty).to.equal(false);
    this.expectedItemCount++;

    await this.application.modelManager.modifyItem({
      item: note,
      modifier: () => {
        note.text = "Stale text";
        note.updated_at = Factory.yesterday();
      }
    })

    await this.application.syncManager.sync(syncOptions);
    expect(note.dirty).to.equal(false);

    // We expect now that the item was conflicted
    this.expectedItemCount++;

    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(this.expectedItemCount);
    for(const payload of rawPayloads) {
      expect(payload.dirty).to.not.be.ok;
    }
  }).timeout(10000);

  it('creating conflict with exactly equal content should keep us in sync', async function() {
    const note = await Factory.createMappedNote(this.application);
    await this.application.modelManager.setItemDirty(note, true);
    this.expectedItemCount++;

    await this.application.syncManager.sync(syncOptions);

    note.updated_at = Factory.yesterday();
    await this.application.modelManager.setItemDirty(note, true);;
    await this.application.syncManager.sync(syncOptions);

    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);
  }).timeout(10000);

  it("marking an item dirty then saving to disk should retain that dirty state when restored", async function() {
    const note = await Factory.createMappedNote(this.application);
    this.expectedItemCount++;
    await this.application.syncManager.markAllItemsAsNeedingSync({
      alternateUuids: false
    });

    this.application.modelManager.handleSignOut();
    await this.application.syncManager.handleSignOut();

    expect(this.application.modelManager.allItems.length).to.equal(0);

    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    const encryptedPayloads = rawPayloads.map((rawPayload) => {
      return CreateMaxPayloadFromAnyObject({
        object: rawPayload
      })
    });
    const payloads = [];
    for(const payload of encryptedPayloads) {
      expect(payload.dirty).to.equal(true);
      const decrypted = await this.application.protocolService
      .payloadByDecryptingPayload({
        payload: payload
      })
      payloads.push(decrypted);
    }
    await this.application.modelManager.mapPayloadsToLocalItems({
      payloads: payloads
    })
    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);
    const foundNote = this.application.modelManager.findItem(note.uuid);
    expect(foundNote.dirty).to.equal(true);
    await this.application.syncManager.sync();
  }).timeout(10000);

  it('duplicating an item should maintian its relationships', async function() {
    const payload1 = Factory.createStorageItemPayload('Foo');
    const payload2 = Factory.createStorageItemPayload('Bar');

    await this.application.modelManager.mapPayloadsToLocalItems({
      payloads: [payload1, payload2]
    })
    this.expectedItemCount += 2;

    const fooItem = this.application.modelManager.itemsForContentType('Foo')[0];
    const barItem = this.application.modelManager.itemsForContentType('Bar')[0];

    await this.application.modelManager.modifyItems({
      items: [fooItem, barItem],
      modifier: () => {
        fooItem.addItemAsRelationship(barItem);
      }
    })

    expect(barItem.referencingItemsCount).to.equal(1);
    expect(barItem.allReferencingItems).to.include(fooItem);

    await this.application.syncManager.sync(syncOptions);
    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);

    await this.application.modelManager.modifyItem({
      item: fooItem,
      modifier: () => {
        fooItem.content.title = `${Math.random()}`
        fooItem.updated_at = Factory.yesterday();
      }
    })

    await this.application.syncManager.sync(syncOptions);

    // fooItem should now be conflicted and a copy created
    this.expectedItemCount++;
    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);
    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(this.expectedItemCount);

    const fooItems = this.application.modelManager.itemsForContentType('Foo');
    const fooItem2 = fooItems[1];

    expect(fooItem2.content.conflict_of).to.equal(fooItem.uuid);
    // Two items now link to this original object
    expect(barItem.referencingItemsCount).to.equal(2);
    expect(barItem.allReferencingItems[0]).to.not.equal(barItem.allReferencingItems[1]);

    expect(fooItem.referencingItemsCount).to.equal(0);
    expect(fooItem2.referencingItemsCount).to.equal(0);

    expect(fooItem.content.references.length).to.equal(1);
    expect(fooItem2.content.references.length).to.equal(1);
    expect(barItem.content.references.length).to.equal(0);

    expect(this.application.modelManager.getDirtyItems().length).to.equal(0);

    for(const item of this.application.modelManager.allItems) {
      expect(item.dirty).to.not.be.ok;
    }
  }).timeout(10000);


  it("should handle uploading with sync pagination", async function() {
    const largeItemCount = 160;
    for(let i = 0; i < largeItemCount; i++) {
      const note = await Factory.createMappedNote(this.application);
      await this.application.modelManager.setItemDirty(note, true);
    }

    this.expectedItemCount += largeItemCount;

    await this.application.syncManager.sync(syncOptions);
    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(this.expectedItemCount);
  }).timeout(10000);

  it("should handle downloading with sync pagination", async function() {
    const largeItemCount = 160;
    for(let i = 0; i < largeItemCount; i++) {
      const note = await Factory.createMappedNote(this.application);
      await this.application.modelManager.setItemDirty(note, true);
    }
    /** Upload */
    await this.application.syncManager.sync(syncOptions);
    this.expectedItemCount += largeItemCount;

    /** Clear local data */
    await this.application.modelManager.handleSignOut();
    await this.application.syncManager.handleSignOut();
    await this.application.storageManager.clearAllPayloads();
    expect(this.application.modelManager.allItems.length).to.equal(0);

    /** Download all data */
    await this.application.syncManager.sync({syncOptions});
    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);
    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(this.expectedItemCount);
  }).timeout(20000);

  it("should be able to download all items separate of sync", async function() {
    const largeItemCount = 20;
    for(let i = 0; i < largeItemCount; i++) {
      const note = await Factory.createMappedNote(this.application);
      await this.application.modelManager.setItemDirty(note, true);
    }
    /** Upload */
    await this.application.syncManager.sync(syncOptions);
    this.expectedItemCount += largeItemCount;

    /** Download */
    const downloadedItems = await this.application.syncManager.stateless_downloadAllItems();
    expect(downloadedItems.length).to.equal(this.expectedItemCount);
    // ensure it's decrypted
    expect(downloadedItems[10].content.text.length).to.be.above(1);
    expect(downloadedItems[10].text.length).to.be.above(1);
  }).timeout(10000);

  it("syncing an item should storage it encrypted", async function() {
    const note = await Factory.createMappedNote(this.application);
    await this.application.modelManager.setItemDirty(note);
    await this.application.syncManager.sync(syncOptions);
    this.expectedItemCount++;
    const rawPayloads = await this.application.syncManager.getDatabasePayloads();
    const notePayload = rawPayloads.find((p) => p.content_type === 'Note');
    expect(typeof notePayload.content).to.equal('string');
  });

  it("syncing an item before data load should storage it encrypted", async function() {
    const note = await Factory.createMappedNote(this.application);
    await this.application.modelManager.setItemDirty(note);
    this.expectedItemCount++;

    /** Simulate database not loaded */
    await this.application.syncManager.handleSignOut();
    this.application.syncManager.ut_setDatabaseLoaded(false);
    this.application.syncManager.sync(syncOptions);
    await Factory.sleep(0.3);

    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    const notePayload = rawPayloads.find((p) => p.content_type === 'Note');
    expect(typeof notePayload.content).to.equal('string');
  });

  it("saving an item after sync should persist it with content property", async function() {
    const note = await Factory.createMappedNote(this.application);
    const text = Factory.randomString(10000);
    note.text = text;
    this.application.modelManager.setItemDirty(note);
    await this.application.syncManager.sync();
    this.expectedItemCount++;
    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    const notePayload = rawPayloads.find((p) => p.content_type === 'Note');
    expect(typeof notePayload.content).to.equal('string');
    expect(notePayload.content.length).to.be.above(text.length);
  });

  it("syncing a new item before local data has loaded should still persist the item to disk",
  async function() {
    this.application.syncManager.ut_setDatabaseLoaded(false);
    /** You don't want to clear model manager state as we'll lose encrypting items key */
    // await this.application.modelManager.handleSignOut();
    await this.application.syncManager.handleSignOut();
    expect(this.application.modelManager.getDirtyItems().length).to.equal(0);

    const note = await Factory.createMappedNote(this.application);
    note.text = `${Math.random()}`;
    await this.application.modelManager.setItemDirty(note);
    /** This sync request should exit prematurely as we called ut_setDatabaseNotLoaded */
    /** Do not await. Sleep instead. */
    this.application.syncManager.sync(syncOptions);
    await Factory.sleep(0.3);
    this.expectedItemCount++;

    /** Item should still be dirty */
    expect(note.dirty).to.equal(true);
    expect(this.application.modelManager.getDirtyItems().length).to.equal(1);

    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(this.expectedItemCount);
    const rawPayload = rawPayloads.find((p) => p.uuid === note.uuid);
    expect(rawPayload.uuid).to.equal(note.uuid);
    expect(rawPayload.dirty).equal(true);
    expect(typeof rawPayload.content).to.equal('string');

    /** Clear state data and upload item from storage to server */
    await this.application.syncManager.handleSignOut();
    await this.application.modelManager.handleSignOut();
    const databasePayloads = await this.application.storageManager.getAllRawPayloads();
    await this.application.syncManager.loadDatabasePayloads(databasePayloads);
    await this.application.syncManager.sync(syncOptions);

    const newRawPayloads = await this.application.storageManager.getAllRawPayloads();
    expect(newRawPayloads.length).to.equal(this.expectedItemCount);

    const currentItem = this.application.modelManager.findItem(note.uuid);
    expect(currentItem.content.text).to.equal(note.content.text);
    expect(currentItem.text).to.equal(note.text);
    expect(currentItem.dirty).to.equal(false);
  }).timeout(10000);

  it("load local items should respect sort priority", async function() {
    const contentTypes = ['A', 'B', 'C'];
    const itemCount = 6;
    for(let i = 0; i < itemCount; i++) {
      const payload = Factory.createStorageItemPayload(contentTypes[Math.floor(i/2)]);
      const item = await Factory.mapPayloadToItem(payload, this.application.modelManager);
      await this.application.modelManager.setItemDirty(item, true);
    }
    this.expectedItemCount += itemCount;

    await this.application.syncManager.sync(syncOptions);
    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(this.expectedItemCount);

    this.application.syncManager.ut_setDatabaseLoaded(false);
    this.application.syncManager.handleSignOut();
    this.application.modelManager.handleSignOut();

    this.application.syncManager.localLoadPriorty = ['C', 'A', 'B'];
    const databasePayloads = await this.application.storageManager.getAllRawPayloads();
    await this.application.syncManager.loadDatabasePayloads(databasePayloads);

    const items = this.application.modelManager.allItemsMatchingTypes(contentTypes);
    expect(items[0].content_type).to.equal('C');
    expect(items[2].content_type).to.equal('A');
    expect(items[4].content_type).to.equal('B');
  }).timeout(10000);

  it("handles stale data in bulk", async function() {
    const largeItemCount = 160;
    await Factory.createManyMappedNotes(this.application, largeItemCount);
    /** Upload */
    await this.application.syncManager.sync(syncOptions);
    this.expectedItemCount += largeItemCount;
    const items = this.application.modelManager.allItems;
    expect(items.length).to.equal(this.expectedItemCount);
    /**
     * We want to see what will happen if we upload everything we have to
     * the server as dirty, with no sync token, so that the server also
     * gives us everything it has.
     */
    const yesterday = Factory.yesterday();
    for(const note of this.application.modelManager.notes) {
      note.text = `${Math.random()}`;
      note.updated_at = yesterday;
      await this.application.modelManager.setItemDirty(note, true);
      // We expect all the notes to be duplicated.
      this.expectedItemCount++;
    }

    await this.application.syncManager.clearSyncPositionTokens();
    await this.application.syncManager.sync(syncOptions);

    const allItems2 = this.application.modelManager.allItems;
    expect(allItems2.length).to.equal(this.expectedItemCount);
  }).timeout(30000);

  it("should sign in and retrieve large number of items", async function() {
    const largeItemCount = 50;
    await Factory.createManyMappedNotes(this.application, largeItemCount);
    this.expectedItemCount += largeItemCount;
    await this.application.syncManager.sync();

    await this.application.signOut();
    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(0);

    await this.application.signIn({
      email: this.email,
      password: this.password
    })

    this.application.syncManager.ut_setDatabaseLoaded(false);
    const databasePayloads = await this.application.storageManager.getAllRawPayloads();
    await this.application.syncManager.loadDatabasePayloads(databasePayloads);
    await this.application.syncManager.sync(syncOptions);

    const items = await this.application.modelManager.allItems;
    expect(items.length).to.equal(this.expectedItemCount);
  }).timeout(20000);

  it('when a note is conflicted, its tags should not be duplicated.', async function() {
    /**
     * If you have a note and a tag, and the tag has 1 reference to the note,
     * and you import the same two items, except modify the note value so that
     * a duplicate is created, we expect only the note to be duplicated,
     * and the tag not to.
     */
    const tag = await Factory.createMappedTag(this.application);
    const note = await Factory.createMappedNote(this.application);
    tag.addItemAsRelationship(note);
    await this.application.modelManager.setItemDirty(tag, true);
    await this.application.modelManager.setItemDirty(note, true);
    this.expectedItemCount += 2;

    await this.application.syncManager.sync(syncOptions);

    // conflict the note
    const newText = `${Math.random()}`;
    note.updated_at = Factory.yesterday();
    note.text = newText;
    await this.application.modelManager.setItemDirty(note, true);

    // conflict the tag but keep its content the same
    tag.updated_at = Factory.yesterday();
    await this.application.modelManager.setItemDirty(tag, true);
    await this.application.syncManager.sync(syncOptions);
    /**
     * We expect now that the total item count has went up by just 1 (the note),
     * and not 2 (the note and tag)
     */
    this.expectedItemCount += 1;
    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);
    expect(tag.content.references.length).to.equal(2);
  }).timeout(10000);

  it('should keep an item dirty thats been modified after low latency sync request began', async function() {
    /**
     * If you begin a sync request that takes 20s to complete, then begin modifying an item
     * many times and attempt to sync, it will await the initial sync to complete.
     * When that completes, it will decide whether an item is still dirty or not.
     * It will do based on comparing whether item.dirtiedDate > item.lastSyncBegan
     */
    const note = await Factory.createMappedNote(this.application);
    await this.application.modelManager.setItemDirty(note, true);
    this.expectedItemCount++;

    // client A. Don't await, we want to do other stuff.
    this.application.syncManager.ut_beginLatencySimulator(2000);
    const slowSync = this.application.syncManager.sync(syncOptions);
    await Factory.sleep(0.1);
    expect(note.dirty).to.equal(true);

    // While that sync is going on, we want to modify this item many times.
    const text = `${Math.random()}`;
    note.text = text;
    await this.application.modelManager.setItemDirty(note);
    await this.application.modelManager.setItemDirty(note);
    await this.application.modelManager.setItemDirty(note);
    expect(note.dirtiedDate).to.be.above(note.lastSyncBegan);

    // Now do a regular sync with no latency.
    this.application.syncManager.ut_endLatencySimulator();
    const midSync = this.application.syncManager.sync(syncOptions);

    await Promise.all([slowSync, midSync]);

    // client B
    await this.application.syncManager.handleSignOut();
    await this.application.modelManager.handleSignOut();
    await this.application.syncManager.clearSyncPositionTokens();
    await this.application.syncManager.sync(syncOptions);

    // Expect that the server value and client value match, and no conflicts are created.
    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);
    const foundItem = this.application.modelManager.findItem(note.uuid);
    expect(foundItem.content.text).to.equal(text);
    expect(foundItem.text).to.equal(text);
  }).timeout(10000);

  it("should sync an item twice if it's marked dirty while a sync is ongoing", async function() {
    // create an item and sync it
    const note = await Factory.createMappedNote(this.application);
    await this.application.modelManager.setItemDirty(note, true);
    this.expectedItemCount++;

    this.application.syncManager.ut_beginLatencySimulator(1000);
    /** Dont await */
    const syncRequest = this.application.syncManager.sync(syncOptions);

    setTimeout(async function () {
      await this.application.modelManager.setItemDirty(note, true);
    }.bind(this), 100);

    await syncRequest;
    expect(this.application.modelManager.getDirtyItems().length).to.equal(1);
  }).timeout(10000);
});
