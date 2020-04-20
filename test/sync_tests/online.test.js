/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('online syncing', () => {
  const BASE_ITEM_COUNT = 1; /** Default items key */

  const syncOptions = {
    checkIntegrity: true
  };

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
      this.application = await Factory.signOutApplicationAndReturnNew(this.application);
    };
    this.signIn = async () => {
      await this.application.signIn(
        this.email,
        this.password,
        undefined, undefined, undefined, undefined, undefined,
        true
      );
    };
  });

  afterEach(async function () {
    expect(this.application.syncService.isOutOfSync()).to.equal(false);
    const items = this.application.itemManager.items;
    expect(items.length).to.equal(this.expectedItemCount);
    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(this.expectedItemCount);
    await this.application.deinit();
  });

  function noteObjectsFromObjects(items) {
    return items.filter((item) => item.content_type === ContentType.Note);
  }

  it('should register and sync basic model online', async function () {
    let note = await Factory.createSyncedNote(this.application);
    this.expectedItemCount++;
    expect(this.application.itemManager.getDirtyItems().length).to.equal(0);
    note = this.application.findItem(note.uuid);
    expect(note.dirty).to.not.be.ok;

    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    const notePayloads = noteObjectsFromObjects(rawPayloads);
    expect(notePayloads.length).to.equal(1);
    for (const rawNote of notePayloads) {
      expect(rawNote.dirty).to.not.be.ok;
    }
  }).timeout(10000);

  it('should login and retrieve synced item', async function () {
    const note = await Factory.createSyncedNote(this.application);
    this.expectedItemCount++;
    this.application = await Factory.signOutApplicationAndReturnNew(this.application);

    await Factory.loginToApplication({
      application: this.application,
      email: this.email,
      password: this.password
    });

    const notes = this.application.itemManager.notes;
    expect(notes.length).to.equal(1);
    expect(notes[0].title).to.equal(note.title);
  }).timeout(10000);

  it('can complete multipage sync on sign in', async function () {
    const count = 0;
    await Factory.createManyMappedNotes(this.application, count);
    this.expectedItemCount += count;
    await this.application.sync();
    this.application = await Factory.signOutApplicationAndReturnNew(this.application);
    expect(this.application.itemManager.items.length).to.equal(BASE_ITEM_COUNT);
    const promise = Factory.loginToApplication({
      application: this.application,
      email: this.email,
      password: this.password
    });
    /** Throw in some random syncs to cause trouble */
    const syncCount = 30;
    for (let i = 0; i < syncCount; i++) {
      this.application.sync();
      await Factory.sleep(0.01);
    }
    await promise;
    expect(promise).to.be.fulfilled;
  }).timeout(20000);

  it('marking all items as needing sync with alternation should delete original payload', async function () {
    this.application = await Factory.signOutApplicationAndReturnNew(this.application);
    const note = await Factory.createMappedNote(this.application);
    this.expectedItemCount++;
    await this.application.syncService.markAllItemsAsNeedingSync(true);
    await this.application.sync();

    const notes = this.application.itemManager.notes;
    expect(notes.length).to.equal(1);
    expect(notes[0].uuid).to.not.equal(note.uuid);
  }).timeout(10000);

  it('having offline data then signing in should alternate uuid and merge with account', async function () {
    this.application = await Factory.signOutApplicationAndReturnNew(this.application);
    const note = await Factory.createMappedNote(this.application);
    this.expectedItemCount++;
    await Factory.loginToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
      mergeLocal: true
    });

    const notes = this.application.itemManager.notes;
    expect(notes.length).to.equal(1);
    /** uuid should have been alternated */
    expect(notes[0].uuid).to.not.equal(note.uuid);
  }).timeout(10000);

  it('server extensions should not be encrypted for sync', async function () {
    const payload = CreateMaxPayloadFromAnyObject(
      {
        uuid: await Uuid.GenerateUuid(),
        content_type: ContentType.Mfa,
        content: {
          secret: '123'
        }
      }
    );
    const results = await this.application.syncService.payloadsByPreparingForServer([payload]);
    const processed = results[0];
    expect(processed.format).to.equal(PayloadFormat.DecryptedBase64String);
  }).timeout(10000);

  it('resolve on next timing strategy', async function () {
    const syncCount = 7;
    let successes = 0;
    let events = 0;

    this.application.syncService.ut_beginLatencySimulator(250);
    this.application.syncService.addEventObserver((event, data) => {
      if (event === SyncEvent.FullSyncCompleted) {
        events++;
      }
    });

    const promises = [];
    for (let i = 0; i < syncCount; i++) {
      promises.push(this.application.syncService.sync({
        queueStrategy: SyncQueueStrategy.ResolveOnNext
      }).then(() => {
        successes++;
      }));
    }

    await Promise.all(promises);
    expect(successes).to.equal(syncCount);
    // Only a fully executed sync request creates a sync:completed event.
    // We don't know how many will execute above.
    expect(events).to.be.at.least(1);

    this.application.syncService.ut_endLatencySimulator();
    // Since the syncs all happen after one another, extra syncs may be queued on that we are not awaiting.
    await Factory.sleep(0.5);
  }).timeout(10000);

  it('force spawn new timing strategy', async function () {
    const syncCount = 7;
    let successes = 0;
    let events = 0;

    this.application.syncService.ut_beginLatencySimulator(250);

    this.application.syncService.addEventObserver((event, data) => {
      if (event === SyncEvent.FullSyncCompleted) {
        events++;
      }
    });

    const promises = [];
    for (let i = 0; i < syncCount; i++) {
      promises.push(
        this.application.syncService.sync({
          queueStrategy: SyncQueueStrategy.ForceSpawnNew
        }).then(() => {
          successes++;
        })
      );
    }
    await Promise.all(promises);
    expect(successes).to.equal(syncCount);
    expect(events).to.equal(syncCount);
    this.application.syncService.ut_endLatencySimulator();
  }).timeout(10000);

  it('retrieving new items should not mark them as dirty', async function () {
    const originalNote = await Factory.createSyncedNote(this.application);
    this.expectedItemCount++;
    this.application = await Factory.signOutApplicationAndReturnNew(this.application);
    this.application.syncService.addEventObserver((event, data) => {
      if (event === SyncEvent.SingleSyncCompleted) {
        const note = this.application.findItem(originalNote.uuid);
        expect(note.dirty).to.not.be.ok;
      }
    });
    await this.application.signIn(
      this.email,
      this.password,
      undefined, undefined, undefined, undefined, undefined,
      true
    );
  }).timeout(10000);

  it('allows me to save data after Ive signed out', async function () {
    expect(this.application.itemManager.itemsKeys.length).to.equal(1);
    this.application = await Factory.signOutApplicationAndReturnNew(this.application);
    expect(this.application.itemManager.itemsKeys.length).to.equal(1);
    const note = await Factory.createMappedNote(this.application);
    this.expectedItemCount++;
    await this.application.itemManager.setItemDirty(note.uuid);
    await this.application.syncService.sync(syncOptions);
    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    const notePayload = noteObjectsFromObjects(rawPayloads);
    expect(notePayload.length).to.equal(1);
    expect(this.application.itemManager.notes.length).to.equal(1);

    // set item to be merged for when sign in occurs
    await this.application.syncService.markAllItemsAsNeedingSync();
    expect(this.application.syncService.isOutOfSync()).to.equal(false);
    expect(this.application.itemManager.getDirtyItems().length).to.equal(2);

    // Sign back in for next tests
    await Factory.loginToApplication({
      application: this.application,
      email: this.email,
      password: this.password
    });

    expect(this.application.itemManager.getDirtyItems().length).to.equal(0);
    expect(this.application.itemManager.itemsKeys.length).to.equal(1);
    expect(this.application.syncService.isOutOfSync()).to.equal(false);
    expect(this.application.itemManager.notes.length).to.equal(1);

    for (const item of this.application.itemManager.notes) {
      expect(item.content.title).to.be.ok;
    }

    const updatedRawPayloads = await this.application.storageService.getAllRawPayloads();
    for (const payload of updatedRawPayloads) {
      // if an item comes back from the server, it is saved to disk immediately without a dirty value.
      expect(payload.dirty).to.not.be.ok;
    }
  }).timeout(10000);

  it('mapping should not mutate items with error decrypting state', async function () {
    const note = await Factory.createMappedNote(this.application);
    this.expectedItemCount++;
    const originalTitle = note.content.title;
    await this.application.itemManager.setItemDirty(note.uuid);
    await this.application.syncService.sync(syncOptions);

    const encrypted = await this.application.protocolService.payloadByEncryptingPayload(
      note.payloadRepresentation(),
      EncryptionIntent.Sync
    );
    const errorred = CreateMaxPayloadFromAnyObject(
      encrypted,
      null,
      null,
      {
        errorDecrypting: true
      }
    );
    const items = await this.application.itemManager.emitItemsFromPayloads(
      [errorred],
      PayloadSource.LocalChanged
    );
    const mappedItem = items[0];
    expect(typeof mappedItem.content).to.equal('string');

    const decryptedPayload = await this.application.protocolService
      .payloadByDecryptingPayload(errorred);
    const mappedItems2 = await this.application.itemManager.emitItemsFromPayloads(
      [decryptedPayload],
      PayloadSource.LocalChanged
    );
    const mappedItem2 = mappedItems2[0];
    expect(typeof mappedItem2.content).to.equal('object');
    expect(mappedItem2.content.title).to.equal(originalTitle);
  }).timeout(10000);

  it('should create conflicted copy if incoming server item attempts to overwrite local dirty item',
    async function () {
      // create an item and sync it
      const note = await Factory.createMappedNote(this.application);
      this.expectedItemCount++;
      await this.application.itemManager.setItemDirty(note.uuid);
      await this.application.syncService.sync(syncOptions);

      const rawPayloads = await this.application.storageService.getAllRawPayloads();
      expect(rawPayloads.length).to.equal(this.expectedItemCount);

      const originalValue = note.title;
      const dirtyValue = `${Math.random()}`;

      await this.application.itemManager.changeNote(note.uuid, (mutator) => {
        // modify this item locally to have differing contents from server
        mutator.title = dirtyValue;
        // Intentionally don't change updated_at. We want to simulate a chaotic case where
        // for some reason we receive an item with different content but the same updated_at.
        // note.updated_at = Factory.yesterday();
      });

      // Download all items from the server, which will include this note.
      await this.application.syncService.clearSyncPositionTokens();
      await this.application.syncService.sync({ ...syncOptions, awaitAll: true });

      // We expect this item to be duplicated
      this.expectedItemCount++;
      expect(this.application.itemManager.notes.length).to.equal(2);

      const allItems = this.application.itemManager.items;
      expect(allItems.length).to.equal(this.expectedItemCount);

      const originalItem = this.application.itemManager.findItem(note.uuid);
      const duplicateItem = allItems.find((i) => i.content.conflict_of === note.uuid);

      expect(originalItem.title).to.equal(dirtyValue);
      expect(duplicateItem.title).to.equal(originalValue);
      expect(originalItem.title).to.not.equal(duplicateItem.title);

      const newRawPayloads = await this.application.storageService.getAllRawPayloads();
      expect(newRawPayloads.length).to.equal(this.expectedItemCount);
    }).timeout(10000);

  it('should handle sync conflicts by duplicating differing data', async function () {
    // create an item and sync it
    const note = await Factory.createMappedNote(this.application);
    await this.application.saveItem(note.uuid);
    this.expectedItemCount++;

    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(this.expectedItemCount);

    await this.application.changeAndSaveItem(note.uuid, (mutator) => {
      // modify this item to have stale values
      mutator.title = `${Math.random()}`;
      mutator.updated_at = Factory.yesterday();
    });

    // We expect this item to be duplicated
    this.expectedItemCount++;
    const allItems = this.application.itemManager.items;
    expect(allItems.length).to.equal(this.expectedItemCount);

    const note1 = this.application.itemManager.notes[0];
    const note2 = this.application.itemManager.notes[1];
    expect(note1.content.title).to.not.equal(note2.content.title);
  }).timeout(10000);


  it('basic conflict with clearing local state', async function () {
    const note = await Factory.createMappedNote(this.application);
    await this.application.saveItem(note.uuid);
    this.expectedItemCount += 1;

    await this.application.changeAndSaveItem(note.uuid, (mutator) => {
      /** Create conflict for a note */
      mutator.title = `${Math.random()}`;
      mutator.updated_at = Factory.yesterday();
    });

    this.expectedItemCount++;
    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);

    // clear sync token, clear storage, download all items, and ensure none of them have error decrypting
    await this.application.syncService.clearSyncPositionTokens();
    await this.application.storageService.clearAllPayloads();
    await this.application.modelManager.resetState();
    await this.application.itemManager.resetState();
    await this.application.syncService.sync();

    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);
  }).timeout(10000);

  it('signing into account with pre-existing items', async function () {
    const note = await Factory.createMappedNote(this.application);
    await this.application.saveItem(note.uuid);
    this.expectedItemCount += 1;

    this.application = await Factory.signOutApplicationAndReturnNew(this.application);
    await this.application.signIn(
      this.email,
      this.password,
      undefined, undefined, undefined, undefined, undefined,
      true
    );

    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);
  }).timeout(10000);

  it('should duplicate item if saving a modified item and clearing our sync token', async function () {
    let note = await Factory.createMappedNote(this.application);
    await this.application.itemManager.setItemDirty(note.uuid);
    await this.application.syncService.sync(syncOptions);
    this.expectedItemCount++;

    const newTitle = `${Math.random()}`;
    await this.application.itemManager.changeItem(note.uuid, (mutator) => {
      // modify this item to have stale values
      mutator.title = newTitle;
      mutator.updated_at = Factory.yesterday();
    });

    // We expect this item to be duplicated
    this.expectedItemCount++;

    await this.application.syncService.clearSyncPositionTokens();
    await this.application.syncService.sync(syncOptions);

    note = this.application.findItem(note.uuid);
    // We expect the item title to be the new title, and not rolled back to original value
    expect(note.content.title).to.equal(newTitle);

    const allItems = this.application.itemManager.items;
    expect(allItems.length).to.equal(this.expectedItemCount);
  }).timeout(10000);

  it('should handle sync conflicts by not duplicating same data', async function () {
    const note = await Factory.createMappedNote(this.application);
    this.expectedItemCount++;
    await this.application.itemManager.setItemDirty(note.uuid);
    await this.application.syncService.sync(syncOptions);

    // keep item as is and set dirty
    await this.application.itemManager.setItemDirty(note.uuid);

    // clear sync token so that all items are retrieved on next sync
    this.application.syncService.clearSyncPositionTokens();

    await this.application.syncService.sync(syncOptions);
    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);
  }).timeout(10000);

  it('clearing conflict_of on two clients simultaneously should keep us in sync', async function () {
    const note = await Factory.createMappedNote(this.application);
    await this.application.itemManager.setItemDirty(note.uuid);
    this.expectedItemCount++;

    await this.application.changeAndSaveItem(note.uuid, (mutator) => {
      // client A
      mutator.content.conflict_of = 'foo';
    });

    // client B
    await this.application.syncService.clearSyncPositionTokens();
    await this.application.itemManager.changeItem(note.uuid, (mutator) => {
      mutator.content.conflict_of = 'bar';
    });

    // conflict_of is a key to ignore when comparing content, so item should
    // not be duplicated.
    await this.application.syncService.sync(syncOptions);
  }).timeout(10000);

  it('setting property on two clients simultaneously should create conflict', async function () {
    const note = await Factory.createMappedNote(this.application);
    await this.application.itemManager.setItemDirty(note.uuid);
    this.expectedItemCount++;

    await this.application.changeAndSaveItem(note.uuid, (mutator) => {
      // client A
      mutator.content.foo = 'foo';
    });

    // client B
    await this.application.syncService.clearSyncPositionTokens();
    await this.application.changeAndSaveItem(note.uuid, (mutator) => {
      mutator.content.foo = 'bar';
      mutator.updated_at = Factory.yesterday();
    });
    this.expectedItemCount++;
  }).timeout(10000);

  it('removes item from storage upon deletion', async function () {
    let note = await Factory.createMappedNote(this.application);
    this.expectedItemCount++;
    await this.application.itemManager.setItemDirty(note.uuid);
    await this.application.syncService.sync(syncOptions);
    note = this.application.findItem(note.uuid);
    expect(note.dirty).to.equal(false);
    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);

    await this.application.itemManager.setItemToBeDeleted(note.uuid);
    note = this.application.findItem(note.uuid);
    expect(note.dirty).to.equal(true);
    this.expectedItemCount--;

    await this.application.syncService.sync(syncOptions);
    note = this.application.findItem(note.uuid);
    expect(note).to.not.be.ok;
    expect(this.application.syncService.state.discordance).to.equal(0);

    // We expect that this item is now gone for good, and no duplicate has been created.
    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);
    await Factory.sleep(0.5);
    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(this.expectedItemCount);
  }).timeout(10000);

  it('retrieving item with no content should correctly map local state', async function () {
    const note = await Factory.createMappedNote(this.application);
    await this.application.itemManager.setItemDirty(note.uuid);
    await this.application.syncService.sync(syncOptions);
    const syncToken = await this.application.syncService.getLastSyncToken();
    this.expectedItemCount++;
    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);

    // client A
    await this.application.itemManager.setItemToBeDeleted(note.uuid);
    await this.application.itemManager.setItemDirty(note.uuid);
    await this.application.syncService.sync(syncOptions);

    // Subtract 1
    this.expectedItemCount--;

    // client B
    // Clearing sync tokens wont work as server wont return deleted items.
    // Set saved sync token instead
    await this.application.syncService.setLastSyncToken(syncToken);
    await this.application.syncService.sync(syncOptions);

    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);
  }).timeout(10000);

  it('if server says deleted but client says not deleted, keep server state', async function () {
    const note = await Factory.createMappedNote(this.application);
    const originalPayload = note.payloadRepresentation();
    this.expectedItemCount++;
    await this.application.itemManager.setItemDirty(note.uuid);
    await this.application.syncService.sync(syncOptions);
    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);

    // client A
    await this.application.itemManager.setItemToBeDeleted(note.uuid);
    await this.application.syncService.sync(syncOptions);
    this.expectedItemCount--;
    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);

    // client B
    await this.application.syncService.clearSyncPositionTokens();
    // Add the item back and say it's not deleted
    const mutatedPayload = CreateMaxPayloadFromAnyObject(
      originalPayload,
      null,
      null,
      {
        deleted: false,
        updated_at: Factory.yesterday()
      }
    );
    await this.application.itemManager.emitItemsFromPayloads(
      [mutatedPayload],
      PayloadSource.LocalChanged
    );
    const resultNote = this.application.itemManager.findItem(note.uuid);
    expect(resultNote.uuid).to.equal(note.uuid);
    await this.application.itemManager.setItemDirty(resultNote.uuid);
    await this.application.syncService.sync(syncOptions);

    // We expect that this item is now gone for good, and a duplicate has not been created.
    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);
  }).timeout(10000);

  it('if server says not deleted but client says deleted, keep server state', async function () {
    const note = await Factory.createMappedNote(this.application);
    await this.application.itemManager.setItemDirty(note.uuid);
    this.expectedItemCount++;

    // client A
    await this.application.syncService.sync(syncOptions);
    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);

    // client B
    await this.application.syncService.clearSyncPositionTokens();

    // This client says this item is deleted, but the server is saying its not deleted.
    // In this case, we want to keep the server copy.
    await this.application.changeAndSaveItem(note.uuid, (mutator) => {
      mutator.setDeleted();
      mutator.updated_at = Factory.yesterday();
    });

    // We expect that this item maintained.
    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);
  }).timeout(10000);

  it('deleting an item while it is being synced should keep deletion state', async function () {
    const note = await Factory.createMappedNote(this.application);
    this.expectedItemCount++;

    /** Begin syncing it with server but introduce latency so we can sneak in a delete */
    this.application.syncService.ut_beginLatencySimulator(500);
    const sync = this.application.sync();
    /** Sleep so sync call can begin preparations but not fully begin */
    await Factory.sleep(0.1);
    await this.application.itemManager.setItemToBeDeleted(note.uuid);
    this.expectedItemCount--;
    await sync;
    this.application.syncService.ut_endLatencySimulator();
    await this.application.sync();

    /** We expect that item has been deleted */
    // expect(note.deleted).to.equal(true);
    const allItems = this.application.itemManager.items;
    expect(allItems.length).to.equal(this.expectedItemCount);
  }).timeout(10000);

  it('should create conflict if syncing an item that is stale', async function () {
    let note = await Factory.createMappedNote(this.application);
    await this.application.itemManager.setItemDirty(note.uuid);
    await this.application.syncService.sync(syncOptions);
    note = this.application.findItem(note.uuid);
    expect(note.dirty).to.equal(false);
    this.expectedItemCount++;
    note = await this.application.changeAndSaveItem(note.uuid, (mutator) => {
      mutator.text = 'Stale text';
      mutator.updated_at = Factory.yesterday();
    });
    expect(note.dirty).to.equal(false);

    // We expect now that the item was conflicted
    this.expectedItemCount++;

    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(this.expectedItemCount);
    for (const payload of rawPayloads) {
      expect(payload.dirty).to.not.be.ok;
    }
  }).timeout(10000);

  it('creating conflict with exactly equal content should keep us in sync', async function () {
    const note = await Factory.createMappedNote(this.application);
    await this.application.itemManager.setItemDirty(note.uuid);
    this.expectedItemCount++;

    await this.application.syncService.sync(syncOptions);

    await this.application.changeAndSaveItem(note.uuid, (mutator) => {
      mutator.updated_at = Factory.yesterday();
    });

    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);
  }).timeout(10000);

  it('items that are never synced and deleted should not be uploaded to server', async function () {
    const note = await Factory.createMappedNote(this.application);
    await this.application.itemManager.setItemDirty(note.uuid);
    await this.application.itemManager.setItemToBeDeleted(note.uuid);

    let success = true;
    let didCompleteRelevantSync = false;
    let beginCheckingResponse = false;
    this.application.syncService.addEventObserver((eventName, data) => {
      if (eventName === SyncEvent.DownloadFirstSyncCompleted) {
        beginCheckingResponse = true;
      }
      if (!beginCheckingResponse) {
        return;
      }
      if (!didCompleteRelevantSync && eventName === SyncEvent.SingleSyncCompleted) {
        didCompleteRelevantSync = true;
        const response = data;
        const matching = response.savedPayloads.find((p) => p.uuid === note.uuid);
        if (matching) {
          success = false;
        }
      }
    });
    await this.application.syncService.sync({ mode: SyncModes.DownloadFirst });
    expect(didCompleteRelevantSync).to.equal(true);
    expect(success).to.equal(true);
  }).timeout(10000);

  it('items that are deleted after download first sync complete should not be uploaded to server', async function () {
    /** The singleton manager may delete items are download first. We dont want those uploaded to server. */
    const note = await Factory.createMappedNote(this.application);
    await this.application.itemManager.setItemDirty(note.uuid);

    let success = true;
    let didCompleteRelevantSync = false;
    let beginCheckingResponse = false;
    this.application.syncService.addEventObserver(async (eventName, data) => {
      if (eventName === SyncEvent.DownloadFirstSyncCompleted) {
        await this.application.itemManager.setItemToBeDeleted(note.uuid);
        beginCheckingResponse = true;
      }
      if (!beginCheckingResponse) {
        return;
      }
      if (!didCompleteRelevantSync && eventName === SyncEvent.SingleSyncCompleted) {
        didCompleteRelevantSync = true;
        const response = data;
        const matching = response.savedPayloads.find((p) => p.uuid === note.uuid);
        if (matching) {
          success = false;
        }
      }
    });
    await this.application.syncService.sync({ mode: SyncModes.DownloadFirst });
    expect(didCompleteRelevantSync).to.equal(true);
    expect(success).to.equal(true);
  }).timeout(10000);

  it('marking an item dirty then saving to disk should retain that dirty state when restored', async function () {
    const note = await Factory.createMappedNote(this.application);
    this.expectedItemCount++;
    await this.application.syncService.markAllItemsAsNeedingSync(false);

    this.application.itemManager.resetState();
    this.application.modelManager.resetState();
    await this.application.syncService.clearSyncPositionTokens();

    expect(this.application.itemManager.items.length).to.equal(0);

    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    const encryptedPayloads = rawPayloads.map((rawPayload) => {
      return CreateMaxPayloadFromAnyObject(rawPayload);
    });
    const payloads = [];
    for (const payload of encryptedPayloads) {
      expect(payload.dirty).to.equal(true);
      const decrypted = await this.application.protocolService
        .payloadByDecryptingPayload(payload);
      payloads.push(decrypted);
    }
    await this.application.itemManager.emitItemsFromPayloads(
      payloads,
      PayloadSource.LocalChanged
    );
    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);
    const foundNote = this.application.itemManager.findItem(note.uuid);
    expect(foundNote.dirty).to.equal(true);
    await this.application.syncService.sync();
  }).timeout(10000);

  it('duplicating an item should maintian its relationships', async function () {
    const payload1 = Factory.createStorageItemPayload(ContentType.ServerExtension);
    const payload2 = Factory.createStorageItemPayload(ContentType.UserPrefs);
    await this.application.itemManager.emitItemsFromPayloads(
      [payload1, payload2],
      PayloadSource.LocalChanged
    );
    this.expectedItemCount += 2;
    let serverExt = this.application.itemManager.getItems(ContentType.ServerExtension)[0];
    let userPrefs = this.application.itemManager.getItems(ContentType.UserPrefs)[0];
    expect(serverExt).to.be.ok;
    expect(userPrefs).to.be.ok;

    serverExt = await this.application.itemManager.changeItem(serverExt.uuid, (mutator) => {
      mutator.addItemAsRelationship(userPrefs);
    });

    await this.application.itemManager.setItemDirty(userPrefs.uuid);
    userPrefs = this.application.findItem(userPrefs.uuid);

    expect(this.application.itemManager.itemsReferencingItem(userPrefs.uuid).length).to.equal(1);
    expect(this.application.itemManager.itemsReferencingItem(userPrefs.uuid)).to.include(serverExt);

    await this.application.syncService.sync(syncOptions);
    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);

    serverExt = await this.application.itemManager.changeItem(serverExt.uuid, (mutator) => {
      mutator.content.title = `${Math.random()}`;
      mutator.updated_at = Factory.yesterday();
    });
    await this.application.syncService.sync({ ...syncOptions, awaitAll: true });

    // fooItem should now be conflicted and a copy created
    this.expectedItemCount++;
    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);
    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(this.expectedItemCount);

    const fooItems = this.application.itemManager.getItems(ContentType.ServerExtension);
    const fooItem2 = fooItems[1];

    expect(fooItem2.content.conflict_of).to.equal(serverExt.uuid);
    // Two items now link to this original object
    const referencingItems = this.application.itemManager.itemsReferencingItem(userPrefs.uuid);
    expect(referencingItems.length).to.equal(2);
    expect(referencingItems[0]).to.not.equal(referencingItems[1]);

    expect(this.application.itemManager.itemsReferencingItem(serverExt.uuid).length).to.equal(0);
    expect(this.application.itemManager.itemsReferencingItem(fooItem2.uuid).length).to.equal(0);

    expect(serverExt.content.references.length).to.equal(1);
    expect(fooItem2.content.references.length).to.equal(1);
    expect(userPrefs.content.references.length).to.equal(0);

    expect(this.application.itemManager.getDirtyItems().length).to.equal(0);
    for (const item of this.application.itemManager.items) {
      expect(item.dirty).to.not.be.ok;
    }
  }).timeout(10000);

  it('should handle uploading with sync pagination', async function () {
    const largeItemCount = 160;
    for (let i = 0; i < largeItemCount; i++) {
      const note = await Factory.createMappedNote(this.application);
      await this.application.itemManager.setItemDirty(note.uuid);
    }

    this.expectedItemCount += largeItemCount;

    await this.application.syncService.sync(syncOptions);
    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(this.expectedItemCount);
  }).timeout(15000);

  it('should handle downloading with sync pagination', async function () {
    const largeItemCount = 160;
    for (let i = 0; i < largeItemCount; i++) {
      const note = await Factory.createMappedNote(this.application);
      await this.application.itemManager.setItemDirty(note.uuid);
    }
    /** Upload */
    await this.application.syncService.sync(syncOptions);
    this.expectedItemCount += largeItemCount;

    /** Clear local data */
    await this.application.modelManager.resetState();
    await this.application.itemManager.resetState();
    await this.application.syncService.clearSyncPositionTokens();
    await this.application.storageService.clearAllPayloads();
    expect(this.application.itemManager.items.length).to.equal(0);

    /** Download all data */
    await this.application.syncService.sync(syncOptions);
    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);
    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(this.expectedItemCount);
  }).timeout(20000);

  it('should be able to download all items separate of sync', async function () {
    const largeItemCount = 20;
    for (let i = 0; i < largeItemCount; i++) {
      const note = await Factory.createMappedNote(this.application);
      await this.application.itemManager.setItemDirty(note.uuid);
    }
    /** Upload */
    await this.application.syncService.sync(syncOptions);
    this.expectedItemCount += largeItemCount;

    /** Download */
    const downloadedItems = await this.application.syncService.statelessDownloadAllItems();
    expect(downloadedItems.length).to.equal(this.expectedItemCount);
    // ensure it's decrypted
    expect(downloadedItems[10].content.text.length).to.be.above(1);
    expect(downloadedItems[10].text.length).to.be.above(1);
  }).timeout(10000);

  it('syncing an item should storage it encrypted', async function () {
    const note = await Factory.createMappedNote(this.application);
    await this.application.itemManager.setItemDirty(note.uuid);
    await this.application.syncService.sync(syncOptions);
    this.expectedItemCount++;
    const rawPayloads = await this.application.syncService.getDatabasePayloads();
    const notePayload = rawPayloads.find((p) => p.content_type === ContentType.Note);
    expect(typeof notePayload.content).to.equal('string');
  });

  it('syncing an item before data load should storage it encrypted', async function () {
    const note = await Factory.createMappedNote(this.application);
    await this.application.itemManager.setItemDirty(note.uuid);
    this.expectedItemCount++;

    /** Simulate database not loaded */
    await this.application.syncService.clearSyncPositionTokens();
    this.application.syncService.ut_setDatabaseLoaded(false);
    this.application.syncService.sync(syncOptions);
    await Factory.sleep(0.3);

    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    const notePayload = rawPayloads.find((p) => p.content_type === ContentType.Note);
    expect(typeof notePayload.content).to.equal('string');
  });

  it('saving an item after sync should persist it with content property', async function () {
    const note = await Factory.createMappedNote(this.application);
    const text = Factory.randomString(10000);
    await this.application.changeAndSaveItem(note.uuid, (mutator) => {
      mutator.text = text;
    });
    this.expectedItemCount++;
    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    const notePayload = rawPayloads.find((p) => p.content_type === ContentType.Note);
    expect(typeof notePayload.content).to.equal('string');
    expect(notePayload.content.length).to.be.above(text.length);
  });

  it('syncing a new item before local data has loaded should still persist the item to disk',
    async function () {
      this.application.syncService.ut_setDatabaseLoaded(false);
      /** You don't want to clear model manager state as we'll lose encrypting items key */
      // await this.application.modelManager.resetState();
      await this.application.syncService.clearSyncPositionTokens();
      expect(this.application.itemManager.getDirtyItems().length).to.equal(0);

      let note = await Factory.createMappedNote(this.application);
      note = await this.application.itemManager.changeItem(note.uuid, (mutator) => {
        mutator.text = `${Math.random()}`;
      });
      /** This sync request should exit prematurely as we called ut_setDatabaseNotLoaded */
      /** Do not await. Sleep instead. */
      this.application.syncService.sync(syncOptions);
      await Factory.sleep(0.3);
      this.expectedItemCount++;

      /** Item should still be dirty */
      expect(note.dirty).to.equal(true);
      expect(this.application.itemManager.getDirtyItems().length).to.equal(1);

      const rawPayloads = await this.application.storageService.getAllRawPayloads();
      expect(rawPayloads.length).to.equal(this.expectedItemCount);
      const rawPayload = rawPayloads.find((p) => p.uuid === note.uuid);
      expect(rawPayload.uuid).to.equal(note.uuid);
      expect(rawPayload.dirty).equal(true);
      expect(typeof rawPayload.content).to.equal('string');

      /** Clear state data and upload item from storage to server */
      await this.application.syncService.clearSyncPositionTokens();
      await this.application.modelManager.resetState();
      await this.application.itemManager.resetState();
      const databasePayloads = await this.application.storageService.getAllRawPayloads();
      await this.application.syncService.loadDatabasePayloads(databasePayloads);
      await this.application.syncService.sync(syncOptions);

      const newRawPayloads = await this.application.storageService.getAllRawPayloads();
      expect(newRawPayloads.length).to.equal(this.expectedItemCount);

      const currentItem = this.application.itemManager.findItem(note.uuid);
      expect(currentItem.content.text).to.equal(note.content.text);
      expect(currentItem.text).to.equal(note.text);
      expect(currentItem.dirty).to.equal(false);
    }).timeout(10000);

  it('load local items should respect sort priority', async function () {
    const contentTypes = ['A', 'B', 'C'];
    const itemCount = 6;
    const originalPayloads = [];
    for (let i = 0; i < itemCount; i++) {
      const payload = Factory.createStorageItemPayload(contentTypes[Math.floor(i / 2)]);
      originalPayloads.push(payload);
    }
    const sorted = SortPayloadsByRecentAndContentPriority(
      originalPayloads,
      ['C', 'A', 'B']
    );
    expect(sorted[0].content_type).to.equal('C');
    expect(sorted[2].content_type).to.equal('A');
    expect(sorted[4].content_type).to.equal('B');
  }).timeout(10000);

  it.only('handles stale data in bulk', async function () {
    /** This number must be greater than the pagination limit per sync request. 
     * For example if the limit per request is 150 items sent/received, this number should
     * be something like 160. */
    const largeItemCount = 160;
    await Factory.createManyMappedNotes(this.application, largeItemCount);
    /** Upload */
    await this.application.syncService.sync(syncOptions);
    this.expectedItemCount += largeItemCount;
    const items = this.application.itemManager.items;
    expect(items.length).to.equal(this.expectedItemCount);
    /**
     * We want to see what will happen if we upload everything we have to
     * the server as dirty, with no sync token, so that the server also
     * gives us everything it has.
     */
    const yesterday = Factory.yesterday();
    for (const note of this.application.itemManager.notes) {
      await this.application.itemManager.changeItem(note.uuid, (mutator) => {
        mutator.text = `${Math.random()}`;
        mutator.updated_at = yesterday;
      });
      // We expect all the notes to be duplicated.
      this.expectedItemCount++;
    }

    await this.application.syncService.clearSyncPositionTokens();
    await this.application.syncService.sync(syncOptions);
    
    const notes = this.application.itemManager.notes;
    expect(notes.length).to.equal(largeItemCount * 2);
  }).timeout(60000);

  it('should sign in and retrieve large number of items', async function () {
    const largeItemCount = 50;
    await Factory.createManyMappedNotes(this.application, largeItemCount);
    this.expectedItemCount += largeItemCount;
    await this.application.syncService.sync();

    this.application = await Factory.signOutApplicationAndReturnNew(this.application);
    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(BASE_ITEM_COUNT);

    await this.application.signIn(
      this.email,
      this.password,
      undefined, undefined, undefined, undefined, undefined,
      true
    );

    this.application.syncService.ut_setDatabaseLoaded(false);
    const databasePayloads = await this.application.storageService.getAllRawPayloads();
    await this.application.syncService.loadDatabasePayloads(databasePayloads);
    await this.application.syncService.sync(syncOptions);

    const items = await this.application.itemManager.items;
    expect(items.length).to.equal(this.expectedItemCount);
  }).timeout(20000);

  it('when a note is conflicted, its tags should not be duplicated.', async function () {
    /**
     * If you have a note and a tag, and the tag has 1 reference to the note,
     * and you import the same two items, except modify the note value so that
     * a duplicate is created, we expect only the note to be duplicated,
     * and the tag not to.
     */
    let tag = await Factory.createMappedTag(this.application);
    let note = await Factory.createMappedNote(this.application);
    tag = await this.application.changeAndSaveItem(tag.uuid, (mutator) => {
      mutator.addItemAsRelationship(note);
    });
    await this.application.itemManager.setItemDirty(note.uuid);
    this.expectedItemCount += 2;

    await this.application.syncService.sync(syncOptions);

    // conflict the note
    const newText = `${Math.random()}`;
    note = await this.application.changeAndSaveItem(note.uuid, (mutator) => {
      mutator.updated_at = Factory.yesterday();
      mutator.text = newText;
    });

    // conflict the tag but keep its content the same
    tag = await this.application.changeAndSaveItem(tag.uuid, (mutator) => {
      mutator.updated_at = Factory.yesterday();
    });
    /**
     * We expect now that the total item count has went up by just 1 (the note),
     * and not 2 (the note and tag)
     */
    this.expectedItemCount += 1;
    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);
    expect(tag.content.references.length).to.equal(2);
  }).timeout(10000);

  it('valid sync date tracking', async function () {
    let note = await Factory.createMappedNote(this.application);
    note = await this.application.itemManager.setItemDirty(note.uuid);
    this.expectedItemCount++;

    expect(note.dirty).to.equal(true);
    expect(note.dirtiedDate).to.be.at.most(new Date());

    note = await this.application.itemManager.changeItem(note.uuid, (mutator) => {
      mutator.text = `${Math.random()}`;
    });
    const sync = this.application.sync();
    await Factory.sleep(0.1);
    note = this.application.findItem(note.uuid);
    expect(note.lastSyncBegan).to.be.below(new Date());
    await sync;
    expect(note.dirty).to.equal(false);
    expect(note.lastSyncEnd).to.be.at.least(note.lastSyncBegan);

  }).timeout(10000);

  it('syncing twice without waiting should only execute 1 online sync', async function () {
    const expectedEvents = 1;
    let actualEvents = 0;
    this.application.syncService.addEventObserver((event, data) => {
      if (event === SyncEvent.FullSyncCompleted && data.source === SyncSources.External) {
        actualEvents++;
      }
    });
    const first = this.application.sync();
    const second = this.application.sync();
    await Promise.all([first, second]);
    /** Sleep so that any automatic syncs that are triggered are also sent to handler above */
    await Factory.sleep(0.5);
    expect(actualEvents).to.equal(expectedEvents);
  });

  it('should keep an item dirty thats been modified after low latency sync request began', async function () {
    /**
     * If you begin a sync request that takes 20s to complete, then begin modifying an item
     * many times and attempt to sync, it will await the initial sync to complete.
     * When that completes, it will decide whether an item is still dirty or not.
     * It will do based on comparing whether item.dirtiedDate > item.lastSyncBegan
     */
    let note = await Factory.createMappedNote(this.application);
    await this.application.itemManager.setItemDirty(note.uuid);
    this.expectedItemCount++;

    // client A. Don't await, we want to do other stuff.
    this.application.syncService.ut_beginLatencySimulator(1500);
    const slowSync = this.application.syncService.sync(syncOptions);
    await Factory.sleep(0.1);
    expect(note.dirty).to.equal(true);

    // While that sync is going on, we want to modify this item many times.
    const text = `${Math.random()}`;
    note = await this.application.itemManager.changeItem(note.uuid, (mutator) => {
      mutator.text = text;
    });
    await this.application.itemManager.setItemDirty(note.uuid);
    await this.application.itemManager.setItemDirty(note.uuid);
    await this.application.itemManager.setItemDirty(note.uuid);
    expect(note.dirtiedDate).to.be.above(note.lastSyncBegan);

    // Now do a regular sync with no latency.
    this.application.syncService.ut_endLatencySimulator();
    const midSync = this.application.syncService.sync(syncOptions);

    await slowSync;
    await midSync;

    note = this.application.findItem(note.uuid);
    expect(note.dirty).to.equal(false);
    expect(note.lastSyncEnd).to.be.above(note.lastSyncBegan);
    expect(note.content.text).to.equal(text);

    // client B
    await this.application.modelManager.resetState();
    await this.application.itemManager.resetState();
    await this.application.syncService.clearSyncPositionTokens();
    await this.application.syncService.sync(syncOptions);

    // Expect that the server value and client value match, and no conflicts are created.
    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);
    const foundItem = this.application.itemManager.findItem(note.uuid);
    expect(foundItem.content.text).to.equal(text);
    expect(foundItem.text).to.equal(text);
  }).timeout(10000);

  it('should sync an item twice if its marked dirty while a sync is ongoing', async function () {
    /** We can't track how many times an item is synced, only how many times its mapped */
    const expectedSaveCount = 2;
    let actualSaveCount = 0;
    /** Create an item and sync it */
    let note = await Factory.createMappedNote(this.application);
    this.application.itemManager.addObserver(
      ContentType.Note,
      (changed, inserted, discarded, source) => {
        if (source === PayloadSource.RemoteSaved) {
          actualSaveCount++;
        }
      }
    );
    this.expectedItemCount++;
    this.application.syncService.ut_beginLatencySimulator(150);
    /** Dont await */
    const syncRequest = this.application.syncService.sync(syncOptions);
    /** Dirty the item 100ms into 150ms request */
    const newText = `${Math.random()}`;
    setTimeout(async function () {
      await this.application.itemManager.changeItem(note.uuid, (mutator) => {
        mutator.text = newText;
      });
    }.bind(this), 100);
    /**
     * Await sync request. A sync request will perform another request if there
     * are still more dirty items, so awaiting this will perform two syncs.
     */
    await syncRequest;
    expect(actualSaveCount).to.equal(expectedSaveCount);
    note = this.application.findItem(note.uuid);
    expect(note.text).to.equal(newText);
  }).timeout(Factory.TestTimeout);

  it('retreiving a remote deleted item should succeed', async function () {
    const note = await Factory.createSyncedNote(this.application);
    const preDeleteSyncToken = await this.application.syncService.getLastSyncToken();
    await this.application.deleteItem(note);
    await this.application.syncService.setLastSyncToken(preDeleteSyncToken);
    await this.application.sync();
    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);
  }).timeout(Factory.TestTimeout);
});
