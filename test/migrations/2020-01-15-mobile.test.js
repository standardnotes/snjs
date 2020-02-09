/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import '../../node_modules/regenerator-runtime/runtime.js';
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import '../vendor/chai-as-promised-built.js';
import Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('2020-01-15 mobile migration', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('2020-01-15 migration with passcode and account', async function () {
    const application = await Factory.createAppWithRandNamespace(Environments.Mobile);
    /** Create legacy migrations value so that base migration detects old app */
    await application.deviceInterface.setRawStorageValue(
      'migrations',
      JSON.stringify(['anything'])
    );
    const operator003 = new SNProtocolOperator003(new SNWebCrypto());
    const identifier = 'foo';
    const passcode = 'bar';
    /** Create old version passcode parameters */
    const passcodeResult = await operator003.createRootKey({
      identifier: identifier,
      password: passcode
    });
    await application.deviceInterface.setRawStorageValue(
      'pc_params',
      JSON.stringify(passcodeResult.keyParams)
    );
    const passcodeKey = passcodeResult.key;
    const passcodeTiming = 'immediately';

    /** Create old version account parameters */
    const password = 'tar';
    const accountResult = await operator003.createRootKey({
      identifier: identifier,
      password: password
    });
    await application.deviceInterface.setRawStorageValue(
      'auth_params',
      JSON.stringify(accountResult.keyParams)
    );
    const accountKey = accountResult.key;
    await application.deviceInterface.setKeychainValue({
      mk: accountKey.masterKey,
      pw: accountKey.serverPassword,
      ak: accountKey.dataAuthenticationKey,
      version: SNProtocolOperator003.versionString(),
      offline: {
        pw: passcodeKey.serverPassword,
        timing: passcodeTiming
      }
    });

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
    });
    const encryptedKeyParams = await operator003.generateEncryptionParameters({
      payload: keyPayload,
      key: passcodeKey,
      format: PayloadFormats.EncryptedString
    });
    const wrappedKey = CreateMaxPayloadFromAnyObject({
      object: keyPayload,
      override: encryptedKeyParams
    });
    await application.deviceInterface.setRawStorageValue(
      'encrypted_account_keys',
      JSON.stringify(wrappedKey)
    );
    const biometricPrefs = { enabled: true, timing: 'immediately' };
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
    const noteEncryptionParams = await operator003.generateEncryptionParameters({
      payload: notePayload,
      key: accountKey,
      format: PayloadFormats.EncryptedString
    });
    const noteEncryptedPayload = CreateMaxPayloadFromAnyObject({
      object: notePayload,
      override: noteEncryptionParams
    });
    await application.deviceInterface.saveRawDatabasePayload(noteEncryptedPayload);

    /** Run migration */
    await application.prepareForLaunch({
      callbacks: {
        requiresChallengeResponses: (challenges) => {
          const responses = [];
          for (const challenge of challenges) {
            if (challenge === Challenges.LocalPasscode) {
              responses.push(new ChallengeResponse({
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
      awaitDatabaseLoad: true
    });

    expect(application.keyManager.keyMode).to.equal(
      KEY_MODE_ROOT_KEY_PLUS_WRAPPER
    );

    /** Should be decrypted */
    const storageMode = application.storageManager.domainKeyForMode(
      StorageValueModes.Default
    );
    const valueStore = application.storageManager.values[storageMode];
    expect(valueStore.content_type).to.not.be.ok;

    const rootKey = await application.keyManager.getRootKey();
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

    await application.deinit();
  });


  it('2020-01-15 migration with passcode only', async function () {
    const application = await Factory.createAppWithRandNamespace(Environments.Mobile);
    /** Create legacy migrations value so that base migration detects old app */
    await application.deviceInterface.setRawStorageValue(
      'migrations',
      JSON.stringify(['anything'])
    );
    const operator003 = new SNProtocolOperator003(new SNWebCrypto());
    const identifier = 'foo';
    const passcode = 'bar';
    /** Create old version passcode parameters */
    const passcodeResult = await operator003.createRootKey({
      identifier: identifier,
      password: passcode
    });
    await application.deviceInterface.setRawStorageValue(
      'pc_params',
      JSON.stringify(passcodeResult.keyParams)
    );
    const passcodeKey = passcodeResult.key;
    const passcodeTiming = 'immediately';
    await application.deviceInterface.setKeychainValue({
      offline: {
        pw: passcodeKey.serverPassword,
        timing: passcodeTiming
      }
    });

    const biometricPrefs = { enabled: true, timing: 'immediately' };
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
    const noteEncryptionParams = await operator003.generateEncryptionParameters({
      payload: notePayload,
      key: passcodeKey,
      format: PayloadFormats.EncryptedString
    });
    const noteEncryptedPayload = CreateMaxPayloadFromAnyObject({
      object: notePayload,
      override: noteEncryptionParams
    });
    await application.deviceInterface.saveRawDatabasePayload(noteEncryptedPayload);

    /** Run migration */
    await application.prepareForLaunch({
      callbacks: {
        requiresChallengeResponses: (challenges) => {
          const responses = [];
          for (const challenge of challenges) {
            if (challenge === Challenges.LocalPasscode) {
              responses.push(new ChallengeResponse({
                challenge,
                value: passcode
              }));
            }
          }
          return responses;
        }
      }
    });
    expect(application.keyManager.keyMode).to.equal(
      KEY_MODE_WRAPPER_ONLY
    );
    await application.launch({
      awaitDatabaseLoad: true
    });
    /** Should be decrypted */
    const storageMode = application.storageManager.domainKeyForMode(
      StorageValueModes.Default
    );
    const valueStore = application.storageManager.values[storageMode];
    expect(valueStore.content_type).to.not.be.ok;

    const rootKey = await application.keyManager.getRootKey();
    expect(rootKey.masterKey).to.equal(passcodeKey.masterKey);
    expect(rootKey.dataAuthenticationKey).to.equal(passcodeKey.dataAuthenticationKey);
    expect(rootKey.serverPassword).to.equal(passcodeKey.serverPassword);
    expect(rootKey.version).to.equal(SNProtocolOperator003.versionString());
    expect(application.keyManager.keyMode).to.equal(KEY_MODE_WRAPPER_ONLY);

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
    expect(
      await application.storageManager.getValue(StorageKeys.MobilePasscodeTiming)
    ).to.eql(passcodeTiming);
    await application.deinit();
  });

  it('2020-01-15 migration with account only', async function () {
    const application = await Factory.createAppWithRandNamespace(Environments.Mobile);
    /** Create legacy migrations value so that base migration detects old app */
    await application.deviceInterface.setRawStorageValue(
      'migrations',
      JSON.stringify(['anything'])
    );
    const operator003 = new SNProtocolOperator003(new SNWebCrypto());
    const identifier = 'foo';
    /** Create old version account parameters */
    const password = 'tar';
    const accountResult = await operator003.createRootKey({
      identifier: identifier,
      password: password
    });
    await application.deviceInterface.setRawStorageValue(
      'auth_params',
      JSON.stringify(accountResult.keyParams)
    );
    const accountKey = accountResult.key;
    expect(accountKey.version).to.equal(SNProtocolOperator003.versionString());
    await application.deviceInterface.setKeychainValue({
      mk: accountKey.masterKey,
      pw: accountKey.serverPassword,
      ak: accountKey.dataAuthenticationKey,
      version: SNProtocolOperator003.versionString()
    });
    const biometricPrefs = {
      enabled: true,
      timing: 'immediately'
    };
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
    const noteEncryptionParams = await operator003.generateEncryptionParameters({
      payload: notePayload,
      key: accountKey,
      format: PayloadFormats.EncryptedString
    });
    const noteEncryptedPayload = CreateMaxPayloadFromAnyObject({
      object: notePayload,
      override: noteEncryptionParams
    });
    await application.deviceInterface.saveRawDatabasePayload(noteEncryptedPayload);

    /** Run migration */
    await application.prepareForLaunch({
      callbacks: {
        requiresChallengeResponses: (challenges) => {
          const responses = [];
          for (const challenge of challenges) {
            if (challenge === Challenges.LocalPasscode) {
              responses.push(new ChallengeResponse({
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
      awaitDatabaseLoad: true
    });

    expect(application.keyManager.keyMode).to.equal(
      KEY_MODE_ROOT_KEY_ONLY
    );
    /** Should be decrypted */
    const storageMode = application.storageManager.domainKeyForMode(
      StorageValueModes.Default
    );
    const valueStore = application.storageManager.values[storageMode];
    expect(valueStore.content_type).to.not.be.ok;
    const rootKey = await application.keyManager.getRootKey();
    expect(rootKey.masterKey).to.equal(accountKey.masterKey);
    expect(rootKey.dataAuthenticationKey).to.equal(accountKey.dataAuthenticationKey);
    expect(rootKey.serverPassword).to.equal(accountKey.serverPassword);
    expect(rootKey.version).to.equal(SNProtocolOperator003.versionString());
    expect(application.keyManager.keyMode).to.equal(KEY_MODE_ROOT_KEY_ONLY);

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

    await application.deinit();
  }).timeout(10000);


  it('2020-01-15 migration with no account and no passcode', async function () {
    const application = await Factory.createAppWithRandNamespace(Environments.Mobile);
    /** Create legacy migrations value so that base migration detects old app */
    await application.deviceInterface.setRawStorageValue(
      'migrations',
      JSON.stringify(['anything'])
    );
    const operator003 = new SNProtocolOperator003(new SNWebCrypto());
    const biometricPrefs = {
      enabled: true,
      timing: 'immediately'
    };
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
    const noteParams = await operator003.generateEncryptionParameters({
      payload: notePayload,
      format: PayloadFormats.DecryptedBareObject
    });
    const noteProcessedPayload = CreateMaxPayloadFromAnyObject({
      object: notePayload,
      override: noteParams
    });
    await application.deviceInterface.saveRawDatabasePayload(noteProcessedPayload);

    /** Run migration */
    await application.prepareForLaunch({
      callbacks: {
        requiresChallengeResponses: (challenges) => {
          const responses = [];
          for (const challenge of challenges) {
            if (challenge === Challenges.LocalPasscode) {
              responses.push(new ChallengeResponse({
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
      awaitDatabaseLoad: true
    });

    expect(application.keyManager.keyMode).to.equal(
      KEY_MODE_ROOT_KEY_NONE
    );
    /** Should be decrypted */
    const storageMode = application.storageManager.domainKeyForMode(
      StorageValueModes.Default
    );
    const valueStore = application.storageManager.values[storageMode];
    expect(valueStore.content_type).to.not.be.ok;

    const rootKey = await application.keyManager.getRootKey();
    expect(rootKey).to.not.be.ok;
    expect(application.keyManager.keyMode).to.equal(KEY_MODE_ROOT_KEY_NONE);

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

    await application.deinit();
  });

});
