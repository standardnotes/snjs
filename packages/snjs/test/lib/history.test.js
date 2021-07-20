import { CreateMaxPayloadFromAnyObject, PayloadSource } from '@Lib/index';
import { ContentType } from '@Lib/models';
import { Uuid } from '@Lib/uuid';
import * as Factory from './../factory';

describe('history manager', () => {
  const largeCharacterChange = 25;

  const syncOptions = {
    checkIntegrity: true,
    awaitAll: true,
  };

  let application;
  let historyManager;
  let payloadManager;

  describe('session', function () {
    beforeEach(async function () {
      application = await Factory.createInitAppWithRandNamespace();
      historyManager = application.historyManager;
      payloadManager = application.payloadManager;
      /** Automatically optimize after every revision by setting this to 0 */
      historyManager.setSessionItemRevisionThreshold(0);
    });

    afterEach(async function () {
      await application.deinit();
    });

    async function setTextAndSync(application, item, text) {
      return application.changeAndSaveItem(
        item.uuid,
        (mutator) => {
          mutator.text = text;
        },
        undefined,
        undefined,
        syncOptions
      );
    }

    function deleteCharsFromString(string, amount) {
      return string.substring(0, string.length - amount);
    }

    it('create basic history entries', async function () {
      const item = await Factory.createSyncedNote(application);
      expect(historyManager.sessionHistoryForItem(item).length).toBe(0);

      /** Sync with same contents, should not create new entry */
      await application.saveItem(item.uuid);
      expect(historyManager.sessionHistoryForItem(item).length).toBe(0);

      /** Sync with different contents, should create new entry */
      await application.changeAndSaveItem(
        item.uuid,
        (mutator) => {
          mutator.title = Math.random();
        },
        undefined,
        undefined,
        syncOptions
      );
      expect(historyManager.sessionHistoryForItem(item).length).toBe(1);

      historyManager.clearHistoryForItem(item);
      expect(historyManager.sessionHistoryForItem(item).length).toBe(0);

      await application.saveItem(item.uuid);
      await application.changeAndSaveItem(
        item.uuid,
        (mutator) => {
          mutator.title = Math.random();
        },
        undefined,
        undefined,
        syncOptions
      );

      historyManager.clearAllHistory();
      expect(historyManager.sessionHistoryForItem(item).length).toBe(0);
    });

    it('first change should create revision with previous value', async function () {
      const identifier = application.identifier;
      const item = await Factory.createSyncedNote(application);
      application.deinit();

      /** Simulate loading new application session */
      const context = await Factory.createAppContext(identifier);
      await context.launch();
      expect(
        context.application.historyManager.sessionHistoryForItem(item).length
      ).toBe(0);
      await context.application.changeAndSaveItem(
        item.uuid,
        (mutator) => {
          mutator.title = Math.random();
        },
        undefined,
        undefined,
        syncOptions
      );
      const entries = context.application.historyManager.sessionHistoryForItem(
        item
      );
      expect(entries.length).toBe(1);
      expect(entries[0].payload.content.title).toBe(item.content.title);
      context.deinit();
    });

    it('creating new item and making 1 change should create 0 revisions', async function () {
      const context = await Factory.createAppContext();
      await context.launch();
      const item = await context.application.createTemplateItem(
        ContentType.Note,
        {
          references: [],
        }
      );
      await context.application.insertItem(item);
      expect(
        context.application.historyManager.sessionHistoryForItem(item).length
      ).toBe(0);

      await context.application.changeAndSaveItem(
        item.uuid,
        (mutator) => {
          mutator.title = Math.random();
        },
        undefined,
        undefined,
        syncOptions
      );
      expect(
        context.application.historyManager.sessionHistoryForItem(item).length
      ).toBe(0);
      context.deinit();
    });

    it('should optimize basic entries', async function () {
      let item = await Factory.createSyncedNote(application);
      /**
       * Add 1 character. This typically would be discarded as an entry, but it
       * won't here because it's the first change, which we want to keep.
       */
      await setTextAndSync(application, item, item.content.text + '1');
      expect(historyManager.sessionHistoryForItem(item).length).toBe(1);

      /**
       * Changing it by one character should keep this entry,
       * since it's now the last (and will keep the first)
       */
      item = await setTextAndSync(
        application,
        item,
        item.content.text + '2'
      );
      expect(historyManager.sessionHistoryForItem(item).length).toBe(2);
      /**
       * Change it over the largeCharacterChange threshold. It should keep this
       * revision, but now remove the previous revision, since it's no longer
       * the last, and is a small change.
       */
      item = await setTextAndSync(
        application,
        item,
        item.content.text + Factory.randomString(largeCharacterChange + 1)
      );
      expect(historyManager.sessionHistoryForItem(item).length).toBe(2);

      item = await setTextAndSync(
        application,
        item,
        item.content.text + Factory.randomString(largeCharacterChange + 1)
      );
      expect(historyManager.sessionHistoryForItem(item).length).toBe(2);
      /** Delete over threshold text. */
      item = await setTextAndSync(
        application,
        item,
        deleteCharsFromString(item.content.text, largeCharacterChange + 1)
      );
      expect(historyManager.sessionHistoryForItem(item).length).toBe(3);
      /**
       * Delete just 1 character. It should now retain the previous revision, as well as the
       * one previous to that.
       */
      item = await setTextAndSync(
        application,
        item,
        deleteCharsFromString(item.content.text, 1)
      );
      expect(historyManager.sessionHistoryForItem(item).length).toBe(4);
      item = await setTextAndSync(
        application,
        item,
        deleteCharsFromString(item.content.text, 1)
      );
      expect(historyManager.sessionHistoryForItem(item).length).toBe(5);
    });

    it('should keep the entry right before a large deletion, regardless of its delta', async function () {
      const payload = CreateMaxPayloadFromAnyObject(
        Factory.createNoteParams({
          text: Factory.randomString(100),
        })
      );
      let item = await application.itemManager.emitItemFromPayload(
        payload,
        PayloadSource.LocalChanged
      );
      await application.itemManager.setItemDirty(item.uuid);
      await application.syncService.sync(syncOptions);
      /** It should keep the first and last by default */
      item = await setTextAndSync(application, item, item.content.text);
      item = await setTextAndSync(
        application,
        item,
        item.content.text + Factory.randomString(1)
      );
      expect(historyManager.sessionHistoryForItem(item).length).toBe(2);
      item = await setTextAndSync(
        application,
        item,
        deleteCharsFromString(item.content.text, largeCharacterChange + 1)
      );
      expect(historyManager.sessionHistoryForItem(item).length).toBe(2);
      item = await setTextAndSync(
        application,
        item,
        item.content.text + Factory.randomString(1)
      );
      expect(historyManager.sessionHistoryForItem(item).length).toBe(3);
      item = await setTextAndSync(
        application,
        item,
        item.content.text + Factory.randomString(largeCharacterChange + 1)
      );
      expect(historyManager.sessionHistoryForItem(item).length).toBe(4);
    });

    it('entries should be ordered from newest to oldest', async function () {
      jest.setTimeout(10000);

      const payload = CreateMaxPayloadFromAnyObject(
        Factory.createNoteParams({
          text: Factory.randomString(200),
        })
      );

      let item = await application.itemManager.emitItemFromPayload(
        payload,
        PayloadSource.LocalChanged
      );

      await application.itemManager.setItemDirty(item.uuid);
      await application.syncService.sync(syncOptions);

      item = await setTextAndSync(
        application,
        item,
        item.content.text + Factory.randomString(1)
      );

      item = await setTextAndSync(
        application,
        item,
        deleteCharsFromString(item.content.text, largeCharacterChange + 1)
      );

      item = await setTextAndSync(
        application,
        item,
        item.content.text + Factory.randomString(1)
      );

      item = await setTextAndSync(
        application,
        item,
        item.content.text + Factory.randomString(largeCharacterChange + 1)
      );

      /** First entry should be the latest revision. */
      const latestRevision = historyManager.sessionHistoryForItem(item)[0];
      /** Last entry should be the initial revision. */
      const initialRevision = historyManager.sessionHistoryForItem(item)[
        historyManager.sessionHistoryForItem(item).length - 1
      ];

      expect(latestRevision).not.toBe(initialRevision);

      expect(latestRevision.textCharDiffLength).toBe(1);
      expect(initialRevision.textCharDiffLength).toBe(200);
      /** Finally, the latest revision updated_at value date should be more recent than the initial revision one. */
      expect(
        latestRevision.itemFromPayload().userModifiedDate
      ).toBeGreaterThan(initialRevision.itemFromPayload().userModifiedDate);
    });

    it('unsynced entries should use payload created_at for preview titles', async function () {
      const payload = Factory.createNotePayload();
      await application.itemManager.emitItemFromPayload(
        payload,
        PayloadSource.LocalChanged
      );
      const item = application.findItem(payload.uuid);
      await application.changeAndSaveItem(
        item.uuid,
        (mutator) => {
          mutator.title = Math.random();
        },
        undefined,
        undefined,
        syncOptions
      );
      const historyItem = historyManager.sessionHistoryForItem(item)[0];
      expect(historyItem.previewTitle()).toBe(historyItem.payload.created_at.toLocaleString());
    });
  });

  describe('remote', function () {
    let email, password;

    beforeEach(async function () {
      application = await Factory.createInitAppWithRandNamespace();
      historyManager = application.historyManager;
      payloadManager = application.payloadManager;
      email = Uuid.GenerateUuidSynchronously();
      password = Uuid.GenerateUuidSynchronously();
      await Factory.registerUserToApplication({
        application: application,
        email: email,
        password: password,
      });
    });

    afterEach(async function () {
      await application.deinit();
    });

    it('response from server should be empty if not signed in', async function () {
      await application.signOut();
      application = await Factory.createInitAppWithRandNamespace();
      historyManager = application.historyManager;
      payloadManager = application.payloadManager;
      const item = await Factory.createSyncedNote(application);
      await application.syncService.sync(syncOptions);
      const itemHistory = await historyManager.remoteHistoryForItem(item);
      expect(itemHistory).toBeUndefined();
    });

    it('create basic history entries', async function () {
      const item = await Factory.createSyncedNote(application);
      let itemHistory = await historyManager.remoteHistoryForItem(item);

      /** Server history should save initial revision */
      expect(itemHistory).toBeTruthy();
      expect(itemHistory.length).toBe(1);

      /** Sync within 5 minutes, should not create a new entry */
      await application.saveItem(item.uuid);
      itemHistory = await historyManager.remoteHistoryForItem(item);
      expect(itemHistory.length).toBe(1);

      /** Sync with different contents, should not create a new entry */
      await application.changeAndSaveItem(
        item.uuid,
        (mutator) => {
          mutator.title = Math.random();
        },
        undefined,
        undefined,
        syncOptions
      );
      itemHistory = await historyManager.remoteHistoryForItem(item);
      expect(itemHistory.length).toBe(1);
    });

    it.skip('create consecutive history entries', async function () {
      // implement remote history fetching more than 1 entry
      // after 5 minutes delay apart of the updates
      // setting updated_at is not permitted via the API
    });

    it.skip('returns revisions from server', async function () {
      let item = await Factory.createSyncedNote(application);

      /** Sync with different contents, should create new entry */
      const newTitleAfterFirstChange = `The title should be: ${Math.random()}`;
      await application.changeAndSaveItem(
        item.uuid,
        (mutator) => {
          mutator.title = newTitleAfterFirstChange;
        },
        undefined,
        undefined,
        syncOptions
      );
      let itemHistory = await historyManager.remoteHistoryForItem(item);
      expect(itemHistory.length).toBe(1);

      let revisionEntry = itemHistory[0];
      let revisionFromServer = await historyManager.fetchRemoteRevision(
        item.uuid,
        revisionEntry
      );
      expect(revisionFromServer).toBeTruthy();

      let payloadFromServer = revisionFromServer.payload;
      expect(payloadFromServer.errorDecrypting).toBe(false);
      expect(payloadFromServer.uuid).toBe(item.payload.uuid);
      expect(payloadFromServer.content).toEqual(item.payload.content);

      item = application.itemManager.findItem(item.uuid);
      expect(payloadFromServer.content).not.toEqual(item.payload.content);

      const newTitleAfterSecondChange = 'Something totally different.';
      await application.changeAndSaveItem(
        item.uuid,
        (mutator) => {
          mutator.title = newTitleAfterSecondChange;
        },
        undefined,
        undefined,
        syncOptions
      );
      itemHistory = await historyManager.remoteHistoryForItem(item);
      expect(itemHistory.length).toBe(2);

      /** The first entry from response should be the previous revision before the actual, current item. */
      revisionEntry = itemHistory[0];
      revisionFromServer = await historyManager.fetchRemoteRevision(
        item.uuid,
        revisionEntry
      );
      expect(revisionFromServer).toBeTruthy();

      payloadFromServer = revisionFromServer.payload;
      expect(payloadFromServer.errorDecrypting).toBe(false);
      expect(payloadFromServer.uuid).toBe(item.payload.uuid);
      expect(payloadFromServer.content).toEqual(item.payload.content);
      expect(payloadFromServer.content.title).toBe(newTitleAfterFirstChange);
    });

    it.skip('revisions count matches original for duplicated items', async function () {
      const note = await Factory.createSyncedNote(application);
      /** Make a few changes to note */
      await application.saveItem(note.uuid);
      await application.saveItem(note.uuid);
      await application.saveItem(note.uuid);
      const dupe = await application.itemManager.duplicateItem(
        note.uuid,
        true
      );
      await application.saveItem(dupe.uuid);

      const expectedRevisions = 3;
      const noteHistory = await historyManager.remoteHistoryForItem(note);
      const dupeHistory = await historyManager.remoteHistoryForItem(dupe);
      expect(noteHistory.length).toBe(expectedRevisions);
      expect(dupeHistory.length).toBe(expectedRevisions);
    });

    it.skip('duplicate revisions should have the originals uuid', async function () {
      const note = await Factory.createSyncedNote(application);
      await application.saveItem(note.uuid);
      const dupe = await application.itemManager.duplicateItem(
        note.uuid,
        true
      );
      await application.saveItem(dupe.uuid);

      const dupeHistory = await historyManager.remoteHistoryForItem(dupe);
      const dupeRevision = await historyManager.fetchRemoteRevision(
        dupe.uuid,
        dupeHistory[0]
      );
      expect(dupeRevision.payload.uuid).toBe(note.uuid);
    });

    it('can decrypt revisions for duplicate_of items', async function () {
      const note = await Factory.createSyncedNote(application);
      const changedText = `${Math.random()}`;
      /** Make a few changes to note */
      await application.changeAndSaveItem(note.uuid, (mutator) => {
        mutator.title = changedText;
      });
      await application.saveItem(note.uuid);

      const dupe = await application.itemManager.duplicateItem(
        note.uuid,
        true
      );
      await application.saveItem(dupe.uuid);
      const itemHistory = await historyManager.remoteHistoryForItem(dupe);
      const newestRevision = itemHistory[0];

      const fetched = await historyManager.fetchRemoteRevision(
        dupe.uuid,
        newestRevision
      );
      expect(fetched.payload.errorDecrypting).toBeFalsy();
      expect(fetched.payload.content.title).toBe(changedText);
    });
  });
});
