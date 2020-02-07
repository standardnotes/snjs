/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('001 protocol operations', () => {

  const application = Factory.createApplication();
  const protocol001 = new SNProtocolOperator001(new SNWebCrypto());

  const _identifier = "hello@test.com";
  const _password = "password";
  let _keyParams, _key;

  // runs once before all tests in this block
  before(async () => {
    localStorage.clear();
    await Factory.initializeApplication(application);
    const result = await protocol001.createRootKey({ identifier: _identifier, password: _password });
    _keyParams = result.keyParams;
    _key = result.key;
  });

  after(() => {
    application.deinit();
  });

  it('cost minimum', () => {
    expect(application.protocolService.costMinimumForVersion("001")).to.equal(3000);
  });

  it('generates random key', async () => {
    const length = 128;
    const key = await protocol001.crypto.generateRandomKey(length);
    expect(key.length).to.equal(length / 4);
  });

  it('generates valid keys for registration', async () => {
    const result = await protocol001.createRootKey({ identifier: _identifier, password: _password });
    expect(result).to.have.property("key");
    expect(result).to.have.property("keyParams");

    expect(result.key.serverPassword).to.not.be.null;
    expect(result.key.masterKey).to.not.be.null;

    expect(result.keyParams.seed).to.not.be.null;
    expect(result.keyParams.kdfIterations).to.not.be.null;
    expect(result.keyParams.salt).to.not.be.null;
  });

  it('properly encrypts and decrypts', async () => {
    const text = "hello world";
    const key = _key.masterKey;
    const iv = await protocol001.crypto.generateRandomKey(128);
    const wcEncryptionResult = await protocol001.encryptText(text, key, iv);
    const wcDecryptionResult = await protocol001.decryptText({
      contentCiphertext: wcEncryptionResult, encryptionKey: key, iv: iv
    });
    expect(wcDecryptionResult).to.equal(text);
  });

  it('generates existing keys for key params', async () => {
    const key = await protocol001.computeRootKey({ password: _password, keyParams: _keyParams });
    expect(key.content).to.have.property("pw");
    expect(key.content).to.have.property("mk");
    expect(key.compare(_key)).to.be.true;
  });
});
