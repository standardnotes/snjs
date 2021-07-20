import { PayloadSource } from '@Lib/index';
import { ContentType } from '@Lib/models';
import { Uuid } from '@Lib/uuid';
import * as Factory from '../../factory';

describe.skip('notes + tags syncing', function () {
  const syncOptions = {
    checkIntegrity: true,
    awaitAll: true,
  };

  let application;

  beforeEach(async function () {
    application = await Factory.createInitAppWithRandNamespace();
    const email = Uuid.GenerateUuidSynchronously();
    const password = Uuid.GenerateUuidSynchronously();
    await Factory.registerUserToApplication({
      application: application,
      email,
      password,
    });
  });

  afterEach(async function () {
    await application.deinit();
  });

  it('syncing an item then downloading it should include items_key_id', async function () {
    const note = await Factory.createMappedNote(application);
    await application.itemManager.setItemDirty(note.uuid);
    await application.syncService.sync(syncOptions);
    await application.payloadManager.resetState();
    await application.itemManager.resetState();
    await application.syncService.clearSyncPositionTokens();
    await application.syncService.sync(syncOptions);
    const downloadedNote = application.itemManager.notes[0];
    expect(downloadedNote.items_key_id).toBeFalsy();
    // Allow time for waitingForKey
    await Factory.sleep(0.1);
    expect(downloadedNote.title).toBeTruthy();
    expect(downloadedNote.content.text).toBeTruthy();
  });

  it('syncing a note many times does not cause duplication', async function () {
    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];

    await application.itemManager.emitItemsFromPayloads(
      [notePayload, tagPayload],
      PayloadSource.LocalChanged
    );
    const note = application.itemManager.getItems([ContentType.Note])[0];
    const tag = application.itemManager.getItems([ContentType.Tag])[0];
    expect(application.itemManager.notes.length).toBe(1);
    expect(application.itemManager.tags.length).toBe(1);

    for (let i = 0; i < 9; i++) {
      await application.itemManager.setItemsDirty([note.uuid, tag.uuid]);
      await application.syncService.sync(syncOptions);
      application.syncService.clearSyncPositionTokens();
      expect(tag.content.references.length).toBe(1);
      expect(
        application.itemManager.itemsReferencingItem(note.uuid).length
      ).toBe(1);
      expect(tag.noteCount).toBe(1);
      expect(application.itemManager.notes.length).toBe(1);
      expect(application.itemManager.tags.length).toBe(1);
      console.warn('Waiting 0.1s...');
      await Factory.sleep(0.1);
    }
  }, 20000);

  it('handles signing in and merging data', async function () {
    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];
    await application.itemManager.emitItemsFromPayloads(
      [notePayload, tagPayload],
      PayloadSource.LocalChanged
    );
    const originalNote = application.itemManager.notes[0];
    const originalTag = application.itemManager.tags[0];
    await application.itemManager.setItemsDirty([
      originalNote.uuid,
      originalTag.uuid,
    ]);

    await application.syncService.sync(syncOptions);

    expect(originalTag.content.references.length).toBe(1);
    expect(originalTag.noteCount).toBe(1);
    expect(
      application.itemManager.itemsReferencingItem(originalNote.uuid)
        .length
    ).toBe(1);

    // when signing in, all local items are cleared from storage (but kept in memory; to clear desktop logs),
    // then resaved with alternated uuids.
    await application.storageService.clearAllPayloads();
    await application.syncService.markAllItemsAsNeedingSync();

    expect(application.itemManager.notes.length).toBe(1);
    expect(application.itemManager.tags.length).toBe(1);

    const note = application.itemManager.notes[0];
    const tag = application.itemManager.tags[0];

    expect(tag.content.references.length).toBe(1);
    expect(note.content.references.length).toBe(0);

    expect(tag.noteCount).toBe(1);
    expect(
      application.itemManager.itemsReferencingItem(note.uuid).length
    ).toBe(1);
  });

  it('duplicating a tag should maintian its relationships', async function () {
    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];
    await application.itemManager.emitItemsFromPayloads(
      [notePayload, tagPayload],
      PayloadSource.LocalChanged
    );
    let note = application.itemManager.notes[0];
    let tag = application.itemManager.tags[0];
    expect(
      application.itemManager.itemsReferencingItem(note.uuid).length
    ).toBe(1);

    await application.itemManager.setItemsDirty([note.uuid, tag.uuid]);
    await application.syncService.sync(syncOptions);
    await application.syncService.clearSyncPositionTokens();

    note = application.itemManager.findItem(note.uuid);
    tag = application.itemManager.findItem(tag.uuid);

    expect(note.dirty).toBe(false);
    expect(tag.dirty).toBe(false);

    expect(application.itemManager.notes.length).toBe(1);
    expect(application.itemManager.tags.length).toBe(1);

    tag = await application.changeAndSaveItem(
      tag.uuid,
      (mutator) => {
        mutator.title = `${Math.random()}`;
        mutator.updated_at_timestamp = Factory.dateToMicroseconds(Factory.yesterday());
      },
      undefined,
      undefined,
      syncOptions
    );

    // tag should now be conflicted and a copy created
    expect(application.itemManager.notes.length).toBe(1);
    expect(application.itemManager.tags.length).toBe(2);

    const tags = application.itemManager.tags;
    const conflictedTag = tags.find((tag) => {
      return !!tag.content.conflict_of;
    });
    const originalTag = tags.find((tag) => {
      return tag !== conflictedTag;
    });

    expect(conflictedTag.uuid).not.toBe(originalTag.uuid);

    expect(originalTag.uuid).toBe(tag.uuid);
    expect(conflictedTag.content.conflict_of).toBe(originalTag.uuid);
    expect(conflictedTag.noteCount).toBe(originalTag.noteCount);

    expect(
      application.itemManager.itemsReferencingItem(conflictedTag.uuid)
        .length
    ).toBe(0);
    expect(
      application.itemManager.itemsReferencingItem(originalTag.uuid).length
    ).toBe(0);

    // Two tags now link to this note
    const referencingItems = application.itemManager.itemsReferencingItem(
      note.uuid
    );
    expect(referencingItems.length).toBe(2);
    expect(referencingItems[0]).not.toBe(referencingItems[1]);
  }, 10000);
});
