/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('000 protocol operations', () => {
  const application = Factory.createApplication();
  const protocol000 = new SNProtocolOperator004(new SNWebCrypto());

  before(async () => {
    await Factory.initializeApplication(application);
  });

  after(() => {
    await Factory.safeDeinit(application);
  });

  it('can decode 000 item', async function () {
    const string =
      '000eyJyZWZlcmVuY2VzIjpbeyJ1dWlkIjoiZGMwMDUwZWUtNWQyNi00MGMyLWJjMjAtYzU1ZWE1Yjc4MmUwIiwiY29udGVudF90eXBlIjoiU058VXNlclByZWZlcmVuY2VzIn1dLCJhcHBEYXRhIjp7Im9yZy5zdGFuZGFyZG5vdGVzLnNuIjp7ImNsaWVudF91cGRhdGVkX2F0IjoiMjAyMC0wNC0wOFQxNDoxODozNC4yNzBaIn19LCJ0aXRsZSI6IjAuMDMyMzc3OTQyMDUxNzUzMzciLCJ0ZXh0Ijoid29ybGQifQ==';
    const payload = CreateMaxPayloadFromAnyObject({
      uuid: 'foo',
      content: string,
      content_type: 'foo',
    });
    const decoded = await protocol000.generateDecryptedParameters(payload);
    expect(decoded.content.text).to.equal('world');
  });
});
