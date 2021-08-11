import {
  KeyParamsOrigination,
  SNProtocolOperator003,
  DeinitSource
} from '@Lib/index';
import * as Factory from '../factory';
import SNCrypto from '../setup/snjs/snCrypto';

describe('Test 003 encryption', () => {
  const identifier = 'hello-test@sn.org';
  const password = 'this-is-a-password-1234';
  const protocol003 = new SNProtocolOperator003(new SNCrypto());

  it('should properly encrypt and decrypt a piece of text', async () => {
    const { application } = await Factory.createAndInitSimpleAppContext();

    const rootKey = await protocol003.createRootKey(
      identifier,
      password,
      KeyParamsOrigination.Registration
    );
    const simpleText = 'This is a simple text. It should be encrypted and decrypted successfully.';
    const rawKey = rootKey.masterKey;
    const nonce = await protocol003.crypto.generateRandomKey(128);

    const encString = await protocol003.encryptString002(
      simpleText,
      rawKey,
      nonce
    );
    const decString = await protocol003.decryptString002(
      encString,
      rawKey,
      nonce
    );

    expect(decString).toEqual(simpleText);

    application.deinit(DeinitSource.SignOut);
  });
});
