/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('notes and tags', () => {
  const BASE_ITEM_COUNT = 1; /** Default items key */
  beforeEach(async function () {
    this.expectedItemCount = BASE_ITEM_COUNT;
    this.application = await Factory.createInitAppWithRandNamespace();
  });

  afterEach(async function () {
    await this.application.deinit();
  });

  it('uses proper class for note', async function () {
    const payload = Factory.createNotePayload();
    await this.application.itemManager.emitItemFromPayload(
      payload,
      PayloadSource.LocalChanged
    );
    const note = this.application.itemManager.getItems([ContentType.Note])[0];
    expect(note.constructor === SNNote).to.equal(true);
  });

  it('properly constructs syncing params', async function () {
    const title = 'Foo';
    const text = 'Bar';
    const note = await this.application.createTemplateItem(
      ContentType.Note,
      {
        title,
        text
      }
    );

    expect(note.content.title).to.equal(title);
    expect(note.content.text).to.equal(text);

    const tag = await this.application.createTemplateItem(
      ContentType.Tag,
      {
        title
      }
    );

    expect(tag.title).to.equal(title);
  });

  it('properly handles legacy relationships', async function () {
    // legacy relationships are when a note has a reference to a tag
    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];

    const mutatedTag = CreateMaxPayloadFromAnyObject(
      tagPayload,
      {
        content: {
          ...tagPayload.safeContent,
          references: null
        }
      }
    );
    const mutatedNote = CreateMaxPayloadFromAnyObject(
      notePayload,
      {
        content: {
          references: [
            {
              uuid: tagPayload.uuid,
              content_type: tagPayload.content_type
            }
          ]
        }
      }
    );

    await this.application.itemManager.emitItemsFromPayloads(
      [mutatedNote, mutatedTag],
      PayloadSource.LocalChanged
    );
    const note = this.application.itemManager.getItems([ContentType.Note])[0];
    const tag = this.application.itemManager.getItems([ContentType.Tag])[0];

    expect(note.content.references.length).to.equal(1);
    expect(this.application.itemManager.itemsReferencingItem(tag.uuid).length).to.equal(1);
  });

  it('creates relationship between note and tag', async function () {
    const pair = Factory.createRelatedNoteTagPairPayload({ dirty: false });
    const notePayload = pair[0];
    const tagPayload = pair[1];

    expect(notePayload.content.references.length).to.equal(0);
    expect(tagPayload.content.references.length).to.equal(1);

    await this.application.itemManager.emitItemsFromPayloads(
      [notePayload, tagPayload],
      PayloadSource.LocalChanged
    );
    let note = this.application.itemManager.notes[0];
    let tag = this.application.itemManager.tags[0];

    expect(note.dirty).to.not.be.ok;
    expect(tag.dirty).to.not.be.ok;

    expect(note.content.references.length).to.equal(0);
    expect(tag.content.references.length).to.equal(1);

    expect(note.hasRelationshipWithItem(tag)).to.equal(false);
    expect(tag.hasRelationshipWithItem(note)).to.equal(true);

    expect(this.application.itemManager.itemsReferencingItem(note.uuid).length).to.equal(1);
    expect(note.payload.safeReferences.length).to.equal(0);
    expect(tag.noteCount).to.equal(1);

    note = await this.application.itemManager.setItemToBeDeleted(note.uuid);
    tag = this.application.itemManager.tags[0];

    expect(note.dirty).to.be.true;
    expect(tag.dirty).to.be.true;
    await this.application.syncService.sync();
    expect(tag.content.references.length).to.equal(0);
    expect(this.application.itemManager.itemsReferencingItem(note.uuid).length).to.equal(0);
    expect(tag.noteCount).to.equal(0);

    note = this.application.itemManager.notes[0];
    tag = this.application.itemManager.tags[0];
    expect(note).to.not.be.ok;
    expect(tag.dirty).to.be.false;
  });

  it('handles remote deletion of relationship', async function () {
    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];

    await this.application.itemManager.emitItemsFromPayloads(
      [notePayload, tagPayload],
      PayloadSource.LocalChanged
    );
    let note = this.application.itemManager.getItems([ContentType.Note])[0];
    let tag = this.application.itemManager.getItems([ContentType.Tag])[0];

    expect(note.content.references.length).to.equal(0);
    expect(tag.content.references.length).to.equal(1);

    await this.application.syncService.sync();

    const mutatedTag = CreateMaxPayloadFromAnyObject(
      tagPayload,
      {
        content: {
          ...tagPayload.safeContent,
          references: []
        }
      }
    );
    await this.application.itemManager.emitItemsFromPayloads(
      [mutatedTag],
      PayloadSource.LocalChanged
    );

    note = this.application.itemManager.findItem(note.uuid);
    tag = this.application.itemManager.findItem(tag.uuid);

    expect(tag.content.references.length).to.equal(0);
    expect(this.application.itemManager.itemsReferencingItem(note.uuid).length).to.equal(0);
    expect(tag.noteCount).to.equal(0);

    // expect to be false
    expect(note.dirty).to.not.be.ok;
    expect(tag.dirty).to.not.be.ok;
  });

  it('creating basic note should have text set', async function () {
    const note = await Factory.createMappedNote(this.application);
    expect(note.title).to.be.ok;
    expect(note.text).to.be.ok;
  });

  it('creating basic tag should have title', async function () {
    const tag = await Factory.createMappedTag(this.application);
    expect(tag.title).to.be.ok;
  });

  it('handles removing relationship between note and tag', async function () {
    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];

    await this.application.itemManager.emitItemsFromPayloads(
      [notePayload, tagPayload],
      PayloadSource.LocalChanged
    );
    const note = this.application.itemManager.getItems([ContentType.Note])[0];
    let tag = this.application.itemManager.getItems([ContentType.Tag])[0];

    expect(note.content.references.length).to.equal(0);
    expect(tag.content.references.length).to.equal(1);

    tag = await this.application.changeAndSaveItem(tag.uuid, (mutator) => {
      mutator.removeItemAsRelationship(note);
    });

    expect(this.application.itemManager.itemsReferencingItem(note.uuid).length).to.equal(0);
    expect(tag.noteCount).to.equal(0);
  });

  it('properly handles tag duplication', async function () {
    const pair = Factory.createRelatedNoteTagPairPayload();
    await this.application.itemManager.emitItemsFromPayloads(
      pair,
      PayloadSource.LocalChanged
    );
    let note = this.application.itemManager.notes[0];
    let tag = this.application.itemManager.tags[0];

    const duplicateTag = await this.application.itemManager.duplicateItem(tag.uuid, true);
    await this.application.syncService.sync();

    note = this.application.itemManager.findItem(note.uuid);
    tag = this.application.itemManager.findItem(tag.uuid);

    expect(tag.uuid).to.not.equal(duplicateTag.uuid);
    expect(tag.content.references.length).to.equal(1);
    expect(tag.noteCount).to.equal(1);
    expect(duplicateTag.content.references.length).to.equal(1);
    expect(duplicateTag.noteCount).to.equal(1);

    const noteTags = this.application.itemManager.itemsReferencingItem(note.uuid);
    expect(noteTags.length).to.equal(2);

    const noteTag1 = noteTags[0];
    const noteTag2 = noteTags[1];
    expect(noteTag1.uuid).to.not.equal(noteTag2.uuid);

    // expect to be false
    expect(note.dirty).to.not.be.ok;
    expect(tag.dirty).to.not.be.ok;
  });

  it('duplicating a note should maintain its tag references', async function () {
    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];
    await this.application.itemManager.emitItemsFromPayloads(
      [notePayload, tagPayload],
      PayloadSource.LocalChanged
    );
    const note = this.application.itemManager.getItems([ContentType.Note])[0];
    const duplicateNote = await this.application.itemManager.duplicateItem(note.uuid, true);
    expect(note.uuid).to.not.equal(duplicateNote.uuid);

    expect(this.application.itemManager.itemsReferencingItem(duplicateNote.uuid).length)
      .to.equal(this.application.itemManager.itemsReferencingItem(note.uuid).length);
  });

  it('deleting a note should update tag references', async function () {
    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];
    await this.application.itemManager.emitItemsFromPayloads(
      [notePayload, tagPayload],
      PayloadSource.LocalChanged
    );
    const note = this.application.itemManager.getItems([ContentType.Note])[0];
    let tag = this.application.itemManager.getItems([ContentType.Tag])[0];

    expect(tag.content.references.length).to.equal(1);
    expect(tag.noteCount).to.equal(1);

    expect(note.content.references.length).to.equal(0);
    expect(this.application.itemManager.itemsReferencingItem(note.uuid).length).to.equal(1);

    await this.application.itemManager.setItemToBeDeleted(tag.uuid);
    tag = this.application.itemManager.findItem(tag.uuid);
    expect(tag.content).to.not.be.ok;
  });

  it('modifying item content should not modify payload content', async function () {
    const notePayload = Factory.createNotePayload();
    await this.application.itemManager.emitItemsFromPayloads(
      [notePayload],
      PayloadSource.LocalChanged
    );
    let note = this.application.itemManager.getItems([ContentType.Note])[0];
    note = await this.application.changeAndSaveItem(note.uuid, (mutator) => {
      mutator.content.title = Math.random();
    });
    expect(note.content.title).to.not.equal(notePayload.content.title);
  });

  it('deleting a tag should not dirty notes', async function () {
    // Tags now reference notes, but it used to be that tags referenced notes and notes referenced tags.
    // After the change, there was an issue where removing an old tag relationship from a note would only
    // remove one way, and thus keep it intact on the visual level.
    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];

    await this.application.itemManager.emitItemsFromPayloads(
      [notePayload, tagPayload],
      PayloadSource.LocalChanged
    );
    let note = this.application.itemManager.getItems([ContentType.Note])[0];
    let tag = this.application.itemManager.getItems([ContentType.Tag])[0];

    await this.application.syncService.sync();
    await this.application.itemManager.setItemToBeDeleted(tag.uuid);

    note = this.application.itemManager.findItem(note.uuid);
    tag = this.application.itemManager.findItem(tag.uuid);

    expect(tag.dirty).to.equal(true);
    expect(note.dirty).to.not.be.ok;
  });

  it('setting a note dirty should collapse its properties into content', async function () {
    let note = await this.application.createTemplateItem(ContentType.Note, { title: 'Foo' });    
    await this.application.insertItem(note);
    note = this.application.itemManager.findItem(note.uuid);
    expect(note.content.title).to.equal('Foo');
  });
});

