/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('item manager', () => {

  before(async function () {
    localStorage.clear();
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

  after(async function () {
    localStorage.clear();
  });

  it('create item', async function () {
    const item = await this.createNote();

    expect(item).to.be.ok;
    expect(item.title).to.equal('hello');
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

  it('deleting from reference map', async function () {
    const note = await this.createNote();
    const tag = await this.createTag([note]);
    await this.itemManager.setItemToBeDeleted(note);

    expect(this.itemManager.referenceMap[tag.uuid]).to.eql([]);
    expect(this.itemManager.inverseReferenceMap[note.uuid]).to.not.be.ok;
  });

  it('items that reference item', async function () {
    const note = await this.createNote();
    const tag = await this.createTag([note]);

    const itemsThatReference = this.itemManager.itemsThatReferenceItem(note.uuid);
    expect(itemsThatReference.length).to.equal(1);
    expect(itemsThatReference[0]).to.equal(tag);
  });

  it('observer', async function () {
    const observed = [];
    this.itemManager.addObserver(
      ContentType.Any,
      async (items, source, sourceKey, type) => {
        observed.push({ items, source, sourceKey, type });
      },
    );
    const note = await this.createNote();
    const tag = await this.createTag([note]);
    expect(observed.length).to.equal(2);

    const firstObserved = observed[0];
    expect(firstObserved.items).to.eql([note]);
    expect(firstObserved.type).to.equal(ObservationType.Inserted);

    const secondObserved = observed[1];
    expect(secondObserved.items).to.eql([tag]);
    expect(secondObserved.type).to.equal(ObservationType.Inserted);
  });

  it('change item', async function () {
    const note = await this.createNote();
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

  it('set items dirty', async function () {
    const note = await this.createNote();
    await this.itemManager.setItemDirty(note);

    const dirtyItems = this.itemManager.getDirtyItems();
    expect(dirtyItems.length).to.equal(1);
    expect(dirtyItems[0].uuid).to.equal(note.uuid);
    expect(dirtyItems[0].dirty).to.equal(true);
  });

  it('duplicate item', async function () {
    const note = await this.createNote();
    await this.itemManager.duplicateItem(note);

    expect(this.itemManager.items.length).to.equal(2);
    expect(this.itemManager.notes.length).to.equal(2);
    expect(this.itemManager.notes[0].uuid).to.not.equal(this.itemManager.notes[1].uuid);
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
    await this.itemManager.setItemToBeDeleted(note);

    /** Items should never be mutated directly */
    expect(note.deleted).to.not.be.ok;
    const latestVersion = this.itemManager.findItem(note.uuid);
    expect(latestVersion.deleted).to.equal(true);
    expect(latestVersion.dirty).to.equal(true);
    expect(latestVersion.content).to.not.be.ok;
    /** Deleted items stick around until they are synced */
    expect(this.itemManager.items.length).to.equal(1);
    expect(this.itemManager.notes.length).to.equal(1);
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