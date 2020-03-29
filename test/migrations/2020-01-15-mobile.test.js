/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from '../lib/factory.js';
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
    const application = await Factory.createAppWithRandNamespace(
      Environments.Mobile,
      Platforms.Ios
    );
    /** Create legacy migrations value so that base migration detects old app */
    await application.deviceInterface.setRawStorageValue(
      'migrations',
      JSON.stringify(['anything'])
    );
    const operator003 = new SNProtocolOperator003(new SNWebCrypto());
    const identifier = 'foo';
    const passcode = 'bar';
    /** Create old version passcode parameters */
    const passcodeResult = await operator003.createRootKey(
      identifier,
      passcode
    );
    await application.deviceInterface.setRawStorageValue(
      'pc_params',
      JSON.stringify(passcodeResult.keyParams.getPortableValue())
    );
    const passcodeKey = passcodeResult.key;
    const passcodeTiming = 'immediately';

    /** Create old version account parameters */
    const password = 'tar';
    const accountResult = await operator003.createRootKey(
      identifier,
      password
    );
    await application.deviceInterface.setRawStorageValue(
      'auth_params',
      JSON.stringify(accountResult.keyParams.getPortableValue())
    );
    const accountKey = accountResult.key;
    await application.deviceInterface.setKeychainValue({
      mk: accountKey.masterKey,
      pw: accountKey.serverPassword,
      ak: accountKey.dataAuthenticationKey,
      version: ProtocolVersions.V003,
      offline: {
        pw: passcodeKey.serverPassword,
        timing: passcodeTiming
      }
    });

    /** Wrap account key with passcode key and store in storage */
    const keyPayload = CreateMaxPayloadFromAnyObject(
      {
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
    );
    const encryptedKeyParams = await operator003.generateEncryptedParameters(
      keyPayload,
      PayloadFormats.EncryptedString,
      passcodeKey,
    );
    const wrappedKey = CreateMaxPayloadFromAnyObject(
      keyPayload,
      null,
      null,
      encryptedKeyParams
    );
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
    const noteEncryptionParams = await operator003.generateEncryptedParameters(
      notePayload,
      PayloadFormats.EncryptedString,
      accountKey,
    );
    const noteEncryptedPayload = CreateMaxPayloadFromAnyObject(
      notePayload,
      null,
      null,
      noteEncryptionParams
    );
    await application.deviceInterface.saveRawDatabasePayload(noteEncryptedPayload);

    /** Run migration */
    const promptForValuesForTypes = (types) => {
      const values = [];
      for (const type of types) {
        if (type === ChallengeType.LocalPasscode) {
          values.push(new ChallengeValue(type, passcode));
        }
      }
      return values;
    };
    const receiveChallenge = async (challenge, orchestrator) => {
      const initialValues = promptForValuesForTypes(challenge.types);
      orchestrator.submitValues(initialValues);
    };
    await application.prepareForLaunch({
      callbacks: { receiveChallenge }
    });
    await application.launch({
      awaitDatabaseLoad: true
    });

    expect(application.protocolService.keyMode).to.equal(
      KeyMode.RootKeyPlusWrapper
    );

    /** Should be decrypted */
    const storageMode = application.storageService.domainKeyForMode(
      StorageValueModes.Default
    );
    const valueStore = application.storageService.values[storageMode];
    expect(valueStore.content_type).to.not.be.ok;

    const keyParams = await application.storageService.getValue(
      StorageKeys.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(typeof keyParams).to.equal('object');

    const rootKey = await application.protocolService.getRootKey();
    expect(rootKey.masterKey).to.equal(accountKey.masterKey);
    expect(rootKey.dataAuthenticationKey).to.equal(accountKey.dataAuthenticationKey);
    expect(rootKey.serverPassword).to.equal(accountKey.serverPassword);
    expect(rootKey.version).to.equal(ProtocolVersions.V003);
    expect(application.protocolService.keyMode).to.equal(KeyMode.RootKeyPlusWrapper);

    const keychainValue = await application.deviceInterface.getKeychainValue();
    expect(keychainValue).to.not.be.ok;

    /** Expect note is decrypted */
    expect(application.modelManager.notes.length).to.equal(1);
    const retrievedNote = application.modelManager.notes[0];
    expect(retrievedNote.uuid).to.equal(notePayload.uuid);
    expect(retrievedNote.content.text).to.equal(notePayload.content.text);
    expect(
      await application.storageService.getValue('first_run')
    ).to.equal(false);
    expect(
      await application.storageService.getValue('biometrics_prefs')
    ).to.eql(biometricPrefs);

    await application.deinit();
  });


  it('2020-01-15 migration with passcode only', async function () {
    const application = await Factory.createAppWithRandNamespace(
      Environments.Mobile,
      Platforms.Ios
    );
    /** Create legacy migrations value so that base migration detects old app */
    await application.deviceInterface.setRawStorageValue(
      'migrations',
      JSON.stringify(['anything'])
    );
    const operator003 = new SNProtocolOperator003(new SNWebCrypto());
    const identifier = 'foo';
    const passcode = 'bar';
    /** Create old version passcode parameters */
    const passcodeResult = await operator003.createRootKey(
      identifier,
      passcode
    );
    await application.deviceInterface.setRawStorageValue(
      'pc_params',
      JSON.stringify(passcodeResult.keyParams.getPortableValue())
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
    const noteEncryptionParams = await operator003.generateEncryptedParameters(
      notePayload,
      PayloadFormats.EncryptedString,
      passcodeKey,
    );
    const noteEncryptedPayload = CreateMaxPayloadFromAnyObject(
      notePayload,
      null,
      null,
      noteEncryptionParams
    );
    await application.deviceInterface.saveRawDatabasePayload(noteEncryptedPayload);

    /** Run migration */
    const promptForValuesForTypes = (types) => {
      const values = [];
      for (const type of types) {
        if (type === ChallengeType.LocalPasscode) {
          values.push(new ChallengeValue(type, passcode));
        }
      }
      return values;
    };
    const receiveChallenge = async (challenge, orchestrator) => {
      orchestrator.setCallbacks(
        undefined,
        (value) => {
          const values = promptForValuesForTypes([value.type]);
          orchestrator.submitValues(values);
        },
      );
      const initialValues = promptForValuesForTypes(challenge.types);
      orchestrator.submitValues(initialValues);
    };
    await application.prepareForLaunch({
      callbacks: {
        receiveChallenge: receiveChallenge,
      }
    });
    expect(application.protocolService.keyMode).to.equal(
      KeyMode.WrapperOnly
    );
    await application.launch({
      awaitDatabaseLoad: true
    });
    /** Should be decrypted */
    const storageMode = application.storageService.domainKeyForMode(
      StorageValueModes.Default
    );
    const valueStore = application.storageService.values[storageMode];
    expect(valueStore.content_type).to.not.be.ok;

    const rootKey = await application.protocolService.getRootKey();
    expect(rootKey.masterKey).to.equal(passcodeKey.masterKey);
    expect(rootKey.dataAuthenticationKey).to.equal(passcodeKey.dataAuthenticationKey);
    expect(rootKey.serverPassword).to.equal(passcodeKey.serverPassword);
    expect(rootKey.version).to.equal(ProtocolVersions.V003);
    expect(application.protocolService.keyMode).to.equal(KeyMode.WrapperOnly);

    const keychainValue = await application.deviceInterface.getKeychainValue();
    expect(keychainValue).to.not.be.ok;

    /** Expect note is decrypted */
    expect(application.modelManager.notes.length).to.equal(1);
    const retrievedNote = application.modelManager.notes[0];
    expect(retrievedNote.uuid).to.equal(notePayload.uuid);
    expect(retrievedNote.content.text).to.equal(notePayload.content.text);
    expect(
      await application.storageService.getValue('first_run')
    ).to.equal(false);
    expect(
      await application.storageService.getValue('biometrics_prefs')
    ).to.eql(biometricPrefs);
    expect(
      await application.storageService.getValue(StorageKeys.MobilePasscodeTiming)
    ).to.eql(passcodeTiming);
    await application.deinit();
  });

  it('2020-01-15 migration with account only', async function () {
    const application = await Factory.createAppWithRandNamespace(
      Environments.Mobile,
      Platforms.Ios
    );
    /** Create legacy migrations value so that base migration detects old app */
    await application.deviceInterface.setRawStorageValue(
      'migrations',
      JSON.stringify(['anything'])
    );
    const operator003 = new SNProtocolOperator003(new SNWebCrypto());
    const identifier = 'foo';
    /** Create old version account parameters */
    const password = 'tar';
    const accountResult = await operator003.createRootKey(
      identifier,
      password
    );
    await application.deviceInterface.setRawStorageValue(
      'auth_params',
      JSON.stringify(accountResult.keyParams.getPortableValue())
    );
    const accountKey = accountResult.key;
    expect(accountKey.version).to.equal(ProtocolVersions.V003);
    await application.deviceInterface.setKeychainValue({
      mk: accountKey.masterKey,
      pw: accountKey.serverPassword,
      ak: accountKey.dataAuthenticationKey,
      version: ProtocolVersions.V003
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
    const noteEncryptionParams = await operator003.generateEncryptedParameters(
      notePayload,
      PayloadFormats.EncryptedString,
      accountKey,
    );
    const noteEncryptedPayload = CreateMaxPayloadFromAnyObject(
      notePayload,
      null,
      null,
      noteEncryptionParams
    );
    await application.deviceInterface.saveRawDatabasePayload(noteEncryptedPayload);

    /** Run migration */
    const promptForValuesForTypes = (types) => {
      const values = [];
      for (const type of types) {
        if (type === ChallengeType.LocalPasscode) {
          values.push(new ChallengeValue(type, passcode));
        }
      }
      return values;
    };
    const receiveChallenge = async (challenge, orchestrator) => {
      orchestrator.setCallbacks(
        undefined,
        (value) => {
          const values = promptForValuesForTypes([value.type]);
          orchestrator.submitValues(values);
        },
      );
      const initialValues = promptForValuesForTypes(challenge.types);
      orchestrator.submitValues(initialValues);
    };
    await application.prepareForLaunch({
      callbacks: {
        receiveChallenge: receiveChallenge,
      }
    });
    await application.launch({
      awaitDatabaseLoad: true
    });

    expect(application.protocolService.keyMode).to.equal(
      KeyMode.RootKeyOnly
    );
    /** Should be decrypted */
    const storageMode = application.storageService.domainKeyForMode(
      StorageValueModes.Default
    );
    const valueStore = application.storageService.values[storageMode];
    expect(valueStore.content_type).to.not.be.ok;
    const rootKey = await application.protocolService.getRootKey();
    expect(rootKey.masterKey).to.equal(accountKey.masterKey);
    expect(rootKey.dataAuthenticationKey).to.equal(accountKey.dataAuthenticationKey);
    expect(rootKey.serverPassword).to.not.be.ok;
    expect(rootKey.version).to.equal(ProtocolVersions.V003);
    expect(application.protocolService.keyMode).to.equal(KeyMode.RootKeyOnly);

    const keyParams = await application.storageService.getValue(
      StorageKeys.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(typeof keyParams).to.equal('object');

    /** Expect note is decrypted */
    expect(application.modelManager.notes.length).to.equal(1);
    const retrievedNote = application.modelManager.notes[0];
    expect(retrievedNote.uuid).to.equal(notePayload.uuid);
    expect(retrievedNote.content.text).to.equal(notePayload.content.text);
    expect(
      await application.storageService.getValue('first_run')
    ).to.equal(false);
    expect(
      await application.storageService.getValue('biometrics_prefs')
    ).to.eql(biometricPrefs);

    await application.deinit();
  }).timeout(10000);


  it('2020-01-15 migration with no account and no passcode', async function () {
    const application = await Factory.createAppWithRandNamespace(
      Environments.Mobile,
      Platforms.Ios
    );
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
    const noteParams = await operator003.generateEncryptedParameters(
      notePayload,
      PayloadFormats.DecryptedBareObject
    );
    const noteProcessedPayload = CreateMaxPayloadFromAnyObject(
      notePayload,
      null,
      null,
      noteParams
    );
    await application.deviceInterface.saveRawDatabasePayload(noteProcessedPayload);

    /** Run migration */
    const promptForValuesForTypes = (types) => {
      const values = [];
      for (const type of types) {
        if (type === ChallengeType.LocalPasscode) {
          values.push(new ChallengeValue(type, passcode));
        }
      }
      return values;
    };
    const receiveChallenge = async (challenge, orchestrator) => {
      orchestrator.setCallbacks(
        undefined,
        (value) => {
          const values = promptForValuesForTypes([value.type]);
          orchestrator.submitValues(values);
        },
      );
      const initialValues = promptForValuesForTypes(challenge.types);
      orchestrator.submitValues(initialValues);
    };
    await application.prepareForLaunch({
      callbacks: {
        receiveChallenge: receiveChallenge,
      }
    });
    await application.launch({
      awaitDatabaseLoad: true
    });

    expect(application.protocolService.keyMode).to.equal(
      KeyMode.RootKeyNone
    );
    /** Should be decrypted */
    const storageMode = application.storageService.domainKeyForMode(
      StorageValueModes.Default
    );
    const valueStore = application.storageService.values[storageMode];
    expect(valueStore.content_type).to.not.be.ok;

    const rootKey = await application.protocolService.getRootKey();
    expect(rootKey).to.not.be.ok;
    expect(application.protocolService.keyMode).to.equal(KeyMode.RootKeyNone);

    /** Expect note is decrypted */
    expect(application.modelManager.notes.length).to.equal(1);
    const retrievedNote = application.modelManager.notes[0];
    expect(retrievedNote.uuid).to.equal(notePayload.uuid);
    expect(retrievedNote.content.text).to.equal(notePayload.content.text);
    expect(
      await application.storageService.getValue('first_run')
    ).to.equal(false);
    expect(
      await application.storageService.getValue('biometrics_prefs')
    ).to.eql(biometricPrefs);

    await application.deinit();
  });

});
