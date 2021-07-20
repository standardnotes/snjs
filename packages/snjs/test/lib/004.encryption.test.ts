import {
  Platform,
  Environment,
  KeyParamsOrigination,
  SNProtocolOperator004,
  ProtocolVersion
} from '@Lib/index';
import { createApplication } from '../factory';
import SNCrypto from '../setup/snjs/snCrypto';

describe('Test 004 encryption', () => {
  const identifier = 'hello-test@sn.org';
  const password = 'this-is-a-password-1234';
  const protocol004 = new SNProtocolOperator004(new SNCrypto());

  it('should properly encrypt and decrypt a piece of text', async () => {
    const application = createApplication('test-application', Environment.Web, Platform.LinuxWeb);
    const rootKey = await protocol004.createRootKey(
      identifier,
      password,
      KeyParamsOrigination.Registration
    );
    const simpleText = 'This is a simple text. It should be encrypted and decrypted successfully.';
    const rawKey = rootKey.masterKey;
    const nonce = await application.protocolService.crypto.generateRandomKey(192);
    const operator = application.protocolService.operatorForVersion(ProtocolVersion.V004);
    const authenticatedData = { foo: 'bar' };

    const encString = await operator.encryptString004(
      simpleText,
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

    expect(decString).toEqual(simpleText);
  });
});
