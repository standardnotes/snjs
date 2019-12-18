import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';

const sn_webprotocolManager = new SNProtocolManager(new SNWebCrypto());
const sn_cryptojsManager = new SNProtocolManager(new SNCryptoJS());

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('protocol', () => {
  it('checks version to make sure its 003', () => {
    expect(sn_webprotocolManager.version()).to.equal("003");
  });

  it('checks supported versions to make sure it includes 001, 002, 003', () => {
    expect(sn_webprotocolManager.supportedVersions()).to.eql(["001", "002", "003"]);
  });

  it('cryptojs should not support costs greater than 5000', () => {
    expect(sn_cryptojsManager.supportsPasswordDerivationCost(5001)).to.equal(false);
  });

  it('cryptoweb should support costs greater than 5000', () => {
    expect(sn_webprotocolManager.supportsPasswordDerivationCost(5001)).to.equal(true);
  });

  it('version comparison of 002 should be older than library version', () => {
    expect(sn_webprotocolManager.isVersionNewerThanLibraryVersion("002")).to.equal(false);
  });

  it('version comparison of 004 should be newer than library version', () => {
    expect(sn_webprotocolManager.isVersionNewerThanLibraryVersion("004")).to.equal(true);
  });

  it('library version should not be outdated', () => {
    var currentVersion = sn_webprotocolManager.version();
    expect(sn_webprotocolManager.isProtocolVersionOutdated(currentVersion)).to.equal(false);
  });

  it('cost minimum for 003 to be 110,000', () => {
    var currentVersion = sn_webprotocolManager.version();
    expect(sn_webprotocolManager.costMinimumForVersion("003")).to.equal(110000);
  });
});

describe('protocol operations', () => {

  var _identifier = "hello@test.com";
  var _password = "password";
  var _authParams, _keys;

  before((done) => {
    // runs before all tests in this block
    sn_webprotocolManager.generateInitialKeysAndAuthParamsForUser(_identifier, _password).then((result) => {
      _authParams = result.authParams;
      _keys = result.keys;
      done();
    })
  });

  it('generates valid keys for registration', () => {
    return expect(sn_webprotocolManager.generateInitialKeysAndAuthParamsForUser(_identifier, _password)).to.be.fulfilled.then((result) => {
      expect(result).to.have.property("keys");
      expect(result).to.have.property("authParams");

      expect(result.keys).to.have.property("pw");
      expect(result.keys).to.have.property("ak");
      expect(result.keys).to.have.property("mk");

      expect(result.authParams).to.have.property("pw_nonce");
      expect(result.authParams).to.have.property("pw_cost");
      expect(result.authParams).to.have.property("identifier");
      expect(result.authParams).to.have.property("version");
    })
  });

  it('properly encrypts and decrypts', async () => {
    var text = "hello world";
    var key = _keys.mk;
    var iv = await sn_webprotocolManager.crypto.generateRandomKey(128);
    let wc_encryptionResult = await sn_webprotocolManager.defaultOperator().encryptText(text, key, iv);
    let wc_decryptionResult = await sn_webprotocolManager.defaultOperator().decryptText({contentCiphertext: wc_encryptionResult, encryptionKey: key, iv: iv})
    expect(wc_decryptionResult).to.equal(text);

    let cj_encryptionResult = await sn_cryptojsManager.defaultOperator().encryptText(text, key, iv);
    let cj_decryptionResult = await sn_cryptojsManager.defaultOperator().decryptText({contentCiphertext: cj_encryptionResult, encryptionKey: key, iv: iv})
    expect(cj_decryptionResult).to.equal(text);
  });

  it('generates existing keys for auth params', () => {
    return expect(sn_webprotocolManager.computeEncryptionKeysForUser(_password, _authParams)).to.be.fulfilled.then((result) => {
      expect(result).to.have.property("pw");
      expect(result).to.have.property("ak");
      expect(result).to.have.property("mk");
      expect(result).to.eql(_keys);
    })
  });

  it('throws error if auth params is missing identifier', () => {
    var params = Object.assign({}, _authParams);
    params.identifier = null;
    return expect(sn_webprotocolManager.computeEncryptionKeysForUser(_password, params)).to.be.fulfilled.then((result) => {
      expect(result).to.be.undefined;
    })
  });

})
