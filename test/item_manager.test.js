/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
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

  beforeEach(async function () {
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

    this.createTag = async (notes) => {
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

    const itemsThatReference = this.itemManager.itemsThatReferenceItem(note);
    expect(itemsThatReference.length).to.equal(1);
    expect(itemsThatReference[0]).to.equal(tag);
  });
});