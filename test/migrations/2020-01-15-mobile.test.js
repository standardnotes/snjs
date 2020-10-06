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
    let application = await Factory.createAppWithRandNamespace(
      Environment.Mobile,
      Platform.Ios
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
    const passcodeKey = await operator003.createRootKey(
      identifier,
      passcode
    );
    await application.deviceInterface.setRawStorageValue(
      'pc_params',
      JSON.stringify(passcodeKey.keyParams.getPortableValue())
    );
    const passcodeTiming = 'immediately';

    /** Create old version account parameters */
    const password = 'tar';
    const accountKey = await operator003.createRootKey(
      identifier,
      password
    );
    await application.deviceInterface.setRawStorageValue(
      'auth_params',
      JSON.stringify(accountKey.keyParams.getPortableValue())
    );
    await application.deviceInterface.setRawStorageValue(
      'user',
      JSON.stringify({ email: identifier })
    );
    await application.deviceInterface.legacy_setRawKeychainValue({
      mk: accountKey.masterKey,
      pw: accountKey.serverPassword,
      ak: accountKey.dataAuthenticationKey,
      version: ProtocolVersion.V003,
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
      PayloadFormat.EncryptedString,
      passcodeKey,
    );
    const wrappedKey = CreateMaxPayloadFromAnyObject(
      keyPayload,
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
      PayloadFormat.EncryptedString,
      accountKey,
    );
    const noteEncryptedPayload = CreateMaxPayloadFromAnyObject(
      notePayload,
      noteEncryptionParams
    );
    await application.deviceInterface.saveRawDatabasePayload(noteEncryptedPayload, application.identifier);
    /** setup options */
    await application.deviceInterface.setRawStorageValue(
      'LastExportDateKey',
      undefined
    );
    await application.deviceInterface.setRawStorageValue(
      'DoNotShowAgainUnsupportedEditorsKey',
      undefined
    );
    const options = JSON.stringify({
      sortBy: 'userModifiedAt',
      sortReverse: undefined,
      selectedTagIds: [],
      hidePreviews: true,
      hideDates: false,
    });
    await application.deviceInterface.setRawStorageValue(
      'options',
      options
    );
    /** Run migration */
    const promptValueReply = (prompts) => {
      const values = [];
      for (const prompt of prompts) {
        if (prompt.validation === ChallengeValidation.None || prompt.validation === ChallengeValidation.LocalPasscode) {
          values.push(new ChallengeValue(prompt, passcode));
        }
        if (prompt.validation === ChallengeValidation.Biometric) {
          values.push(new ChallengeValue(prompt, true));
        }
      }
      return values;
    };
    const receiveChallenge = async (challenge) => {
      const values = promptValueReply(challenge.prompts);
      application.submitValuesForChallenge(challenge, values);
    };
    await application.prepareForLaunch({
      receiveChallenge
    });
    await application.launch(true);

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
      StorageKey.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(typeof keyParams).to.equal('object');
    const rootKey = await application.protocolService.getRootKey();
    expect(rootKey.masterKey).to.equal(accountKey.masterKey);
    expect(rootKey.dataAuthenticationKey).to.equal(accountKey.dataAuthenticationKey);
    expect(rootKey.serverPassword).to.equal(accountKey.serverPassword);
    expect(rootKey.keyVersion).to.equal(ProtocolVersion.V003);
    expect(application.protocolService.keyMode).to.equal(KeyMode.RootKeyPlusWrapper);

    const keychainValue = await application.deviceInterface.getNamespacedKeychainValue(application.identifier);
    expect(keychainValue).to.not.be.ok;

    /** Expect note is decrypted */
    expect(application.itemManager.notes.length).to.equal(1);
    const retrievedNote = application.itemManager.notes[0];
    expect(retrievedNote.uuid).to.equal(notePayload.uuid);
    expect(retrievedNote.content.text).to.equal(notePayload.content.text);
    expect(
      await application.storageService.getValue('first_run')
    ).to.equal(false);

    expect(await application.storageService.getValue(StorageKey.BiometricsState, StorageValueModes.Nonwrapped)).to.equal(biometricPrefs.enabled);
    expect(await application.storageService.getValue(StorageKey.MobileBiometricsTiming, StorageValueModes.Nonwrapped)).to.equal(biometricPrefs.timing);
    expect(await application.getUser().email).to.equal(identifier);

    const appId = application.identifier;
    await application.deinit();

    /** Recreate application and ensure storage values are consistent */
    application = Factory.createApplication(appId);
    await application.prepareForLaunch({
      receiveChallenge
    });
    await application.launch(true);
    expect(await application.getUser().email).to.equal(identifier);
    const preferences = await application.storageService.getValue('preferences');
    expect(preferences.sortBy).to.equal('userModifiedAt');
    expect(preferences.sortReverse).to.to.equal(undefined);
    expect(preferences.hideDate).to.be.false;
    expect(preferences.hideNotePreview).to.be.true;
    expect(preferences.lastExportDate).to.equal(undefined);
    expect(preferences.doNotShowAgainUnsupportedEditors).to.to.equal(undefined);
  });


  it('2020-01-15 migration with passcode only', async function () {
    const application = await Factory.createAppWithRandNamespace(
      Environment.Mobile,
      Platform.Ios
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
    const passcodeKey = await operator003.createRootKey(
      identifier,
      passcode
    );
    await application.deviceInterface.setRawStorageValue(
      'pc_params',
      JSON.stringify(passcodeKey.keyParams.getPortableValue())
    );
    const passcodeTiming = 'immediately';
    await application.deviceInterface.legacy_setRawKeychainValue({
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
      PayloadFormat.EncryptedString,
      passcodeKey,
    );
    const noteEncryptedPayload = CreateMaxPayloadFromAnyObject(
      notePayload,
      noteEncryptionParams
    );
    await application.deviceInterface.saveRawDatabasePayload(noteEncryptedPayload, application.identifier);
    /** setup options */
    await application.deviceInterface.setRawStorageValue(
      'DoNotShowAgainUnsupportedEditorsKey',
      true
    );
    const options = JSON.stringify({
      sortBy: undefined,
      sortReverse: undefined,
      selectedTagIds: [],
      hidePreviews: false,
      hideDates: undefined,
    });
    await application.deviceInterface.setRawStorageValue(
      'options',
      options
    );
    /** Run migration */
    const promptValueReply = (prompts) => {
      const values = [];
      for (const prompt of prompts) {
        if (prompt.validation === ChallengeValidation.None || prompt.validation === ChallengeValidation.LocalPasscode) {
          values.push(new ChallengeValue(prompt, passcode));
        }
        if (prompt.validation === ChallengeValidation.Biometric) {
          values.push(new ChallengeValue(prompt, true));
        }

      }
      return values;
    };
    const receiveChallenge = async (challenge) => {
      application.addChallengeObserver(challenge, {
        onInvalidValue: (value) => {
          const values = promptValueReply([value.prompt]);
          application.submitValuesForChallenge(challenge, values);
        },
      });
      await Factory.sleep(0);
      const initialValues = promptValueReply(challenge.prompts);
      application.submitValuesForChallenge(challenge, initialValues);
    };
    await application.prepareForLaunch({
      receiveChallenge: receiveChallenge,
    });
    expect(application.protocolService.keyMode).to.equal(
      KeyMode.WrapperOnly
    );
    await application.launch(true);
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
    expect(rootKey.keyVersion).to.equal(ProtocolVersion.V003);
    expect(application.protocolService.keyMode).to.equal(KeyMode.WrapperOnly);

    const keychainValue = await application.deviceInterface.getNamespacedKeychainValue(application.identifier);
    expect(keychainValue).to.not.be.ok;

    /** Expect note is decrypted */
    expect(application.itemManager.notes.length).to.equal(1);
    const retrievedNote = application.itemManager.notes[0];
    expect(retrievedNote.uuid).to.equal(notePayload.uuid);
    expect(retrievedNote.content.text).to.equal(notePayload.content.text);
    expect(
      await application.storageService.getValue('first_run')
    ).to.equal(false);
    expect(await application.storageService.getValue(StorageKey.BiometricsState, StorageValueModes.Nonwrapped)).to.equal(biometricPrefs.enabled);
    expect(await application.storageService.getValue(StorageKey.MobileBiometricsTiming, StorageValueModes.Nonwrapped)).to.equal(biometricPrefs.timing);
    expect(
      await application.storageService.getValue(StorageKey.MobilePasscodeTiming, StorageValueModes.Nonwrapped)
    ).to.eql(passcodeTiming);
    const preferences = await application.storageService.getValue('preferences');
    expect(preferences.sortBy).to.equal(undefined);
    expect(preferences.sortReverse).to.be.false;
    expect(preferences.hideNotePreview).to.be.false;
    expect(preferences.hideDate).to.be.false;
    expect(preferences.lastExportDate).to.equal(undefined);
    expect(preferences.doNotShowAgainUnsupportedEditors).to.be.true;
    await application.deinit();
  });

  it('2020-01-15 migration with account only', async function () {
    const application = await Factory.createAppWithRandNamespace(
      Environment.Mobile,
      Platform.Ios
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
    const accountKey = await operator003.createRootKey(
      identifier,
      password
    );
    await application.deviceInterface.setRawStorageValue(
      'auth_params',
      JSON.stringify(accountKey.keyParams.getPortableValue())
    );
    await application.deviceInterface.setRawStorageValue(
      'user',
      JSON.stringify({ email: identifier })
    );
    expect(accountKey.keyVersion).to.equal(ProtocolVersion.V003);
    await application.deviceInterface.legacy_setRawKeychainValue({
      mk: accountKey.masterKey,
      pw: accountKey.serverPassword,
      ak: accountKey.dataAuthenticationKey,
      version: ProtocolVersion.V003
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
      PayloadFormat.EncryptedString,
      accountKey,
    );
    const noteEncryptedPayload = CreateMaxPayloadFromAnyObject(
      notePayload,
      noteEncryptionParams
    );
    await application.deviceInterface.saveRawDatabasePayload(noteEncryptedPayload, application.identifier);
    /** setup options */
    await application.deviceInterface.setRawStorageValue(
      'LastExportDateKey',
      true
    );
    await application.deviceInterface.setRawStorageValue(
      'DoNotShowAgainUnsupportedEditorsKey',
      undefined
    );
    const options = JSON.stringify({
      sortBy: 'created_at',
      sortReverse: undefined,
      selectedTagIds: [],
      hidePreviews: true,
      hideDates: false,
    });
    await application.deviceInterface.setRawStorageValue(
      'options',
      options
    );
    /** Run migration */
    const promptValueReply = (prompts) => {
      const values = [];
      for (const prompt of prompts) {
        if (prompt.validation === ChallengeValidation.None || prompt.validation === ChallengeValidation.LocalPasscode) {
          values.push(new ChallengeValue(prompt, passcode));
        }
        if (prompt.validation === ChallengeValidation.Biometric) {
          values.push(new ChallengeValue(prompt, true));
        }
      }
      return values;
    };
    const receiveChallenge = async (challenge) => {
      application.addChallengeObserver(challenge, {
        onInvalidValue: (value) => {
          const values = promptValueReply([value.prompt]);
          application.submitValuesForChallenge(challenge, values);
        },
      });
      const initialValues = promptValueReply(challenge.prompts);
      application.submitValuesForChallenge(challenge, initialValues);
    };
    await application.prepareForLaunch({
      receiveChallenge: receiveChallenge,
    });
    await application.launch(true);

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
    expect(rootKey.keyVersion).to.equal(ProtocolVersion.V003);
    expect(application.protocolService.keyMode).to.equal(KeyMode.RootKeyOnly);

    const keyParams = await application.storageService.getValue(
      StorageKey.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(typeof keyParams).to.equal('object');

    /** Expect note is decrypted */
    expect(application.itemManager.notes.length).to.equal(1);
    const retrievedNote = application.itemManager.notes[0];
    expect(retrievedNote.uuid).to.equal(notePayload.uuid);
    expect(retrievedNote.content.text).to.equal(notePayload.content.text);
    expect(
      await application.storageService.getValue('first_run')
    ).to.equal(false);
    expect(await application.storageService.getValue(StorageKey.BiometricsState, StorageValueModes.Nonwrapped)).to.equal(biometricPrefs.enabled);
    expect(await application.storageService.getValue(StorageKey.MobileBiometricsTiming, StorageValueModes.Nonwrapped)).to.equal(biometricPrefs.timing);
    expect(await application.getUser().email).to.equal(identifier);
    const preferences = await application.storageService.getValue('preferences');
    expect(preferences.sortBy).to.equal('created_at');
    expect(preferences.sortReverse).to.be.false;
    expect(preferences.hideDate).to.be.false;
    expect(preferences.hideNotePreview).to.be.true;
    expect(preferences.lastExportDate).to.equal(undefined);
    expect(preferences.doNotShowAgainUnsupportedEditors).to.be.true;
    await application.deinit();
  }).timeout(10000);


  it('2020-01-15 migration with no account and no passcode', async function () {
    const application = await Factory.createAppWithRandNamespace(
      Environment.Mobile,
      Platform.Ios
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
      PayloadFormat.DecryptedBareObject
    );
    const noteProcessedPayload = CreateMaxPayloadFromAnyObject(
      notePayload,
      noteParams
    );
    await application.deviceInterface.saveRawDatabasePayload(noteProcessedPayload, application.identifier);
    /** setup options */
    await application.deviceInterface.setRawStorageValue(
      'LastExportDateKey',
      true
    );
    await application.deviceInterface.setRawStorageValue(
      'DoNotShowAgainUnsupportedEditorsKey',
      undefined
    );
    const options = JSON.stringify({
      sortBy: 'created_at',
      sortReverse: undefined,
      selectedTagIds: [],
      hidePreviews: true,
      hideDates: false,
    });
    await application.deviceInterface.setRawStorageValue(
      'options',
      options
    );
    /** Run migration */
    const promptValueReply = (prompts) => {
      const values = [];
      for (const prompt of prompts) {
        if (prompt.validation === ChallengeValidation.None || prompt.validation === ChallengeValidation.LocalPasscode) {
          values.push(new ChallengeValue(prompt, passcode));
        }
        if (prompt.validation === ChallengeValidation.Biometric) {
          values.push(new ChallengeValue(prompt, true));
        }
      }
      return values;
    };
    const receiveChallenge = async (challenge) => {
      application.addChallengeObserver(challenge, {
        onInvalidValue: (value) => {
          const values = promptValueReply([value.prompt]);
          application.submitValuesForChallenge(challenge, values);
        },
      });
      const initialValues = promptValueReply(challenge.prompts);
      application.submitValuesForChallenge(challenge, initialValues);
    };
    await application.prepareForLaunch({
      receiveChallenge: receiveChallenge,
    });
    await application.launch(true);

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
    expect(application.itemManager.notes.length).to.equal(1);
    const retrievedNote = application.itemManager.notes[0];
    expect(retrievedNote.uuid).to.equal(notePayload.uuid);
    expect(retrievedNote.content.text).to.equal(notePayload.content.text);
    expect(
      await application.storageService.getValue('first_run')
    ).to.equal(false);
    expect(await application.storageService.getValue(StorageKey.BiometricsState, StorageValueModes.Nonwrapped)).to.equal(biometricPrefs.enabled);
    expect(await application.storageService.getValue(StorageKey.MobileBiometricsTiming, StorageValueModes.Nonwrapped)).to.equal(biometricPrefs.timing);
    const preferences = await application.storageService.getValue('preferences');
    expect(preferences.sortBy).to.equal('created_at');
    expect(preferences.sortReverse).to.be.false;
    expect(preferences.hideDate).to.be.false;
    expect(preferences.hideNotePreview).to.be.true;
    expect(preferences.lastExportDate).to.equal(undefined);
    expect(preferences.doNotShowAgainUnsupportedEditors).to.be.true;
    await application.deinit();
  });

});
