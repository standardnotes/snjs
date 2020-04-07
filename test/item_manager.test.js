/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

const expectThrowsAsync = async (method, errorMessage) => {
  let error = null;
  try {
    await method();
  }
  catch (err) {
    error = err;
  }
  expect(error).to.be.an('Error');
  if (errorMessage) {
    expect(error.message).to.equal(errorMessage);
  }
};

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
        BuildItemContent({
          title: 'hello',
          text: 'world'
        })
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
        BuildItemContent({
          title: 'thoughts',
          references: references
        })
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

    expect(this.itemManager.referenceMap[tag.uuid]).to.eql([note.uuid]);
  });

  it('inverse reference map', async function () {
    const note = await this.createNote();
    const tag = await this.createTag([note]);

    expect(this.itemManager.inverseReferenceMap[note.uuid]).to.eql([tag.uuid]);
  });

  it('inverse reference map should not have duplicates', async function () {
    const note = await this.createNote();
    const tag = await this.createTag([note]);
    await this.itemManager.changeItem(tag, () => {});

    expect(this.itemManager.inverseReferenceMap[note.uuid]).to.eql([tag.uuid]);
  });

  it('deleting from reference map', async function () {
    const note = await this.createNote();
    const tag = await this.createTag([note]);
    await this.itemManager.setItemToBeDeleted(note.uuid);

    expect(this.itemManager.referenceMap[tag.uuid]).to.eql([]);
    expect(this.itemManager.inverseReferenceMap[note.uuid]).to.not.be.ok;
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
    await this.itemManager.changeItem(tag, (mutator) => {
      mutator.removeItemAsRelationship(note);
    });

    expect(this.itemManager.referenceMap[tag.uuid]).to.eql([]);
    expect(this.itemManager.inverseReferenceMap[note.uuid]).to.eql([]);
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
      async (changed, inserted, discarded, source, sourceKey) => {
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
    await this.itemManager.changeNote(
      note.uuid,
      (mutator) => {
        mutator.title = newTitle;
      }
    );

    const latestVersion = this.itemManager.findItem(note.uuid);
    expect(latestVersion.title).to.equal(newTitle);
  });

  it('change non-existing item through item ref should succeed', async function () {
    const note = await this.itemManager.createTemplateItem(
      ContentType.Note,
      BuildItemContent({
        title: 'hello',
        text: 'world'
      })
    );
    const newTitle = String(Math.random());
    await this.itemManager.changeNote(
      note,
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
      BuildItemContent({
        title: 'hello',
        text: 'world'
      })
    );

    const changeFn = async () => {
      const newTitle = String(Math.random());
      return this.itemManager.changeNote(
        note.uuid,
        (mutator) => {
          mutator.title = newTitle;
        }
      );
    };
    await expectThrowsAsync(() => changeFn(), 'Attempting to change non-existant note');
  });

  it('set items dirty', async function () {
    const note = await this.createNote();
    await this.itemManager.setItemDirty(note.uuid);

    const dirtyItems = this.itemManager.getDirtyItems();
    expect(dirtyItems.length).to.equal(1);
    expect(dirtyItems[0].uuid).to.equal(note.uuid);
    expect(dirtyItems[0].dirty).to.equal(true);
  });

  it('duplicate item', async function () {
    const note = await this.createNote();
    await this.itemManager.duplicateItem(note.uuid);

    expect(this.itemManager.items.length).to.equal(2);
    expect(this.itemManager.notes.length).to.equal(2);
    expect(this.itemManager.notes[0].uuid).to.not.equal(this.itemManager.notes[1].uuid);
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
      note,
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
      async (items, source, sourceKey, type) => {
        observed.push({ items, source, sourceKey, type });
      },
    );
    await this.createNote();
    await this.itemManager.removeAllItemsFromMemory();

    const deletionEvent = observed[1];
    expect(deletionEvent.items[0].deleted).to.equal(true);
    expect(this.itemManager.items.length).to.equal(0);
  });

  it('remove item locally', async function () {
    const observed = [];
    this.itemManager.addObserver(
      ContentType.Any,
      async (items, source, sourceKey, type) => {
        observed.push({ items, source, sourceKey, type });
      },
    );
    const note = await this.createNote();
    await this.itemManager.removeItemLocally(note);

    expect(observed.length).to.equal(1);
    expect(this.itemManager.findItem(note.uuid)).to.not.be.ok;
  });
});