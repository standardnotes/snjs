/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('item manager', () => {

  before(async function () {
    const crypto = new SNWebCrypto();
    Uuid.SetGenerators(
      crypto.generateUUIDSync,
      crypto.generateUUID
    );
  });

  beforeEach(function () {
    this.modelManager = new PayloadManager();
    this.itemManager = new ItemManager(this.modelManager);
    this.createNote = async () => {
      return this.itemManager.createItem(
        ContentType.Note,
        {
          title: 'hello',
          text: 'world'
        }
      );
    };

    this.createTag = async (notes = []) => {
      const references = notes.map((note) => {
        return {
          uuid: note.uuid,
          content_type: note.content_type
        };
      });
      return this.itemManager.createItem(
        ContentType.Tag,
        {
          title: 'thoughts',
          references: references
        }
      );
    };
  });

  it('create item', async function () {
    const item = await this.createNote();

    expect(item).to.be.ok;
    expect(item.title).to.equal('hello');
  });

  it('find items with valid uuid', async function () {
    const item = await this.createNote();

    const results = await this.itemManager.findItems([item.uuid]);
    expect(results.length).to.equal(1);
    expect(results[0]).to.equal(item);
  });

  it('find items with invalid uuid no blanks', async function () {
    const includeBlanks = false;
    const results = await this.itemManager.findItems(
      [Factory.generateUuidish()],
      includeBlanks
    );
    expect(results.length).to.equal(0);
  });

  it('find items with invalid uuid include blanks', async function () {
    const includeBlanks = true;
    const results = await this.itemManager.findItems(
      [Factory.generateUuidish()],
      includeBlanks
    );
    expect(results.length).to.equal(1);
    expect(results[0]).to.not.be.ok;
  });

  it('item state', async function () {
    await this.createNote();

    expect(this.itemManager.items.length).to.equal(1);
    expect(this.itemManager.notes.length).to.equal(1);
  });

  it('find item', async function () {
    const item = await this.createNote();

    const foundItem = this.itemManager.findItem(item.uuid);
    expect(foundItem).to.be.ok;
  });

  it('reference map', async function () {
    const note = await this.createNote();
    const tag = await this.createTag([note]);

    expect(this.itemManager.collection.referenceMap.directMap[tag.uuid]).to.eql([note.uuid]);
  });

  it('inverse reference map', async function () {
    const note = await this.createNote();
    const tag = await this.createTag([note]);

    expect(this.itemManager.collection.referenceMap.inverseMap[note.uuid]).to.eql([tag.uuid]);
  });

  it('inverse reference map should not have duplicates', async function () {
    const note = await this.createNote();
    const tag = await this.createTag([note]);
    await this.itemManager.changeItem(tag.uuid);

    expect(this.itemManager.collection.referenceMap.inverseMap[note.uuid]).to.eql([tag.uuid]);
  });

  it('deleting from reference map', async function () {
    const note = await this.createNote();
    const tag = await this.createTag([note]);
    await this.itemManager.setItemToBeDeleted(note.uuid);

    expect(this.itemManager.collection.referenceMap.directMap[tag.uuid]).to.eql([]);
    expect(this.itemManager.collection.referenceMap.inverseMap[note.uuid]).to.not.be.ok;
  });

  it('deleting referenced item should update referencing item references', async function () {
    const note = await this.createNote();
    let tag = await this.createTag([note]);
    await this.itemManager.setItemToBeDeleted(note.uuid);

    tag = this.itemManager.findItem(tag.uuid);
    expect(tag.content.references.length).to.equal(0);
  });

  it('removing relationship should update reference map', async function () {
    const note = await this.createNote();
    const tag = await this.createTag([note]);
    await this.itemManager.changeItem(tag.uuid, (mutator) => {
      mutator.removeItemAsRelationship(note);
    });

    expect(this.itemManager.collection.referenceMap.directMap[tag.uuid]).to.eql([]);
    expect(this.itemManager.collection.referenceMap.inverseMap[note.uuid]).to.eql([]);
  });

  it('emitting discardable payload should remove it from our collection', async function () {
    const note = await this.createNote();
    const payload = note.payloadRepresentation({
      deleted: true,
      dirty: false
    });
    await this.itemManager.emitItemFromPayload(payload);

    expect(payload.discardable).to.equal(true);
    expect(this.itemManager.findItem(note.uuid)).to.not.be.ok;
  });

  it('items that reference item', async function () {
    const note = await this.createNote();
    const tag = await this.createTag([note]);

    const itemsThatReference = this.itemManager.itemsReferencingItem(note.uuid);
    expect(itemsThatReference.length).to.equal(1);
    expect(itemsThatReference[0]).to.equal(tag);
  });

  it('observer', async function () {
    const observed = [];
    this.itemManager.addObserver(
      ContentType.Any,
      (changed, inserted, discarded, ignored, source, sourceKey) => {
        observed.push({ changed, inserted, discarded, source, sourceKey });
      },
    );
    const note = await this.createNote();
    const tag = await this.createTag([note]);
    expect(observed.length).to.equal(2);

    const firstObserved = observed[0];
    expect(firstObserved.inserted).to.eql([note]);

    const secondObserved = observed[1];
    expect(secondObserved.inserted).to.eql([tag]);
  });

  it('change existing item', async function () {
    const note = await this.createNote();
    const newTitle = String(Math.random());
    await this.itemManager.changeItem(
      note.uuid,
      (mutator) => {
        mutator.title = newTitle;
      }
    );

    const latestVersion = this.itemManager.findItem(note.uuid);
    expect(latestVersion.title).to.equal(newTitle);
  });

  it('change non-existant item through uuid should fail', async function () {
    const note = await this.itemManager.createTemplateItem(
      ContentType.Note,
      {
        title: 'hello',
        text: 'world'
      }
    );

    const changeFn = async () => {
      const newTitle = String(Math.random());
      return this.itemManager.changeItem(
        note.uuid,
        (mutator) => {
          mutator.title = newTitle;
        }
      );
    };
    await Factory.expectThrowsAsync(() => changeFn(), 'Attempting to change non-existant item');
  });

  it('set items dirty', async function () {
    const note = await this.createNote();
    await this.itemManager.setItemDirty(note.uuid);

    const dirtyItems = this.itemManager.getDirtyItems();
    expect(dirtyItems.length).to.equal(1);
    expect(dirtyItems[0].uuid).to.equal(note.uuid);
    expect(dirtyItems[0].dirty).to.equal(true);
  });

  describe('duplicateItem', async function () {
    const sandbox = sinon.createSandbox();

    beforeEach(async function () {
      this.note = await this.createNote();
      this.emitPayloads = sandbox.spy(this.itemManager.modelManager, 'emitPayloads');
    });

    afterEach(function () {
      sandbox.restore();
    });

    it('should duplicate the item and set the duplicate_of property', async function () {
      await this.itemManager.duplicateItem(this.note.uuid);
      sinon.assert.calledOnce(this.emitPayloads);

      const originalNote = this.itemManager.notes[0];
      const duplicatedNote = this.itemManager.notes[1];

      expect(this.itemManager.items.length).to.equal(2);
      expect(this.itemManager.notes.length).to.equal(2);
      expect(originalNote.uuid).to.not.equal(duplicatedNote.uuid);
      expect(originalNote.uuid).to.equal(duplicatedNote.duplicateOf);
      expect(originalNote.uuid).to.equal(duplicatedNote.payload.duplicate_of);
      expect(duplicatedNote.conflictOf).to.be.undefined;
      expect(duplicatedNote.payload.content.conflict_of).to.be.undefined;
    });

    it('should duplicate the item and set the duplicate_of and conflict_of properties', async function () {
      await this.itemManager.duplicateItem(this.note.uuid, true);
      sinon.assert.calledOnce(this.emitPayloads);

      const originalNote = this.itemManager.notes[0];
      const duplicatedNote = this.itemManager.notes[1];

      expect(this.itemManager.items.length).to.equal(2);
      expect(this.itemManager.notes.length).to.equal(2);
      expect(originalNote.uuid).to.not.equal(duplicatedNote.uuid);
      expect(originalNote.uuid).to.equal(duplicatedNote.duplicateOf);
      expect(originalNote.uuid).to.equal(duplicatedNote.payload.duplicate_of);
      expect(originalNote.uuid).to.equal(duplicatedNote.conflictOf);
      expect(originalNote.uuid).to.equal(duplicatedNote.payload.content.conflict_of);
    });
  });

  it('duplicate item with relationships', async function () {
    const note = await this.createNote();
    const tag = await this.createTag([note]);
    const duplicate = await this.itemManager.duplicateItem(tag.uuid);

    expect(duplicate.content.references.length).to.equal(1);
    expect(this.itemManager.items.length).to.equal(3);
    expect(this.itemManager.tags.length).to.equal(2);
  });

  it('create template item', async function () {
    const item = await this.itemManager.createTemplateItem(
      ContentType.Note,
      {
        title: 'hello'
      }
    );

    expect(item).to.be.ok;
    /* Template items should never be added to the record */
    expect(this.itemManager.items.length).to.equal(0);
    expect(this.itemManager.notes.length).to.equal(0);
  });

  it('set item deleted', async function () {
    const note = await this.createNote();
    await this.itemManager.setItemToBeDeleted(note.uuid);

    /** Items should never be mutated directly */
    expect(note.deleted).to.not.be.ok;

    const latestVersion = this.itemManager.findItem(note.uuid);
    expect(latestVersion.deleted).to.equal(true);
    expect(latestVersion.dirty).to.equal(true);
    expect(latestVersion.content).to.not.be.ok;
    /** Deleted items stick around until they are synced */
    expect(this.itemManager.items.length).to.equal(1);
    /** Deleted items do not show up in particular arrays (.notes, .tags, .components, etc) */
    expect(this.itemManager.notes.length).to.equal(0);
  });

  it('system smart tags', async function () {
    expect(this.itemManager.systemSmartTags.length).to.equal(3);
  });

  it('find tag by title', async function () {
    const tag = await this.createTag();

    expect(this.itemManager.findTagByTitle(tag.title)).to.be.ok;
  });

  it('find or create tag by title', async function () {
    const title = 'foo';

    expect(await this.itemManager.findOrCreateTagByTitle(title)).to.be.ok;
  });

  it('note count', async function () {
    await this.createNote();
    expect(this.itemManager.noteCount).to.equal(1);
  });

  it('trash', async function () {
    const note = await this.createNote();
    const versionTwo = await this.itemManager.changeItem(
      note.uuid,
      (mutator) => {
        mutator.trashed = true;
      }
    );

    expect(this.itemManager.trashSmartTag).to.be.ok;
    expect(versionTwo.trashed).to.equal(true);
    expect(versionTwo.dirty).to.equal(true);
    expect(versionTwo.content).to.be.ok;

    expect(this.itemManager.items.length).to.equal(1);
    expect(this.itemManager.trashedItems.length).to.equal(1);

    await this.itemManager.emptyTrash();
    const versionThree = this.itemManager.findItem(note.uuid);
    expect(versionThree.deleted).to.equal(true);
    expect(this.itemManager.trashedItems.length).to.equal(0);
  });

  it('remove all items from memory', async function () {
    const observed = [];
    this.itemManager.addObserver(
      ContentType.Any,
      (changed, inserted, discarded, ignored) => {
        observed.push({ changed, inserted, discarded, ignored });
      },
    );
    await this.createNote();
    await this.itemManager.removeAllItemsFromMemory();

    const deletionEvent = observed[1];
    expect(deletionEvent.discarded[0].deleted).to.equal(true);
    expect(this.itemManager.items.length).to.equal(0);
  });

  it('remove item locally', async function () {
    const observed = [];
    this.itemManager.addObserver(
      ContentType.Any,
      (changed, inserted, discarded, ignored) => {
        observed.push({ changed, inserted, discarded, ignored });
      },
    );
    const note = await this.createNote();
    await this.itemManager.removeItemLocally(note);

    expect(observed.length).to.equal(1);
    expect(this.itemManager.findItem(note.uuid)).to.not.be.ok;
  });

  it('emitting a payload from within observer should queue to end', async function () {
    /**
     * From within an item observer, we want to emit some changes and await them.
     * We expect that the end result is that whatever was most recently emitted,
     * is propagated to listeners after any pending observation events. That is, when you
     * emit items, it should be done serially, so that emitting while you're emitting does
     * not interrupt the current emission, but instead queues it. This is so that changes
     * are not propagated out of order.
     */
    const payload = Factory.createNotePayload();
    const changedTitle = 'changed title';
    let didEmit = false;
    let latestVersion;
    this.itemManager.addObserver(
      ContentType.Note,
      (changed, inserted, _discarded, _ignored) => {
        const all = changed.concat(inserted);
        if (!didEmit) {
          didEmit = true;
          const changedPayload = CopyPayload(
            payload,
            {
              content: {
                ...payload.content,
                title: changedTitle
              }
            }
          );
          this.itemManager.emitItemFromPayload(changedPayload);
        }
        latestVersion = all[0];
      }
    );
    await this.itemManager.emitItemFromPayload(payload);
    expect(latestVersion.title).to.equal(changedTitle);
  });
});