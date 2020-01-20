import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';
chai.use(chaiAsPromised);
var expect = chai.expect;

describe('payload collections', () => {
  const sharedApplication = Factory.createApplication();

  before(async () => {
    localStorage.clear();
    await Factory.initializeApplication(sharedApplication);
  });

  after(async () => {
    localStorage.clear();
  })

  it('find', async () => {
    const payload = Factory.createNotePayload()
    const collection = new PayloadCollection({
      payloads: [payload]
    });
    expect(collection.findPayload(payload.uuid)).to.be.ok;
  });

  it('references', async () => {
    const payloads = Factory.createRelatedNoteTagPairPayload();
    const notePayload = payloads[0];
    const tagPayload = payloads[1];
    const collection = new PayloadCollection({
      payloads: [notePayload, tagPayload]
    });
    const referencing = collection.payloadsThatReferencePayload(notePayload);
    expect(referencing.length).to.equal(1);
  });

  it('master collection', async () => {
    const note = await Factory.createMappedNote(sharedApplication);
    const masterCollection = sharedApplication.modelManager.getMasterCollection();
    const result = masterCollection.findPayload(note.uuid);
    expect(result.uuid).to.equal(note.uuid);
  })
})
