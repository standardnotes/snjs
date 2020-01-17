import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('003 protocol operations', () => {

  before(async () => {
    localStorage.clear();
  })

  after(async () => {
    localStorage.clear();
  })

  let _identifier = "hello@test.com";
  let _password = "password";
  let _keyParams, _key;

  const sharedApplication = Factory.createApplication();
  const protocol_003 = new SNProtocolOperator003(new SNWebCrypto());

  // runs once before all tests in this block
  before(async () => {
    await Factory.initializeApplication(sharedApplication);
    const result = await protocol_003.createRootKey({
      identifier: _identifier,
      password: _password
    });
    _keyParams = result.keyParams;
    _key = result.key;
  });

  it('cost minimum', () => {
    let currentVersion = sharedApplication.protocolService.latestVersion();
    expect(sharedApplication.protocolService.costMinimumForVersion("003")).to.equal(110000);
  });

  it('generates random key', async () => {
    const length = 128;
    const key = await protocol_003.crypto.generateRandomKey(length);
    expect(key.length).to.equal(length/4);
  });

  it('generates valid keys for registration', async () => {
    const result = await protocol_003.createRootKey({
      identifier: _identifier,
      password: _password
    });
    expect(result).to.have.property("key");
    expect(result).to.have.property("keyParams");

    expect(result.key.dataAuthenticationKey).to.not.be.null;
    expect(result.key.serverPassword).to.not.be.null;
    expect(result.key.masterKey).to.not.be.null;

    expect(result.keyParams.seed).to.not.be.null;
    expect(result.keyParams.kdfIterations).to.not.be.null;
    expect(result.keyParams.salt).to.not.be.ok;
    expect(result.keyParams.identifier).to.be.ok;
  });

  it('properly encrypts and decrypts', async () => {
    let text = "hello world";
    let rawKey = _key.masterKey;
    let iv = await protocol_003.crypto.generateRandomKey(128);
    let wc_encryptionResult = await protocol_003.encryptText(text, rawKey, iv);
    let wc_decryptionResult = await protocol_003.decryptText({contentCiphertext: wc_encryptionResult, encryptionKey: rawKey, iv: iv})
    expect(wc_decryptionResult).to.equal(text);
  });

  it('generates existing keys for key params', async () => {
    const key = await protocol_003.computeRootKey({password: _password, keyParams: _keyParams});
    expect(key.compare(_key)).to.be.true;
  });
})
