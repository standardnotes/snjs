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

  it('find', async () => {
    const payload = Factory.createNotePayload();
    const collection = new ImmutablePayloadCollection(
      [payload]
    );
    expect(collection.find(payload.uuid)).to.be.ok;
  });

  it('references', async () => {
    const payloads = Factory.createRelatedNoteTagPairPayload();
    const notePayload = payloads[0];
    const tagPayload = payloads[1];
    const collection = new ImmutablePayloadCollection(
      [notePayload, tagPayload]
    );
    const referencing = collection.elementsReferencingElement(notePayload);
    expect(referencing.length).to.equal(1);
  });

  it('conflict map', async () => {
    const payload = Factory.createNotePayload();
    const collection = new MutableCollection([payload]);
    const conflict = CopyPayload(
      payload,
      {
        content: {
          conflict_of: payload.uuid,
          ...payload.content
        }
      }
    );
    collection.set([conflict]);

    expect(collection.conflictsOf(payload.uuid)).to.eql([conflict]);

    const manualResults = collection.all().find((p) => {
      return p.safeContent.conflict_of === payload.uuid;
    });
    expect(collection.conflictsOf(payload.uuid)).to.eql([manualResults]);
  });

});
