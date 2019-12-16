import '../dist/regenerator.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';

chai.use(chaiAsPromised);
var expect = chai.expect;

// automatically optimize after every revision by setting this to 0
SFHistorySession.LargeItemEntryAmountThreshold = 0;
SFItemHistory.LargeEntryDeltaThreshold = 15;

let largeCharacterChange = SFItemHistory.LargeEntryDeltaThreshold;

describe('session history', () => {
  var email = Factory.globalStandardNotes().crypto.generateUUIDSync();
  var password = Factory.globalStandardNotes().crypto.generateUUIDSync();
  var totalItemCount = 0;

  let authManager = Factory.globalAuthManager();
  let modelManager = Factory.createModelManager();
  let syncManager = new SFSyncManager(modelManager, Factory.globalStorageManager(), Factory.globalHttpManager());
  var keyRequestHandler = async () => {
    return {
      keys: await authManager.keys(),
      auth_params: await authManager.getAuthParams(),
      offline: false
    };
  };

  syncManager.setKeyRequestHandler(keyRequestHandler)

  before((done) => {
    Factory.globalStorageManager().clearAllData().then(() => {
      Factory.newRegisteredUser(email, password).then((user) => {
        syncManager.loadLocalItems().then(() => {
          done();
        })
      })
    })
  })

  let historyManager = new SFSessionHistoryManager(modelManager, Factory.globalStorageManager(), keyRequestHandler, "*");
  beforeEach((done) => {
    historyManager.clearAllHistory().then(done);
  })

  const setTextAndSync = async (item, text) => {
    item.content.text = text;
    modelManager.setItemDirty(item, true);
    return syncManager.sync();
  }

  const deleteCharsFromString = (string, amount) => {
    return string.substring(0, string.length - amount);
  }

  const stringOfSize = (size) => {
    var s = "";
    for(var i = 0; i < size; i++) {
      s += "a";
    }
    return s;
  }

  it("create basic history entries", async () => {
    var item = Factory.createItem();
    modelManager.setItemDirty(item, true);
    modelManager.addItem(item);
    await syncManager.sync();

    var itemHistory = historyManager.historyForItem(item);
    expect(itemHistory).to.be.ok;
    expect(itemHistory.entries.length).to.equal(1);

    // sync with same contents, should not create new entry
    modelManager.setItemDirty(item, true);
    await syncManager.sync();
    expect(itemHistory.entries.length).to.equal(1);

    // sync with different contents, should create new entry
    item.content.title = Math.random();
    modelManager.setItemDirty(item, true);
    await syncManager.sync();
    expect(itemHistory.entries.length).to.equal(2);

    historyManager.clearHistoryForItem(item);
    var itemHistory = historyManager.historyForItem(item);
    expect(itemHistory.entries.length).to.equal(0);

    modelManager.setItemDirty(item, true);
    await syncManager.sync();
    expect(itemHistory.entries.length).to.equal(1);

    historyManager.clearAllHistory();
    expect(historyManager.historyForItem(item).entries.length).to.equal(0);
  });

  it("should optimize basic entries", async () => {
    var item = Factory.createItem();
    modelManager.setItemDirty(item, true);
    modelManager.addItem(item);
    await syncManager.sync();

    var itemHistory = historyManager.historyForItem(item);

    // it should keep the first revision, regardless of character delta.
    expect(itemHistory.entries.length).to.equal(1);

    // Add 1 character. This typically would be discarded as an entry, but it won't here because it's the last one, which we want to keep.
    await setTextAndSync(item, item.content.text + stringOfSize(1));
    expect(itemHistory.entries.length).to.equal(2);

    // Now changing it by one character should discard this entry, keeping the total at 2.
    await setTextAndSync(item, item.content.text + stringOfSize(1));
    expect(itemHistory.entries.length).to.equal(2);

    // Change it over the largeCharacterChange threshold. It should keep this revision, but now remove the previous revision,
    // since it's no longer the last, and is a small change.
    await setTextAndSync(item, item.content.text + stringOfSize(largeCharacterChange + 1));
    expect(itemHistory.entries.length).to.equal(2);

    // Change it again over the delta threshhold. It should keep this revision, and the last one, totaling 3.
    await setTextAndSync(item, item.content.text + stringOfSize(largeCharacterChange + 1));
    expect(itemHistory.entries.length).to.equal(3);

    // Delete over threshold text. It should keep this revision.
    await setTextAndSync(item, deleteCharsFromString(item.content.text, largeCharacterChange + 1));
    expect(itemHistory.entries.length).to.equal(4);

    // Delete just 1 character. It should keep this entry, because it's the last, upping the total to 5.
    // However, the next small revision after that should delete it, keeping it at 5.
    await setTextAndSync(item, deleteCharsFromString(item.content.text, 1));
    expect(itemHistory.entries.length).to.equal(5);
    await setTextAndSync(item, deleteCharsFromString(item.content.text, 1));
    expect(itemHistory.entries.length).to.equal(5);
  });

  it("should keep the entry right before a large deletion, regardless of its delta", async () => {
    var item = Factory.createItem();
    modelManager.setItemDirty(item, true);
    modelManager.addItem(item);
    item.content.text = stringOfSize(100);
    await syncManager.sync();

    var itemHistory = historyManager.historyForItem(item);

    // it should keep the first and last by default
    await setTextAndSync(item, item.content.text);
    await setTextAndSync(item, item.content.text + stringOfSize(1));
    expect(itemHistory.entries.length).to.equal(2);

    // We want to delete a large number of characters. The revision right before this one was a small negligible revision of +1 char.
    // This would typically be discarded after optimization. However, because this next revision will delete a large number of characters,
    // we want to preserve the entry right before the deletion. This is because the deletion will only have the value of the text after the large deletion.
    // We want to keep the value directly preceding this deletion as a way to recover from the deletion.

    // It would have been 2 typically. But because we're hanging on to a small revision right before a large deletion, the total will be 3.
    await setTextAndSync(item, deleteCharsFromString(item.content.text, largeCharacterChange + 1));
    expect(itemHistory.entries.length).to.equal(3);

    // Now we're going to make sure that the rule above only applies to large negative deltas, and not large positive deltas.
    // We don't care about hanging on to the preceding revision of a large revision, since the large revision will have more information.

    // Make a small positive change. This should be kept, because it's the last.
    await setTextAndSync(item, item.content.text + stringOfSize(1));
    expect(itemHistory.entries.length).to.equal(4);

    // Make a large positive change. The previous small positive change should now be discarded, keeping a total of 4.
    await setTextAndSync(item, item.content.text + stringOfSize(largeCharacterChange + 1));
    expect(itemHistory.entries.length).to.equal(4);
  });
});
