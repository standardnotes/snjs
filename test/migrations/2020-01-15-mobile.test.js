import '../../node_modules/regenerator-runtime/runtime.js';
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import '../vendor/chai-as-promised-built.js';
import Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('2020-01-15 mobile migration', () => {

  before(() => {
    localStorage.clear();
  })

  after(() => {
    localStorage.clear();
  })

  it('passes 2020-01-15 migration for mobile', async function () {
    const application = await Factory.createAppWithRandNamespace(PLATFORM_MOBILE);
    /** Create legacy migrations value so that base migration detects old app */
    await application.deviceInterface.setRawStorageValue(
      'migrations',
      JSON.stringify(['anything'])
    );
    const operator_003 = new SNProtocolOperator003(new SNWebCrypto());
    const identifier = 'foo';
    const passcode = 'bar';
    /** Create old version passcode parameters */
    const passcodeResult = await operator_003.createRootKey({
      identifier: identifier,
      password: passcode
    });
    await application.deviceInterface.setRawStorageValue(
      'pc_params',
      JSON.stringify(passcodeResult.keyParams)
    );
    const passcodeKey = passcodeResult.key;

    /** Create old version account parameters */
    const password = 'tar';
    const accountResult = await operator_003.createRootKey({
      identifier: identifier,
      password: password
    });
    await application.deviceInterface.setRawStorageValue(
      'auth_params',
      JSON.stringify(accountResult.keyParams)
    );
    const accountKey = accountResult.key;

    /** Wrap account key with passcode key and store in storage */
    const keyPayload = CreateMaxPayloadFromAnyObject({
      object: {
        uuid: Factory.generateUuid(),
        content_type: 'SN|Mobile|EncryptedKeys',
        content: {
          accountKeys: {
            mk: accountKey.masterKey,
            ak: accountKey.dataAuthenticationKey,
            pw: accountKey.serverPassword
          }
        }
      }
    })
    const encryptedKeyParams = await operator_003.generateEncryptionParameters({
      payload: keyPayload,
      key: passcodeKey,
      format: PAYLOAD_CONTENT_FORMAT_ENCRYPTED_STRING
    });
    const wrappedKey = CreateMaxPayloadFromAnyObject({
      object: keyPayload,
      override: encryptedKeyParams
    })
    await application.deviceInterface.setRawStorageValue(
      'encrypted_account_keys',
      JSON.stringify(wrappedKey)
    );
    const biometricPrefs = {enabled: true, timing: 'immediately'};
    /** Create legacy storage. Storage in mobile was never wrapped. */
    await application.deviceInterface.setRawStorageValue(
      'biometrics_prefs',
      JSON.stringify(biometricPrefs)
    );
    await application.deviceInterface.setRawStorageValue(
      'first_run',
      false
    );
    /** Create encrypted item and store it in db */
    const notePayload = Factory.createNotePayload();
    const noteEncryptionParams = await operator_003.generateEncryptionParameters({
      payload: notePayload,
      key: accountKey,
      format: PAYLOAD_CONTENT_FORMAT_ENCRYPTED_STRING
    });
    const noteEncryptedPayload = CreateMaxPayloadFromAnyObject({
      object: notePayload,
      override: noteEncryptionParams
    });
    await application.deviceInterface.saveRawDatabasePayload(noteEncryptedPayload);

    /** Run migration */
    await application.prepareForLaunch({
      callbacks: {
        authChallengeResponses: (challenges) => {
          const responses = [];
          for(const challenge of challenges) {
            if(challenge === CHALLENGE_LOCAL_PASSCODE) {
              responses.push(new DeviceAuthResponse({
                challenge,
                value: passcode
              }));
            }
          }
          return responses;
        }
      }
    });
    await application.launch({
      ut_awaitDatabaseLoad: true
    });

    expect(application.keyManager.keyMode).to.equal(
      KEY_MODE_ROOT_KEY_PLUS_WRAPPER
    );

    /** Should be decrypted */
    const storageMode = application.storageManager.domainKeyForMode(
      STORAGE_VALUE_MODE_DEFAULT
    );
    const valueStore = application.storageManager.values[storageMode];
    expect(valueStore.content_type).to.not.be.ok;

    /** Embedded value should match */
    const migratedKeyParams = await application.storageManager.getValue(
      STORAGE_KEY_ROOT_KEY_PARAMS,
      STORAGE_VALUE_MODE_NONWRAPPED
    );
    const rootKey = await application.keyManager.getRootKey()
    expect(rootKey.masterKey).to.equal(accountKey.masterKey);
    expect(rootKey.dataAuthenticationKey).to.equal(accountKey.dataAuthenticationKey);
    expect(rootKey.serverPassword).to.equal(accountKey.serverPassword);
    expect(rootKey.version).to.equal(SNProtocolOperator003.versionString());
    expect(application.keyManager.keyMode).to.equal(KEY_MODE_ROOT_KEY_PLUS_WRAPPER);

    /** Expect note is decrypted */
    expect(application.modelManager.notes.length).to.equal(1);
    const retrievedNote = application.modelManager.notes[0];
    expect(retrievedNote.uuid).to.equal(notePayload.uuid);
    expect(retrievedNote.content.text).to.equal(notePayload.content.text);
    expect(
      await application.storageManager.getValue('first_run')
    ).to.equal(false);
    expect(
      await application.storageManager.getValue('biometrics_prefs')
    ).to.eql(biometricPrefs);
  });

});
