import '../dist/regenerator.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';

const sf_cryptoweb = new StandardNotes(new SFCryptoWeb());
const sf_cryptojs = new StandardNotes(new SFCryptoJS());

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('crypto', () => {
  it('checks version to make sure its 003', () => {
    expect(sf_cryptoweb.version()).to.equal("003");
  });

  it('checks supported versions to make sure it includes 001, 002, 003', () => {
    expect(sf_cryptoweb.supportedVersions()).to.eql(["001", "002", "003"]);
  });

  it('cryptojs should not support costs greater than 5000', () => {
    expect(sf_cryptojs.supportsPasswordDerivationCost(5001)).to.equal(false);
  });

  it('cryptoweb should support costs greater than 5000', () => {
    expect(sf_cryptoweb.supportsPasswordDerivationCost(5001)).to.equal(true);
  });

  it('version comparison of 002 should be older than library version', () => {
    expect(sf_cryptoweb.isVersionNewerThanLibraryVersion("002")).to.equal(false);
  });

  it('version comparison of 004 should be newer than library version', () => {
    expect(sf_cryptoweb.isVersionNewerThanLibraryVersion("004")).to.equal(true);
  });

  it('library version should not be outdated', () => {
    var currentVersion = sf_cryptoweb.version();
    expect(sf_cryptoweb.isProtocolVersionOutdated(currentVersion)).to.equal(false);
  });

  it('cost minimum for 003 to be 110,000', () => {
    var currentVersion = sf_cryptoweb.version();
    expect(sf_cryptoweb.costMinimumForVersion("003")).to.equal(110000);
  });
});

describe('webcrypto', function() {
  it('should be defined', function() {
    expect(window.crypto).to.not.be.null;
  });
});

describe('crypto operations', () => {

  var _identifier = "hello@test.com";
  var _password = "password";
  var _authParams, _keys;

  before((done) => {
    // runs before all tests in this block
    sf_cryptoweb.crypto.generateInitialKeysAndAuthParamsForUser(_identifier, _password).then((result) => {
      _authParams = result.authParams;
      _keys = result.keys;
      done();
    })
  });

  it('generates valid uuid', () => {
    expect(sf_cryptoweb.crypto.generateUUIDSync().length).to.equal(36);
  });

  it('generates valid keys for registration', () => {
    return expect(sf_cryptoweb.crypto.generateInitialKeysAndAuthParamsForUser(_identifier, _password)).to.be.fulfilled.then((result) => {
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

  it('generates existing keys for auth params', () => {
    return expect(sf_cryptoweb.crypto.computeEncryptionKeysForUser(_password, _authParams)).to.be.fulfilled.then((result) => {
      expect(result).to.have.property("pw");
      expect(result).to.have.property("ak");
      expect(result).to.have.property("mk");
      expect(result).to.eql(_keys);
    })
  });

  it('throws error if auth params is missing identifier', () => {
    var params = Object.assign({}, _authParams);
    params.identifier = null;
    return expect(sf_cryptoweb.crypto.computeEncryptionKeysForUser(_password, params)).to.be.fulfilled.then((result) => {
      expect(result).to.be.undefined;
    })
  });

  it('properly encodes base64', () => {
    var source = "hello world";
    var target = "aGVsbG8gd29ybGQ=";
    return expect(sf_cryptoweb.crypto.base64(source)).to.eventually.equal(target);
    return expect(sf_cryptojs.crypto.base64(source)).to.eventually.equal(target);
  });

  it('properly decodes base64', () => {
    var source = "aGVsbG8gd29ybGQ=";
    var target = "hello world";
    return expect(sf_cryptoweb.crypto.base64Decode(source)).to.eventually.equal(target);
    return expect(sf_cryptojs.crypto.base64Decode(source)).to.eventually.equal(target);
  });

  it('generates proper length generic key', async () => {
    var length = 256;
    let wc_result = await sf_cryptoweb.crypto.generateRandomKey(length);
    expect(wc_result.length).to.equal(length/4);

    let cj_result = await sf_cryptojs.crypto.generateRandomKey(length);
    expect(cj_result.length).to.equal(length/4);
  });

  it('generates proper length item key', async () => {
    let wc_result = await sf_cryptoweb.crypto.generateItemEncryptionKey()
    expect(wc_result.length).to.equal(128);

    let cj_result = await sf_cryptojs.crypto.generateItemEncryptionKey()
    expect(cj_result.length).to.equal(128);
  });

  it('properly encrypts and decrypts', async () => {
    var text = "hello world";
    var key = _keys.mk;
    var iv = await sf_cryptoweb.crypto.generateRandomKey(128);
    let wc_encryptionResult = await sf_cryptoweb.crypto.encryptText(text, key, iv);
    let wc_decryptionResult = await sf_cryptoweb.crypto.decryptText({contentCiphertext: wc_encryptionResult, encryptionKey: key, iv: iv})
    expect(wc_decryptionResult).to.equal(text);

    let cj_encryptionResult = await sf_cryptojs.crypto.encryptText(text, key, iv);
    let cj_decryptionResult = await sf_cryptojs.crypto.decryptText({contentCiphertext: cj_encryptionResult, encryptionKey: key, iv: iv})
    expect(cj_decryptionResult).to.equal(text);
  });

  it('cryptojs and webcrypto should generate same hmac signatures', async () => {
    var message = "hello world";
    var key = _keys.ak;
    let cryptojs = new SFCryptoJS();
    let webcrypto = new SFCryptoWeb();
    let cryptoJsSignature = await cryptojs.hmac256(message, key);
    let webCryptoSignature = await webcrypto.hmac256(message, key);
    expect(cryptoJsSignature).to.equal(webCryptoSignature);
  })

  it('compares strings with timing safe comparison', async () => {
    let crypto = new SFAbstractCrypto();

    expect(crypto.timingSafeEqual("hello world", "hello world")).to.equal(true);

    expect(crypto.timingSafeEqual("helo world", "hello world")).to.equal(false);

    expect(crypto.timingSafeEqual("", "a")).to.equal(false);

    expect(crypto.timingSafeEqual("", "")).to.equal(true);

    expect(crypto.timingSafeEqual(
      "2e1ee7920bb188a88f94bb912153befd83cc55cd",
      "2e1ee7920bb188a88f94bb912153befd83cc55cd")
    ).to.equal(true);
    expect(crypto.timingSafeEqual(
      "1e1ee7920bb188a88f94bb912153befd83cc55cd",
      "2e1ee7920bb188a88f94bb912153befd83cc55cd")
    ).to.equal(false);
    expect(crypto.timingSafeEqual(
      "2e1ee7920bb188a88f94bb912153befd83cc55cc",
      "2e1ee7920bb188a88f94bb912153befd83cc55cd")
    ).to.equal(false);
  })

})
