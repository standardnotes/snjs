/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('001 protocol operations', () => {

  const application = Factory.createApplication();
  const protocol001 = new SNProtocolOperator001(new SNWebCrypto());

  const _identifier = 'hello@test.com';
  const _password = 'password';
  let _keyParams, _key;

  // runs once before all tests in this block
  before(async () => {
    localStorage.clear();
    await Factory.initializeApplication(application);
    _key = await protocol001.createRootKey(_identifier, _password, KeyParamsOrigination.Registration);
    _keyParams = _key.keyParams;
  });

  after(() => {
    application.deinit();
  });

  it('generates random key', async () => {
    const length = 128;
    const key = await protocol001.crypto.generateRandomKey(length);
    expect(key.length).to.equal(length / 4);
  });

  it('cost minimum', () => {
    expect(application.protocolService.costMinimumForVersion('001')).to.equal(3000);
  });

  it('generates valid keys for registration', async () => {
    const key = await protocol001.createRootKey(_identifier, _password, KeyParamsOrigination.Registration);
    expect(key.serverPassword).to.be.ok;
    expect(key.masterKey).to.be.ok;

    expect(key.keyParams.content.pw_nonce).to.not.be.ok;
    expect(key.keyParams.content.pw_cost).to.be.ok;
    expect(key.keyParams.content.pw_salt).to.be.ok;
  });

  it('properly encrypts and decrypts', async () => {
    const text = 'hello world';
    const key = _key.masterKey;
    const encString = await protocol001.encryptString(text, key);
    const decString = await protocol001.decryptString(encString, key);
    expect(decString).to.equal(text);
  });

  it('generates existing keys for key params', async () => {
    const key = await protocol001.computeRootKey(
      _password,
      _keyParams
    );
    expect(key.content).to.have.property('serverPassword');
    expect(key.content).to.have.property('masterKey');
    expect(key.compare(_key)).to.be.true;
  });

  it('generating encryption params includes items_key_id', async () => {
    const payload = Factory.createNotePayload();
    const key = await protocol001.createItemsKey();
    const params = await protocol001.generateEncryptedParameters(
      payload,
      PayloadFormat.EncryptedString,
      key,
    );
    expect(params.content).to.be.ok;
    expect(params.enc_item_key).to.be.ok;
    expect(params.auth_hash).to.be.ok;
    expect(params.items_key_id).to.equal(key.uuid);
  });

  it('can decrypt encrypted params', async () => {
    const payload = Factory.createNotePayload();
    const key = await protocol001.createItemsKey();
    const params = await protocol001.generateEncryptedParameters(
      payload,
      PayloadFormat.EncryptedString,
      key,
    );

    const decrypted = await protocol001.generateDecryptedParameters(
      params,
      key
    );
    expect(decrypted.content).to.eql(payload.content);
  });
});
