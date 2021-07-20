import { PayloadSource, CopyPayload } from '@Lib/index';
import { Uuid } from '@Lib/uuid';
import * as Factory from '../../factory';

describe.skip('sync discordance', () => {
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
    const rawPayloads = await application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).toBe(expectedItemCount);
    application.deinit();
  });

  it('should begin discordance upon instructions', async function () {
    await application.syncService.sync({ checkIntegrity: false });
    expect(application.syncService.state.getLastClientIntegrityHash()).toBeFalsy();

    await application.syncService.sync({ checkIntegrity: true });
    expect(application.syncService.state.getLastClientIntegrityHash()).toBeTruthy();

    // integrity should be valid
    expect(application.syncService.state.discordance).toBe(0);

    // sync should no longer request integrity hash from server
    await application.syncService.sync({ checkIntegrity: false });
    expect(application.syncService.state.getLastClientIntegrityHash()).toBeFalsy();

    // we expect another integrity check here
    await application.syncService.sync({ checkIntegrity: true });
    expect(application.syncService.state.getLastClientIntegrityHash()).toBeTruthy();

    // integrity should be valid
    expect(application.syncService.state.discordance).toBe(0);
  }, 10000);

  it('should abort integrity computation if any single item is missing updated_at_timestamp', async function () {
    /**
     * As part of the May 2021 server migration from SSRB to SSJS, the server in essence
     * had phased out updated_at by returning it as a conversion from updated_at_timestamp (
     * instead of its raw value).
     * To conform to the server's state, clients must transition integrity hash computation
     * to use updated_at_timestamp locally (by first converting microseconds to milliseconds)
     * instead of updated_at. Because previously signed in clients may not yet have
     * this value for all items, if we are missing updated_at_timestamp for any item, we
     * will have to abort performing integrity computation. This is to prevent false
     * positives for users who may not have signed out and back in to redownload all new timestamps.
     */
    await application.syncService.sync(syncOptions);

    const payload = Factory.createNotePayload();
    await application.itemManager.emitItemFromPayload(
      payload,
      PayloadSource.LocalChanged
    );
    expectedItemCount++;

    await application.syncService.sync({ checkIntegrity: true });

    // Expect no discordance
    expect(application.syncService.state.discordance).toBe(0);

    // Set an updated_at_timestamp that's incorrect, and expect out of sync
    await application.itemManager.emitItemFromPayload(
      CopyPayload(application.itemManager.findItem(payload.uuid).payload, {
        updated_at_timestamp: 1234,
      }),
      PayloadSource.LocalChanged
    );

    // wait for integrity check interval
    await application.syncService.sync({ checkIntegrity: true });

    // repeat syncs for sync discordance are not waited for, so we have to sleep for a bit here
    await Factory.sleep(0.2);

    expect(application.syncService.isOutOfSync()).toBe(true);
    expect(application.syncService.state.getLastClientIntegrityHash()).toBeTruthy();

    // Simulate not having updated_at_timestamp altogether. We should be in sync after that
    await application.itemManager.emitItemFromPayload(
      CopyPayload(application.itemManager.findItem(payload.uuid).payload, {
        updated_at_timestamp: undefined,
      }),
      PayloadSource.LocalChanged
    );

    await application.syncService.sync({ checkIntegrity: true });

    expect(application.syncService.isOutOfSync()).toBe(false);
  }, 10000);

  it('should increase discordance as client server mismatches', async function () {
    await application.syncService.sync(syncOptions);

    const payload = Factory.createNotePayload();
    const item = await application.itemManager.emitItemFromPayload(
      payload,
      PayloadSource.LocalChanged
    );
    expectedItemCount++;

    await application.syncService.sync({ checkIntegrity: true });

    // Expect no discordance
    expect(application.syncService.state.discordance).toBe(0);

    // Delete item locally only without notifying server. We should then be in discordance.
    await application.itemManager.removeItemLocally(item);

    // wait for integrity check interval
    await application.syncService.sync({ checkIntegrity: true });

    // repeat syncs for sync discordance are not waited for, so we have to sleep for a bit here
    await Factory.sleep(0.2);

    // We expect now to be in discordance. What the client has is different from what the server has
    // The above sync will not resolve until it syncs enough time to meet discordance threshold
    expect(application.syncService.state.discordance).toBe(application.syncService.maxDiscordance);

    // We now expect out of sync to be true, since we have reached maxDiscordance
    expect(application.syncService.isOutOfSync()).toBe(true);

    // Integrity checking should now be disabled until the next interval
    await application.syncService.sync();
    expect(application.syncService.state.getLastClientIntegrityHash()).toBeFalsy();

    // We should still be in discordance and out of sync at this point
    expect(application.syncService.state.discordance).toBe(application.syncService.maxDiscordance);
    expect(application.syncService.isOutOfSync()).toBe(true);

    // We will now reinstate the item and sync, which should repair everything
    await application.itemManager.insertItem(item);
    await application.syncService.sync({ checkIntegrity: true });

    expect(application.syncService.isOutOfSync()).toBe(false);
    expect(application.syncService.state.discordance).toBe(0);
  }, 10000);

  it('should perform sync resolution in which differing items are duplicated instead of merged', async function () {
    const payload = Factory.createNotePayload();
    const item = await application.itemManager.emitItemFromPayload(
      payload,
      PayloadSource.LocalChanged
    );
    expectedItemCount++;

    await application.syncService.sync(syncOptions);

    // Delete item locally only without notifying server. We should then be in discordance.
    await application.itemManager.removeItemLocally(item);
    expectedItemCount--;

    expect(application.itemManager.items.length).toBe(expectedItemCount);

    await application.syncService.sync({ checkIntegrity: true });
    // repeat syncs for sync discordance are not waited for, so we have to sleep for a bit here
    await Factory.sleep(0.2);
    expect(application.syncService.isOutOfSync()).toBe(true);

    // lets resolve sync where content does not differ
    await application.syncService.resolveOutOfSync();
    expect(application.syncService.isOutOfSync()).toBe(false);
    expectedItemCount++;

    // expect a clean merge
    expect(application.itemManager.items.length).toBe(expectedItemCount);

    const aNote = application.itemManager.notes[0];
    // now lets change the local content without syncing it.
    await application.itemManager.changeItem(aNote.uuid, (mutator) => {
      mutator.text = 'discordance';
    });

    // When we resolve out of sync now (even though we're not currently officially out of sync)
    // we expect that the remote content coming in doesn't wipe our pending change. A conflict should be created
    await application.syncService.resolveOutOfSync();
    expectedItemCount++;
    expect(application.syncService.isOutOfSync()).toBe(false);
    expect(application.itemManager.items.length).toBe(expectedItemCount);

    for (const item of application.itemManager.items) {
      expect(item.uuid).not.toBeNull();
    }

    // now lets sync the item, just to make sure it doesn't cause any problems
    await application.itemManager.setItemDirty(aNote.uuid);
    await application.syncService.sync({ checkIntegrity: true });
    expect(application.syncService.isOutOfSync()).toBe(false);
    expect(application.itemManager.items.length).toBe(expectedItemCount);
  });
});
