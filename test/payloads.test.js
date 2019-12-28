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

})
