/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('history manager', () => {
  const largeCharacterChange = 15;

  const syncOptions = {
    checkIntegrity: true,
    awaitAll: true,
  };

  beforeEach(async function () {
    localStorage.clear();
  });

  afterEach(async function () {
    localStorage.clear();
  });

  describe('session', async function () {
    beforeEach(async function () {
      this.application = await Factory.createInitAppWithRandNamespace();
      this.historyManager = this.application.historyManager;
      this.payloadManager = this.application.payloadManager;
      /** Automatically optimize after every revision by setting this to 0 */
      this.historyManager.setSessionItemRevisionThreshold(0);
    });

    afterEach(async function () {
      await this.application.deinit();
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
      const item = await Factory.createSyncedNote(this.application);
      expect(this.historyManager.sessionHistoryForItem(item).length).to.equal(
        0
      );

      /** Sync with same contents, should not create new entry */
      await this.application.saveItem(item.uuid);
      expect(this.historyManager.sessionHistoryForItem(item).length).to.equal(
        0
      );

      /** Sync with different contents, should create new entry */
      await this.application.changeAndSaveItem(
        item.uuid,
        (mutator) => {
          mutator.title = Math.random();
        },
        undefined,
        undefined,
        syncOptions
      );
      expect(this.historyManager.sessionHistoryForItem(item).length).to.equal(
        1
      );

      this.historyManager.clearHistoryForItem(item);
      expect(this.historyManager.sessionHistoryForItem(item).length).to.equal(
        0
      );

      await this.application.saveItem(item.uuid);
      await this.application.changeAndSaveItem(
        item.uuid,
        (mutator) => {
          mutator.title = Math.random();
        },
        undefined,
        undefined,
        syncOptions
      );

      this.historyManager.clearAllHistory();
      expect(this.historyManager.sessionHistoryForItem(item).length).to.equal(
        0
      );
    });

    it('should optimize basic entries', async function () {
      let item = await Factory.createSyncedNote(this.application);
      /**
       * Add 1 character. This typically would be discarded as an entry, but it
       * won't here because it's the first change, which we want to keep.
       */
      await setTextAndSync(this.application, item, item.content.text + '1');
      expect(this.historyManager.sessionHistoryForItem(item).length).to.equal(
        1
      );

      /**
       * Changing it by one character should keep this entry,
       * since it's now the last (and will keep the first)
       */
      item = await setTextAndSync(
        this.application,
        item,
        item.content.text + '2'
      );
      expect(this.historyManager.sessionHistoryForItem(item).length).to.equal(
        2
      );
      /**
       * Change it over the largeCharacterChange threshold. It should keep this
       * revision, but now remove the previous revision, since it's no longer
       * the last, and is a small change.
       */
      item = await setTextAndSync(
        this.application,
        item,
        item.content.text + Factory.randomString(largeCharacterChange + 1)
      );
      expect(this.historyManager.sessionHistoryForItem(item).length).to.equal(
        2
      );

      item = await setTextAndSync(
        this.application,
        item,
        item.content.text + Factory.randomString(largeCharacterChange + 1)
      );
      expect(this.historyManager.sessionHistoryForItem(item).length).to.equal(
        2
      );
      /** Delete over threshold text. */
      item = await setTextAndSync(
        this.application,
        item,
        deleteCharsFromString(item.content.text, largeCharacterChange + 1)
      );
      expect(this.historyManager.sessionHistoryForItem(item).length).to.equal(
        3
      );
      /**
       * Delete just 1 character. It should now retain the previous revision, as well as the
       * one previous to that.
       */
      item = await setTextAndSync(
        this.application,
        item,
        deleteCharsFromString(item.content.text, 1)
      );
      expect(this.historyManager.sessionHistoryForItem(item).length).to.equal(
        4
      );
      item = await setTextAndSync(
        this.application,
        item,
        deleteCharsFromString(item.content.text, 1)
      );
      expect(this.historyManager.sessionHistoryForItem(item).length).to.equal(
        5
      );
    });

    it('should keep the entry right before a large deletion, regardless of its delta', async function () {
      const payload = CreateMaxPayloadFromAnyObject(
        Factory.createNoteParams({
          text: Factory.randomString(100),
        })
      );
      let item = await this.application.itemManager.emitItemFromPayload(
        payload,
        PayloadSource.LocalChanged
      );
      await this.application.itemManager.setItemDirty(item.uuid);
      await this.application.syncService.sync(syncOptions);
      /** It should keep the first and last by default */
      item = await setTextAndSync(this.application, item, item.content.text);
      item = await setTextAndSync(
        this.application,
        item,
        item.content.text + Factory.randomString(1)
      );
      expect(this.historyManager.sessionHistoryForItem(item).length).to.equal(
        2
      );
      item = await setTextAndSync(
        this.application,
        item,
        deleteCharsFromString(item.content.text, largeCharacterChange + 1)
      );
      expect(this.historyManager.sessionHistoryForItem(item).length).to.equal(
        2
      );
      item = await setTextAndSync(
        this.application,
        item,
        item.content.text + Factory.randomString(1)
      );
      expect(this.historyManager.sessionHistoryForItem(item).length).to.equal(
        3
      );
      item = await setTextAndSync(
        this.application,
        item,
        item.content.text + Factory.randomString(largeCharacterChange + 1)
      );
      expect(this.historyManager.sessionHistoryForItem(item).length).to.equal(
        4
      );
    });

    it('entries should be ordered from newest to oldest', async function () {
      const payload = CreateMaxPayloadFromAnyObject(
        Factory.createNoteParams({
          text: Factory.randomString(200),
        })
      );

      let item = await this.application.itemManager.emitItemFromPayload(
        payload,
        PayloadSource.LocalChanged
      );

      await this.application.itemManager.setItemDirty(item.uuid);
      await this.application.syncService.sync(syncOptions);

      item = await setTextAndSync(
        this.application,
        item,
        item.content.text + Factory.randomString(1)
      );

      item = await setTextAndSync(
        this.application,
        item,
        deleteCharsFromString(item.content.text, largeCharacterChange + 1)
      );

      item = await setTextAndSync(
        this.application,
        item,
        item.content.text + Factory.randomString(1)
      );

      item = await setTextAndSync(
        this.application,
        item,
        item.content.text + Factory.randomString(largeCharacterChange + 1)
      );

      /** First entry should be the latest revision. */
      const latestRevision = this.historyManager.sessionHistoryForItem(item)[0];
      /** Last entry should be the initial revision. */
      const initialRevision = this.historyManager.sessionHistoryForItem(item)[
        this.historyManager.sessionHistoryForItem(item).length - 1
      ];

      expect(latestRevision).to.not.equal(initialRevision);

      expect(latestRevision.textCharDiffLength).to.equal(1);
      expect(initialRevision.textCharDiffLength).to.equal(200);
      /** Finally, the latest revision updated_at value date should be more recent than the initial revision one. */
      expect(
        latestRevision.itemFromPayload().userModifiedDate
      ).to.be.greaterThan(initialRevision.itemFromPayload().userModifiedDate);
    }).timeout(10000);
  });

  describe('remote', async function () {
    beforeEach(async function () {
      this.application = await Factory.createInitAppWithRandNamespace();
      this.historyManager = this.application.historyManager;
      this.payloadManager = this.application.payloadManager;
      this.email = Uuid.GenerateUuidSynchronously();
      this.password = Uuid.GenerateUuidSynchronously();
      await Factory.registerUserToApplication({
        application: this.application,
        email: this.email,
        password: this.password,
      });
    });

    afterEach(async function () {
      await this.application.deinit();
    });

    it('response from server should be empty if not signed in', async function () {
      await this.application.signOut();
      this.application = await Factory.createInitAppWithRandNamespace();
      this.historyManager = this.application.historyManager;
      this.payloadManager = this.application.payloadManager;
      const item = await Factory.createSyncedNote(this.application);
      await this.application.syncService.sync(syncOptions);
      const itemHistory = await this.historyManager.remoteHistoryForItem(item);
      expect(itemHistory).to.be.undefined;
    });

    it('create basic history entries', async function () {
      const item = await Factory.createSyncedNote(this.application);
      let itemHistory = await this.historyManager.remoteHistoryForItem(item);

      /** Server history should save initial revision */
      expect(itemHistory).to.be.ok;
      expect(itemHistory.length).to.equal(1);

      /** Sync within 5 minutes, should not create a new entry */
      await this.application.saveItem(item.uuid);
      itemHistory = await this.historyManager.remoteHistoryForItem(item);
      expect(itemHistory.length).to.equal(1);

      /** Sync with different contents, should not create a new entry */
      await this.application.changeAndSaveItem(
        item.uuid,
        (mutator) => {
          mutator.title = Math.random();
        },
        undefined,
        undefined,
        syncOptions
      );
      itemHistory = await this.historyManager.remoteHistoryForItem(item);
      expect(itemHistory.length).to.equal(1);
    });

    it.skip('create consecutive history entries', async function () {
      // implement remote history fetching more than 1 entry
      // after 5 minutes delay apart of the updates
      // setting updated_at is not permitted via the API
    });

    it.skip('returns revisions from server', async function () {
      let item = await Factory.createSyncedNote(this.application);

      /** Sync with different contents, should create new entry */
      const newTitleAfterFirstChange = `The title should be: ${Math.random()}`;
      await this.application.changeAndSaveItem(
        item.uuid,
        (mutator) => {
          mutator.title = newTitleAfterFirstChange;
        },
        undefined,
        undefined,
        syncOptions
      );
      let itemHistory = await this.historyManager.remoteHistoryForItem(item);
      expect(itemHistory.length).to.equal(1);

      let revisionEntry = itemHistory[0];
      let revisionFromServer = await this.historyManager.fetchRemoteRevision(
        item.uuid,
        revisionEntry
      );
      expect(revisionFromServer).to.be.ok;

      let payloadFromServer = revisionFromServer.payload;
      expect(payloadFromServer.errorDecrypting).to.be.false;
      expect(payloadFromServer.uuid).to.eq(item.payload.uuid);
      expect(payloadFromServer.content).to.eql(item.payload.content);

      item = this.application.itemManager.findItem(item.uuid);
      expect(payloadFromServer.content).to.not.eql(item.payload.content);

      const newTitleAfterSecondChange = 'Something totally different.';
      await this.application.changeAndSaveItem(
        item.uuid,
        (mutator) => {
          mutator.title = newTitleAfterSecondChange;
        },
        undefined,
        undefined,
        syncOptions
      );
      itemHistory = await this.historyManager.remoteHistoryForItem(item);
      expect(itemHistory.length).to.equal(2);

      /** The first entry from response should be the previous revision before the actual, current item. */
      revisionEntry = itemHistory[0];
      revisionFromServer = await this.historyManager.fetchRemoteRevision(
        item.uuid,
        revisionEntry
      );
      expect(revisionFromServer).to.be.ok;

      payloadFromServer = revisionFromServer.payload;
      expect(payloadFromServer.errorDecrypting).to.be.false;
      expect(payloadFromServer.uuid).to.eq(item.payload.uuid);
      expect(payloadFromServer.content).to.eql(item.payload.content);
      expect(payloadFromServer.content.title).to.eq(newTitleAfterFirstChange);
    });

    it.skip('revisions count matches original for duplicated items', async function () {
      const note = await Factory.createSyncedNote(this.application);
      /** Make a few changes to note */
      await this.application.saveItem(note.uuid);
      await this.application.saveItem(note.uuid);
      await this.application.saveItem(note.uuid);
      const dupe = await this.application.itemManager.duplicateItem(
        note.uuid,
        true
      );
      await this.application.saveItem(dupe.uuid);

      const expectedRevisions = 3;
      const noteHistory = await this.historyManager.remoteHistoryForItem(note);
      const dupeHistory = await this.historyManager.remoteHistoryForItem(dupe);
      expect(noteHistory.length).to.equal(expectedRevisions);
      expect(dupeHistory.length).to.equal(expectedRevisions);
    });

    it.skip('duplicate revisions should have the originals uuid', async function () {
      const note = await Factory.createSyncedNote(this.application);
      await this.application.saveItem(note.uuid);
      const dupe = await this.application.itemManager.duplicateItem(
        note.uuid,
        true
      );
      await this.application.saveItem(dupe.uuid);

      const dupeHistory = await this.historyManager.remoteHistoryForItem(dupe);
      const dupeRevision = await this.historyManager.fetchRemoteRevision(
        dupe.uuid,
        dupeHistory[0]
      );
      expect(dupeRevision.payload.uuid).to.equal(note.uuid);
    });

    it('can decrypt revisions for duplicate_of items', async function () {
      const note = await Factory.createSyncedNote(this.application);
      const changedText = `${Math.random()}`;
      /** Make a few changes to note */
      await this.application.changeAndSaveItem(note.uuid, (mutator) => {
        mutator.title = changedText;
      });
      await this.application.saveItem(note.uuid);

      const dupe = await this.application.itemManager.duplicateItem(
        note.uuid,
        true
      );
      await this.application.saveItem(dupe.uuid);
      const itemHistory = await this.historyManager.remoteHistoryForItem(dupe);
      const newestRevision = itemHistory[0];

      const fetched = await this.historyManager.fetchRemoteRevision(
        dupe.uuid,
        newestRevision
      );
      expect(fetched.payload.errorDecrypting).to.not.be.ok;
      expect(fetched.payload.content.title).to.equal(changedText);
    });
  });
});
