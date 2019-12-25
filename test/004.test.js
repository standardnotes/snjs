import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';

const sn_webprotocolManager = new SNProtocolManager(new SNWebCrypto());

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('004 protocol operations', () => {

  var _identifier = "hello@test.com";
  var _password = "password";
  var _keyParams, _key;

  before((done) => {
    // runs before all tests in this block
    sn_webprotocolManager.createRootKey({identifier: _identifier, password: _password}).then((result) => {
      _keyParams = result.keyParams;
      _key = result.key;
      done();
    })
  });

  it('cost minimum for 004 to be 500,000', () => {
    var currentVersion = sn_webprotocolManager.version();
    expect(sn_webprotocolManager.costMinimumForVersion("004")).to.equal(500000);
  });

  it('generates valid keys for registration', async () => {
    const result = await sn_webprotocolManager.createRootKey({identifier: _identifier, password: _password});

    expect(result).to.have.property("key");
    expect(result).to.have.property("keyParams");

    expect(result.key.masterKey).to.be.ok;
    expect(result.key.dataAuthenticationKey).to.not.be.ok;
    expect(result.key.serverAuthenticationValue).to.not.be.null;
    expect(result.key.mk).to.not.be.ok;

    expect(result.keyParams.seed).to.not.be.null;
    expect(result.keyParams.kdfIterations).to.not.be.null;
    expect(result.keyParams.salt).to.not.be.ok;
    expect(result.keyParams.identifier).to.be.ok;
  });

  it('generates random key', async () => {
    const length = 96;
    const key = await sn_webprotocolManager.crypto.generateRandomKey(length);
    expect(key.length).to.equal(length/4);
  });

  it('properly encrypts and decrypts', async () => {
    var text = "hello world";
    var rawKey = _key.masterKey;
    var iv = await sn_webprotocolManager.crypto.generateRandomKey(96);
    const additionalData = {foo: "bar"};
    let wc_encryptionResult = await sn_webprotocolManager.defaultOperator().encryptText({
      plaintext: text,
      rawKey: rawKey,
      iv: iv,
      aad: additionalData
    });
    let wc_decryptionResult = await sn_webprotocolManager.defaultOperator().decryptText({
      ciphertext: wc_encryptionResult,
      rawKey: rawKey,
      iv: iv,
      aad: additionalData
    })
    expect(wc_decryptionResult).to.equal(text);
  });

  it('fails to decrypt non-matching aad', async () => {
    var text = "hello world";
    var rawKey = _key.masterKey;
    var iv = await sn_webprotocolManager.crypto.generateRandomKey(96);
    const aad = {foo: "bar"};
    const nonmatchingAad = {foo: "rab"};
    let wc_encryptionResult = await sn_webprotocolManager.defaultOperator().encryptText({
      plaintext: text,
      rawKey: rawKey,
      iv,
      aad: aad
    });
    let wc_decryptionResult = await sn_webprotocolManager.defaultOperator().decryptText({
      ciphertext: wc_encryptionResult,
      rawKey: rawKey,
      iv: iv,
      aad: nonmatchingAad
    })
    expect(wc_decryptionResult).to.not.equal(text);
  });

  it('generates existing keys for key params', async () => {
    const key = await sn_webprotocolManager.computeRootKey({password: _password, keyParams: _keyParams});
    expect(key.compare(_key)).to.be.true;
  });
})
