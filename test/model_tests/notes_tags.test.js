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
    const modelManager = await createModelManager();
    const item = await Factory.createMappedNote(modelManager);
    const note = modelManager.allItemsMatchingTypes(["Note"])[0];
    expect(note.constructor === SNNote).to.equal(true);
  });

  it('properly constructs syncing params', async function() {
    let note = new SNNote();
    let title = "Foo", text = "Bar";
    note.title = title;
    note.text = text;

    let content = note.collapseContent();
    expect(content.title).to.equal(title);
    expect(content.text).to.equal(text);

    let tag = new SNTag();
    tag.title = title;

    expect(tag.collapseContent().title).to.equal(title);

    expect(tag.structureParams().title).to.equal(tag.getContentCopy().title);
  })

  it('properly handles legacy relationships', async () => {
    // legacy relationships are when a note has a reference to a tag
    const modelManager = await createModelManager();
    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];
    tagPayload.content.references = null;
    notePayload.content.references = [
      {
        uuid: tagPayload.uuid,
        content_type: tagPayload.content_type
      }
    ];

    modelManager.mapPayloadsToLocalItems({payloads: [notePayload, tagPayload]});
    const note = modelManager.allItemsMatchingTypes(["Note"])[0];
    const tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    expect(note.tags.length).to.equal(1);
    expect(tag.notes.length).to.equal(1);
  })

  it('creates relationship between note and tag', async () => {
    let modelManager = await createModelManager();

    let pair = Factory.createRelatedNoteTagPairPayload();
    let notePayload = pair[0];
    let tagPayload = pair[1];

    expect(notePayload.content.references.length).to.equal(0);
    expect(tagPayload.content.references.length).to.equal(1);

    modelManager.mapPayloadsToLocalItems({payloads: [notePayload, tagPayload]});
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

    let pair = Factory.createRelatedNoteTagPairPayload();
    let notePayload = pair[0];
    let tagPayload = pair[1];

    modelManager.mapPayloadsToLocalItems({payloads: [notePayload, tagPayload]});
    let note = modelManager.allItemsMatchingTypes(["Note"])[0];
    let tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    expect(note.content.references.length).to.equal(0);
    expect(tag.content.references.length).to.equal(1);

    tagPayload.content.references = [];
    modelManager.mapPayloadsToLocalItems({payloads: [tagPayload]});

    expect(tag.content.references.length).to.equal(0);
    expect(note.tags.length).to.equal(0);
    expect(tag.notes.length).to.equal(0);

    // expect to be false
    expect(note.dirty).to.not.be.ok;
    expect(tag.dirty).to.not.be.ok;
  });

  it('resets cached note tags string when tag is deleted from remote source', async () => {
    const modelManager = await createModelManager();

    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];

    modelManager.mapPayloadsToLocalItems({payloads: [notePayload, tagPayload]});
    const note = modelManager.allItemsMatchingTypes(["Note"])[0];
    const tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    expect(note.tagsString().length).to.not.equal(0);

    const changedTagPayload = CreatePayloadFromAnyObject({
      object: tagPayload,
      override: {
        deleted: true
      }
    })
    modelManager.mapPayloadsToLocalItems({payloads: [changedTagPayload]});

    expect(modelManager.tags.length).to.equal(0);

    // Should be null
    expect(note.savedTagsString).to.not.be.ok;

    expect(note.referencedItemsCount).to.equal(0);
    expect(note.referencingItemsCount).to.equal(0);

    expect(note.tags.length).to.equal(0);
    expect(tag.notes.length).to.equal(0);
  });

  it('resets cached note tags string when tag reference is removed from remote source', async () => {
    const modelManager = await createModelManager();

    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];

    modelManager.mapPayloadsToLocalItems({payloads: [notePayload, tagPayload]});
    const note = modelManager.allItemsMatchingTypes(["Note"])[0];
    const tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    expect(note.tagsString().length).to.not.equal(0);

    tagPayload.content.references = [];
    modelManager.mapPayloadsToLocalItems({payloads: [tagPayload]});

    // should be null
    expect(note.savedTagsString).to.not.be.ok;

    expect(note.tags.length).to.equal(0);
    expect(tag.notes.length).to.equal(0);
  });

  it('resets cached note tags string when tag is renamed', async () => {
    const modelManager = await createModelManager();

    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];

    modelManager.mapPayloadsToLocalItems({payloads: [notePayload, tagPayload]});
    const note = modelManager.allItemsMatchingTypes(["Note"])[0];
    const tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    expect(note.tagsString()).to.equal(`#${tagPayload.content.title}`);

    const newTitle = `${Math.random()}`;
    // Saving involves modifying local state first, then syncing with omitting content.
    tag.title = newTitle;
    tag.setDirty(true);

    expect(tag.content.title).to.equal(newTitle);

    const changedTagPayload = CreatePayloadFromAnyObject({
      object: tagPayload,
      omit: ['content']
    })

    // simulate a save, which omits `content`
    modelManager.mapPayloadsToLocalItems({
      payloads: [changedTagPayload]
    })

    expect(tag.content.title).to.equal(newTitle);
    expect(note.savedTagsString).to.not.be.ok;
    expect(note.tagsString()).to.equal(`#${newTitle}`);
  });

  it('handles removing relationship between note and tag', async () => {
    let modelManager = await createModelManager();

    let pair = Factory.createRelatedNoteTagPairPayload();
    let notePayload = pair[0];
    let tagPayload = pair[1];

    modelManager.mapPayloadsToLocalItems({payloads: [notePayload, tagPayload]});
    let note = modelManager.allItemsMatchingTypes(["Note"])[0];
    let tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    expect(note.content.references.length).to.equal(0);
    expect(tag.content.references.length).to.equal(1);

    tag.removeItemAsRelationship(note);

    const newTagPayload = CreatePayloadFromAnyObject({object: tag});

    modelManager.mapPayloadsToLocalItems({payloads: [newTagPayload]});

    expect(note.tags.length).to.equal(0);
    expect(tag.notes.length).to.equal(0);
  });

  it('properly handles tag duplication', async () => {
    const modelManager = await createModelManager();

    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];

    modelManager.mapPayloadsToLocalItems({payloads: [notePayload, tagPayload]});
    const note = modelManager.allItemsMatchingTypes(["Note"])[0];
    const tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    const duplicateTag = await modelManager.duplicateItemAndAddAsConflict(tag);

    expect(tag.uuid).to.not.equal(duplicateTag.uuid);

    expect(tag.content.references.length).to.equal(1);
    expect(tag.notes.length).to.equal(1);

    expect(duplicateTag.content.references.length).to.equal(1);
    expect(duplicateTag.notes.length).to.equal(1);

    expect(note.tags.length).to.equal(2);

    const noteTag1 = note.tags[0];
    const noteTag2 = note.tags[1];
    expect(noteTag1.uuid).to.not.equal(noteTag2.uuid);

    // expect to be false
    expect(note.dirty).to.not.be.ok;
    expect(tag.dirty).to.not.be.ok;
  });

  it('duplicating a note should maintain its tag references', async () => {
    const modelManager = await createModelManager();

    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];

    modelManager.mapPayloadsToLocalItems({payloads: [notePayload, tagPayload]});
    const note = modelManager.allItemsMatchingTypes(["Note"])[0];
    const tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    const duplicateNote = await modelManager.duplicateItemAndAddAsConflict(note);

    expect(note.uuid).to.not.equal(duplicateNote.uuid);
    expect(duplicateNote.tags.length).to.equal(note.tags.length);
  });

  it('deleting a note should update tag references', async () => {
    const modelManager = await createModelManager();

    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];

    modelManager.mapPayloadsToLocalItems({payloads: [notePayload, tagPayload]});
    const note = modelManager.allItemsMatchingTypes(["Note"])[0];
    const tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    expect(tag.content.references.length).to.equal(1);
    expect(tag.notes.length).to.equal(1);

    expect(note.content.references.length).to.equal(0);
    expect(note.tags.length).to.equal(1);

    modelManager.setItemToBeDeleted(tag);
    const newTagPayload = CreatePayloadFromAnyObject({object: tag});
    modelManager.mapPayloadsToLocalItems({payloads: [newTagPayload]});
    expect(tag.content.references.length).to.equal(0);
    expect(tag.notes.length).to.equal(0);
  });

  it('importing existing data should keep relationships valid', async () => {
    const modelManager = await createModelManager();

    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];

    modelManager.mapPayloadsToLocalItems({payloads: [notePayload, tagPayload]});
    const note = modelManager.allItemsMatchingTypes(["Note"])[0];
    const tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    expect(tag.content.references.length).to.equal(1);
    expect(tag.notes.length).to.equal(1);

    expect(note.content.references.length).to.equal(0);
    expect(note.tags.length).to.equal(1);

    modelManager.importItemsFromRaw([notePayload, tagPayload]);

    expect(modelManager.allItems.length).to.equal(2);

    expect(tag.content.references.length).to.equal(1);
    expect(tag.notes.length).to.equal(1);

    expect(note.content.references.length).to.equal(0);
    expect(note.referencingItemsCount).to.equal(1);
    expect(note.tags.length).to.equal(1);
  });

  it('modifying payload content should not modify item content', async () => {
    const modelManager = await createModelManager();
    const notePayload = Factory.createNotePayload();
    modelManager.mapPayloadsToLocalItems({payloads: [notePayload]});
    const note = modelManager.allItemsMatchingTypes(["Note"])[0];
    expect(note.content === notePayload.content).to.equal(false);
    expect(note.content.references === notePayload.content.references).to.equal(false);
    notePayload.content.title = Math.random();
    expect(note.content.title).to.not.equal(notePayload.content.title);
  });

  it('importing data with differing content should create duplicates', async () => {
    const modelManager = await createModelManager();

    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];

    modelManager.mapPayloadsToLocalItems({payloads: [notePayload, tagPayload]});
    const note = modelManager.allItemsMatchingTypes(["Note"])[0];
    const tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    notePayload.content.title = `${Math.random()}`;
    tagPayload.content.title = `${Math.random()}`;
    expect(note.content.title).to.not.equal(notePayload.content.title);

    const imported = await modelManager.importItemsFromRaw([notePayload, tagPayload]);

    expect(modelManager.allItems.length).to.equal(4);

    const newNote = imported[0];
    const newTag = imported[1];

    expect(newNote.uuid).to.not.equal(note.uuid);
    expect(newTag.uuid).to.not.equal(tag.uuid);

    expect(tag.content.references.length).to.equal(2);
    expect(tag.notes.length).to.equal(2);

    expect(note.content.references.length).to.equal(0);
    expect(note.referencingItemsCount).to.equal(2);
    expect(note.tags.length).to.equal(2);

    expect(newTag.content.references.length).to.equal(2);
    expect(newTag.notes.length).to.equal(2);

    expect(newNote.content.references.length).to.equal(0);
    expect(newNote.referencingItemsCount).to.equal(2);
    expect(newNote.tags.length).to.equal(2);
  });

  it('deleting a tag from a note with bi-directional relationship', async () => {
    // Tags now reference notes, but it used to be that tags referenced notes and notes referenced tags.
    // After the change, there was an issue where removing an old tag relationship from a note would only
    // remove one way, and thus keep it intact on the visual level.

    const modelManager = await createModelManager();

    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];

    notePayload.content.references = [{
      content_type: tagPayload.content_type,
      uuid: tagPayload.uuid
    }]

    modelManager.mapPayloadsToLocalItems({payloads: [notePayload, tagPayload]});
    const note = modelManager.allItemsMatchingTypes(["Note"])[0];
    const tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

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

    const modelManager = await createModelManager();

    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];

    modelManager.mapPayloadsToLocalItems({payloads: [notePayload, tagPayload]});
    const note = modelManager.allItemsMatchingTypes(["Note"])[0];
    const tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    modelManager.setItemToBeDeleted(tag);

    expect(tag.dirty).to.equal(true);
    expect(note.dirty).to.not.be.ok;
  })

  it('setting a note dirty should collapse its properties into content', async () => {
    let note = new SNNote();
    note.title = "Foo";
    expect(note.content.title).to.not.be.ok;

    note.setDirty(true);
    expect(note.content.title).to.equal("Foo");
  });
});
