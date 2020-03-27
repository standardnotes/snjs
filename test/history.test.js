/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('session history', () => {
  const largeCharacterChange = 15;

  before(async function () {
    localStorage.clear();
  });

  after(async function () {
    localStorage.clear();
  });

  beforeEach(async function () {
    this.application = await Factory.createInitAppWithRandNamespace();
    this.historyManager = this.application.historyManager;
    this.modelManager = this.application.modelManager;
    /** Automatically optimize after every revision by setting this to 0 */
    this.historyManager.setSessionItemRevisionThreshold(0);
    this.email = Uuid.GenerateUuidSynchronously();
    this.password = Uuid.GenerateUuidSynchronously();
  });

  afterEach(async function () {
    await this.application.deinit();
  });

  async function setTextAndSync(application, item, text) {
    item.text = text;
    await application.saveItem({ item });
  }

  function deleteCharsFromString(string, amount) {
    return string.substring(0, string.length - amount);
  }

  it('create basic history entries', async function () {
    const item = await Factory.createSyncedNote(this.application);
    const itemHistory = this.historyManager.historyForItem(item);
    expect(itemHistory).to.be.ok;
    expect(itemHistory.entries.length).to.equal(1);

    /** Sync with same contents, should not create new entry */
    await this.application.saveItem({ item });
    expect(itemHistory.entries.length).to.equal(1);

    /** Sync with different contents, should create new entry */
    item.title = Math.random();
    await this.application.saveItem({ item });
    expect(itemHistory.entries.length).to.equal(2);

    this.historyManager.clearHistoryForItem(item);
    const newItemHistory = this.historyManager.historyForItem(item);
    expect(newItemHistory.entries.length).to.equal(0);

    await this.application.saveItem({ item });
    expect(newItemHistory.entries.length).to.equal(1);

    this.historyManager.clearAllHistory();
    expect(this.historyManager.historyForItem(item).entries.length).to.equal(0);
  });

  it('should optimize basic entries', async function () {
    const item = await Factory.createSyncedNote(this.application);
    const itemHistory = this.historyManager.historyForItem(item);
    /** It should keep the first revision, regardless of character delta. */
    expect(itemHistory.entries.length).to.equal(1);
    /**
     * Add 1 character. This typically would be discarded as an entry, but it
     * won't here because it's the last one, which we want to keep.
     */
    await setTextAndSync(
      this.application,
      item,
      item.content.text + Factory.randomString(1)
    );
    expect(itemHistory.entries.length).to.equal(2);

    /**
     * Now changing it by one character should discard this entry,
     * keeping the total at 2.
     */
    await setTextAndSync(
      this.application,
      item,
      item.content.text + Factory.randomString(1)
    );
    expect(itemHistory.entries.length).to.equal(2);
    /**
     * Change it over the largeCharacterChange threshold. It should keep this
     * revision, but now remove the previous revision, since it's no longer
     * the last, and is a small change.
     */
    await setTextAndSync(
      this.application,
      item,
      item.content.text + Factory.randomString(largeCharacterChange + 1)
    );
    expect(itemHistory.entries.length).to.equal(2);
    /**
     * Change it again over the delta threshhold. It should keep this revision,
     * and the last one, totaling 3.
     */
    await setTextAndSync(
      this.application,
      item,
      item.content.text + Factory.randomString(largeCharacterChange + 1)
    );
    expect(itemHistory.entries.length).to.equal(3);

    /** Delete over threshold text. It should keep this revision. */
    await setTextAndSync(
      this.application,
      item,
      deleteCharsFromString(item.content.text, largeCharacterChange + 1)
    );
    expect(itemHistory.entries.length).to.equal(4);
    /**
     * Delete just 1 character. It should keep this entry, because it's the
     * last, upping the total to 5. However, the next small revision after that
     * should delete it, keeping it at 5.
     */
    await setTextAndSync(
      this.application,
      item,
      deleteCharsFromString(item.content.text, 1)
    );
    expect(itemHistory.entries.length).to.equal(5);
    await setTextAndSync(
      this.application,
      item,
      deleteCharsFromString(item.content.text, 1)
    );
    expect(itemHistory.entries.length).to.equal(5);
  });

  it('should keep the entry right before a large deletion, regardless of its delta',
    async function () {
      const payload = CreateMaxPayloadFromAnyObject(
        Factory.createNoteParams({
          text: Factory.randomString(100)
        })
      );
      const item = await this.modelManager.mapPayloadToLocalItem({ 
        payload,
        source: PayloadSources.LocalChanged
      });
      await this.application.modelManager.setItemDirty(item);
      await this.application.syncService.sync();
      const itemHistory = this.historyManager.historyForItem(item);
      /** It should keep the first and last by default */
      await setTextAndSync(
        this.application,
        item,
        item.content.text
      );
      await setTextAndSync(
        this.application,
        item,
        item.content.text + Factory.randomString(1)
      );
      expect(itemHistory.entries.length).to.equal(2);
      /**
       * We want to delete a large number of characters. The revision right before
       * this one was a small negligible revision of +1 char. This would typically
       * be discarded after optimization. However, because this next revision will
       * delete a large number of characters, we want to preserve the entry right
       * before the deletion. This is because the deletion will only have the value
       * of the text after the large deletion. We want to keep the value directly
       * preceding this deletion as a way to recover from the deletion.
       */
      /**
       * It would have been 2 typically. But because we're hanging on to a small
       * revision right before a large deletion, the total will be 3.
       */
      await setTextAndSync(
        this.application,
        item,
        deleteCharsFromString(item.content.text, largeCharacterChange + 1)
      );
      expect(itemHistory.entries.length).to.equal(3);
      /**
       * Now we're going to make sure that the rule above only applies to large
       * negative deltas, and not large positive deltas. We don't care about
       * hanging on to the preceding revision of a large revision, since the
       * large revision will have more information.
       */
      /** Make a small positive change. This should be kept, because it's the last. */
      await setTextAndSync(
        this.application,
        item,
        item.content.text + Factory.randomString(1)
      );
      expect(itemHistory.entries.length).to.equal(4);
      /**
       * Make a large positive change. The previous small positive change should
       * now be discarded, keeping a total of 4.
       */
      await setTextAndSync(
        this.application,
        item,
        item.content.text + Factory.randomString(largeCharacterChange + 1
        ));
      expect(itemHistory.entries.length).to.equal(4);
    });
});
