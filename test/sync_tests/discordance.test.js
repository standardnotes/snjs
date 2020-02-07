/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import '../vendor/chai-as-promised-built.js';
import Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('sync discordance', () => {
  const BASE_ITEM_COUNT = 1; /** Default items key */

  before(async function() {
    localStorage.clear();
  });

  after(async function() {
    localStorage.clear();
  });

  beforeEach(async function() {
    this.expectedItemCount = BASE_ITEM_COUNT;
    this.application = await Factory.createInitAppWithRandNamespace();
    this.email = Uuid.GenerateUuidSynchronously();
    this.password = Uuid.GenerateUuidSynchronously();
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password
    });
  });

  afterEach(async function() {
    expect(this.application.syncManager.isOutOfSync()).to.equal(false);
    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(this.expectedItemCount);
    await this.application.deinit();
  });

  it("should begin discordance upon instructions", async function () {
    await this.application.syncManager.sync({checkIntegrity: false});
    expect(this.application.syncManager.state.getLastClientIntegrityHash()).to.not.be.ok;

    await this.application.syncManager.sync({checkIntegrity: true});
    expect(this.application.syncManager.state.getLastClientIntegrityHash()).to.not.be.null;

    // integrity should be valid
    expect(this.application.syncManager.state.discordance).to.equal(0);

    // sync should no longer request integrity hash from server
    await this.application.syncManager.sync({checkIntegrity: false});
    expect(this.application.syncManager.state.getLastClientIntegrityHash()).to.not.be.ok;

    // we expect another integrity check here
    await this.application.syncManager.sync({checkIntegrity: true});
    expect(this.application.syncManager.state.getLastClientIntegrityHash()).to.not.be.null;

    // integrity should be valid
    expect(this.application.syncManager.state.discordance).to.equal(0);
  }).timeout(10000);

  it("should increase discordance as client server mismatches", async function () {
    await this.application.syncManager.sync();

    const payload = Factory.createNotePayload();
    const item = await this.application.modelManager.mapPayloadToLocalItem({payload: payload});
    this.expectedItemCount++;

    await this.application.syncManager.sync({checkIntegrity: true});

    // Expect no discordance
    expect(this.application.syncManager.state.discordance).to.equal(0);

    // Delete item locally only without notifying server. We should then be in discordance.
    await this.application.modelManager.removeItemLocally(item);

    // wait for integrity check interval
    await this.application.syncManager.sync({checkIntegrity: true});

    // repeat syncs for sync discordance are not waited for, so we have to sleep for a bit here
    await Factory.sleep(0.2);

    // We expect now to be in discordance. What the client has is different from what the server has
    // The above sync will not resolve until it syncs enough time to meet discordance threshold
    expect(this.application.syncManager.state.discordance).to.equal(
      this.application.syncManager.maxDiscordance
    );

    // We now expect out of sync to be true, since we have reached maxDiscordance
    expect(this.application.syncManager.isOutOfSync()).to.equal(true);

    // Integrity checking should now be disabled until the next interval
    await this.application.syncManager.sync();
    expect(this.application.syncManager.state.getLastClientIntegrityHash()).to.not.be.ok;

    // We should still be in discordance and out of sync at this point
    expect(this.application.syncManager.state.discordance).to.equal(
      this.application.syncManager.maxDiscordance
    );
    expect(this.application.syncManager.isOutOfSync()).to.equal(true);

    // We will now reinstate the item and sync, which should repair everything
    await this.application.modelManager.setItemDirty(item, true);
    await this.application.syncManager.sync({checkIntegrity: true});

    expect(this.application.syncManager.isOutOfSync()).to.equal(false);
    expect(this.application.syncManager.state.discordance).to.equal(0);
  }).timeout(10000);

  it("should perform sync resolution in which differing items are duplicated instead of merged", async function () {
    const payload = Factory.createNotePayload();
    const item = await this.application.modelManager.mapPayloadToLocalItem({payload});
    this.expectedItemCount++;

    // this.application.syncManager.loggingEnabled = true;

    await this.application.syncManager.sync();

    // Delete item locally only without notifying server. We should then be in discordance.
    // Don't use this.application.modelManager.removeItemLocally(item), as it saves some state about itemsPendingDeletion. Use internal API

    this.application.modelManager.items = this.application.modelManager.items.filter((candidate) => {
      return candidate.uuid !== item.uuid;
    });

    await this.application.modelManager.removeItemLocally(item);
    this.expectedItemCount--;

    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);

    await this.application.syncManager.sync({checkIntegrity: true});
    // repeat syncs for sync discordance are not waited for, so we have to sleep for a bit here
    await Factory.sleep(0.2);
    expect(this.application.syncManager.isOutOfSync()).to.equal(true);

    // lets resolve sync where content does not differ
    await this.application.syncManager.resolveOutOfSync();
    expect(this.application.syncManager.isOutOfSync()).to.equal(false);
    this.expectedItemCount++;

    // expect a clean merge
    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);

    // now lets change the local content without syncing it.
    const aNote = this.application.modelManager.notes[0];
    aNote.text = "discordance";
    await this.application.modelManager.setItemDirty(aNote);

    // When we resolve out of sync now (even though we're not currently officially out of sync)
    // we expect that the remote content coming in doesn't wipe our pending change. A conflict should be created
    await this.application.syncManager.resolveOutOfSync();
    this.expectedItemCount++;
    expect(this.application.syncManager.isOutOfSync()).to.equal(false);
    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);

    for(const item of this.application.modelManager.allItems) {
      expect(item.uuid).not.be.null;
    }

    // now lets sync the item, just to make sure it doesn't cause any problems
    await this.application.modelManager.setItemDirty(aNote, true);
    await this.application.syncManager.sync({checkIntegrity: true});
    expect(this.application.syncManager.isOutOfSync()).to.equal(false);
    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);
  });
});
