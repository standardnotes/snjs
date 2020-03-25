/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('004 protocol operations', () => {
  const _identifier = 'hello@test.com';
  const _password = 'password';
  let _keyParams;
  let _key;

  const application = Factory.createApplication();
  const protocol004 = new SNProtocolOperator004(new SNWebCrypto());

  before(async () => {
    await Factory.initializeApplication(application);
    const result = await protocol004.createRootKey({
      identifier: _identifier,
      password: _password
    });
    _keyParams = result.keyParams;
    _key = result.key;
  });

  after(() => {
    application.deinit();
  });

  it('cost minimum should throw', () => {
    expect(() => {application.protocolService.costMinimumForVersion('004')})
      .to.throw('Cost minimums only apply to versions <= 002');
  });

  it('generates valid keys for registration', async () => {
    const result = await application.protocolService.createRootKey({
      identifier: _identifier,
      password: _password
    });

    expect(result).to.have.property('key');
    expect(result).to.have.property('keyParams');

    expect(result.key.masterKey).to.be.ok;

    expect(result.key.serverPassword).to.not.be.null;
    expect(result.key.mk).to.not.be.ok;
    expect(result.key.dataAuthenticationKey).to.not.be.ok;

    expect(result.keyParams.seed).to.not.be.null;
    expect(result.keyParams.kdfIterations).to.not.be.null;
    expect(result.keyParams.salt).to.not.be.ok;
    expect(result.keyParams.identifier).to.be.ok;
  });

  it('computes proper keys for sign in', async () => {
    const identifier = 'foo@bar.com';
    const password = 'very_secure';
    const keyParams = application.protocolService.createKeyParams({
      pw_nonce: 'baaec0131d677cf993381367eb082fe377cefe70118c1699cb9b38f0bc850e7b',
      identifier: identifier,
      version: '004'
    });
    const key = await protocol004.computeRootKey({
      keyParams: keyParams,
      password: password
    });
    expect(key.masterKey).to.equal('5d68e78b56d454e32e1f5dbf4c4e7cf25d74dc1efc942e7c9dfce572c1f3b943');
    expect(key.serverPassword).to.equal('83707dfc837b3fe52b317be367d3ed8e14e903b2902760884fd0246a77c2299d');
    expect(key.dataAuthenticationKey).to.not.be.ok;
  });

  it('generates random key', async () => {
    const length = 96;
    const key = await application.protocolService.crypto.generateRandomKey(length);
    expect(key.length).to.equal(length/4);
  });

  it('properly encrypts and decrypts', async () => {
    const text = 'hello world';
    const rawKey = _key.masterKey;
    const nonce = await application.protocolService.crypto.generateRandomKey(192);
    const additionalData = {foo: 'bar'};
    const encString = await application.protocolService.defaultOperator().encryptString({
      plaintext: text,
      rawKey: rawKey,
      nonce: nonce,
      aad: additionalData
    });
    const decString = await application.protocolService.defaultOperator().decryptString({
      ciphertext: encString,
      rawKey: rawKey,
      nonce: nonce,
      aad: additionalData
    });
    expect(decString).to.equal(text);
  });

  it('fails to decrypt non-matching aad', async () => {
    const text = 'hello world';
    const rawKey = _key.masterKey;
    const nonce = await application.protocolService.crypto.generateRandomKey(192);
    const aad = {foo: 'bar'};
    const nonmatchingAad = {foo: 'rab'};
    const encString = await application.protocolService.defaultOperator().encryptString({
      plaintext: text,
      rawKey: rawKey,
      nonce,
      aad: aad
    });
    const decString = await application.protocolService.defaultOperator().decryptString({
      ciphertext: encString,
      rawKey: rawKey,
      nonce: nonce,
      aad: nonmatchingAad
    });
    expect(decString).to.not.be.ok;
  });

  it('generates existing keys for key params', async () => {
    const key = await application.protocolService.computeRootKey({
      password: _password,
      keyParams: _keyParams
    });
    expect(key.compare(_key)).to.be.true;
  });

  it('can decrypt encrypted params', async () => {
    const payload = Factory.createNotePayload();
    const key = await protocol004.createItemsKey();
    const params = await protocol004.generateEncryptionParameters({
      payload,
      key,
      format: PayloadFormats.EncryptedString
    });
    const decrypted = await protocol004.generateDecryptedParameters({
      encryptedParameters: params,
      key: key
    });
    expect(decrypted.content).to.eql(payload.content);
  });
});
