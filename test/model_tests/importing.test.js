/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('importing', () => {
  const BASE_ITEM_COUNT = 1; /** Default items key */

  beforeEach(async function () {
    this.expectedItemCount = BASE_ITEM_COUNT;
    this.application = await Factory.createInitAppWithRandNamespace();
  });

  afterEach(async function () {
    await this.application.deinit();
  });

  it('importing existing data should keep relationships valid', async function () {
    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];

    await this.application.itemManager.emitItemsFromPayloads(
      [notePayload, tagPayload],
      PayloadSource.LocalChanged
    );
    this.expectedItemCount += 2;
    const note = this.application.itemManager.getItems([ContentType.Note])[0];
    const tag = this.application.itemManager.getItems([ContentType.Tag])[0];

    expect(tag.content.references.length).to.equal(1);
    expect(tag.noteCount).to.equal(1);

    expect(note.content.references.length).to.equal(0);
    expect(this.application.itemManager.itemsThatReferenceItem(note.uuid).length).to.equal(1);

    await this.application.importData(
      {
        items: [notePayload, tagPayload]
      },
      undefined,
      true,
    );

    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);

    expect(tag.content.references.length).to.equal(1);
    expect(tag.noteCount).to.equal(1);

    expect(note.content.references.length).to.equal(0);
    expect(this.application.itemManager.itemsThatReferenceItem(note.uuid).length).to.equal(1);
  });

  it('importing same note many times should create only one duplicate', async function () {
    /**
     * Used strategy here will be KEEP_LEFT_DUPLICATE_RIGHT
     * which means that new right items will be created with different
     */
    const notePayload = Factory.createNotePayload();
    await this.application.itemManager.emitItemFromPayload(
      notePayload,
      PayloadSource.LocalSaved
    );
    this.expectedItemCount++;
    const mutatedNote = CreateMaxPayloadFromAnyObject(
      notePayload,
      null,
      null,
      {
        content: {
          ...notePayload.content,
          title: `${Math.random()}`
        }
      }
    );
    await this.application.importData(
      {
        items: [
          mutatedNote,
          mutatedNote,
          mutatedNote,
        ]
      },
      undefined,
      true,
    );
    this.expectedItemCount++;
    expect(this.application.itemManager.notes.length).to.equal(2);
    const imported = this.application.itemManager.notes.find((n) => n.uuid !== notePayload.uuid);
    expect(imported.content.title).to.equal(mutatedNote.content.title);
  });

  it('importing a tag with lesser references should not create duplicate', async function () {
    const pair = Factory.createRelatedNoteTagPairPayload();
    const tagPayload = pair[1];
    await this.application.itemManager.emitItemsFromPayloads(
      pair,
      PayloadSource.LocalChanged
    );
    const mutatedTag = CreateMaxPayloadFromAnyObject(
      tagPayload,
      null,
      null,
      {
        content: {
          ...tagPayload.safeContent,
          references: []
        }
      }
    );
    await this.application.importData(
      {
        items: [
          mutatedTag
        ]
      },
      undefined,
      true,
    );
    expect(this.application.itemManager.tags.length).to.equal(1);
    expect(this.application.itemManager.findItem(tagPayload.uuid).content.references.length).to.equal(1);
  });

  it('importing data with differing content should create duplicates', async function () {
    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];
    await this.application.itemManager.emitItemsFromPayloads(
      pair,
      PayloadSource.LocalChanged
    );
    this.expectedItemCount += 2;
    const note = this.application.itemManager.notes[0];
    const tag = this.application.itemManager.tags[0];
    const mutatedNote = CreateMaxPayloadFromAnyObject(
      notePayload,
      null,
      null,
      {
        content: {
          ...notePayload.safeContent,
          title: `${Math.random()}`
        }
      }
    );
    const mutatedTag = CreateMaxPayloadFromAnyObject(
      tagPayload,
      null,
      null,
      {
        content: {
          ...tagPayload.safeContent,
          title: `${Math.random()}`
        }
      }
    );
    await this.application.importData(
      {
        items: [
          mutatedNote,
          mutatedTag
        ]
      },
      undefined,
      true,
    );
    this.expectedItemCount += 2;
    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);

    const newNote = this.application.itemManager.notes.find((n) => n.uuid !== notePayload.uuid);
    const newTag = this.application.itemManager.tags.find((t) => t.uuid !== tagPayload.uuid);

    expect(newNote.uuid).to.not.equal(note.uuid);
    expect(newTag.uuid).to.not.equal(tag.uuid);
    
    const refreshedTag = this.application.itemManager.findItem(tag.uuid);
    expect(refreshedTag.content.references.length).to.equal(2);
    expect(refreshedTag.noteCount).to.equal(2);

    const refreshedNote = this.application.itemManager.findItem(note.uuid);
    expect(refreshedNote.content.references.length).to.equal(0);
    expect(this.application.itemManager.itemsThatReferenceItem(refreshedNote.uuid).length).to.equal(2);

    expect(newTag.content.references.length).to.equal(1);
    expect(newTag.noteCount).to.equal(1);

    expect(newNote.content.references.length).to.equal(0);
    expect(this.application.itemManager.itemsThatReferenceItem(newNote.uuid).length).to.equal(1);
  });

  it('when importing items, imported values should not be used to determine if changed',
    async function () {
      /**
       * If you have a note and a tag, and the tag has 1 reference to the note,
       * and you import the same two items, except modify the note value so that
       * a duplicate is created, we expect only the note to be duplicated, and the
       * tag not to. However, if only the note changes, and you duplicate the note,
       * which causes the tag's references content to change, then when the incoming
       * tag is being processed, it will also think it has changed, since our local
       * value now doesn't match what's coming in. The solution is to get all values
       * ahead of time before any changes are made.
       */
      const note = await Factory.createMappedNote(this.application);
      const tag = await Factory.createMappedTag(this.application);
      this.expectedItemCount += 2;

      await this.application.itemManager.changeItem(tag, (mutator) => {
        mutator.addItemAsRelationship(note);
      });

      const externalNote = Object.assign({},
        {
          uuid: note.uuid,
          content: note.getContentCopy(),
          content_type: note.content_type
        }
      );
      externalNote.content.text = `${Math.random()}`;

      const externalTag = Object.assign({},
        {
          uuid: tag.uuid,
          content: tag.getContentCopy(),
          content_type: tag.content_type
        }
      );

      await this.application.importData(
        {
          items: [
            externalNote,
            externalTag
          ]
        },
        undefined,
        true,
      );
      this.expectedItemCount += 1;

      /** We expect now that the total item count is 3, not 4. */
      expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);
      
      const refreshedTag = this.application.itemManager.findItem(tag.uuid);
      /** References from both items have merged. */
      expect(refreshedTag.content.references.length).to.equal(2);
    });
});
