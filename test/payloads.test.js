import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';
chai.use(chaiAsPromised);
var expect = chai.expect;

describe('payload', () => {

  const application = Factory.createApplication();

  before(async () => {
    await Factory.initializeApplication(application);
  });

  it('creating payload from item should create copy not by reference', async () => {
    const item = await Factory.createMappedNote(application.modelManager);
    const payload = CreateMaxPayloadFromItem({item});
    expect(item.content === payload.content).to.equal(false);
    expect(item.content.references === payload.content.references).to.equal(false);
  });

  it('creating payload from item should preserve appData', async () => {
    const item = await Factory.createMappedNote(application.modelManager);
    const payload = CreateMaxPayloadFromItem({item});
    expect(item.content.appData).to.be.ok;
    expect(JSON.stringify(item.content)).to.equal(JSON.stringify(payload.content));
  });

  it('creating payload with override properties', async () => {
    const payload = Factory.createNotePayload();
    const uuid = payload.uuid;
    const changedUuid = 'foo';
    const changedPayload = CreatePayloadFromAnyObject({
      object: payload,
      override: {
        uuid: changedUuid
      }
    })

    expect(payload.uuid).to.equal(uuid);
    expect(changedPayload.uuid).to.equal(changedUuid);
  });

  it('creating payload with deep override properties', async () => {
    const payload = Factory.createNotePayload();
    const text = payload.content.text;
    const changedText = `${Math.random()}`;
    const changedPayload = CreatePayloadFromAnyObject({
      object: payload,
      override: {
        content: {
          text: changedText
        }
      }
    })

    expect(payload.content === changedPayload.content).to.equal(false);
    expect(payload.content.text).to.equal(text);
    expect(changedPayload.content.text).to.equal(changedText);
  });

})
