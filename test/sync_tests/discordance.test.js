/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('sync discordance', () => {
  const BASE_ITEM_COUNT = 2; /** Default items key, user preferences */

  const syncOptions = {
    checkIntegrity: true,
    awaitAll: true,
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
      password: this.password,
    });
  });

  afterEach(async function () {
    expect(this.application.syncService.isOutOfSync()).to.equal(false);
    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(this.expectedItemCount);
    await this.application.deinit();
  });

  it('should begin discordance upon instructions', async function () {
    await this.application.syncService.sync({ checkIntegrity: false });
    expect(this.application.syncService.state.getLastClientIntegrityHash()).to
      .not.be.ok;

    await this.application.syncService.sync({ checkIntegrity: true });
    expect(this.application.syncService.state.getLastClientIntegrityHash()).to
      .be.ok;

    // integrity should be valid
    expect(this.application.syncService.state.discordance).to.equal(0);

    // sync should no longer request integrity hash from server
    await this.application.syncService.sync({ checkIntegrity: false });
    expect(this.application.syncService.state.getLastClientIntegrityHash()).to
      .not.be.ok;

    // we expect another integrity check here
    await this.application.syncService.sync({ checkIntegrity: true });
    expect(this.application.syncService.state.getLastClientIntegrityHash()).to
      .be.ok;

    // integrity should be valid
    expect(this.application.syncService.state.discordance).to.equal(0);
  }).timeout(10000);

  it('should increase discordance as client server mismatches', async function () {
    await this.application.syncService.sync(syncOptions);

    const payload = Factory.createNotePayload();
    const item = await this.application.itemManager.emitItemFromPayload(
      payload,
      PayloadSource.LocalChanged
    );
    this.expectedItemCount++;

    await this.application.syncService.sync({ checkIntegrity: true });

    // Expect no discordance
    expect(this.application.syncService.state.discordance).to.equal(0);

    // Delete item locally only without notifying server. We should then be in discordance.
    await this.application.itemManager.removeItemLocally(item);

    // wait for integrity check interval
    await this.application.syncService.sync({ checkIntegrity: true });

    // repeat syncs for sync discordance are not waited for, so we have to sleep for a bit here
    await Factory.sleep(0.2);

    // We expect now to be in discordance. What the client has is different from what the server has
    // The above sync will not resolve until it syncs enough time to meet discordance threshold
    expect(this.application.syncService.state.discordance).to.equal(
      this.application.syncService.maxDiscordance
    );

    // We now expect out of sync to be true, since we have reached maxDiscordance
    expect(this.application.syncService.isOutOfSync()).to.equal(true);

    // Integrity checking should now be disabled until the next interval
    await this.application.syncService.sync();
    expect(this.application.syncService.state.getLastClientIntegrityHash()).to
      .not.be.ok;

    // We should still be in discordance and out of sync at this point
    expect(this.application.syncService.state.discordance).to.equal(
      this.application.syncService.maxDiscordance
    );
    expect(this.application.syncService.isOutOfSync()).to.equal(true);

    // We will now reinstate the item and sync, which should repair everything
    await this.application.itemManager.insertItem(item);
    await this.application.syncService.sync({ checkIntegrity: true });

    expect(this.application.syncService.isOutOfSync()).to.equal(false);
    expect(this.application.syncService.state.discordance).to.equal(0);
  }).timeout(10000);

  it('should perform sync resolution in which differing items are duplicated instead of merged', async function () {
    const payload = Factory.createNotePayload();
    const item = await this.application.itemManager.emitItemFromPayload(
      payload,
      PayloadSource.LocalChanged
    );
    this.expectedItemCount++;

    await this.application.syncService.sync(syncOptions);

    // Delete item locally only without notifying server. We should then be in discordance.
    await this.application.itemManager.removeItemLocally(item);
    this.expectedItemCount--;

    expect(this.application.itemManager.items.length).to.equal(
      this.expectedItemCount
    );

    await this.application.syncService.sync({ checkIntegrity: true });
    // repeat syncs for sync discordance are not waited for, so we have to sleep for a bit here
    await Factory.sleep(0.2);
    expect(this.application.syncService.isOutOfSync()).to.equal(true);

    // lets resolve sync where content does not differ
    await this.application.syncService.resolveOutOfSync();
    expect(this.application.syncService.isOutOfSync()).to.equal(false);
    this.expectedItemCount++;

    // expect a clean merge
    expect(this.application.itemManager.items.length).to.equal(
      this.expectedItemCount
    );

    const aNote = this.application.itemManager.notes[0];
    // now lets change the local content without syncing it.
    await this.application.itemManager.changeItem(aNote.uuid, (mutator) => {
      mutator.text = 'discordance';
    });

    // When we resolve out of sync now (even though we're not currently officially out of sync)
    // we expect that the remote content coming in doesn't wipe our pending change. A conflict should be created
    await this.application.syncService.resolveOutOfSync();
    this.expectedItemCount++;
    expect(this.application.syncService.isOutOfSync()).to.equal(false);
    expect(this.application.itemManager.items.length).to.equal(
      this.expectedItemCount
    );

    for (const item of this.application.itemManager.items) {
      expect(item.uuid).not.be.null;
    }

    // now lets sync the item, just to make sure it doesn't cause any problems
    await this.application.itemManager.setItemDirty(aNote.uuid);
    await this.application.syncService.sync({ checkIntegrity: true });
    expect(this.application.syncService.isOutOfSync()).to.equal(false);
    expect(this.application.itemManager.items.length).to.equal(
      this.expectedItemCount
    );
  });
});
