/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('002 protocol operations', () => {

  const _identifier = "hello@test.com";
  const _password = "password";
  let _keyParams, _key;
  const application = Factory.createApplication();
  const protocol002 = new SNProtocolOperator002(new SNWebCrypto());

  // runs once before all tests in this block
  before(async () => {
    localStorage.clear();
    await Factory.initializeApplication(application);
    const result = await protocol002.createRootKey({ identifier: _identifier, password: _password });
    _keyParams = result.keyParams;
    _key = result.key;
  });

  after(() => {
    application.deinit();
  });

  it('cost minimum', () => {
    expect(application.protocolService.costMinimumForVersion("002")).to.equal(3000);
  });

  it('generates random key', async () => {
    const length = 128;
    const key = await protocol002.crypto.generateRandomKey(length);
    expect(key.length).to.equal(length / 4);
  });

  it('generates valid keys for registration', async () => {
    const result = await protocol002.createRootKey({ identifier: _identifier, password: _password });
    expect(result).to.have.property("key");
    expect(result).to.have.property("keyParams");

    expect(result.key.dataAuthenticationKey).to.not.be.null;
    expect(result.key.serverPassword).to.not.be.null;
    expect(result.key.masterKey).to.not.be.null;

    expect(result.keyParams.seed).to.not.be.null;
    expect(result.keyParams.kdfIterations).to.not.be.null;
    expect(result.keyParams.salt).to.not.be.null;
  });

  it('properly encrypts and decrypts strings', async () => {
    const text = "hello world";
    const key = _key.masterKey;
    const iv = await protocol002.crypto.generateRandomKey(128);
    const encString = await protocol002.encryptString(text, key, iv);
    const decString = await protocol002.decryptString(encString, key, iv);
    expect(decString).to.equal(text);
  });

  it('generates existing keys for key params', async () => {
    const key = await protocol002.computeRootKey({ password: _password, keyParams: _keyParams });
    expect(key.compare(_key)).to.be.true;
  });

  it('generating encryption params includes items_key_id', async () => {
    const payload = Factory.createNotePayload();
    const key = await protocol002.createItemsKey();
    const params = await protocol002.generateEncryptionParameters({
      payload,
      key,
      format: PayloadFormats.EncryptedString
    });
    expect(params.content).to.be.ok;
    expect(params.enc_item_key).to.be.ok;
    expect(params.items_key_id).to.equal(key.uuid);
  });

  it('can decrypt encrypted params', async () => {
    const payload = Factory.createNotePayload();
    const key = await protocol002.createItemsKey();
    const params = await protocol002.generateEncryptionParameters({
      payload,
      key,
      format: PayloadFormats.EncryptedString
    });

    const decrypted = await protocol002.generateDecryptedParameters({
      encryptedParameters: params,
      key: key
    });
    expect(decrypted.content).to.eql(payload.content);
  });
});
