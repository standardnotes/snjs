/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('payload collections', () => {
  before(async () => {
    localStorage.clear();
  });

  after(async () => {
    localStorage.clear();
  });

  const copyPayload = (payload, timestamp, changeUuid) => {
    return CopyPayload(payload, {
      uuid: changeUuid ? Factory.generateUuidish() : payload.uuid,
      created_at: timestamp ? new Date(timestamp) : new Date(),
    });
  };

  it('find', async () => {
    const payload = Factory.createNotePayload();
    const collection = ImmutablePayloadCollection.WithPayloads([payload]);
    expect(collection.find(payload.uuid)).to.be.ok;
  });

  it('references', async () => {
    const payloads = Factory.createRelatedNoteTagPairPayload();
    const notePayload = payloads[0];
    const tagPayload = payloads[1];
    const collection = ImmutablePayloadCollection.WithPayloads([
      notePayload,
      tagPayload,
    ]);
    const referencing = collection.elementsReferencingElement(notePayload);
    expect(referencing.length).to.equal(1);
  });

  it('conflict map', async () => {
    const payload = Factory.createNotePayload();
    const collection = new ItemCollection();
    collection.set([payload]);
    const conflict = CopyPayload(payload, {
      content: {
        conflict_of: payload.uuid,
        ...payload.content,
      },
    });
    collection.set([conflict]);

    expect(collection.conflictsOf(payload.uuid)).to.eql([conflict]);

    const manualResults = collection.all().find((p) => {
      return p.safeContent.conflict_of === payload.uuid;
    });
    expect(collection.conflictsOf(payload.uuid)).to.eql([manualResults]);
  });

  it('setting same element twice should not yield duplicates', async () => {
    const collection = new ItemCollection();
    collection.setDisplayOptions(
      ContentType.Note,
      CollectionSort.CreatedAt,
      'asc'
    );
    const payload = Factory.createNotePayload();

    const copy = CopyPayload(payload);
    collection.set([payload, copy]);
    collection.set([payload]);
    collection.set([payload, copy]);

    const sorted = collection.displayElements(ContentType.Note);
    expect(sorted.length).to.equal(1);
  });

  it('display sort asc', async () => {
    const collection = new ItemCollection();
    collection.setDisplayOptions(
      ContentType.Note,
      CollectionSort.CreatedAt,
      'asc'
    );
    const present = Factory.createNotePayload();
    const oldest = CopyPayload(present, {
      uuid: Factory.generateUuidish(),
      created_at: Factory.yesterday(),
    });
    const newest = CopyPayload(present, {
      uuid: Factory.generateUuidish(),
      created_at: Factory.tomorrow(),
    });
    collection.set([newest, oldest, present]);
    const sorted = collection.displayElements(ContentType.Note);

    expect(sorted[0].uuid).to.equal(oldest.uuid);
    expect(sorted[1].uuid).to.equal(present.uuid);
    expect(sorted[2].uuid).to.equal(newest.uuid);
  });

  it('display sort dsc', async () => {
    const collection = new ItemCollection();
    collection.setDisplayOptions(
      ContentType.Note,
      CollectionSort.CreatedAt,
      'dsc'
    );
    const present = Factory.createNotePayload();
    const oldest = CopyPayload(present, {
      uuid: Factory.generateUuidish(),
      created_at: Factory.yesterday(),
    });
    const newest = CopyPayload(present, {
      uuid: Factory.generateUuidish(),
      created_at: Factory.tomorrow(),
    });
    collection.set([oldest, newest, present]);
    const sorted = collection.displayElements(ContentType.Note);

    expect(sorted[0].uuid).to.equal(newest.uuid);
    expect(sorted[1].uuid).to.equal(present.uuid);
    expect(sorted[2].uuid).to.equal(oldest.uuid);
  });

  it('display sort filter asc', async () => {
    const collection = new ItemCollection();
    const filterFor = 'fo';
    collection.setDisplayOptions(
      ContentType.Note,
      CollectionSort.CreatedAt,
      'asc',
      (element) => {
        return element.content.title.includes(filterFor);
      }
    );
    const passes1 = Factory.createNotePayload('fo');
    const passes2 = Factory.createNotePayload('foo');
    const fails = Factory.createNotePayload('bar');

    collection.set([passes1, passes2, fails]);
    const filtered = collection.displayElements(ContentType.Note);
    expect(filtered.length).to.equal(2);

    expect(filtered[0].content.title.includes(filterFor)).to.equal(true);
    expect(filtered[1].content.title.includes(filterFor)).to.equal(true);
  });

  it('deleting should remove from displayed elements', async () => {
    const collection = new ItemCollection();
    collection.setDisplayOptions(
      ContentType.Note,
      CollectionSort.CreatedAt,
      'asc'
    );
    const present = Factory.createNotePayload();
    collection.set([present]);

    expect(collection.all(ContentType.Note).length).to.equal(1);
    expect(collection.displayElements(ContentType.Note).length).to.equal(1);

    const deleted = CopyPayload(present, {
      deleted: true,
    });
    collection.set([deleted]);

    expect(
      collection.all(ContentType.Note).filter((n) => !n.deleted).length
    ).to.equal(0);
    expect(collection.displayElements(ContentType.Note).length).to.equal(0);
  });

  it('changing element should update sort order', async () => {
    const collection = new ItemCollection();
    collection.setDisplayOptions(
      ContentType.Note,
      CollectionSort.CreatedAt,
      'asc'
    );
    const base = Factory.createNotePayload();
    const payload1 = copyPayload(base, 1000, true);
    const payload2 = copyPayload(base, 2000, true);
    const payload3 = copyPayload(base, 3000, true);

    collection.set([payload2, payload1, payload3]);
    let displayed = collection.displayElements(ContentType.Note);

    expect(displayed[0].uuid).to.equal(payload1.uuid);
    expect(displayed[1].uuid).to.equal(payload2.uuid);
    expect(displayed[2].uuid).to.equal(payload3.uuid);

    const changed2 = copyPayload(payload2, 4000, false);
    collection.set([changed2]);

    displayed = collection.displayElements(ContentType.Note);
    expect(displayed.length).to.equal(3);

    expect(displayed[0].uuid).to.equal(payload1.uuid);
    expect(displayed[1].uuid).to.equal(payload3.uuid);
    expect(displayed[2].uuid).to.equal(payload2.uuid);
  });

  it('pinning note should update sort', async () => {
    const collection = new ItemCollection();
    collection.setDisplayOptions(
      ContentType.Note,
      CollectionSort.CreatedAt,
      'asc'
    );
    const unpinned1 = CreateItemFromPayload(Factory.createNotePayload('fo'));
    const unpinned2 = CreateItemFromPayload(Factory.createNotePayload('foo'));

    collection.set([unpinned1, unpinned2]);
    const sorted = collection.displayElements(ContentType.Note);

    expect(sorted[0].uuid).to.equal(unpinned1.uuid);
    expect(sorted[1].uuid).to.equal(unpinned2.uuid);

    const pinned2 = CreateItemFromPayload(
      CopyPayload(unpinned2.payload, {
        content: {
          ...unpinned1.content,
          appData: {
            [SNItem.DefaultAppDomain()]: {
              pinned: true,
            },
          },
        },
      })
    );
    collection.set(pinned2);
    const resorted = collection.displayElements(ContentType.Note);

    expect(resorted[0].uuid).to.equal(unpinned2.uuid);
    expect(resorted[1].uuid).to.equal(unpinned1.uuid);
  });

  it('setDisplayOptions should not fail for encrypted items', async () => {
    const collection = new ItemCollection();
    const regularPayload1 = CreateItemFromPayload(
      Factory.createNotePayload('foo', 'noteText')
    );
    const regularPayload2 = CreateItemFromPayload(
      Factory.createNotePayload('foo', 'noteText2')
    );
    const encryptedPayloadUpdated = CreateItemFromPayload(
      CopyPayload(regularPayload1.payload, {
        ...regularPayload1.payload,
        errorDecrypting: true,
        content: 'ssss',
        uuid: Factory.generateUuidish(),
      })
    );
    collection.set([regularPayload1, encryptedPayloadUpdated, regularPayload2]);
    collection.setDisplayOptions(
      ContentType.Note,
      CollectionSort.UpdatedAt,
      'asc'
    );
    const displayed = collection.displayElements(ContentType.Note);
    expect(displayed.length).to.equal(3);
    expect(displayed[0].errorDecrypting).to.equal(true);
    expect(displayed[1].text).to.equal('noteText');
    expect(displayed[2].text).to.equal('noteText2');
  });
});
