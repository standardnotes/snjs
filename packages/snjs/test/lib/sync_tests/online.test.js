import { ChallengeValue } from '@Lib/challenges';
import { SyncEvent } from '@Lib/events';
import {
  CreateMaxPayloadFromAnyObject,
  PayloadFormat,
  PayloadSource,
  SortPayloadsByRecentAndContentPriority,
  SyncSources,
  CopyPayload,
  SyncResponse,
  SyncResponseResolver
} from '@Lib/index';
import { ContentType } from '@Lib/models';
import { EncryptionIntent } from '@Lib/protocol';
import { SyncQueueStrategy, SyncModes } from '@Lib/services';
import { Uuid } from '@Lib/uuid';
import * as Factory from '../../factory';

describe.skip('online syncing', function () {
  jest.setTimeout(Factory.TestTimeout);
  const BASE_ITEM_COUNT = 2; /** Default items key, user preferences */

  const syncOptions = {
    checkIntegrity: true,
    awaitAll: true,
  };

  let expectedItemCount;
  let application;
  let email, password;

  beforeEach(async function () {
    expectedItemCount = BASE_ITEM_COUNT;
    application = await Factory.createInitAppWithRandNamespace();
    email = Uuid.GenerateUuidSynchronously();
    password = Uuid.GenerateUuidSynchronously();
    await Factory.registerUserToApplication({
      application: application,
      email: email,
      password: password,
    });
  });

  afterEach(async function () {
    expect(application.syncService.isOutOfSync()).toBe(false);
    const items = application.itemManager.items;
    expect(items.length).toBe(expectedItemCount);
    const rawPayloads = await application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).toBe(expectedItemCount);
    await application.deinit();
  });

  function noteObjectsFromObjects(items) {
    return items.filter((item) => item.content_type === ContentType.Note);
  }

  it('should register and sync basic model online', async function () {
    let note = await Factory.createSyncedNote(application);
    expectedItemCount++;
    expect(application.itemManager.getDirtyItems().length).toBe(0);
    note = application.findItem(note.uuid);
    expect(note.dirty).toBeFalsy();

    const rawPayloads = await application.storageService.getAllRawPayloads();
    const notePayloads = noteObjectsFromObjects(rawPayloads);
    expect(notePayloads.length).toBe(1);
    for (const rawNote of notePayloads) {
      expect(rawNote.dirty).toBeFalsy();
    }
  });

  it('should login and retrieve synced item', async function () {
    const note = await Factory.createSyncedNote(application);
    expectedItemCount++;
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );

    await Factory.loginToApplication({
      application: application,
      email: email,
      password: password,
    });

    const notes = application.itemManager.notes;
    expect(notes.length).toBe(1);
    expect(notes[0].title).toBe(note.title);
  });

  it('can complete multipage sync on sign in', async function () {
    const count = 0;
    await Factory.createManyMappedNotes(application, count);
    expectedItemCount += count;
    await application.sync(syncOptions);
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    expect(application.itemManager.items.length).toBe(BASE_ITEM_COUNT);
    const promise = Factory.loginToApplication({
      application: application,
      email: email,
      password: password,
    });
    /** Throw in some random syncs to cause trouble */
    const syncCount = 30;
    for (let i = 0; i < syncCount; i++) {
      application.sync(syncOptions);
      await Factory.sleep(0.01);
    }
    await promise;
    expect(promise).resolves.toBeTruthy();
    /** Allow any unwaited syncs in for loop to complete */
    await Factory.sleep(0.5);
  }, 20000);

  it('uuid alternation should delete original payload', async function () {
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    const note = await Factory.createMappedNote(application);
    expectedItemCount++;
    await application.syncService.alternateUuidForItem(note.uuid);
    await application.sync(syncOptions);

    const notes = application.itemManager.notes;
    expect(notes.length).toBe(1);
    expect(notes[0].uuid).not.toBe(note.uuid);
  });

  it('having offline data then signing in should not alternate uuid and merge with account', async function () {
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    const note = await Factory.createMappedNote(application);
    expectedItemCount++;
    await Factory.loginToApplication({
      application: application,
      email: email,
      password: password,
      mergeLocal: true,
    });

    const notes = application.itemManager.notes;
    expect(notes.length).toBe(1);
    /** uuid should have been alternated */
    expect(notes[0].uuid).toBe(note.uuid);
  });

  it('server extensions should not be encrypted for sync', async function () {
    const payload = CreateMaxPayloadFromAnyObject({
      uuid: await Uuid.GenerateUuid(),
      content_type: ContentType.Mfa,
      content: {
        secret: '123',
      },
    });
    const results = await application.syncService.payloadsByPreparingForServer(
      [payload]
    );
    const processed = results[0];
    expect(processed.format).toBe(PayloadFormat.DecryptedBase64String);
  });

  it('resolve on next timing strategy', async function () {
    const syncCount = 7;
    let successes = 0;
    let events = 0;

    application.syncService.ut_beginLatencySimulator(250);
    application.syncService.addEventObserver((event, data) => {
      if (event === SyncEvent.FullSyncCompleted) {
        events++;
      }
    });

    const promises = [];
    for (let i = 0; i < syncCount; i++) {
      promises.push(
        application.syncService
          .sync({
            queueStrategy: SyncQueueStrategy.ResolveOnNext,
          })
          .then(() => {
            successes++;
          })
      );
    }

    await Promise.all(promises);
    expect(successes).toBe(syncCount);
    // Only a fully executed sync request creates a sync:completed event.
    // We don't know how many will execute above.
    expect(events).toBeGreaterThanOrEqual(1);

    application.syncService.ut_endLatencySimulator();
    // Since the syncs all happen after one another, extra syncs may be queued on that we are not awaiting.
    await Factory.sleep(0.5);
  });

  it('force spawn new timing strategy', async function () {
    const syncCount = 7;
    let successes = 0;
    let events = 0;

    application.syncService.ut_beginLatencySimulator(250);

    application.syncService.addEventObserver((event, data) => {
      if (event === SyncEvent.FullSyncCompleted) {
        events++;
      }
    });

    const promises = [];
    for (let i = 0; i < syncCount; i++) {
      promises.push(
        application.syncService
          .sync({
            queueStrategy: SyncQueueStrategy.ForceSpawnNew,
          })
          .then(() => {
            successes++;
          })
      );
    }
    await Promise.all(promises);
    expect(successes).toBe(syncCount);
    expect(events).toBe(syncCount);
    application.syncService.ut_endLatencySimulator();
  });

  it('retrieving new items should not mark them as dirty', async function () {
    const originalNote = await Factory.createSyncedNote(application);
    expectedItemCount++;
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    application.syncService.addEventObserver((event, data) => {
      if (event === SyncEvent.SingleSyncCompleted) {
        const note = application.findItem(originalNote.uuid);
        expect(note.dirty).toBeFalsy();
      }
    });
    await application.signIn(
      email,
      password,
      undefined,
      undefined,
      undefined,
      true
    );
  });

  it('allows me to save data after Ive signed out', async function () {
    expect(application.itemManager.itemsKeys().length).toBe(1);
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    expect(application.itemManager.itemsKeys().length).toBe(1);
    const note = await Factory.createMappedNote(application);
    expectedItemCount++;
    await application.itemManager.setItemDirty(note.uuid);
    await application.syncService.sync(syncOptions);
    const rawPayloads = await application.storageService.getAllRawPayloads();
    const notePayload = noteObjectsFromObjects(rawPayloads);
    expect(notePayload.length).toBe(1);
    expect(application.itemManager.notes.length).toBe(1);

    // set item to be merged for when sign in occurs
    await application.syncService.markAllItemsAsNeedingSync();
    expect(application.syncService.isOutOfSync()).toBe(false);
    expect(application.itemManager.getDirtyItems().length).toBe(BASE_ITEM_COUNT + 1);

    // Sign back in for next tests
    await Factory.loginToApplication({
      application: application,
      email: email,
      password: password,
    });

    expect(application.itemManager.getDirtyItems().length).toBe(0);
    expect(application.itemManager.itemsKeys().length).toBe(1);
    expect(application.syncService.isOutOfSync()).toBe(false);
    expect(application.itemManager.notes.length).toBe(1);

    for (const item of application.itemManager.notes) {
      expect(item.content.title).toBeTruthy();
    }

    const updatedRawPayloads = await application.storageService.getAllRawPayloads();
    for (const payload of updatedRawPayloads) {
      // if an item comes back from the server, it is saved to disk immediately without a dirty value.
      expect(payload.dirty).toBeFalsy();
    }
  });

  it('mapping should not mutate items with error decrypting state', async function () {
    const note = await Factory.createMappedNote(application);
    expectedItemCount++;
    const originalTitle = note.content.title;
    await application.itemManager.setItemDirty(note.uuid);
    await application.syncService.sync(syncOptions);

    const encrypted = await application.protocolService.payloadByEncryptingPayload(
      note.payloadRepresentation(),
      EncryptionIntent.Sync
    );
    const errorred = CreateMaxPayloadFromAnyObject(encrypted, {
      errorDecrypting: true,
    });
    const items = await application.itemManager.emitItemsFromPayloads(
      [errorred],
      PayloadSource.LocalChanged
    );
    const mappedItem = items[0];
    expect(typeof mappedItem.content).toBe('string');

    const decryptedPayload = await application.protocolService.payloadByDecryptingPayload(
      errorred
    );
    const mappedItems2 = await application.itemManager.emitItemsFromPayloads(
      [decryptedPayload],
      PayloadSource.LocalChanged
    );
    const mappedItem2 = mappedItems2[0];
    expect(typeof mappedItem2.content).toBe('object');
    expect(mappedItem2.content.title).toBe(originalTitle);
  });

  it('signing into account with pre-existing items', async function () {
    const note = await Factory.createMappedNote(application);
    await application.saveItem(note.uuid);
    expectedItemCount += 1;

    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    await application.signIn(
      email,
      password,
      undefined,
      undefined,
      undefined,
      true
    );

    expect(application.itemManager.items.length).toBe(expectedItemCount);
  });

  it('removes item from storage upon deletion', async function () {
    let note = await Factory.createMappedNote(application);
    expectedItemCount++;
    await application.itemManager.setItemDirty(note.uuid);
    await application.syncService.sync(syncOptions);
    note = application.findItem(note.uuid);
    expect(note.dirty).toBe(false);
    expect(application.itemManager.items.length).toBe(expectedItemCount);

    await application.itemManager.setItemToBeDeleted(note.uuid);
    note = application.findItem(note.uuid);
    expect(note.dirty).toBe(true);
    expectedItemCount--;

    await application.syncService.sync(syncOptions);
    note = application.findItem(note.uuid);
    expect(note).toBeFalsy();
    expect(application.syncService.state.discordance).toBe(0);

    // We expect that this item is now gone for good, and no duplicate has been created.
    expect(application.itemManager.items.length).toBe(expectedItemCount);
    await Factory.sleep(0.5);
    const rawPayloads = await application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).toBe(expectedItemCount);
  });

  it('retrieving item with no content should correctly map local state', async function () {
    const note = await Factory.createMappedNote(application);
    await application.itemManager.setItemDirty(note.uuid);
    await application.syncService.sync(syncOptions);
    const syncToken = await application.syncService.getLastSyncToken();
    expectedItemCount++;
    expect(application.itemManager.items.length).toBe(expectedItemCount);

    // client A
    await application.itemManager.setItemToBeDeleted(note.uuid);
    await application.itemManager.setItemDirty(note.uuid);
    await application.syncService.sync(syncOptions);

    // Subtract 1
    expectedItemCount--;

    // client B
    // Clearing sync tokens wont work as server wont return deleted items.
    // Set saved sync token instead
    await application.syncService.setLastSyncToken(syncToken);
    await application.syncService.sync(syncOptions);

    expect(application.itemManager.items.length).toBe(expectedItemCount);
  });

  it('deleting an item while it is being synced should keep deletion state', async function () {
    const note = await Factory.createMappedNote(application);
    expectedItemCount++;

    /** Begin syncing it with server but introduce latency so we can sneak in a delete */
    application.syncService.ut_beginLatencySimulator(500);
    const sync = application.sync();
    /** Sleep so sync call can begin preparations but not fully begin */
    await Factory.sleep(0.1);
    await application.itemManager.setItemToBeDeleted(note.uuid);
    expectedItemCount--;
    await sync;
    application.syncService.ut_endLatencySimulator();
    await application.sync(syncOptions);

    /** We expect that item has been deleted */
    const allItems = application.itemManager.items;
    expect(allItems.length).toBe(expectedItemCount);
  });

  it('items that are never synced and deleted should not be uploaded to server', async function () {
    const note = await Factory.createMappedNote(application);
    await application.itemManager.setItemDirty(note.uuid);
    await application.itemManager.setItemToBeDeleted(note.uuid);

    let success = true;
    let didCompleteRelevantSync = false;
    let beginCheckingResponse = false;
    application.syncService.addEventObserver((eventName, data) => {
      if (eventName === SyncEvent.DownloadFirstSyncCompleted) {
        beginCheckingResponse = true;
      }
      if (!beginCheckingResponse) {
        return;
      }
      if (
        !didCompleteRelevantSync &&
        eventName === SyncEvent.SingleSyncCompleted
      ) {
        didCompleteRelevantSync = true;
        const response = data;
        const matching = response.savedPayloads.find(
          (p) => p.uuid === note.uuid
        );
        if (matching) {
          success = false;
        }
      }
    });
    await application.syncService.sync({ mode: SyncModes.DownloadFirst });
    expect(didCompleteRelevantSync).toBe(true);
    expect(success).toBe(true);
  });

  it('items that are deleted after download first sync complete should not be uploaded to server', async function () {
    /** The singleton manager may delete items are download first. We dont want those uploaded to server. */
    const note = await Factory.createMappedNote(application);
    await application.itemManager.setItemDirty(note.uuid);

    let success = true;
    let didCompleteRelevantSync = false;
    let beginCheckingResponse = false;
    application.syncService.addEventObserver(async (eventName, data) => {
      if (eventName === SyncEvent.DownloadFirstSyncCompleted) {
        await application.itemManager.setItemToBeDeleted(note.uuid);
        beginCheckingResponse = true;
      }
      if (!beginCheckingResponse) {
        return;
      }
      if (
        !didCompleteRelevantSync &&
        eventName === SyncEvent.SingleSyncCompleted
      ) {
        didCompleteRelevantSync = true;
        const response = data;
        const matching = response.savedPayloads.find(
          (p) => p.uuid === note.uuid
        );
        if (matching) {
          success = false;
        }
      }
    });
    await application.syncService.sync({ mode: SyncModes.DownloadFirst });
    expect(didCompleteRelevantSync).toBe(true);
    expect(success).toBe(true);
  });

  it('marking an item dirty then saving to disk should retain that dirty state when restored', async function () {
    const note = await Factory.createMappedNote(application);
    expectedItemCount++;
    await application.syncService.markAllItemsAsNeedingSync();

    application.itemManager.resetState();
    application.payloadManager.resetState();
    await application.syncService.clearSyncPositionTokens();

    expect(application.itemManager.items.length).toBe(0);

    const rawPayloads = await application.storageService.getAllRawPayloads();
    const encryptedPayloads = rawPayloads.map((rawPayload) => {
      return CreateMaxPayloadFromAnyObject(rawPayload);
    });
    const payloads = [];
    for (const payload of encryptedPayloads) {
      expect(payload.dirty).toBe(true);
      const decrypted = await application.protocolService.payloadByDecryptingPayload(
        payload
      );
      payloads.push(decrypted);
    }
    await application.itemManager.emitItemsFromPayloads(
      payloads,
      PayloadSource.LocalChanged
    );
    expect(application.itemManager.items.length).toBe(expectedItemCount);
    const foundNote = application.itemManager.findItem(note.uuid);
    expect(foundNote.dirty).toBe(true);
    await application.syncService.sync(syncOptions);
  });

  it('should handle uploading with sync pagination', async function () {
    const largeItemCount = 160;
    for (let i = 0; i < largeItemCount; i++) {
      const note = await Factory.createMappedNote(application);
      await application.itemManager.setItemDirty(note.uuid);
    }

    expectedItemCount += largeItemCount;

    await application.syncService.sync(syncOptions);
    const rawPayloads = await application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).toBe(expectedItemCount);
  }, 15000);

  it('should handle downloading with sync pagination', async function () {
    const largeItemCount = 160;
    for (let i = 0; i < largeItemCount; i++) {
      const note = await Factory.createMappedNote(application);
      await application.itemManager.setItemDirty(note.uuid);
    }
    /** Upload */
    await application.syncService.sync(syncOptions);
    expectedItemCount += largeItemCount;

    /** Clear local data */
    await application.payloadManager.resetState();
    await application.itemManager.resetState();
    await application.syncService.clearSyncPositionTokens();
    await application.storageService.clearAllPayloads();
    expect(application.itemManager.items.length).toBe(0);

    /** Download all data */
    await application.syncService.sync(syncOptions);
    expect(application.itemManager.items.length).toBe(expectedItemCount);
    const rawPayloads = await application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).toBe(expectedItemCount);
  }, 20000);

  it('should be able to download all items separate of sync', async function () {
    const largeItemCount = 20;
    for (let i = 0; i < largeItemCount; i++) {
      const note = await Factory.createMappedNote(application);
      await application.itemManager.setItemDirty(note.uuid);
    }
    /** Upload */
    await application.syncService.sync(syncOptions);
    expectedItemCount += largeItemCount;

    /** Download */
    const downloadedItems = await application.syncService.statelessDownloadAllItems();
    expect(downloadedItems.length).toBe(expectedItemCount);
    // ensure it's decrypted
    expect(downloadedItems[10].content.text.length).toBeGreaterThan(1);
    expect(downloadedItems[10].text.length).toBeGreaterThan(1);
  });

  it('syncing an item should storage it encrypted', async function () {
    const note = await Factory.createMappedNote(application);
    await application.itemManager.setItemDirty(note.uuid);
    await application.syncService.sync(syncOptions);
    expectedItemCount++;
    const rawPayloads = await application.syncService.getDatabasePayloads();
    const notePayload = rawPayloads.find(
      (p) => p.content_type === ContentType.Note
    );
    expect(typeof notePayload.content).toBe('string');
  });

  it('syncing an item before data load should storage it encrypted', async function () {
    const note = await Factory.createMappedNote(application);
    await application.itemManager.setItemDirty(note.uuid);
    expectedItemCount++;

    /** Simulate database not loaded */
    await application.syncService.clearSyncPositionTokens();
    application.syncService.ut_setDatabaseLoaded(false);
    application.syncService.sync(syncOptions);
    await Factory.sleep(0.3);

    const rawPayloads = await application.storageService.getAllRawPayloads();
    const notePayload = rawPayloads.find(
      (p) => p.content_type === ContentType.Note
    );
    expect(typeof notePayload.content).toBe('string');
  });

  it('saving an item after sync should persist it with content property', async function () {
    const note = await Factory.createMappedNote(application);
    const text = Factory.randomString(10000);
    await application.changeAndSaveItem(
      note.uuid,
      (mutator) => {
        mutator.text = text;
      },
      undefined,
      undefined,
      syncOptions
    );
    expectedItemCount++;
    const rawPayloads = await application.storageService.getAllRawPayloads();
    const notePayload = rawPayloads.find(
      (p) => p.content_type === ContentType.Note
    );
    expect(typeof notePayload.content).toBe('string');
    expect(notePayload.content.length).toBeGreaterThan(text.length);
  });

  it('syncing a new item before local data has loaded should still persist the item to disk', async function () {
    application.syncService.ut_setDatabaseLoaded(false);
    /** You don't want to clear model manager state as we'll lose encrypting items key */
    // await application.payloadManager.resetState();
    await application.syncService.clearSyncPositionTokens();
    expect(application.itemManager.getDirtyItems().length).toBe(0);

    let note = await Factory.createMappedNote(application);
    note = await application.itemManager.changeItem(
      note.uuid,
      (mutator) => {
        mutator.text = `${Math.random()}`;
      }
    );
    /** This sync request should exit prematurely as we called ut_setDatabaseNotLoaded */
    /** Do not await. Sleep instead. */
    application.syncService.sync(syncOptions);
    await Factory.sleep(0.3);
    expectedItemCount++;

    /** Item should still be dirty */
    expect(note.dirty).toBe(true);
    expect(application.itemManager.getDirtyItems().length).toBe(1);

    const rawPayloads = await application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).toBe(expectedItemCount);
    const rawPayload = rawPayloads.find((p) => p.uuid === note.uuid);
    expect(rawPayload.uuid).toBe(note.uuid);
    expect(rawPayload.dirty).toBe(true);
    expect(typeof rawPayload.content).toBe('string');

    /** Clear state data and upload item from storage to server */
    await application.syncService.clearSyncPositionTokens();
    await application.payloadManager.resetState();
    await application.itemManager.resetState();
    const databasePayloads = await application.storageService.getAllRawPayloads();
    await application.syncService.loadDatabasePayloads(databasePayloads);
    await application.syncService.sync(syncOptions);

    const newRawPayloads = await application.storageService.getAllRawPayloads();
    expect(newRawPayloads.length).toBe(expectedItemCount);

    const currentItem = application.itemManager.findItem(note.uuid);
    expect(currentItem.content.text).toBe(note.content.text);
    expect(currentItem.text).toBe(note.text);
    expect(currentItem.dirty).toBeFalsy();
  });

  it('load local items should respect sort priority', async function () {
    const contentTypes = ['A', 'B', 'C'];
    const itemCount = 6;
    const originalPayloads = [];
    for (let i = 0; i < itemCount; i++) {
      const payload = Factory.createStorageItemPayload(
        contentTypes[Math.floor(i / 2)]
      );
      originalPayloads.push(payload);
    }
    const sorted = SortPayloadsByRecentAndContentPriority(originalPayloads, [
      'C',
      'A',
      'B',
    ]);
    expect(sorted[0].content_type).toBe('C');
    expect(sorted[2].content_type).toBe('A');
    expect(sorted[4].content_type).toBe('B');
  });

  it('should sign in and retrieve large number of items', async function () {
    const largeItemCount = 50;
    await Factory.createManyMappedNotes(application, largeItemCount);
    expectedItemCount += largeItemCount;
    await application.syncService.sync(syncOptions);

    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    const rawPayloads = await application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).toBe(BASE_ITEM_COUNT);

    await application.signIn(
      email,
      password,
      undefined,
      undefined,
      undefined,
      true
    );

    application.syncService.ut_setDatabaseLoaded(false);
    const databasePayloads = await application.storageService.getAllRawPayloads();
    await application.syncService.loadDatabasePayloads(databasePayloads);
    await application.syncService.sync(syncOptions);

    const items = await application.itemManager.items;
    expect(items.length).toBe(expectedItemCount);
  }, 20000);

  it('valid sync date tracking', async function () {
    let note = await Factory.createMappedNote(application);
    note = await application.itemManager.setItemDirty(note.uuid);
    expectedItemCount++;

    expect(note.dirty).toBe(true);
    expect(note.dirtiedDate).toBeLessThanOrEqual(new Date());

    note = await application.itemManager.changeItem(
      note.uuid,
      (mutator) => {
        mutator.text = `${Math.random()}`;
      }
    );
    const sync = application.sync(syncOptions);
    await Factory.sleep(0.1);
    note = application.findItem(note.uuid);
    expect(note.lastSyncBegan).toBeLessThan(new Date());
    await sync;
    note = application.findItem(note.uuid);
    expect(note.dirty).toBe(false);
    expect(note.lastSyncEnd).toBeGreaterThanOrEqual(note.lastSyncBegan);
  });

  it('syncing twice without waiting should only execute 1 online sync', async function () {
    const expectedEvents = 1;
    let actualEvents = 0;
    application.syncService.addEventObserver((event, data) => {
      if (
        event === SyncEvent.FullSyncCompleted &&
        data.source === SyncSources.External
      ) {
        actualEvents++;
      }
    });
    const first = application.sync();
    const second = application.sync();
    await Promise.all([first, second]);
    /** Sleep so that any automatic syncs that are triggered are also sent to handler above */
    await Factory.sleep(0.5);
    expect(actualEvents).toBe(expectedEvents);
  });

  it('should keep an item dirty thats been modified after low latency sync request began', async function () {
    /**
     * If you begin a sync request that takes 20s to complete, then begin modifying an item
     * many times and attempt to sync, it will await the initial sync to complete.
     * When that completes, it will decide whether an item is still dirty or not.
     * It will do based on comparing whether item.dirtiedDate > item.lastSyncBegan
     */
    let note = await Factory.createMappedNote(application);
    await application.itemManager.setItemDirty(note.uuid);
    expectedItemCount++;

    // client A. Don't await, we want to do other stuff.
    application.syncService.ut_beginLatencySimulator(1500);
    const slowSync = application.syncService.sync(syncOptions);
    await Factory.sleep(0.1);
    expect(note.dirty).toBe(true);

    // While that sync is going on, we want to modify this item many times.
    const text = `${Math.random()}`;
    note = await application.itemManager.changeItem(
      note.uuid,
      (mutator) => {
        mutator.text = text;
      }
    );
    await application.itemManager.setItemDirty(note.uuid);
    await application.itemManager.setItemDirty(note.uuid);
    await application.itemManager.setItemDirty(note.uuid);
    expect(note.dirtiedDate).toBeGreaterThan(note.lastSyncBegan);

    // Now do a regular sync with no latency.
    application.syncService.ut_endLatencySimulator();
    const midSync = application.syncService.sync(syncOptions);

    await slowSync;
    await midSync;

    note = application.findItem(note.uuid);
    expect(note.dirty).toBe(false);
    expect(note.lastSyncEnd).toBeGreaterThan(note.lastSyncBegan);
    expect(note.content.text).toBe(text);

    // client B
    await application.payloadManager.resetState();
    await application.itemManager.resetState();
    await application.syncService.clearSyncPositionTokens();
    await application.syncService.sync(syncOptions);

    // Expect that the server value and client value match, and no conflicts are created.
    expect(application.itemManager.items.length).toBe(expectedItemCount);
    const foundItem = application.itemManager.findItem(note.uuid);
    expect(foundItem.content.text).toBe(text);
    expect(foundItem.text).toBe(text);
  });

  it('should sync an item twice if its marked dirty while a sync is ongoing', async function () {
    /** We can't track how many times an item is synced, only how many times its mapped */
    const expectedSaveCount = 2;
    let actualSaveCount = 0;
    /** Create an item and sync it */
    let note = await Factory.createMappedNote(application);
    application.itemManager.addObserver(
      ContentType.Note,
      (changed, inserted, discarded, ignored, source) => {
        if (source === PayloadSource.RemoteSaved) {
          actualSaveCount++;
        }
      }
    );
    expectedItemCount++;
    application.syncService.ut_beginLatencySimulator(150);
    /** Dont await */
    const syncRequest = application.syncService.sync(syncOptions);
    /** Dirty the item 100ms into 150ms request */
    const newText = `${Math.random()}`;
    setTimeout(
      async function () {
        await application.itemManager.changeItem(note.uuid, (mutator) => {
          mutator.text = newText;
        });
      }.bind(this),
      100
    );
    /**
     * Await sync request. A sync request will perform another request if there
     * are still more dirty items, so awaiting this will perform two syncs.
     */
    await syncRequest;
    expect(actualSaveCount).toBe(expectedSaveCount);
    note = application.findItem(note.uuid);
    expect(note.text).toBe(newText);
  });

  it('marking item dirty after dirty items are prepared for sync but before they are synced should sync again', async function () {
    /** There is a twilight zone where items needing sync are popped, and then say about 100ms of processing before
     * we set those items lastSyncBegan. If the item is dirtied in between these times, then item.dirtiedDate will be less than
     * item.lastSyncBegan, and it will not by synced again.
     */
    const expectedSaveCount = 2;
    let actualSaveCount = 0;
    /** Create an item and sync it */
    let note = await Factory.createMappedNote(application);
    application.itemManager.addObserver(
      ContentType.Note,
      (_changed, _inserted, _discarded, _ignored, source) => {
        if (source === PayloadSource.RemoteSaved) {
          actualSaveCount++;
        }
      }
    );
    expectedItemCount++;
    /** Dont await */
    const syncRequest = application.syncService.sync(syncOptions);
    /** Dirty the item before lastSyncBegan is set */
    let didPerformMutatation = false;
    const newText = `${Math.random()}`;
    application.syncService.addEventObserver(async (eventName) => {
      if (eventName === SyncEvent.SyncWillBegin && !didPerformMutatation) {
        didPerformMutatation = true;
        await application.itemManager.changeItem(note.uuid, (mutator) => {
          mutator.text = newText;
        });
      }
    });
    await syncRequest;
    expect(actualSaveCount).toBe(expectedSaveCount);
    note = application.findItem(note.uuid);
    expect(note.text).toBe(newText);
  });

  it('marking item dirty at exact same time as lastSyncBegan should sync again', async function () {
    /** Due to lack of nanosecond support in JS, it's possible that two operations complete
     * within the same millisecond cycle. What happens if you mark an item as dirty at time A and also begin
     * syncing at time A? It should sync again. */
    const expectedSaveCount = 2;
    let actualSaveCount = 0;
    /** Create an item and sync it */
    let note = await Factory.createMappedNote(application);
    let didPerformMutatation = false;
    const newText = `${Math.random()}`;
    application.itemManager.addObserver(
      ContentType.Note,
      async (changed, _inserted, _discarded, _ignored, source) => {
        if (source === PayloadSource.RemoteSaved) {
          actualSaveCount++;
        } else if (
          source === PayloadSource.PreSyncSave &&
          !didPerformMutatation
        ) {
          didPerformMutatation = true;
          const mutated = CopyPayload(changed[0].payload, {
            content: { ...note.payload.content, text: newText },
            dirty: true,
            dirtiedDate: changed[0].lastSyncBegan,
          });
          await application.itemManager.emitItemFromPayload(mutated);
        }
      }
    );
    expectedItemCount++;
    /** Dont await */
    const syncRequest = application.syncService.sync(syncOptions);
    await syncRequest;
    expect(actualSaveCount).toBe(expectedSaveCount);
    note = application.findItem(note.uuid);
    expect(note.text).toBe(newText);
  });

  it('retreiving a remote deleted item should succeed', async function () {
    const note = await Factory.createSyncedNote(application);
    const preDeleteSyncToken = await application.syncService.getLastSyncToken();
    await application.deleteItem(note);
    await application.syncService.setLastSyncToken(preDeleteSyncToken);
    await application.sync(syncOptions);
    expect(application.itemManager.items.length).toBe(expectedItemCount);
  });

  it('errored items should not be synced', async function () {
    const note = await Factory.createSyncedNote(application);
    expectedItemCount++;
    const lastSyncBegan = note.lastSyncBegan;
    const lastSyncEnd = note.lastSyncEnd;
    const encrypted = await application.protocolService.payloadByEncryptingPayload(
      note.payload,
      EncryptionIntent.Sync
    );
    const errored = CopyPayload(encrypted, {
      errorDecrypting: true,
      dirty: true,
    });
    await application.itemManager.emitItemFromPayload(errored);
    await application.sync(syncOptions);

    const updatedNote = application.findItem(note.uuid);
    expect(updatedNote.lastSyncBegan.getTime()).toBe(lastSyncBegan.getTime());
    expect(updatedNote.lastSyncEnd.getTime()).toBe(lastSyncEnd.getTime());
  });

  it('syncing with missing session object should prompt for re-auth', async function () {
    /**
     * This covers the temporary function syncService.handleInvalidSessionState
     * where mobile could be missing storage/session object
     */
    let didPromptForSignIn = false;
    const receiveChallenge = async (challenge) => {
      didPromptForSignIn = true;
      application.submitValuesForChallenge(challenge, [
        new ChallengeValue(challenge.prompts[0], email),
        new ChallengeValue(challenge.prompts[1], password),
      ]);
    };
    application.setLaunchCallback({ receiveChallenge });
    application.apiService.setSession(undefined);

    await application.sync();

    /** Allow session recovery to do its thing */
    await Factory.sleep(2.0);

    expect(didPromptForSignIn).toBe(true);
    expect(application.apiService.session.accessToken).toBeTruthy();
    expect(application.apiService.session.refreshToken).toBeTruthy();
  });

  it('should not allow receiving decrypted payloads from server', async function () {
    const masterCollection = application.payloadManager.getMasterCollection();
    const historyMap = application.historyManager.getHistoryMapCopy();
    const payload = CreateMaxPayloadFromAnyObject(
      Factory.createNotePayload(),
      undefined,
      PayloadSource.RemoteRetrieved
    );
    const response = new SyncResponse({
      data: {
        retrieved_items: [payload],
      },
    });
    const resolver = new SyncResponseResolver(
      response,
      [payload],
      masterCollection,
      [],
      historyMap
    );
    const collections = await resolver.collectionsByProcessingResponse();
    for (const collection of collections) {
      await application.payloadManager.emitCollection(collection);
    }

    expect(application.itemManager.notes.length).toBe(0);
  });

  it('retrieved items should have both updated_at and updated_at_timestamps', async function () {
    const note = await Factory.createSyncedNote(application);
    expectedItemCount++;
    expect(note.payload.created_at_timestamp).toBeTruthy();
    expect(note.payload.created_at).toBeTruthy();
    expect(note.payload.updated_at_timestamp).toBeTruthy();
    expect(note.payload.updated_at).toBeTruthy();
  });
});
