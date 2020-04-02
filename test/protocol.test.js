/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('protocol', () => {
  const application = Factory.createApplication();
  before(async () => {
    localStorage.clear();
    await Factory.initializeApplication(application);
  });

  after(() => {
    application.deinit();
    localStorage.clear();
  });

  it('checks version to make sure its 004', () => {
    expect(application.protocolService.getLatestVersion()).to.equal('004');
  });

  it('checks supported versions to make sure it includes 001, 002, 003, 004', () => {
    expect(application.protocolService.supportedVersions()).to.eql(['001', '002', '003', '004']);
  });

  it('platform derivation support', () => {
    expect(application.protocolService.platformSupportsKeyDerivation({ version: '001' })).to.equal(true);
    expect(application.protocolService.platformSupportsKeyDerivation({ version: '002' })).to.equal(true);
    expect(application.protocolService.platformSupportsKeyDerivation({ version: '003' })).to.equal(true);
    expect(application.protocolService.platformSupportsKeyDerivation({ version: '004' })).to.equal(true);
    expect(application.protocolService.platformSupportsKeyDerivation({ version: '005' })).to.equal(true);
  });

  it('key params versions <= 002 should include pw_cost in portable value', () => {
    const keyParams002 = application.protocolService.createKeyParams({
      version: '002',
      pw_cost: 5000
    });
    expect(keyParams002.getPortableValue().pw_cost).to.be.ok;
  });

  it('key params versions >= 003 should not include pw_cost in portable value', () => {
    const keyParams003 = application.protocolService.createKeyParams({
      version: '003',
      pw_cost: 110000
    });
    expect(keyParams003.getPortableValue().pw_cost).to.not.be.ok;
  });

  it('version comparison of 002 should be older than library version', () => {
    expect(application.protocolService.isVersionNewerThanLibraryVersion('002')).to.equal(false);
  });

  it('version comparison of 005 should be newer than library version', () => {
    expect(application.protocolService.isVersionNewerThanLibraryVersion('005')).to.equal(true);
  });

  it('library version should not be outdated', () => {
    var currentVersion = application.protocolService.getLatestVersion();
    expect(application.protocolService.isProtocolVersionOutdated(currentVersion)).to.equal(false);
  });

  it('decrypting already decrypted payload should return same payload', async function () {
    const payload = Factory.createNotePayload();
    const result = await application.protocolService.payloadByDecryptingPayload(payload);
    expect(payload).to.equal(result);
    expect(result.errorDecrypting).to.not.be.ok;
  });

  it('decrypting 000 payload should succeed', async function () {
    const payload = CreateMaxPayloadFromAnyObject(
      {
        uuid: await Uuid.GenerateUuid(),
        content_type: ContentType.Mfa,
        content: {
          secret: '123'
        }
      }
    );
    const encrypted = await application.protocolService.payloadByEncryptingPayload(
      payload,
      EncryptionIntents.SyncDecrypted
    );
    expect(encrypted.content.startsWith('000')).to.equal(true);
    const decrypted = await application.protocolService.payloadByDecryptingPayload(encrypted);
    expect(decrypted.errorDecrypting).to.not.be.ok;
    expect(decrypted.content.secret).to.equal(payload.content.secret);
  });
});
