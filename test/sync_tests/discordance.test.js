import '../../node_modules/regenerator-runtime/runtime.js';
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import '../vendor/chai-as-promised-built.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('sync discordance', () => {
  var email = SFItem.GenerateUuidSynchronously();
  var password = SFItem.GenerateUuidSynchronously();
  var totalItemCount = 0;

  let localStorageManager = Factory.createMemoryStorageManager();
  let localAuthManager = new SNAuthManager({
    storageManager: localStorageManager,
    httpManager: Factory.globalHttpManager(),
    keyManager: Factory.globalKeyManager(),
    protocolManager: Factory.globalProtocolManager()
  });
  let localHttpManager = new SNHttpManager();
  localHttpManager.setJWTRequestHandler(async () => {
    return localStorageManager.getItem("jwt");;
  })
  let localModelManager = Factory.createModelManager();
  const localSyncManager = new SNSyncManager({
    modelManager: localModelManager,
    authManager: Factory.globalAuthManager(),
    storageManager: localStorageManager,
    protocolManager: Factory.globalProtocolManager(),
    httpManager: localHttpManager
  });

  before((done) => {
    localStorageManager.clearAllData().then(() => {
      Factory.registerUserToApplication({email, password, application}).then((user) => {
        done();
      })
    })
  })

  beforeEach(async () => {
    await localSyncManager.loadLocalItems();
  });

  let itemCount = 0;

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

    var item = Factory.createStorageItemNotePayload();
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
    var item = Factory.createStorageItemNotePayload();
    localModelManager.addItem(item);
    localModelManager.setItemDirty(item, true);
    itemCount++;

    // localSyncManager.loggingEnabled = true;

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
    item.text = "discordance";
    // typically this is done by setDirty, but because we don't want to sync it, we'll apply this directly.
    item.collapseContent();

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
