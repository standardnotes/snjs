import '../../node_modules/regenerator-runtime/runtime.js';
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import './../vendor/chai-as-promised-built.js';
import Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
var expect = chai.expect;


describe.only("notes + tags syncing", async function() {
  const sharedApplication = Factory.createApplication();
  before(async function() {
    await Factory.initializeApplication(sharedApplication);
  });

  let totalItemCount = 0;

  beforeEach(async function() {
    this.application = await Factory.createInitAppWithRandNamespace();
    const email = SFItem.GenerateUuidSynchronously();
    const password = SFItem.GenerateUuidSynchronously();
    await Factory.registerUserToApplication({application: this.application, email, password});
  })

  it.only('syncing a note many times does not cause duplication', async function() {
    let pair = Factory.createRelatedNoteTagPairParams();
    let noteParams = pair[0];
    let tagParams = pair[1];

    this.application.modelManager.mapResponseItemsToLocalModels([noteParams, tagParams]);
    let note = this.application.modelManager.allItemsMatchingTypes(["Note"])[0];
    let tag = this.application.modelManager.allItemsMatchingTypes(["Tag"])[0];

    for(let i = 0; i < 9; i++) {
      note.setDirty(true);
      tag.setDirty(true);
      await this.application.syncManager.sync();
      this.application.syncManager.clearSyncToken();
      expect(tag.content.references.length).to.equal(1);
      expect(note.tags.length).to.equal(1);
      expect(tag.notes.length).to.equal(1);
      expect(this.application.modelManager.allItems.length).to.equal(2);
      console.log("Waiting 1.1s...");
      Factory.sleep(1.1);
    }
  }).timeout(20000);

  it("handles signing in and merging data", async function() {
    let pair = Factory.createRelatedNoteTagPairParams();
    let noteParams = pair[0];
    let tagParams = pair[1];

    this.application.modelManager.mapResponseItemsToLocalModels([noteParams, tagParams]);
    let originalNote = this.application.modelManager.allItemsMatchingTypes(["Note"])[0];
    let originalTag = this.application.modelManager.allItemsMatchingTypes(["Tag"])[0];
    originalNote.setDirty(true);
    originalTag.setDirty(true);

    await this.application.syncManager.sync();

    expect(originalTag.content.references.length).to.equal(1);
    expect(originalTag.notes.length).to.equal(1);
    expect(originalNote.tags.length).to.equal(1);

    // when signing in, all local items are cleared from storage (but kept in memory; to clear desktop logs),
    // then resaved with alternated uuids.
    await this.application.storageManager.clearAllModels();
    await this.application.syncManager.markAllItemsDirtyAndSaveOffline(true)

    let note = this.application.modelManager.allItemsMatchingTypes(["Note"])[0];
    let tag = this.application.modelManager.allItemsMatchingTypes(["Tag"])[0];

    expect(this.application.modelManager.allItems.length).to.equal(2);

    expect(note.uuid).to.not.equal(originalNote.uuid);
    expect(tag.uuid).to.not.equal(originalTag.uuid);

    expect(tag.content.references.length).to.equal(1);
    expect(note.content.references.length).to.equal(0);

    expect(note.referencingObjects.length).to.equal(1);
    expect(tag.notes.length).to.equal(1);
    expect(note.tags.length).to.equal(1);
  })

  it('duplicating a tag should maintian its relationships', async function() {
    await this.application.syncManager.loadLocalItems();
    this.application.modelManager.handleSignout();
    let pair = Factory.createRelatedNoteTagPairParams();
    let noteParams = pair[0];
    let tagParams = pair[1];

    this.application.modelManager.mapResponseItemsToLocalModels([noteParams, tagParams]);
    let note = this.application.modelManager.allItemsMatchingTypes(["Note"])[0];
    let tag = this.application.modelManager.allItemsMatchingTypes(["Tag"])[0];

    note.setDirty(true);
    tag.setDirty(true);

    await this.application.syncManager.sync();
    await this.application.syncManager.clearSyncToken();

    expect(this.application.modelManager.allItems.length).to.equal(2);

    tag.title = `${Math.random()}`
    tag.updated_at = Factory.yesterday();
    tag.setDirty(true);

    expect(note.referencingObjects.length).to.equal(1);

    // wait about 1s, which is the value the dev server will ignore conflicting changes
    await Factory.sleep(1.1);

    await this.application.syncManager.sync();

    // tag should now be conflicted and a copy created
    let models = this.application.modelManager.allItems;
    expect(this.application.modelManager.allItems.length).to.equal(3);
    var tags = this.application.modelManager.allItemsMatchingTypes(["Tag"]);
    var tag1 = tags[0];
    var tag2 = tags[1];

    expect(tag1.uuid).to.not.equal(tag2.uuid);

    expect(tag1.uuid).to.equal(tag.uuid);
    expect(tag2.content.conflict_of).to.equal(tag1.uuid);
    expect(tag1.notes.length).to.equal(tag2.notes.length);
    expect(tag1.referencingObjects.length).to.equal(0);
    expect(tag2.referencingObjects.length).to.equal(0);

    // Two tags now link to this note
    expect(note.referencingObjects.length).to.equal(2);
    expect(note.referencingObjects[0]).to.not.equal(note.referencingObjects[1]);
  }).timeout(10000);
})
