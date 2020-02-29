/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import './../vendor/chai-as-promised-built.js';
import Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("notes + tags syncing", async function() {
  const sharedApplication = Factory.createApplication();
  before(async function() {
    await Factory.initializeApplication(sharedApplication);
  });

  after(async function () {
    localStorage.clear();
    await sharedApplication.deinit();
  });

  beforeEach(async function() {
    this.application = await Factory.createInitAppWithRandNamespace();
    const email = Uuid.GenerateUuidSynchronously();
    const password = Uuid.GenerateUuidSynchronously();
    await Factory.registerUserToApplication({application: this.application, email, password});
  });

  afterEach(async function () {
    await this.application.deinit();
  });

  it('syncing an item then downloading it should include items_key_id', async function() {
    const note = await Factory.createMappedNote(this.application);
    await this.application.modelManager.setItemDirty(note);
    await this.application.syncService.sync();
    await this.application.modelManager.resetState();
    await this.application.syncService.clearSyncPositionTokens();
    await this.application.syncService.sync();
    const downloadedNote = this.application.modelManager.notes[0];
    expect(downloadedNote.items_key_id).to.be.ok;
    // Allow time for waitingForKey
    await Factory.sleep(0.1);
    expect(downloadedNote.content.text).to.be.ok;
  });

  it('syncing a note many times does not cause duplication', async function() {
    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];

    await this.application.modelManager.mapPayloadsToLocalItems({payloads: [notePayload, tagPayload]});
    const note = this.application.modelManager.getItems(["Note"])[0];
    const tag = this.application.modelManager.getItems(["Tag"])[0];
    expect(this.application.modelManager.notes.length).to.equal(1);
    expect(this.application.modelManager.tags.length).to.equal(1);

    for(let i = 0; i < 9; i++) {
      await this.application.modelManager.setItemsDirty([note, tag]);
      await this.application.syncService.sync();
      this.application.syncService.clearSyncPositionTokens();
      expect(tag.content.references.length).to.equal(1);
      expect(note.tags.length).to.equal(1);
      expect(tag.notes.length).to.equal(1);
      expect(this.application.modelManager.notes.length).to.equal(1);
      expect(this.application.modelManager.tags.length).to.equal(1);
      console.warn("Waiting 0.1s...");
      await Factory.sleep(0.1);
    }
  }).timeout(20000);

  it("handles signing in and merging data", async function() {
    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];
    await this.application.modelManager.mapPayloadsToLocalItems({
      payloads: [notePayload, tagPayload]
    });
    const originalNote = this.application.modelManager.notes[0];
    const originalTag = this.application.modelManager.tags[0];
    await this.application.modelManager.setItemsDirty([originalNote, originalTag]);

    await this.application.syncService.sync();

    expect(originalTag.content.references.length).to.equal(1);
    expect(originalTag.notes.length).to.equal(1);
    expect(originalNote.tags.length).to.equal(1);

    // when signing in, all local items are cleared from storage (but kept in memory; to clear desktop logs),
    // then resaved with alternated uuids.
    await this.application.storageService.clearAllPayloads();
    await this.application.syncService.markAllItemsAsNeedingSync({
      alternateUuids: true
    })

    expect(this.application.modelManager.notes.length).to.equal(1);
    expect(this.application.modelManager.tags.length).to.equal(1);

    const note = this.application.modelManager.notes[0];
    const tag = this.application.modelManager.tags[0];
    expect(note.uuid).to.not.equal(originalNote.uuid);
    expect(tag.uuid).to.not.equal(originalTag.uuid);

    expect(tag.content.references.length).to.equal(1);
    expect(note.content.references.length).to.equal(0);

    expect(note.referencingItemsCount).to.equal(1);
    expect(tag.notes.length).to.equal(1);
    expect(note.tags.length).to.equal(1);
  })

  it('duplicating a tag should maintian its relationships', async function() {
    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];

    await this.application.modelManager.mapPayloadsToLocalItems({
      payloads: [notePayload, tagPayload]
    });
    const note = this.application.modelManager.notes[0];
    const tag = this.application.modelManager.tags[0];
    expect(note.referencingItemsCount).to.equal(1);

    await this.application.modelManager.setItemsDirty([note, tag]);
    await this.application.syncService.sync();
    await this.application.syncService.clearSyncPositionTokens();

    expect(note.dirty).to.equal(false);
    expect(tag.dirty).to.equal(false);

    expect(this.application.modelManager.notes.length).to.equal(1);
    expect(this.application.modelManager.tags.length).to.equal(1);

    tag.title = `${Math.random()}`
    tag.updated_at = Factory.yesterday();
    await this.application.saveItem({item: tag});

    // tag should now be conflicted and a copy created
    expect(this.application.modelManager.notes.length).to.equal(1);
    expect(this.application.modelManager.tags.length).to.equal(2);
    const tags = this.application.modelManager.tags;
    const tag1 = tags[0];
    const tag2 = tags[1];

    expect(tag1.uuid).to.not.equal(tag2.uuid);

    expect(tag1.uuid).to.equal(tag.uuid);
    expect(tag2.content.conflict_of).to.equal(tag1.uuid);
    expect(tag1.notes.length).to.equal(tag2.notes.length);
    expect(tag1.referencingItemsCount).to.equal(0);
    expect(tag2.referencingItemsCount).to.equal(0);

    // Two tags now link to this note
    expect(note.referencingItemsCount).to.equal(2);
    expect(note.allReferencingItems[0]).to.not.equal(note.allReferencingItems[1]);
  }).timeout(10000);
})
