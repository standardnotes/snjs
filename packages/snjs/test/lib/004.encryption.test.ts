import {
  KeyParamsOrigination,
  SNProtocolOperator004,
  ProtocolVersion,
  DeinitSource,
  SNApplication,
  CopyPayload,
  Environment,
  PayloadFormat,
  Platform,
  SNRootKey,
  SNRootKeyParams
} from '@Lib/index';
import * as Factory from '../factory';
import SNCrypto from '../setup/snjs/snCrypto';

describe('Test 004 encryption', () => {
  const _identifier = 'hello-test@sn.org';
  const _password = 'this-is-a-password-1234';
  const protocol004 = new SNProtocolOperator004(new SNCrypto());

  let application: SNApplication;
  let _keyParams: SNRootKeyParams;
  let _key: SNRootKey;

  beforeAll(async function () {
    application = await Factory.createAppWithRandNamespace(Environment.Web, Platform.LinuxWeb);
    await Factory.initializeApplication(application);
    _key = await protocol004.createRootKey(
      _identifier,
      _password,
      KeyParamsOrigination.Registration
    );
    _keyParams = _key.keyParams;
  });

  afterAll(function () {
    application.deinit(DeinitSource.SignOut);
  });

  it('cost minimum should throw', function () {
    expect(function () {
      application.protocolService.costMinimumForVersion(ProtocolVersion.V004);
    }).toThrow('Cost minimums only apply to versions <= 002');
  });

  it('generates valid keys for registration', async function () {
    const key = await application.protocolService.createRootKey(
      _identifier,
      _password,
      KeyParamsOrigination.Registration
    );

    expect(key.masterKey).toBeDefined;

    expect(key.serverPassword).toBeDefined;
    expect(key.mk).toBeUndefined;
    expect(key.dataAuthenticationKey).toBeUndefined;

    expect(key.keyParams.content004.pw_nonce).toBeDefined;
    expect(key.keyParams.content004.pw_cost).toBeUndefined;
    expect(key.keyParams.content004.salt).toBeUndefined;
    expect(key.keyParams.content004.identifier).toBeDefined;
  });

  it('computes proper keys for sign in', async function () {
    const identifier = 'foo@bar.com';
    const password = 'very_secure';
    const keyParams = application.protocolService.createKeyParams({
      pw_nonce:
        'baaec0131d677cf993381367eb082fe377cefe70118c1699cb9b38f0bc850e7b',
      identifier: identifier,
      version: ProtocolVersion.V004,
    });
    const key = await protocol004.computeRootKey(password, keyParams);
    expect(key.masterKey).toEqual(
      '5d68e78b56d454e32e1f5dbf4c4e7cf25d74dc1efc942e7c9dfce572c1f3b943'
    );
    expect(key.serverPassword).toEqual(
      '83707dfc837b3fe52b317be367d3ed8e14e903b2902760884fd0246a77c2299d'
    );
    expect(key.dataAuthenticationKey).toBeUndefined;
  });

  it('generates random key', async function () {
    const length = 96;
    const key = await application.protocolService.crypto.generateRandomKey(
      length
    );
    expect(key.length).toEqual(length / 4);
  });

  it('properly encrypts and decrypts', async function () {
    const text = 'hello world';
    const rawKey = _key.masterKey;
    const nonce = await application.protocolService.crypto.generateRandomKey(
      192
    );
    const operator = application.protocolService.operatorForVersion(
      ProtocolVersion.V004
    );
    const authenticatedData = { foo: 'bar' };
    const encString = await operator.encryptString004(
      text,
      rawKey,
      nonce,
      authenticatedData
    );
    const decString = await operator.decryptString004(
      encString,
      rawKey,
      nonce,
      await operator.authenticatedDataToString(authenticatedData)
    );
    expect(decString).toEqual(text);
  });

  it('fails to decrypt non-matching aad', async function () {
    const text = 'hello world';
    const rawKey = _key.masterKey;
    const nonce = await application.protocolService.crypto.generateRandomKey(
      192
    );
    const operator = application.protocolService.operatorForVersion(
      ProtocolVersion.V004
    );
    const aad = { foo: 'bar' };
    const nonmatchingAad = { foo: 'rab' };
    const encString = await operator.encryptString004(text, rawKey, nonce, aad);
    const decString = await operator.decryptString004(
      encString,
      rawKey,
      nonce,
      nonmatchingAad
    );
    expect(decString).toBeUndefined;
  });

  it('generates existing keys for key params', async function () {
    const key = await application.protocolService.computeRootKey(
      _password,
      _keyParams
    );
    expect(key.compare(_key)).toBe(true);
  });

  it('can decrypt encrypted params', async function () {
    const payload = Factory.createNotePayload();
    const key = await protocol004.createItemsKey();
    const params = await protocol004.generateEncryptedParameters(
      payload,
      PayloadFormat.EncryptedString,
      key
    );
    const decrypted = await protocol004.generateDecryptedParameters(
      params,
      key
    );
    expect(decrypted.errorDecrypting).toBeUndefined;
    expect(decrypted.content).toEqual(payload.content);
  });

  it('modifying the uuid of the payload should fail to decrypt', async function () {
    const payload = Factory.createNotePayload();
    const key = await protocol004.createItemsKey();
    const params = await protocol004.generateEncryptedParameters(
      payload,
      PayloadFormat.EncryptedString,
      key
    );
    const modifiedParams = CopyPayload(params, { uuid: 'foo' });
    const result = await protocol004.generateDecryptedParameters(
      modifiedParams,
      key
    );
    expect(result.errorDecrypting).toEqual(true);
  });
});
