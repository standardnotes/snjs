/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('002 protocol operations', () => {

  const _identifier = 'hello@test.com';
  const _password = 'password';
  let _keyParams, _key;
  const application = Factory.createApplication();
  const protocol002 = new SNProtocolOperator002(new SNWebCrypto());

  // runs once before all tests in this block
  before(async () => {
    localStorage.clear();
    await Factory.initializeApplication(application);
    _key = await protocol002.createRootKey(_identifier, _password);
    _keyParams = _key.keyParams;
  });

  after(() => {
    application.deinit();
  });

  it('generates random key', async () => {
    const length = 128;
    const key = await protocol002.crypto.generateRandomKey(length);
    expect(key.length).to.equal(length / 4);
  });

  it('cost minimum', () => {
    expect(application.protocolService.costMinimumForVersion('002')).to.equal(3000);
  });

  it('generates valid keys for registration', async () => {
    const key = await protocol002.createRootKey(_identifier, _password);
    expect(key.dataAuthenticationKey).to.be.ok;
    expect(key.serverPassword).to.be.ok;
    expect(key.masterKey).to.be.ok;

    expect(key.keyParams.content.pw_nonce).to.not.be.ok;
    expect(key.keyParams.content.pw_cost).to.be.ok;
    expect(key.keyParams.content.pw_salt).to.be.ok;
  });

  it('properly encrypts and decrypts strings', async () => {
    const text = 'hello world';
    const key = _key.masterKey;
    const iv = await protocol002.crypto.generateRandomKey(128);
    const encString = await protocol002.encryptString(text, key, iv);
    const decString = await protocol002.decryptString(encString, key, iv);
    expect(decString).to.equal(text);
  });

  it('generates existing keys for key params', async () => {
    const key = await protocol002.computeRootKey(_password, _keyParams);
    expect(key.compare(_key)).to.be.true;
  });

  it('generating encryption params includes items_key_id', async () => {
    const payload = Factory.createNotePayload();
    const key = await protocol002.createItemsKey();
    const params = await protocol002.generateEncryptedParameters(
      payload,
      PayloadFormat.EncryptedString,
      key,
    );
    expect(params.content).to.be.ok;
    expect(params.enc_item_key).to.be.ok;
    expect(params.items_key_id).to.equal(key.uuid);
  });

  it('can decrypt encrypted params', async () => {
    const payload = Factory.createNotePayload();
    const key = await protocol002.createItemsKey();
    const params = await protocol002.generateEncryptedParameters(
      payload,
      PayloadFormat.EncryptedString,
      key,
    );

    const decrypted = await protocol002.generateDecryptedParameters(
      params,
      key
    );
    expect(decrypted.content).to.eql(payload.content);
  });
});
