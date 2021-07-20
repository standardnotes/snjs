import { SyncEvent } from '@Lib/events';
import { CreateMaxPayloadFromAnyObject, FillItemContent, PayloadSource, Uuids } from '@Lib/index';
import { ContentType, SNPredicate } from '@Lib/models';
import { SyncModes } from '@Lib/services';
import { Uuid } from '@Lib/uuid';
import * as Factory from '../factory';

describe('singletons', function () {
  jest.setTimeout(Factory.TestTimeout);

  const syncOptions = {
    checkIntegrity: true,
  };
  const BASE_ITEM_COUNT = 2; /** Default items key, user preferences */

  function createPrefsPayload() {
    const params = {
      uuid: Uuid.GenerateUuidSynchronously(),
      content_type: ContentType.UserPrefs,
      content: {
        foo: 'bar',
      },
    };
    return CreateMaxPayloadFromAnyObject(params);
  }

  function findOrCreatePrefsSingleton(application) {
    return application.singletonManager.findOrCreateSingleton(
      new SNPredicate('content_type', '=', ContentType.UserPrefs),
      ContentType.UserPrefs,
      FillItemContent({})
    );
  }

  let expectedItemCount;
  let application;
  let email, password;
  let extManagerId, extPred;

  const registerUser = async () => {
    await Factory.registerUserToApplication({
      application: application,
      email: email,
      password: password,
    });
  };
  const signOut = async () => {
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
  };
  const signIn = async () => {
    await application.signIn(
      email,
      password,
      undefined,
      undefined,
      undefined,
      true
    );
  };
  const createExtMgr = async () => {
    return application.createManagedItem(
      ContentType.Component,
      {
        package_info: {
          name: 'Extensions',
          identifier: extManagerId,
        },
      },
      true
    );
  };

  beforeEach(async function () {
    expectedItemCount = BASE_ITEM_COUNT;
    application = await Factory.createInitAppWithRandNamespace();
    email = Uuid.GenerateUuidSynchronously();
    password = Uuid.GenerateUuidSynchronously();
    extManagerId = 'org.standardnotes.extensions-manager';
    extPred = SNPredicate.CompoundPredicate([
      new SNPredicate('content_type', '=', ContentType.Component),
      new SNPredicate('package_info.identifier', '=', extManagerId),
    ]);
  });

  afterEach(async function () {
    expect(application.syncService.isOutOfSync()).toBe(false);
    expect(application.itemManager.items.length).toBe(expectedItemCount);
    const rawPayloads = await application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).toBe(expectedItemCount);
    application.deinit();
  });

  it(`only resolves to ${BASE_ITEM_COUNT} items`, async function () {
    /** Preferences are an item we know to always return true for isSingleton */
    const prefs1 = createPrefsPayload();
    const prefs2 = createPrefsPayload();
    const prefs3 = createPrefsPayload();

    const items = await application.itemManager.emitItemsFromPayloads(
      [prefs1, prefs2, prefs3],
      PayloadSource.LocalChanged
    );
    await application.itemManager.setItemsDirty(Uuids(items));
    await application.syncService.sync(syncOptions);
    expect(application.itemManager.items.length).toBe(expectedItemCount);
  });

  it('resolves registered predicate', async function () {
    application.singletonManager.registerPredicate(extPred);
    const extManager = await createExtMgr();
    expectedItemCount += 1;

    /** Call needlessly */
    await createExtMgr();
    await createExtMgr();
    await createExtMgr();

    expect(extManager).toBeTruthy();
    const refreshedExtMgr = application.findItem(extManager.uuid);
    expect(refreshedExtMgr).toBeTruthy();
    await application.sync(syncOptions);
    expect(
      application.itemManager.itemsMatchingPredicate(extPred).length
    ).toBe(1);
  });

  it('resolves via find or create', async function () {
    /* Set to never synced as singleton manager will attempt to sync before resolving */
    application.syncService.ut_clearLastSyncDate();
    application.syncService.ut_setDatabaseLoaded(false);
    const contentType = ContentType.UserPrefs;
    const predicate = new SNPredicate('content_type', '=', contentType);
    /* Start a sync right after we await singleton resolve below */
    setTimeout(() => {
      application.syncService.ut_setDatabaseLoaded(true);
      application.sync({
        /* Simulate the first sync occuring as that is handled specially by sync service */
        mode: SyncModes.DownloadFirst,
      });
    });
    const userPreferences = await application.singletonManager.findOrCreateSingleton(
      predicate,
      contentType,
      {}
    );

    expect(userPreferences).toBeTruthy();
    const refreshedUserPrefs = application.findItem(userPreferences.uuid);
    expect(refreshedUserPrefs).toBeTruthy();
    await application.sync(syncOptions);
    expect(
      application.itemManager.itemsMatchingPredicate(predicate).length
    ).toBe(1);
  });

  it('resolves registered predicate with signing in/out', async function () {
    await registerUser();
    await signOut();
    email = Uuid.GenerateUuidSynchronously();
    password = Uuid.GenerateUuidSynchronously();
    application.singletonManager.registerPredicate(extPred);
    await createExtMgr();
    expectedItemCount += 1;
    await Factory.registerUserToApplication({
      application: application,
      email: email,
      password: password,
    });
    await signOut();
    application.singletonManager.registerPredicate(extPred);
    await createExtMgr();
    await application.sync(syncOptions);
    const extraSync = application.sync(syncOptions);
    await signIn();
    await extraSync;
  }, 15000);

  it('singletons that are deleted after download first sync should not sync to server', async function () {
    await registerUser();
    application.singletonManager.registerPredicate(extPred);
    await createExtMgr();
    await createExtMgr();
    await createExtMgr();
    expectedItemCount++;

    let didCompleteRelevantSync = false;
    let beginCheckingResponse = false;
    application.syncService.addEventObserver(async (eventName, data) => {
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
        const saved = data.savedPayloads;
        expect(saved.length).toBe(1);
        const matching = saved.find(
          (p) => p.content_type === ContentType.Component && p.deleted
        );
        expect(matching).toBeFalsy();
      }
    });
    await application.syncService.sync({ mode: SyncModes.DownloadFirst });
    expect(didCompleteRelevantSync).toBe(true);
  }, 10000);

  it('signing into account and retrieving singleton shouldnt put us in deadlock', async function () {
    await registerUser();
    /** Create prefs */
    const ogPrefs = await findOrCreatePrefsSingleton(application);
    await application.sync(syncOptions);
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    /** Create another instance while signed out */
    await findOrCreatePrefsSingleton(application);
    await Factory.loginToApplication({
      application: application,
      email: email,
      password: password,
    });
    /** After signing in, the instance retrieved from the server should be the one kept */
    const latestPrefs = await findOrCreatePrefsSingleton(application);
    expect(latestPrefs.uuid).toBe(ogPrefs.uuid);
    const allPrefs = application.itemManager.nonErroredItemsForContentType(
      ogPrefs.content_type
    );
    expect(allPrefs.length).toBe(1);
  });

  it('resolving singleton before first sync, then signing in, should result in correct number of instances', async function () {
    await registerUser();
    /** Create prefs and associate them with account */
    const ogPrefs = await findOrCreatePrefsSingleton(application);
    await application.sync(syncOptions);
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );

    /** Create another instance while signed out */
    await findOrCreatePrefsSingleton(application);
    await Factory.loginToApplication({
      application: application,
      email: email,
      password: password,
    });
    /** After signing in, the instance retrieved from the server should be the one kept */
    const latestPrefs = await findOrCreatePrefsSingleton(application);
    expect(latestPrefs.uuid).toBe(ogPrefs.uuid);
    const allPrefs = application.itemManager.nonErroredItemsForContentType(
      ogPrefs.content_type
    );
    expect(allPrefs.length).toBe(1);
  });

  it('if only result is errorDecrypting, create new item', async function () {
    const item = application.itemManager.items.find(
      (item) => item.content_type === ContentType.UserPrefs
    );
    await application.itemManager.changeItem(item.uuid, (mutator) => {
      mutator.errorDecrypting = true;
    });

    const predicate = new SNPredicate('content_type', '=', item.content_type);
    const resolvedItem = await application.singletonManager.findOrCreateSingleton(
      predicate,
      item.content_type,
      item.content
    );
    await application.sync({ awaitAll: true });
    expect(application.itemManager.items.length).toBe(expectedItemCount);
    expect(resolvedItem.uuid).not.toBe(item.uuid);
    expect(resolvedItem.errorDecrypting).toBeFalsy();
  });

  it('if two items and one is error decrypting, should resolve after download first sync', async function () {
    /**
     * While signing in, a singleton item may be inserted that hasn't yet had the chance to decrypt
     * When the singleton logic runs, it will ignore this item, and matching singletons will result
     * in just 1, meaning the two items will not be consolidated. We want to make sure that when the item
     * is then subsequently decrypted, singleton logic runs again for the item.
     */

    application.singletonManager.registerPredicate(extPred);

    await application.createManagedItem(
      ContentType.Component,
      {
        package_info: {
          name: 'Extensions',
          identifier: extManagerId,
        },
      },
      true,
      {
        errorDecrypting: false,
      }
    );

    const errored = await application.createManagedItem(
      ContentType.Component,
      {
        package_info: {
          name: 'Extensions',
          identifier: extManagerId,
        },
      },
      true,
      {
        errorDecrypting: true,
      }
    );

    expectedItemCount += 1;
    await application.sync(syncOptions);
    /** Now mark errored as not errorDecrypting and sync */
    const notErrored = CreateMaxPayloadFromAnyObject(errored, {
      errorDecrypting: false,
      errorDecryptingValueChanged: true,
    });
    await application.payloadManager.emitPayload(notErrored);
    /** Item will get decrypted on current tick, so wait one before syncing */
    await Factory.sleep(0);
    await application.syncService.sync(syncOptions);

    expect(
      application.itemManager.itemsMatchingPredicate(extPred).length
    ).toBe(1);
  });

  it('alternating the uuid of a singleton should return correct result', async function () {
    const payload = createPrefsPayload();
    const item = await application.itemManager.emitItemFromPayload(
      payload,
      PayloadSource.LocalChanged
    );
    await application.syncService.sync(syncOptions);
    const predicate = new SNPredicate('content_type', '=', item.content_type);
    let resolvedItem = await application.singletonManager.findOrCreateSingleton(
      predicate,
      payload.content_type,
      payload.content
    );
    const originalUuid = resolvedItem.uuid;
    await application.syncService.alternateUuidForItem(resolvedItem.uuid);
    await application.syncService.sync(syncOptions);
    const resolvedItem2 = await application.singletonManager.findOrCreateSingleton(
      predicate,
      payload.content_type,
      payload.content
    );
    resolvedItem = application.findItem(resolvedItem.uuid);
    expect(resolvedItem).toBeFalsy();
    expect(resolvedItem2.uuid).not.toBe(originalUuid);
    expect(application.itemManager.items.length).toBe(expectedItemCount);
  });
});
