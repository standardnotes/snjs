/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('003 protocol operations', () => {

  before(async () => {
    localStorage.clear();
  });

  after(async () => {
    localStorage.clear();
  });

  const _identifier = 'hello@test.com';
  const _password = 'password';
  let _keyParams, _key;

  const sharedApplication = Factory.createApplication();
  const protocol003 = new SNProtocolOperator003(new SNWebCrypto());

  // runs once before all tests in this block
  before(async () => {
    await Factory.initializeApplication(sharedApplication);
    const result = await protocol003.createRootKey({
      identifier: _identifier,
      password: _password
    });
    _keyParams = result.keyParams;
    _key = result.key;
  });

  after(() => {
    sharedApplication.deinit();
  });

  it('generates random key', async () => {
    const length = 128;
    const key = await protocol003.crypto.generateRandomKey(length);
    expect(key.length).to.equal(length/4);
  });

  it('cost minimum should throw', () => {
    expect(() => {sharedApplication.protocolService.costMinimumForVersion('003')})
      .to.throw('Cost minimums only apply to versions <= 002');
  });

  it('generates valid keys for registration', async () => {
    const result = await protocol003.createRootKey({
      identifier: _identifier,
      password: _password
    });
    expect(result).to.have.property('key');
    expect(result).to.have.property('keyParams');

    expect(result.key.dataAuthenticationKey).to.not.be.null;
    expect(result.key.serverPassword).to.not.be.null;
    expect(result.key.masterKey).to.not.be.null;

    expect(result.keyParams.seed).to.not.be.null;
    expect(result.keyParams.kdfIterations).to.not.be.null;
    expect(result.keyParams.salt).to.not.be.ok;
    expect(result.keyParams.identifier).to.be.ok;
  });

  it('computes proper keys for sign in', async () => {
    const identifier = 'foo@bar.com';
    const password = 'very_secure';
    const keyParams = sharedApplication.protocolService.createKeyParams({
      pw_nonce: 'baaec0131d677cf993381367eb082fe377cefe70118c1699cb9b38f0bc850e7b',
      identifier: identifier,
      version: '003'
    });
    const key = await protocol003.computeRootKey({
      keyParams: keyParams,
      password: password
    });
    expect(key.serverPassword).to.equal('60fdae231049d81974c562e943ad472f0143daa87f43048d2ede2d199ea7be25');
    expect(key.masterKey).to.equal('2b2162e5299f71f9fcd39789a01f6062f2779220e97a43d7895cf30da11186e9');
    expect(key.dataAuthenticationKey).to.equal('24dfba6f42ffc07a5223440a28a574d463e99d8d4aeb68fe95f55aa8ed5fd39f');
  });

  it('properly encrypts and decrypts', async () => {
    const text = 'hello world';
    const rawKey = _key.masterKey;
    const iv = await protocol003.crypto.generateRandomKey(128);
    const encString = await protocol003.encryptString(text, rawKey, iv);
    const decString = await protocol003.decryptString(encString, rawKey, iv);
    expect(decString).to.equal(text);
  });

  it('generates existing keys for key params', async () => {
    const key = await protocol003.computeRootKey({
      password: _password, 
      keyParams: _keyParams
    });
    expect(key.compare(_key)).to.be.true;
  });

  it('generating encryption params includes items_key_id', async () => {
    const payload = Factory.createNotePayload();
    const key = await protocol003.createItemsKey();
    const params = await protocol003.generateEncryptionParameters({ 
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
    const key = await protocol003.createItemsKey();
    const params = await protocol003.generateEncryptionParameters({
      payload,
      key,
      format: PayloadFormats.EncryptedString
    });

    const decrypted = await protocol003.generateDecryptedParameters({
      encryptedParameters: params,
      key: key
    });
    expect(decrypted.content).to.eql(payload.content);
  });
});
