import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';

const sn_webprotocolManager = new SNProtocolManager(new SNWebCrypto());

chai.use(chaiAsPromised);
var expect = chai.expect;

describe.only('004 protocol operations', () => {

  var _identifier = "hello@test.com";
  var _password = "password";
  var _keyParams, _keys;

  before((done) => {
    // runs before all tests in this block
    sn_webprotocolManager.createRootKey({identifier: _identifier, password: _password}).then((result) => {
      _keyParams = result.keyParams;
      _keys = result.keys;
      done();
    })
  });

  it('cost minimum for 004 to be 500,000', () => {
    var currentVersion = sn_webprotocolManager.version();
    expect(sn_webprotocolManager.costMinimumForVersion("004")).to.equal(500000);
  });

  it('generates valid keys for registration', async () => {
    const result = await sn_webprotocolManager.createRootKey({identifier: _identifier, password: _password});
    expect(result).to.have.property("keys");
    expect(result).to.have.property("keyParams");

    expect(result.keys).to.have.property("masterKey");
    expect(result.keys).to.have.property("itemsKey");
    expect(result.keys).to.have.property("serverPassword");
    expect(result.keys).to.not.have.property("mk");

    expect(result.keyParams).to.have.property("seed");
    expect(result.keyParams).to.have.property("iterations");
    expect(result.keyParams).to.have.property("identifier");
    expect(result.keyParams).to.have.property("version");
  });

  it('generates random key', async () => {
    const length = 96;
    const key = await sn_webprotocolManager.crypto.generateRandomKey(length);
    expect(key.length).to.equal(length/4);
  });

  it('properly encrypts and decrypts', async () => {
    var text = "hello world";
    var key = _keys.itemsKey;
    var iv = await sn_webprotocolManager.crypto.generateRandomKey(96);
    const additionalData = {foo: "bar"};
    let wc_encryptionResult = await sn_webprotocolManager.defaultOperator().encryptText({plaintext: text, key, iv, aad: additionalData});
    let wc_decryptionResult = await sn_webprotocolManager.defaultOperator().decryptText({ciphertext: wc_encryptionResult, key: key, iv: iv, aad: additionalData})
    expect(wc_decryptionResult).to.equal(text);
  });

  it('fails to decrypt non-matching aad', async () => {
    var text = "hello world";
    var key = _keys.itemsKey;
    var iv = await sn_webprotocolManager.crypto.generateRandomKey(96);
    const aad = {foo: "bar"};
    const nonmatchingAad = {foo: "rab"};
    let wc_encryptionResult = await sn_webprotocolManager.defaultOperator().encryptText({
      plaintext: text,
      key,
      iv,
      aad: aad
    });
    let wc_decryptionResult = await sn_webprotocolManager.defaultOperator().decryptText({
      ciphertext: wc_encryptionResult,
      key: key,
      iv: iv,
      aad: nonmatchingAad
    })
    expect(wc_decryptionResult).to.not.equal(text);
  });

  it('generates existing keys for auth params', async () => {
    const result = await sn_webprotocolManager.computeRootKey({password: _password, keyParams: _keyParams});
    expect(result).to.have.property("masterKey");
    expect(result).to.have.property("serverPassword");
    // expect(result).to.eql(_keys);
  });
})
