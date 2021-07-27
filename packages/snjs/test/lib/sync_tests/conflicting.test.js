import { CreateMaxPayloadFromAnyObject, PayloadSource, CopyPayload, ComponentArea, SyncUpDownLimit } from '@Lib/index';
import { ContentType } from '@Lib/models';
import { EncryptionIntent } from '@Lib/protocol';
import { Uuid } from '@Lib/uuid';
import * as Factory from '../../factory';

describe('online conflict handling', function () {
  jest.setTimeout(Factory.TestTimeout);
  const BASE_ITEM_COUNT = 2; /** Default items key, user preferences */

  const syncOptions = {
    checkIntegrity: true,
    awaitAll: true,
  };

  const sharedFinalAssertions = async function (application, expectedItemCount) {
    expect(application.syncService.isOutOfSync()).toBe(false);
    const items = application.itemManager.items;
    expect(items.length).toBe(expectedItemCount);
    const rawPayloads = await application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).toBe(expectedItemCount);
  };

  async function setupApplication() {
    const expectedItemCount = BASE_ITEM_COUNT;
    const application = await Factory.createInitAppWithRandNamespace();
    const email = Uuid.GenerateUuidSynchronously();
    const password = Uuid.GenerateUuidSynchronously();
    await Factory.registerUserToApplication({
      application: application,
      email: email,
      password: password,
    });

    return {
      expectedItemCount,
      application,
      email,
      password
    };
  }

  function createDirtyPayload(contentType) {
    const params = {
      uuid: Uuid.GenerateUuidSynchronously(),
      content_type: contentType,
      content: {
        foo: 'bar',
      },
    };
    const payload = CreateMaxPayloadFromAnyObject(params, {
      dirty: true,
      dirtiedDate: new Date(),
    });
    return payload;
  }

  it('components should not be duplicated under any circumstances', async function () {
    let { application, expectedItemCount } = await setupApplication();
    const payload = createDirtyPayload(ContentType.Component);
    const item = await application.itemManager.emitItemFromPayload(
      payload,
      PayloadSource.LocalChanged
    );
    expectedItemCount++;
    await application.syncService.sync(syncOptions);
    /** First modify the item without saving so that
     * our local contents digress from the server's */
    await application.changeItem(item.uuid, (mutator) => {
      mutator.content.foo = `${Math.random()}`;
    });
    await application.changeAndSaveItem(
      item.uuid,
      (mutator) => {
        /** Conflict the item */
        mutator.content.foo = 'zar';
        mutator.updated_at_timestamp = Factory.dateToMicroseconds(
          Factory.yesterday()
        );
      },
      undefined,
      undefined,
      syncOptions
    );
    expect(application.itemManager.items.length).toBe(expectedItemCount);
    await sharedFinalAssertions(application, expectedItemCount);
  });

  it('items keys should not be duplicated under any circumstances', async function () {
    let { application, expectedItemCount } = await setupApplication();
    const payload = createDirtyPayload(ContentType.ItemsKey);
    const item = await application.itemManager.emitItemFromPayload(
      payload,
      PayloadSource.LocalChanged
    );
    expectedItemCount++;
    await application.syncService.sync(syncOptions);
    /** First modify the item without saving so that
     * our local contents digress from the server's */
    await application.changeItem(item.uuid, (mutator) => {
      mutator.title = `${Math.random()}`;
    });
    await application.changeAndSaveItem(
      item.uuid,
      (mutator) => {
        /** Conflict the item */
        mutator.content.foo = 'zar';
        mutator.updated_at_timestamp = Factory.dateToMicroseconds(
          Factory.yesterday()
        );
      },
      undefined,
      undefined,
      syncOptions
    );
    expect(application.itemManager.items.length).toBe(expectedItemCount);
    await sharedFinalAssertions(application, expectedItemCount);
  });

  it('duplicating note should maintain editor ref', async function () {
    let { application, expectedItemCount } = await setupApplication();
    const note = await Factory.createSyncedNote(application);
    expectedItemCount++;
    const basePayload = createDirtyPayload(ContentType.Component);
    const payload = CopyPayload(basePayload, {
      content: {
        ...basePayload.content,
        area: ComponentArea.Editor,
      },
    });
    const editor = await application.itemManager.emitItemFromPayload(
      payload,
      PayloadSource.LocalChanged
    );
    expectedItemCount++;
    await application.syncService.sync(syncOptions);

    await application.changeAndSaveItem(
      editor.uuid,
      (mutator) => {
        mutator.associateWithItem(note.uuid);
      },
      undefined,
      undefined,
      syncOptions
    );

    expect(application.componentManager.editorForNote(note)).toBeTruthy();

    /** Conflict the note */
    /** First modify the item without saving so that
     * our local contents digress from the server's */
    await application.changeItem(note.uuid, (mutator) => {
      mutator.title = `${Math.random()}`;
    });
    await application.changeAndSaveItem(
      note.uuid,
      (mutator) => {
        mutator.content.title = 'zar';
        mutator.updated_at_timestamp = Factory.dateToMicroseconds(
          Factory.yesterday()
        );
      },
      undefined,
      undefined,
      syncOptions
    );
    expectedItemCount++;

    const duplicate = application.itemManager.notes.find((n) => {
      return n.uuid !== note.uuid;
    });
    expect(duplicate).toBeTruthy();
    expect(application.componentManager.editorForNote(duplicate)).toBeTruthy();
    await sharedFinalAssertions(application, expectedItemCount);
  });

  it('should create conflicted copy if incoming server item attempts to overwrite local dirty item', async function () {
    let { application, expectedItemCount } = await setupApplication();
    // create an item and sync it
    const note = await Factory.createMappedNote(application);
    expectedItemCount++;
    await application.itemManager.setItemDirty(note.uuid);
    await application.syncService.sync(syncOptions);

    const rawPayloads = await application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).toBe(expectedItemCount);

    const originalValue = note.title;
    const dirtyValue = `${Math.random()}`;

    await application.itemManager.changeNote(note.uuid, (mutator) => {
      // modify this item locally to have differing contents from server
      mutator.title = dirtyValue;
      // Intentionally don't change updated_at. We want to simulate a chaotic case where
      // for some reason we receive an item with different content but the same updated_at.
      // note.updated_at = Factory.yesterday();
    });

    // Download all items from the server, which will include this note.
    await application.syncService.clearSyncPositionTokens();
    await application.syncService.sync({
      ...syncOptions,
      awaitAll: true,
    });

    // We expect this item to be duplicated
    expectedItemCount++;
    expect(application.itemManager.notes.length).toBe(2);

    const allItems = application.itemManager.items;
    expect(allItems.length).toBe(expectedItemCount);

    const originalItem = application.itemManager.findItem(note.uuid);
    const duplicateItem = allItems.find(
      (i) => i.content.conflict_of === note.uuid
    );

    expect(originalItem.title).toBe(dirtyValue);
    expect(duplicateItem.title).toBe(originalValue);
    expect(originalItem.title).not.toBe(duplicateItem.title);

    const newRawPayloads = await application.storageService.getAllRawPayloads();
    expect(newRawPayloads.length).toBe(expectedItemCount);
    await sharedFinalAssertions(application, expectedItemCount);
  });

  it('should handle sync conflicts by duplicating differing data', async function () {
    let { application, expectedItemCount } = await setupApplication();
    // create an item and sync it
    const note = await Factory.createMappedNote(application);
    await application.saveItem(note.uuid);
    expectedItemCount++;

    const rawPayloads = await application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).toBe(expectedItemCount);
    /** First modify the item without saving so that
     * our local contents digress from the server's */
    await application.changeItem(note.uuid, (mutator) => {
      mutator.title = `${Math.random()}`;
    });
    await application.changeAndSaveItem(
      note.uuid,
      (mutator) => {
        // modify this item to have stale values
        mutator.title = `${Math.random()}`;
        mutator.updated_at_timestamp = Factory.dateToMicroseconds(
          Factory.yesterday()
        );
      },
      undefined,
      undefined,
      syncOptions
    );

    // We expect this item to be duplicated
    expectedItemCount++;
    const allItems = application.itemManager.items;
    expect(allItems.length).toBe(expectedItemCount);

    const note1 = application.itemManager.notes[0];
    const note2 = application.itemManager.notes[1];
    expect(note1.content.title).not.toBe(note2.content.title);
    await sharedFinalAssertions(application, expectedItemCount);
  });

  it('basic conflict with clearing local state', async function () {
    let { application, expectedItemCount } = await setupApplication();
    const note = await Factory.createMappedNote(application);
    await application.saveItem(note.uuid);
    expectedItemCount += 1;
    /** First modify the item without saving so that
     * our local contents digress from the server's */
    await application.changeItem(note.uuid, (mutator) => {
      mutator.title = `${Math.random()}`;
    });
    await application.changeAndSaveItem(
      note.uuid,
      (mutator) => {
        /** Create conflict for a note */
        mutator.title = `${Math.random()}`;
        mutator.updated_at_timestamp = Factory.dateToMicroseconds(
          Factory.yesterday()
        );
      },
      undefined,
      undefined,
      syncOptions
    );

    expectedItemCount++;
    expect(application.itemManager.items.length).toBe(expectedItemCount);

    // clear sync token, clear storage, download all items, and ensure none of them have error decrypting
    await application.syncService.clearSyncPositionTokens();
    await application.storageService.clearAllPayloads();
    application.payloadManager.resetState();
    application.itemManager.resetState();
    await application.syncService.sync(syncOptions);

    expect(application.itemManager.items.length).toBe(expectedItemCount);
    await sharedFinalAssertions(application, expectedItemCount);
  });

  it('should duplicate item if saving a modified item and clearing our sync token', async function () {
    let { application, expectedItemCount } = await setupApplication();
    let note = await Factory.createMappedNote(application);
    await application.itemManager.setItemDirty(note.uuid);
    await application.syncService.sync(syncOptions);
    expectedItemCount++;

    const newTitle = `${Math.random()}`;
    /** First modify the item without saving so that
     * our local contents digress from the server's */
    await application.changeItem(note.uuid, (mutator) => {
      mutator.title = `${Math.random()}`;
    });
    await application.itemManager.changeItem(note.uuid, (mutator) => {
      // modify this item to have stale values
      mutator.title = newTitle;
      mutator.updated_at_timestamp = Factory.dateToMicroseconds(
        Factory.yesterday()
      );
    });

    // We expect this item to be duplicated
    expectedItemCount++;

    await application.syncService.clearSyncPositionTokens();
    await application.syncService.sync(syncOptions);

    note = application.findItem(note.uuid);
    // We expect the item title to be the new title, and not rolled back to original value
    expect(note.content.title).toBe(newTitle);

    const allItems = application.itemManager.items;
    expect(allItems.length).toBe(expectedItemCount);
    await sharedFinalAssertions(application, expectedItemCount);
  });

  it('should handle sync conflicts by not duplicating same data', async function () {
    let { application, expectedItemCount } = await setupApplication();
    const note = await Factory.createMappedNote(application);
    expectedItemCount++;
    await application.itemManager.setItemDirty(note.uuid);
    await application.syncService.sync(syncOptions);

    // keep item as is and set dirty
    await application.itemManager.setItemDirty(note.uuid);

    // clear sync token so that all items are retrieved on next sync
    application.syncService.clearSyncPositionTokens();

    await application.syncService.sync(syncOptions);
    expect(application.itemManager.items.length).toBe(expectedItemCount);
    await sharedFinalAssertions(application, expectedItemCount);
  });

  it('clearing conflict_of on two clients simultaneously should keep us in sync', async function () {
    let { application, expectedItemCount } = await setupApplication();
    const note = await Factory.createMappedNote(application);
    await application.itemManager.setItemDirty(note.uuid);
    expectedItemCount++;

    await application.changeAndSaveItem(
      note.uuid,
      (mutator) => {
        // client A
        mutator.content.conflict_of = 'foo';
      },
      undefined,
      undefined,
      syncOptions
    );

    // client B
    await application.syncService.clearSyncPositionTokens();
    await application.itemManager.changeItem(
      note.uuid,
      (mutator) => {
        mutator.content.conflict_of = 'bar';
      },
      undefined,
      undefined,
      syncOptions
    );

    // conflict_of is a key to ignore when comparing content, so item should
    // not be duplicated.
    await application.syncService.sync(syncOptions);
    await sharedFinalAssertions(application, expectedItemCount);
  });

  it('setting property on two clients simultaneously should create conflict', async function () {
    let { application, expectedItemCount } = await setupApplication();
    const note = await Factory.createMappedNote(application);
    await application.itemManager.setItemDirty(note.uuid);
    expectedItemCount++;

    await application.changeAndSaveItem(
      note.uuid,
      (mutator) => {
        // client A
        mutator.content.foo = 'foo';
      },
      undefined,
      undefined,
      syncOptions
    );
    /** First modify the item without saving so that
     * our local contents digress from the server's */
    await application.changeItem(note.uuid, (mutator) => {
      mutator.title = `${Math.random()}`;
    });
    // client B
    await application.syncService.clearSyncPositionTokens();
    await application.changeAndSaveItem(
      note.uuid,
      (mutator) => {
        mutator.content.foo = 'bar';
        mutator.updated_at_timestamp = Factory.dateToMicroseconds(
          Factory.yesterday()
        );
      },
      undefined,
      undefined,
      syncOptions
    );
    expectedItemCount++;
    await sharedFinalAssertions(application, expectedItemCount);
  });

  it('if server says deleted but client says not deleted, keep server state', async function () {
    let { application, expectedItemCount } = await setupApplication();
    const note = await Factory.createMappedNote(application);
    const originalPayload = note.payloadRepresentation();
    expectedItemCount++;
    await application.itemManager.setItemDirty(note.uuid);
    await application.syncService.sync(syncOptions);
    expect(application.itemManager.items.length).toBe(expectedItemCount);

    // client A
    await application.itemManager.setItemToBeDeleted(note.uuid);
    await application.syncService.sync(syncOptions);
    expectedItemCount--;
    expect(application.itemManager.items.length).toBe(expectedItemCount);

    // client B
    await application.syncService.clearSyncPositionTokens();
    // Add the item back and say it's not deleted
    const mutatedPayload = CreateMaxPayloadFromAnyObject(originalPayload, {
      deleted: false,
      updated_at: Factory.yesterday(),
    });
    await application.itemManager.emitItemsFromPayloads(
      [mutatedPayload],
      PayloadSource.LocalChanged
    );
    const resultNote = application.itemManager.findItem(note.uuid);
    expect(resultNote.uuid).toBe(note.uuid);
    await application.itemManager.setItemDirty(resultNote.uuid);
    await application.syncService.sync(syncOptions);

    // We expect that this item is now gone for good, and a duplicate has not been created.
    expect(application.itemManager.items.length).toBe(expectedItemCount);
    await sharedFinalAssertions(application, expectedItemCount);
  });

  it('if server says not deleted but client says deleted, keep server state', async function () {
    let { application, expectedItemCount } = await setupApplication();
    const note = await Factory.createMappedNote(application);
    await application.itemManager.setItemDirty(note.uuid);
    expectedItemCount++;

    // client A
    await application.syncService.sync(syncOptions);
    expect(application.itemManager.items.length).toBe(expectedItemCount);

    // client B
    await application.syncService.clearSyncPositionTokens();

    // This client says this item is deleted, but the server is saying its not deleted.
    // In this case, we want to keep the server copy.
    await application.changeAndSaveItem(
      note.uuid,
      (mutator) => {
        mutator.setDeleted();
        mutator.updated_at_timestamp = Factory.dateToMicroseconds(
          Factory.yesterday()
        );
      },
      undefined,
      undefined,
      syncOptions
    );

    // We expect that this item maintained.
    expect(application.itemManager.items.length).toBe(expectedItemCount);
    await sharedFinalAssertions(application, expectedItemCount);
  });

  it('should create conflict if syncing an item that is stale', async function () {
    let { application, expectedItemCount } = await setupApplication();
    let note = await Factory.createMappedNote(application);
    await application.itemManager.setItemDirty(note.uuid);
    await application.syncService.sync(syncOptions);
    note = application.findItem(note.uuid);
    expect(note.dirty).toBe(false);
    expectedItemCount++;
    /** First modify the item without saving so that
     * our local contents digress from the server's */
    await application.changeItem(note.uuid, (mutator) => {
      mutator.title = `${Math.random()}`;
    });
    note = await application.changeAndSaveItem(
      note.uuid,
      (mutator) => {
        mutator.text = 'Stale text';
        mutator.updated_at_timestamp = Factory.dateToMicroseconds(
          Factory.yesterday()
        );
      },
      undefined,
      undefined,
      syncOptions
    );
    expect(note.dirty).toBe(false);

    // We expect now that the item was conflicted
    expectedItemCount++;

    const rawPayloads = await application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).toBe(expectedItemCount);
    for (const payload of rawPayloads) {
      expect(payload.dirty).toBeFalsy();
    }
    await sharedFinalAssertions(application, expectedItemCount);
  });

  it('creating conflict with exactly equal content should keep us in sync', async function () {
    let { application, expectedItemCount } = await setupApplication();
    const note = await Factory.createMappedNote(application);
    await application.itemManager.setItemDirty(note.uuid);
    expectedItemCount++;

    await application.syncService.sync(syncOptions);

    await application.changeAndSaveItem(
      note.uuid,
      (mutator) => {
        mutator.updated_at_timestamp = Factory.dateToMicroseconds(
          Factory.yesterday()
        );
      },
      undefined,
      undefined,
      syncOptions
    );

    expect(application.itemManager.items.length).toBe(expectedItemCount);
    await sharedFinalAssertions(application, expectedItemCount);
  });

  it('handles stale data in bulk', async function () {
    let { application, expectedItemCount } = await setupApplication();
    /** This number must be greater than the pagination limit per sync request.
     * For example if the limit per request is 150 items sent/received, this number should
     * be something like 160. */
    const largeItemCount = SyncUpDownLimit + 10;
    await Factory.createManyMappedNotes(application, largeItemCount);
    /** Upload */
    await application.syncService.sync(syncOptions);
    expectedItemCount += largeItemCount;
    const items = application.itemManager.items;
    expect(items.length).toBe(expectedItemCount);
    /**
     * We want to see what will happen if we upload everything we have to
     * the server as dirty, with no sync token, so that the server also
     * gives us everything it has.
     */
    const yesterday = Factory.yesterday();
    for (const note of application.itemManager.notes) {
      /** First modify the item without saving so that
       * our local contents digress from the server's */
      await application.itemManager.changeItem(note.uuid, (mutator) => {
        mutator.text = `1`;
      });
      await application.itemManager.changeItem(note.uuid, (mutator) => {
        mutator.text = `2`;
        mutator.updated_at_timestamp = Factory.dateToMicroseconds(yesterday);
      });
      // We expect all the notes to be duplicated.
      expectedItemCount++;
    }
    await application.syncService.clearSyncPositionTokens();
    await application.syncService.sync(syncOptions);
    expect(application.itemManager.notes.length).toBe(largeItemCount * 2);
    await sharedFinalAssertions(application, expectedItemCount);
  }, 60000);

  it('duplicating an item should maintian its relationships', async function () {
    let { application, expectedItemCount } = await setupApplication();
    const payload1 = Factory.createStorageItemPayload(
      ContentType.ServerExtension
    );
    const payload2 = Factory.createStorageItemPayload(ContentType.UserPrefs);
    expectedItemCount -= 1; /** auto-created user preferences  */
    await application.itemManager.emitItemsFromPayloads(
      [payload1, payload2],
      PayloadSource.LocalChanged
    );
    expectedItemCount += 2;
    let serverExt = application.itemManager.getItems(
      ContentType.ServerExtension
    )[0];
    let userPrefs = application.itemManager.getItems(
      ContentType.UserPrefs
    )[0];
    expect(serverExt).toBeTruthy();
    expect(userPrefs).toBeTruthy();

    serverExt = await application.itemManager.changeItem(
      serverExt.uuid,
      (mutator) => {
        mutator.addItemAsRelationship(userPrefs);
      }
    );

    await application.itemManager.setItemDirty(userPrefs.uuid);
    userPrefs = application.findItem(userPrefs.uuid);

    expect(
      application.itemManager.itemsReferencingItem(userPrefs.uuid).length
    ).toBe(1);
    expect(application.itemManager.itemsReferencingItem(userPrefs.uuid)).toEqual(expect.arrayContaining([serverExt]));

    await application.syncService.sync(syncOptions);
    expect(application.itemManager.items.length).toBe(expectedItemCount);

    serverExt = await application.itemManager.changeItem(
      serverExt.uuid,
      (mutator) => {
        mutator.content.title = `${Math.random()}`;
        mutator.updated_at_timestamp = Factory.dateToMicroseconds(
          Factory.yesterday()
        );
      }
    );
    await application.syncService.sync({ ...syncOptions, awaitAll: true });

    // fooItem should now be conflicted and a copy created
    expectedItemCount++;
    expect(application.itemManager.items.length).toBe(expectedItemCount);
    const rawPayloads = await application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).toBe(expectedItemCount);

    const fooItems = application.itemManager.getItems(
      ContentType.ServerExtension
    );
    const fooItem2 = fooItems[1];

    expect(fooItem2.content.conflict_of).toBe(serverExt.uuid);
    // Two items now link to this original object
    const referencingItems = application.itemManager.itemsReferencingItem(
      userPrefs.uuid
    );
    expect(referencingItems.length).toBe(2);
    expect(referencingItems[0]).not.toBe(referencingItems[1]);

    expect(
      application.itemManager.itemsReferencingItem(serverExt.uuid).length
    ).toBe(0);
    expect(
      application.itemManager.itemsReferencingItem(fooItem2.uuid).length
    ).toBe(0);

    expect(serverExt.content.references.length).toBe(1);
    expect(fooItem2.content.references.length).toBe(1);
    expect(userPrefs.content.references.length).toBe(0);

    expect(application.itemManager.getDirtyItems().length).toBe(0);
    for (const item of application.itemManager.items) {
      expect(item.dirty).toBeFalsy();
    }
    await sharedFinalAssertions(application, expectedItemCount);
  });

  it('when a note is conflicted, its tags should not be duplicated.', async function () {
    let { application, expectedItemCount } = await setupApplication();
    /**
     * If you have a note and a tag, and the tag has 1 reference to the note,
     * and you import the same two items, except modify the note value so that
     * a duplicate is created, we expect only the note to be duplicated,
     * and the tag not to.
     */
    let tag = await Factory.createMappedTag(application);
    let note = await Factory.createMappedNote(application);
    tag = await application.changeAndSaveItem(
      tag.uuid,
      (mutator) => {
        mutator.addItemAsRelationship(note);
      },
      undefined,
      undefined,
      syncOptions
    );
    await application.itemManager.setItemDirty(note.uuid);
    expectedItemCount += 2;

    await application.syncService.sync(syncOptions);

    // conflict the note
    const newText = `${Math.random()}`;
    /** First modify the item without saving so that
     * our local contents digress from the server's */
    await application.changeItem(note.uuid, (mutator) => {
      mutator.title = `${Math.random()}`;
    });
    note = await application.changeAndSaveItem(
      note.uuid,
      (mutator) => {
        mutator.updated_at_timestamp = Factory.dateToMicroseconds(
          Factory.yesterday()
        );
        mutator.text = newText;
      },
      undefined,
      undefined,
      syncOptions
    );

    // conflict the tag but keep its content the same
    tag = await application.changeAndSaveItem(
      tag.uuid,
      (mutator) => {
        mutator.updated_at_timestamp = Factory.dateToMicroseconds(
          Factory.yesterday()
        );
      },
      undefined,
      undefined,
      syncOptions
    );
    /**
     * We expect now that the total item count has went up by just 1 (the note),
     * and not 2 (the note and tag)
     */
    expectedItemCount += 1;
    expect(application.itemManager.items.length).toBe(expectedItemCount);
    expect(tag.content.references.length).toBe(2);
    await sharedFinalAssertions(application, expectedItemCount);
  });

  it('succesful server side saving but dropped packet response should not create sync conflict', async function () {
    let { application, expectedItemCount } = await setupApplication();
    /**
     * 1. Initiate a change locally that is successfully saved by the server, but the client
     * drops the server response.
     * 2. Make a change to this note locally that then syncs and the response is successfully recorded.
     *
     * Expected result: no sync conflict is created
     */
    const note = await Factory.createSyncedNote(application);
    expectedItemCount++;

    const baseTitle = 'base title';
    /** Change the note */
    const noteAfterChange = await application.itemManager.changeItem(
      note.uuid,
      (mutator) => {
        mutator.title = baseTitle;
      }
    );
    await application.sync();

    /** Simulate a dropped response by reverting the note back its post-change, pre-sync state */
    const retroNote = await application.itemManager.emitItemFromPayload(
      noteAfterChange.payload
    );
    expect(retroNote.serverUpdatedAt.getTime()).toBe(noteAfterChange.serverUpdatedAt.getTime());

    /** Change the item to its final title and sync */
    const finalTitle = 'final title';
    await application.itemManager.changeItem(note.uuid, (mutator) => {
      mutator.title = finalTitle;
    });
    await application.sync();

    /** Expect that no duplicates have been created, and that the note's title is now finalTitle */
    expect(application.itemManager.notes.length).toBe(1);
    const finalNote = application.findItem(note.uuid);
    expect(finalNote.title).toBe(finalTitle);
    await sharedFinalAssertions(application, expectedItemCount);
  });

  it('receiving a decrypted item while the current local item is errored and dirty should overwrite local value', async function () {
    let { application, expectedItemCount } = await setupApplication();
    /**
     * An item can be marked as dirty (perhaps via a bulk dirtying operation) even if it is errored,
     * but it can never be sent to the server if errored. If we retrieve an item from the server
     * that we're able to decrypt, and the current base value is errored and dirty, we don't want to
     * create a conflict, but instead just have the server value replace the client value.
     */
    /**
     * Create a note and sync it with the server while its valid
     */
    const note = await Factory.createSyncedNote(application);
    expectedItemCount++;

    /**
     * Mark the item as dirty and errored
     */
    const errorred = CreateMaxPayloadFromAnyObject(note.payload, {
      errorDecrypting: true,
      dirty: true,
    });
    await application.itemManager.emitItemsFromPayloads(
      [errorred],
      PayloadSource.LocalChanged
    );

    /**
     * Retrieve this note from the server by clearing sync token
     */
    await application.syncService.clearSyncPositionTokens();
    await application.syncService.sync({
      ...syncOptions,
      awaitAll: true,
    });

    /**
     * Expect that the final result is just 1 note that is not errored
     */
    const resultNote = application.findItem(note.uuid);
    expect(resultNote.errorDecrypting).toBeFalsy();
    expect(application.itemManager.notes.length).toBe(1);
    await sharedFinalAssertions(application, expectedItemCount);
  });

  it('registering for account with bulk offline data belonging to another account should be error-free', async function () {
    const { application } = await setupApplication();
    /**
     * When performing a multi-page sync request where we are uploading data imported from a backup,
     * if the first page of the sync request returns conflicted items keys, we rotate their UUID.
     * The second page of sync waiting to be sent up is still encrypted with the old items key UUID.
     * This causes a problem because when that second page is returned as conflicts, we will be looking
     * for an items_key_id that no longer exists (has been rotated). Rather than modifying the entire
     * sync paradigm to allow multi-page requests to consider side-effects of each page, we will instead
     * take the approach of making sure the decryption function is liberal with regards to searching
     * for the right items key. It will now consider (as a result of this test) an items key as being
     * the correct key to decrypt an item if the itemskey.uuid == item.items_key_id OR if the itemsKey.duplicateOf
     * value is equal to item.items_key_id.
     */

    /** Create bulk data belonging to another account and sync */
    const largeItemCount = SyncUpDownLimit + 10;
    await Factory.createManyMappedNotes(application, largeItemCount);
    await application.syncService.sync(syncOptions);
    const priorData = application.itemManager.items;

    /** Register new account and import this same data */
    const newApp = await Factory.signOutApplicationAndReturnNew(
      application
    );
    await Factory.registerUserToApplication({
      application: newApp,
      email: await Factory.generateUuid(),
      password: await Factory.generateUuid(),
    });
    await newApp.itemManager.emitItemsFromPayloads(
      priorData.map((i) => i.payload)
    );
    await newApp.syncService.markAllItemsAsNeedingSync();
    await newApp.syncService.sync(syncOptions);
    expect(newApp.itemManager.invalidItems.length).toBe(0);
    newApp.deinit();
  }, 60000);

  it('importing data belonging to another account should not result in duplication', async function () {
    const { application, password } = await setupApplication();
    /** Create primary account and export data */
    await Factory.createSyncedNoteWithTag(application);
    let backupFile = await application.createBackupFile(
      EncryptionIntent.FileEncrypted
    );
    /** Sort matters, and is the cause of the original issue, where tag comes before the note */
    backupFile.items = [
      backupFile.items.find((i) => i.content_type === ContentType.ItemsKey),
      backupFile.items.find((i) => i.content_type === ContentType.Tag),
      backupFile.items.find((i) => i.content_type === ContentType.Note),
    ];
    backupFile = JSON.parse(JSON.stringify(backupFile));
    /** Register new account and import this same data */
    const newApp = await Factory.signOutApplicationAndReturnNew(
      application
    );
    await Factory.registerUserToApplication({
      application: newApp,
      email: await Factory.generateUuid(),
      password: password,
    });
    Factory.handlePasswordChallenges(newApp, password);
    await newApp.importData(backupFile, true);
    expect(newApp.itemManager.tags.length).toBe(1);
    expect(newApp.itemManager.notes.length).toBe(1);
    newApp.deinit();
  }, 10000);

  it('importing notes + tags belonging to another account should keep correct associations', async function () {
    const { application, password } = await setupApplication();
    /**
     * The original issue can be replicated when an export contains a tag with two notes,
     * where the two notes are first listed in the backup, then the tag.
     */
    /** Create primary account and export data */
    await Factory.createSyncedNoteWithTag(application);
    const tag = application.itemManager.tags[0];
    const note2 = await Factory.createMappedNote(application);
    await application.changeAndSaveItem(tag.uuid, (mutator) => {
      mutator.addItemAsRelationship(note2);
    });
    let backupFile = await application.createBackupFile(
      EncryptionIntent.FileEncrypted
    );
    backupFile.items = [
      backupFile.items.find((i) => i.content_type === ContentType.ItemsKey),
      backupFile.items.filter((i) => i.content_type === ContentType.Note)[0],
      backupFile.items.filter((i) => i.content_type === ContentType.Note)[1],
      backupFile.items.find((i) => i.content_type === ContentType.Tag),
    ];
    backupFile = JSON.parse(JSON.stringify(backupFile));
    /** Register new account and import this same data */
    const newApp = await Factory.signOutApplicationAndReturnNew(
      application
    );
    await Factory.registerUserToApplication({
      application: newApp,
      email: await Factory.generateUuid(),
      password: password,
    });
    Factory.handlePasswordChallenges(newApp, password);
    await newApp.importData(backupFile, true);
    const newTag = newApp.itemManager.tags[0];
    const notes = newApp.referencesForItem(newTag);
    expect(notes.length).toBe(2);
    newApp.deinit();
  }, 10000);

  it('server should prioritize updated_at_timestamp over updated_at for sync, if provided', async function () {
    let { application, expectedItemCount } = await setupApplication();
    /**
     * As part of SSRB to SSJS migration, server should prefer to use updated_at_timestamp
     * over updated_at for sync conflict logic. The timestamps are more accurate and support
     * microsecond precision, versus date objects which only go up to milliseconds.
     */
    const note = await Factory.createSyncedNote(application);
    expectedItemCount++;

    /** First modify the item without saving so that
     * our local contents digress from the server's */
    await application.changeItem(note.uuid, (mutator) => {
      mutator.title = `${Math.random()}`;
    });
    /**
     * Create a modified payload that has updated_at set to old value, but updated_at_timestamp
     * set to new value. Then send to server. If the server conflicts, it means it's incorrectly ignoring
     * updated_at_timestamp and looking at updated_at.
     */
    const modified = CopyPayload(note.payload, {
      updated_at: new Date(0),
      content: {
        ...note.content,
        title: Math.random(),
      },
      dirty: true,
    });
    await application.itemManager.emitItemFromPayload(modified);
    await application.sync();
    expect(application.itemManager.notes.length).toBe(1);
    await sharedFinalAssertions(application, expectedItemCount);
  });

  it('conflict should be created if updated_at_timestamp is not exactly equal to servers', async function () {
    let { application, expectedItemCount } = await setupApplication();
    const note = await Factory.createSyncedNote(application);
    expectedItemCount++;

    /** First modify the item without saving so that
     * our local contents digress from the server's */
    await application.changeItem(note.uuid, (mutator) => {
      mutator.title = `${Math.random()}`;
    });
    const modified = CopyPayload(note.payload, {
      updated_at_timestamp: note.payload.updated_at_timestamp - 1,
      content: {
        ...note.content,
        title: Math.random(),
      },
      dirty: true,
    });
    expectedItemCount++;
    await application.itemManager.emitItemFromPayload(modified);
    await application.sync();
    expect(application.itemManager.notes.length).toBe(2);
    await sharedFinalAssertions(application, expectedItemCount);
  });
});
