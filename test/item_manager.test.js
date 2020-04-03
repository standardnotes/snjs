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
  });

  after(async function () {
    localStorage.clear();
  });

  it('create item', async function () {
    const item = await this.itemManager.createItem(
      ContentType.Note,
      BuildItemContent({
        title: 'hello',
        text: 'world'
      })
    );

    expect(item).to.be.ok;
    expect(item.title).to.equal('hello');
    expect(this.itemManager.items.length).to.equal(1);
    expect(this.itemManager.notes.length).to.equal(1);
  });
});
