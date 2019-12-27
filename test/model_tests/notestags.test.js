import '../../node_modules/regenerator-runtime/runtime.js';
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import './../vendor/chai-as-promised-built.js';
import Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
var expect = chai.expect;

describe("notes and tags", () => {

  const createModelManager = async () => {
    const isolatedApplication = await Factory.createInitAppWithRandNamespace();
    return isolatedApplication.modelManager;
  }

  it('uses proper class for note', async function() {
    let modelManager = await createModelManager();
    let noteParams = Factory.createNoteParams();
    modelManager.mapResponseItemsToLocalModels([noteParams]);
    let note = modelManager.allItemsMatchingTypes(["Note"])[0];
    expect(note.constructor === SNNote).to.equal(true);
  });

  it('properly constructs syncing params', async function() {
    let note = new SNNote();
    let title = "Foo", text = "Bar";
    note.title = title;
    note.text = text;

    let content = note.createContentJSONFromProperties();
    expect(content.title).to.equal(title);
    expect(content.text).to.equal(text);

    let tag = new SNTag();
    tag.title = title;

    expect(tag.createContentJSONFromProperties().title).to.equal(title);

    expect(tag.structureParams().title).to.equal(tag.getContentCopy().title);
  })

  it('properly handles legacy relationships', async () => {
    // legacy relationships are when a note has a reference to a tag
    let modelManager = await createModelManager();
    let pair = Factory.createRelatedNoteTagPairParams();
    let noteParams = pair[0];
    let tagParams = pair[1];
    tagParams.content.references = null;
    noteParams.content.references = [
      {
        uuid: tagParams.uuid,
        content_type: tagParams.content_type
      }
    ];

    modelManager.mapResponseItemsToLocalModels([noteParams, tagParams]);
    let note = modelManager.allItemsMatchingTypes(["Note"])[0];
    let tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    expect(note.tags.length).to.equal(1);
    expect(tag.notes.length).to.equal(1);
  })

  it('creates two-way relationship between note and tag', async () => {
    let modelManager = await createModelManager();

    let pair = Factory.createRelatedNoteTagPairParams();
    let noteParams = pair[0];
    let tagParams = pair[1];

    expect(noteParams.content.references.length).to.equal(0);
    expect(tagParams.content.references.length).to.equal(1);

    modelManager.mapResponseItemsToLocalModels([noteParams, tagParams]);
    let note = modelManager.allItemsMatchingTypes(["Note"])[0];
    let tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    // expect to be false
    expect(note.dirty).to.not.be.ok;
    expect(tag.dirty).to.not.be.ok;

    expect(note.content.references.length).to.equal(0);
    expect(tag.content.references.length).to.equal(1);

    expect(note.hasRelationshipWithItem(tag)).to.equal(false);
    expect(tag.hasRelationshipWithItem(note)).to.equal(true);

    expect(note.tags.length).to.equal(1);
    expect(tag.notes.length).to.equal(1);

    modelManager.setItemToBeDeleted(note);
    expect(note.tags.length).to.equal(0);
    expect(tag.notes.length).to.equal(0);

    // expect to be true
    expect(note.dirty).to.be.ok;
    expect(tag.dirty).to.be.ok;
  });

  it('handles remote deletion of relationship', async () => {
    let modelManager = await createModelManager();

    let pair = Factory.createRelatedNoteTagPairParams();
    let noteParams = pair[0];
    let tagParams = pair[1];

    modelManager.mapResponseItemsToLocalModels([noteParams, tagParams]);
    let note = modelManager.allItemsMatchingTypes(["Note"])[0];
    let tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    expect(note.content.references.length).to.equal(0);
    expect(tag.content.references.length).to.equal(1);

    tagParams.content.references = [];
    modelManager.mapResponseItemsToLocalModels([tagParams]);

    expect(tag.content.references.length).to.equal(0);
    expect(note.tags.length).to.equal(0);
    expect(tag.notes.length).to.equal(0);

    // expect to be false
    expect(note.dirty).to.not.be.ok;
    expect(tag.dirty).to.not.be.ok;
  });

  it('resets cached note tags string when tag is deleted from remote source', async () => {
    let modelManager = await createModelManager();

    let pair = Factory.createRelatedNoteTagPairParams();
    let noteParams = pair[0];
    let tagParams = pair[1];

    modelManager.mapResponseItemsToLocalModels([noteParams, tagParams]);
    let note = modelManager.allItemsMatchingTypes(["Note"])[0];
    let tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    expect(note.tagsString().length).to.not.equal(0);

    tagParams.deleted = true;
    modelManager.mapResponseItemsToLocalModels([tagParams]);

    // should be null
    expect(note.savedTagsString).to.not.be.ok;

    expect(note.tags.length).to.equal(0);
    expect(tag.notes.length).to.equal(0);
  });

  it('resets cached note tags string when tag reference is removed from remote source', async () => {
    let modelManager = await createModelManager();

    let pair = Factory.createRelatedNoteTagPairParams();
    let noteParams = pair[0];
    let tagParams = pair[1];

    modelManager.mapResponseItemsToLocalModels([noteParams, tagParams]);
    let note = modelManager.allItemsMatchingTypes(["Note"])[0];
    let tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    expect(note.tagsString().length).to.not.equal(0);

    tagParams.content.references = [];
    modelManager.mapResponseItemsToLocalModels([tagParams]);

    // should be null
    expect(note.savedTagsString).to.not.be.ok;

    expect(note.tags.length).to.equal(0);
    expect(tag.notes.length).to.equal(0);
  });

  it('resets cached note tags string when tag is renamed', async () => {
    let modelManager = await createModelManager();

    let pair = Factory.createRelatedNoteTagPairParams();
    let noteParams = pair[0];
    let tagParams = pair[1];

    modelManager.mapResponseItemsToLocalModels([noteParams, tagParams]);
    let note = modelManager.allItemsMatchingTypes(["Note"])[0];
    let tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    expect(note.tagsString()).to.equal(`#${tagParams.content.title}`);

    var title = Math.random();

    // Saving involves modifying local state first, then syncing with omitting content.
    tag.title = title;
    tagParams.content.title = title;
    // simulate a save, which omits `content`
    modelManager.mapResponseItemsToLocalModelsOmittingFields([tagParams], ['content']);

    // should be null
    expect(note.savedTagsString).to.not.be.ok;
    expect(note.tagsString()).to.equal(`#${title}`);
  });

  it('handles removing relationship between note and tag', async () => {
    let modelManager = await createModelManager();

    let pair = Factory.createRelatedNoteTagPairParams();
    let noteParams = pair[0];
    let tagParams = pair[1];

    modelManager.mapResponseItemsToLocalModels([noteParams, tagParams]);
    let note = modelManager.allItemsMatchingTypes(["Note"])[0];
    let tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    expect(note.content.references.length).to.equal(0);
    expect(tag.content.references.length).to.equal(1);

    tag.removeItemAsRelationship(note);
    modelManager.mapResponseItemsToLocalModels([tag]);

    expect(note.tags.length).to.equal(0);
    expect(tag.notes.length).to.equal(0);
  });

  it('properly handles tag duplication', async () => {
    let modelManager = await createModelManager();

    let pair = Factory.createRelatedNoteTagPairParams();
    let noteParams = pair[0];
    let tagParams = pair[1];

    modelManager.mapResponseItemsToLocalModels([noteParams, tagParams]);
    let note = modelManager.allItemsMatchingTypes(["Note"])[0];
    let tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    var duplicateTag = await modelManager.duplicateItemAndAddAsConflict(tag);

    expect(tag.uuid).to.not.equal(duplicateTag.uuid);

    expect(tag.content.references.length).to.equal(1);
    expect(tag.notes.length).to.equal(1);

    expect(duplicateTag.content.references.length).to.equal(1);
    expect(duplicateTag.notes.length).to.equal(1);

    expect(note.tags.length).to.equal(2);

    var noteTag1 = note.tags[0];
    var noteTag2 = note.tags[1];
    expect(noteTag1.uuid).to.not.equal(noteTag2.uuid);

    // expect to be false
    expect(note.dirty).to.not.be.ok;
    expect(tag.dirty).to.not.be.ok;
  });

  it('duplicating a note should maintain its tag references', async () => {
    let modelManager = await createModelManager();

    let pair = Factory.createRelatedNoteTagPairParams();
    let noteParams = pair[0];
    let tagParams = pair[1];

    modelManager.mapResponseItemsToLocalModels([noteParams, tagParams]);
    let note = modelManager.allItemsMatchingTypes(["Note"])[0];
    let tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    var duplicateNote = await modelManager.duplicateItemAndAddAsConflict(note);

    expect(note.uuid).to.not.equal(duplicateNote.uuid);
    expect(duplicateNote.tags.length).to.equal(note.tags.length);
  });

  it('deleting a note should update tag references', async () => {
    let modelManager = await createModelManager();

    let pair = Factory.createRelatedNoteTagPairParams();
    let noteParams = pair[0];
    let tagParams = pair[1];

    modelManager.mapResponseItemsToLocalModels([noteParams, tagParams]);
    let note = modelManager.allItemsMatchingTypes(["Note"])[0];
    let tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    expect(tag.content.references.length).to.equal(1);
    expect(tag.notes.length).to.equal(1);

    expect(note.content.references.length).to.equal(0);
    expect(note.tags.length).to.equal(1);

    modelManager.setItemToBeDeleted(tag);
    modelManager.mapResponseItemsToLocalModels([tag]);
    expect(tag.content.references.length).to.equal(0);
    expect(tag.notes.length).to.equal(0);
  });

  it('importing existing data should keep relationships valid', async () => {
    let modelManager = await createModelManager();

    let pair = Factory.createRelatedNoteTagPairParams();
    let noteParams = pair[0];
    let tagParams = pair[1];

    modelManager.mapResponseItemsToLocalModels([noteParams, tagParams]);
    let note = modelManager.allItemsMatchingTypes(["Note"])[0];
    let tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    expect(tag.content.references.length).to.equal(1);
    expect(tag.notes.length).to.equal(1);

    expect(note.content.references.length).to.equal(0);
    expect(note.tags.length).to.equal(1);

    modelManager.importItems([noteParams, tagParams]);

    expect(modelManager.allItems.length).to.equal(2);

    expect(tag.content.references.length).to.equal(1);
    expect(tag.notes.length).to.equal(1);

    expect(note.content.references.length).to.equal(0);
    expect(note.referencingObjects.length).to.equal(1);
    expect(note.tags.length).to.equal(1);
  });

  it('importing data with differing content should create duplicates', async () => {
    let modelManager = await createModelManager();

    let pair = Factory.createRelatedNoteTagPairParams();
    let noteParams = pair[0];
    let tagParams = pair[1];

    modelManager.mapResponseItemsToLocalModels([noteParams, tagParams]);
    let note = modelManager.allItemsMatchingTypes(["Note"])[0];
    let tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    noteParams.content.title = Math.random();
    tagParams.content.title = Math.random();
    await modelManager.importItems([noteParams, tagParams]);

    expect(modelManager.allItems.length).to.equal(4);

    var newNote = modelManager.allItemsMatchingTypes(["Note"])[1];
    var newTag = modelManager.allItemsMatchingTypes(["Tag"])[1];

    expect(newNote.uuid).to.not.equal(note.uuid);
    expect(newTag.uuid).to.not.equal(tag.uuid);

    expect(tag.content.references.length).to.equal(2);
    expect(tag.notes.length).to.equal(2);

    expect(note.content.references.length).to.equal(0);
    expect(note.referencingObjects.length).to.equal(2);
    expect(note.tags.length).to.equal(2);

    expect(newTag.content.references.length).to.equal(1);
    expect(newTag.notes.length).to.equal(1);

    expect(newNote.content.references.length).to.equal(0);
    expect(newNote.referencingObjects.length).to.equal(1);
    expect(newNote.tags.length).to.equal(1);
  });

  it('deleting a tag from a note with bi-directional relationship', async () => {
    // Tags now reference notes, but it used to be that tags referenced notes and notes referenced tags.
    // After the change, there was an issue where removing an old tag relationship from a note would only
    // remove one way, and thus keep it intact on the visual level.

    let modelManager = await createModelManager();

    let pair = Factory.createRelatedNoteTagPairParams();
    let noteParams = pair[0];
    let tagParams = pair[1];

    noteParams.content.references = [{
      content_type: tagParams.content_type,
      uuid: tagParams.uuid
    }]

    modelManager.mapResponseItemsToLocalModels([noteParams, tagParams]);
    let note = modelManager.allItemsMatchingTypes(["Note"])[0];
    let tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    expect(tag.notes.length).to.equal(1);
    expect(note.tags.length).to.equal(1);

    tag.removeItemAsRelationship(note);

    expect(tag.notes.length).to.equal(0);
    expect(note.tags.length).to.equal(0);

    expect(note.content.references.length).to.equal(0);
    expect(tag.content.references.length).to.equal(0);
  });

  it('deleting a tag should not dirty notes', async () => {
    // Tags now reference notes, but it used to be that tags referenced notes and notes referenced tags.
    // After the change, there was an issue where removing an old tag relationship from a note would only
    // remove one way, and thus keep it intact on the visual level.

    let modelManager = await createModelManager();

    let pair = Factory.createRelatedNoteTagPairParams();
    let noteParams = pair[0];
    let tagParams = pair[1];

    modelManager.mapResponseItemsToLocalModels([noteParams, tagParams]);
    let note = modelManager.allItemsMatchingTypes(["Note"])[0];
    let tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    modelManager.setItemToBeDeleted(tag);

    expect(tag.dirty).to.equal(true);
    expect(note.dirty).to.not.be.ok;
  })

  it('syncing a note should collapse its properties into the content object after setting it dirty', async () => {
    let note = new SNNote();
    note.title = "Foo";
    expect(note.content.title).to.not.be.ok;

    note.setDirty(true);
    expect(note.content.title).to.equal("Foo");
  });
});
