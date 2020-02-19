/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import '../../node_modules/regenerator-runtime/runtime.js';
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import './../vendor/chai-as-promised-built.js';
import Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe.only("importing", () => {
  const BASE_ITEM_COUNT = 1; /** Default items key */

  beforeEach(async function () {
    this.expectedItemCount = BASE_ITEM_COUNT;
    this.application = await Factory.createInitAppWithRandNamespace();
  });

  afterEach(async function () {
    await this.application.deinit();
  });

  it.only('importing existing data should keep relationships valid', async function () {
    const modelManager = this.application.modelManager;

    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];

    await modelManager.mapPayloadsToLocalItems({ payloads: [notePayload, tagPayload] });
    const note = modelManager.getItems(["Note"])[0];
    const tag = modelManager.getItems(["Tag"])[0];
    this.expectedItemCount += 2;

    expect(tag.content.references.length).to.equal(1);
    expect(tag.notes.length).to.equal(1);

    expect(note.content.references.length).to.equal(0);
    expect(note.tags.length).to.equal(1);

    await this.application.importData({
      data: {
        items: [notePayload, tagPayload]
      }
    });

    expect(modelManager.allItems.length).to.equal(this.expectedItemCount);

    expect(tag.content.references.length).to.equal(1);
    expect(tag.notes.length).to.equal(1);

    expect(note.content.references.length).to.equal(0);
    expect(note.referencingItemsCount).to.equal(1);
    expect(note.tags.length).to.equal(1);
  });

  it('importing same note many times should create only one duplicate', async function () {
    /**
     * Used strategy here will be KEEP_LEFT_DUPLICATE_RIGHT
     * which means that new right items will be created with different
     */
    const modelManager = this.application.modelManager;
    const notePayload = Factory.createNotePayload();
    await modelManager.mapPayloadToLocalItem({ payload: notePayload });
    this.expectedItemCount++;
    const mutatedNote = CreateMaxPayloadFromAnyObject({
      object: notePayload,
      override: { content: { title: `${Math.random()}` } }
    });
    await this.application.importData({
      data: {
        items: [
          mutatedNote,
          mutatedNote,
          mutatedNote
        ]
      }
    });
    this.expectedItemCount++;
    expect(modelManager.notes.length).to.equal(2);
    const imported = modelManager.notes.find((n) => n.uuid !== notePayload.uuid);
    expect(imported.content.title).to.equal(mutatedNote.content.title);
  });

  it('importing a tag with lesser references should not create duplicate', async function () {
    const modelManager = this.application.modelManager;
    const pair = Factory.createRelatedNoteTagPairPayload();
    const tagPayload = pair[1];
    await modelManager.mapPayloadsToLocalItems({ payloads: pair });
    const mutatedTag = CreateMaxPayloadFromAnyObject({
      object: tagPayload,
      override: { content: { references: [] } }
    });
    await this.application.importData({
      data: {
        items: [
          mutatedTag
        ]
      }
    });
    expect(modelManager.tags.length).to.equal(1);
    expect(modelManager.findItem(tagPayload.uuid).content.references.length).to.equal(1);
  });

  it('importing data with differing content should create duplicates', async function () {
    const modelManager = this.application.modelManager;
    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];
    await modelManager.mapPayloadsToLocalItems({ payloads: pair });
    this.expectedItemCount += 2;
    const note = modelManager.notes[0];
    const tag = modelManager.tags[0];
    const mutatedNote = CreateMaxPayloadFromAnyObject({
      object: notePayload,
      override: { content: { title: `${Math.random()}` } }
    });
    const mutatedTag = CreateMaxPayloadFromAnyObject({
      object: tagPayload,
      override: { content: { title: `${Math.random()}` } }
    });
    await this.application.importData({
      data: {
        items: [
          mutatedNote,
          mutatedTag
        ]
      }
    });
    this.expectedItemCount += 2;
    expect(modelManager.allItems.length).to.equal(this.expectedItemCount);

    const newNote = modelManager.notes.find((n) => n.uuid !== notePayload.uuid);
    const newTag = modelManager.tags.find((t) => t.uuid !== tagPayload.uuid);

    expect(newNote.uuid).to.not.equal(note.uuid);
    expect(newTag.uuid).to.not.equal(tag.uuid);

    expect(tag.content.references.length).to.equal(2);
    expect(tag.notes.length).to.equal(2);

    expect(note.content.references.length).to.equal(0);
    expect(note.referencingItemsCount).to.equal(2);
    expect(note.tags.length).to.equal(2);

    expect(newTag.content.references.length).to.equal(1);
    expect(newTag.notes.length).to.equal(1);

    expect(newNote.content.references.length).to.equal(0);
    expect(newNote.referencingItemsCount).to.equal(1);
    expect(newNote.tags.length).to.equal(1);
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
      const modelManager = this.application.modelManager;
      const note = await Factory.createMappedNote(this.application);
      const tag = await Factory.createMappedTag(this.application);
      this.expectedItemCount += 2;

      tag.addItemAsRelationship(note);
      await this.application.saveItem({ item: tag });

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

      await this.application.importData({
        data: {
          items: [
            externalNote,
            externalTag
          ]
        }
      });
      this.expectedItemCount += 1;

      /** We expect now that the total item count is 3, not 4. */
      expect(modelManager.allItems.length).to.equal(this.expectedItemCount);
      /** References from both items have merged. */
      expect(tag.content.references.length).to.equal(2);
    });
});
