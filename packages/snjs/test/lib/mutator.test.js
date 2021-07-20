/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('mutator', () => {
  beforeEach(function () {
    this.createBarePayload = () => {
      return new PurePayload({
        uuid: '123',
        content_type: ContentType.Note,
        content: {
          title: 'hello',
        },
      });
    };

    this.createNote = () => {
      return new SNItem(this.createBarePayload());
    };

    this.createTag = (notes = []) => {
      const references = notes.map((note) => {
        return {
          uuid: note.uuid,
          content_type: note.content_type,
        };
      });
      return new SNTag(
        new PurePayload({
          uuid: Factory.generateUuidish(),
          content_type: ContentType.Tag,
          content: {
            title: 'thoughts',
            references: references,
          },
        })
      );
    };
  });

  it('mutate set domain data key', function () {
    const item = this.createNote();
    const mutator = new ItemMutator(item);
    mutator.setDomainDataKey('somekey', 'somevalue', 'somedomain');
    const payload = mutator.getResult();

    expect(payload.content.appData.somedomain.somekey).to.equal('somevalue');
  });

  it('mutate set pinned', function () {
    const item = this.createNote();
    const mutator = new ItemMutator(item);
    mutator.pinned = true;
    const payload = mutator.getResult();

    expect(payload.content.appData[SNItem.DefaultAppDomain()].pinned).to.equal(
      true
    );
  });

  it('mutate set archived', function () {
    const item = this.createNote();
    const mutator = new ItemMutator(item);
    mutator.archived = true;
    const payload = mutator.getResult();

    expect(
      payload.content.appData[SNItem.DefaultAppDomain()].archived
    ).to.equal(true);
  });

  it('mutate set locked', function () {
    const item = this.createNote();
    const mutator = new ItemMutator(item);
    mutator.locked = true;
    const payload = mutator.getResult();

    expect(payload.content.appData[SNItem.DefaultAppDomain()].locked).to.equal(
      true
    );
  });

  it('mutate set protected', function () {
    const item = this.createNote();
    const mutator = new ItemMutator(item);
    mutator.protected = true;
    const payload = mutator.getResult();

    expect(payload.content.protected).to.equal(true);
  });

  it('mutate set trashed', function () {
    const item = this.createNote();
    const mutator = new ItemMutator(item);
    mutator.trashed = true;
    const payload = mutator.getResult();

    expect(payload.content.trashed).to.equal(true);
  });

  it('calling get result should set us dirty', function () {
    const item = this.createNote();
    const mutator = new ItemMutator(item);
    const payload = mutator.getResult();

    expect(payload.dirty).to.equal(true);
  });

  it('get result should always have userModifiedDate', function () {
    const item = this.createNote();
    const mutator = new ItemMutator(item);
    const payload = mutator.getResult();
    const resultItem = CreateItemFromPayload(payload);
    expect(resultItem.userModifiedDate).to.be.ok;
  });

  it('mutate set deleted', function () {
    const item = this.createNote();
    const mutator = new ItemMutator(item);
    mutator.setDeleted();
    const payload = mutator.getResult();

    expect(payload.content).to.not.be.ok;
    expect(payload.deleted).to.equal(true);
    expect(payload.dirty).to.equal(true);
  });

  it('mutate app data', function () {
    const item = this.createNote();
    const mutator = new ItemMutator(item, MutationType.UserInteraction);
    mutator.setAppDataItem('foo', 'bar');
    mutator.setAppDataItem('bar', 'foo');
    const payload = mutator.getResult();
    expect(payload.content.appData[SNItem.DefaultAppDomain()].foo).to.equal(
      'bar'
    );
    expect(payload.content.appData[SNItem.DefaultAppDomain()].bar).to.equal(
      'foo'
    );
  });

  it('mutate add item as relationship', function () {
    const note = this.createNote();
    const tag = this.createTag();
    const mutator = new ItemMutator(tag);
    mutator.addItemAsRelationship(note);
    const payload = mutator.getResult();

    const item = new SNItem(payload);
    expect(item.hasRelationshipWithItem(note)).to.equal(true);
  });

  it('mutate remove item as relationship', function () {
    const note = this.createNote();
    const tag = this.createTag([note]);
    const mutator = new ItemMutator(tag);
    mutator.removeItemAsRelationship(note);
    const payload = mutator.getResult();

    const item = new SNItem(payload);
    expect(item.hasRelationshipWithItem(note)).to.equal(false);
  });
});
