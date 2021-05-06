/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('notes + tags syncing', async function () {
  const syncOptions = {
    checkIntegrity: true,
    awaitAll: true,
  };

  after(async function () {
    localStorage.clear();
  });

  beforeEach(async function () {
    this.application = await Factory.createInitAppWithRandNamespace();
    const email = Uuid.GenerateUuidSynchronously();
    const password = Uuid.GenerateUuidSynchronously();
    await Factory.registerUserToApplication({
      application: this.application,
      email,
      password,
    });
  });

  afterEach(async function () {
    await this.application.deinit();
  });

  it('syncing an item then downloading it should include items_key_id', async function () {
    const note = await Factory.createMappedNote(this.application);
    await this.application.itemManager.setItemDirty(note.uuid);
    await this.application.syncService.sync(syncOptions);
    await this.application.payloadManager.resetState();
    await this.application.itemManager.resetState();
    await this.application.syncService.clearSyncPositionTokens();
    await this.application.syncService.sync(syncOptions);
    const downloadedNote = this.application.itemManager.notes[0];
    expect(downloadedNote.items_key_id).to.not.be.ok;
    // Allow time for waitingForKey
    await Factory.sleep(0.1);
    expect(downloadedNote.title).to.be.ok;
    expect(downloadedNote.content.text).to.be.ok;
  });

  it('syncing a note many times does not cause duplication', async function () {
    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];

    await this.application.itemManager.emitItemsFromPayloads(
      [notePayload, tagPayload],
      PayloadSource.LocalChanged
    );
    const note = this.application.itemManager.getItems([ContentType.Note])[0];
    const tag = this.application.itemManager.getItems([ContentType.Tag])[0];
    expect(this.application.itemManager.notes.length).to.equal(1);
    expect(this.application.itemManager.tags.length).to.equal(1);

    for (let i = 0; i < 9; i++) {
      await this.application.itemManager.setItemsDirty([note.uuid, tag.uuid]);
      await this.application.syncService.sync(syncOptions);
      this.application.syncService.clearSyncPositionTokens();
      expect(tag.content.references.length).to.equal(1);
      expect(
        this.application.itemManager.itemsReferencingItem(note.uuid).length
      ).to.equal(1);
      expect(tag.noteCount).to.equal(1);
      expect(this.application.itemManager.notes.length).to.equal(1);
      expect(this.application.itemManager.tags.length).to.equal(1);
      console.warn('Waiting 0.1s...');
      await Factory.sleep(0.1);
    }
  }).timeout(20000);

  it('handles signing in and merging data', async function () {
    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];
    await this.application.itemManager.emitItemsFromPayloads(
      [notePayload, tagPayload],
      PayloadSource.LocalChanged
    );
    const originalNote = this.application.itemManager.notes[0];
    const originalTag = this.application.itemManager.tags[0];
    await this.application.itemManager.setItemsDirty([
      originalNote.uuid,
      originalTag.uuid,
    ]);

    await this.application.syncService.sync(syncOptions);

    expect(originalTag.content.references.length).to.equal(1);
    expect(originalTag.noteCount).to.equal(1);
    expect(
      this.application.itemManager.itemsReferencingItem(originalNote.uuid)
        .length
    ).to.equal(1);

    // when signing in, all local items are cleared from storage (but kept in memory; to clear desktop logs),
    // then resaved with alternated uuids.
    await this.application.storageService.clearAllPayloads();
    await this.application.syncService.markAllItemsAsNeedingSync();

    expect(this.application.itemManager.notes.length).to.equal(1);
    expect(this.application.itemManager.tags.length).to.equal(1);

    const note = this.application.itemManager.notes[0];
    const tag = this.application.itemManager.tags[0];

    expect(tag.content.references.length).to.equal(1);
    expect(note.content.references.length).to.equal(0);

    expect(tag.noteCount).to.equal(1);
    expect(
      this.application.itemManager.itemsReferencingItem(note.uuid).length
    ).to.equal(1);
  });

  it('duplicating a tag should maintian its relationships', async function () {
    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];
    await this.application.itemManager.emitItemsFromPayloads(
      [notePayload, tagPayload],
      PayloadSource.LocalChanged
    );
    let note = this.application.itemManager.notes[0];
    let tag = this.application.itemManager.tags[0];
    expect(
      this.application.itemManager.itemsReferencingItem(note.uuid).length
    ).to.equal(1);

    await this.application.itemManager.setItemsDirty([note.uuid, tag.uuid]);
    await this.application.syncService.sync(syncOptions);
    await this.application.syncService.clearSyncPositionTokens();

    note = this.application.itemManager.findItem(note.uuid);
    tag = this.application.itemManager.findItem(tag.uuid);

    expect(note.dirty).to.equal(false);
    expect(tag.dirty).to.equal(false);

    expect(this.application.itemManager.notes.length).to.equal(1);
    expect(this.application.itemManager.tags.length).to.equal(1);

    tag = await this.application.changeAndSaveItem(
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
    expect(this.application.itemManager.notes.length).to.equal(1);
    expect(this.application.itemManager.tags.length).to.equal(2);

    const tags = this.application.itemManager.tags;
    const conflictedTag = tags.find((tag) => {
      return !!tag.content.conflict_of;
    });
    const originalTag = tags.find((tag) => {
      return tag !== conflictedTag;
    });

    expect(conflictedTag.uuid).to.not.equal(originalTag.uuid);

    expect(originalTag.uuid).to.equal(tag.uuid);
    expect(conflictedTag.content.conflict_of).to.equal(originalTag.uuid);
    expect(conflictedTag.noteCount).to.equal(originalTag.noteCount);

    expect(
      this.application.itemManager.itemsReferencingItem(conflictedTag.uuid)
        .length
    ).to.equal(0);
    expect(
      this.application.itemManager.itemsReferencingItem(originalTag.uuid).length
    ).to.equal(0);

    // Two tags now link to this note
    const referencingItems = this.application.itemManager.itemsReferencingItem(
      note.uuid
    );
    expect(referencingItems.length).to.equal(2);
    expect(referencingItems[0]).to.not.equal(referencingItems[1]);
  }).timeout(10000);
});