// it.skip('deleting a tag from a note with bi-directional relationship', async function () {
//   /**
//    * We no longer handle legacy relationships. Instead the UI should make the proper display
//    * decisions based on one-way relationships where tags.references mention notes.
//    */
//   // Tags now reference notes, but it used to be that tags referenced notes and notes referenced tags.
//   // After the change, there was an issue where removing an old tag relationship from a note would only
//   // remove one way, and thus keep it intact on the visual level.

//   const pair = Factory.createRelatedNoteTagPairPayload();
//   const notePayload = pair[0];
//   const tagPayload = pair[1];

//   const mutatedPayload = CreateMaxPayloadFromAnyObject(
//     notePayload,
//     null,
//     null,
//     {
//       content: {
//         ...notePayload.safeContent,
//         references: [{
//           content_type: tagPayload.content_type,
//           uuid: tagPayload.uuid
//         }]
//       }
//     }
//   );

//   await this.application.itemManager.emitItemsFromPayloads(
//     [mutatedPayload, tagPayload],
//     PayloadSource.LocalChanged
//   );
//   let note = this.application.itemManager.getItems([ContentType.Note])[0];
//   let tag = this.application.itemManager.getItems([ContentType.Tag])[0];

//   expect(tag.noteCount).to.equal(1);
//   expect(this.application.itemManager.itemsReferencingItem(note.uuid).length).to.equal(1);

//   tag = await this.application.changeAndSaveItem(tag.uuid, (mutator) => {
//     mutator.removeItemAsRelationship(note);
//   });

//   expect(tag.noteCount).to.equal(0);
//   expect(this.application.itemManager.itemsReferencingItem(note.uuid).length).to.equal(0);

//   note = this.application.itemManager.findItem(note.uuid);
//   expect(note.content.references.length).to.equal(0);
//   expect(tag.content.references.length).to.equal(0);
// });