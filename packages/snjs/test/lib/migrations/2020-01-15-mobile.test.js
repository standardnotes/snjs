import * as Factory from './../../factory';
import {
  CreateMaxPayloadFromAnyObject,
  Environment,
  Platform,
  SNProtocolOperator003,
  PayloadFormat,
  NonwrappedStorageKey,
  ChallengeValidation,
  ChallengeValue,
  KeyMode,
  ProtocolVersion,
  SessionStrings,
  SNProtocolOperator001,
  SNProtocolOperator002,
  StorageKey,
  StorageValueModes,
  Uuid
} from '@Lib/index';
import SNCrypto from './../../setup/snjs/snCrypto';

describe('2020-01-15 mobile migration', () => {
  beforeEach(() => {
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
    const operator003 = new SNProtocolOperator003(new SNCrypto());
    const identifier = 'foo';
    const passcode = 'bar';
    /** Create old version passcode parameters */
    const passcodeKey = await operator003.createRootKey(identifier, passcode);
    await application.deviceInterface.setRawStorageValue(
      'pc_params',
      JSON.stringify(passcodeKey.keyParams.getPortableValue())
    );
    const passcodeTiming = 'immediately';

    /** Create old version account parameters */
    const password = 'tar';
    const accountKey = await operator003.createRootKey(identifier, password);
    await application.deviceInterface.setRawStorageValue(
      'auth_params',
      JSON.stringify(accountKey.keyParams.getPortableValue())
    );
    const customServer = 'http://server-dev.standardnotes.org';
    await application.deviceInterface.setRawStorageValue(
      'user',
      JSON.stringify({ email: identifier, server: customServer })
    );
    await application.deviceInterface.legacy_setRawKeychainValue({
      offline: {
        pw: passcodeKey.serverPassword,
        timing: passcodeTiming,
      },
    });
    /** Wrap account key with passcode key and store in storage */
    const keyPayload = CreateMaxPayloadFromAnyObject({
      uuid: Factory.generateUuid(),
      content_type: 'SN|Mobile|EncryptedKeys',
      content: {
        accountKeys: {
          jwt: 'foo',
          mk: accountKey.masterKey,
          ak: accountKey.dataAuthenticationKey,
          pw: accountKey.serverPassword,
        },
      },
    });
    const encryptedKeyParams = await operator003.generateEncryptedParameters(
      keyPayload,
      PayloadFormat.EncryptedString,
      passcodeKey
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
      NonwrappedStorageKey.MobileFirstRun,
      false
    );
    /** Create encrypted item and store it in db */
    const notePayload = Factory.createNotePayload();
    const noteEncryptionParams = await operator003.generateEncryptedParameters(
      notePayload,
      PayloadFormat.EncryptedString,
      accountKey
    );
    const noteEncryptedPayload = CreateMaxPayloadFromAnyObject(
      notePayload,
      noteEncryptionParams
    );
    await application.deviceInterface.saveRawDatabasePayload(
      noteEncryptedPayload,
      application.identifier
    );
    /** setup options */
    const lastExportDate = '2020:02';
    await application.deviceInterface.setRawStorageValue(
      'LastExportDateKey',
      lastExportDate
    );
    const options = JSON.stringify({
      sortBy: 'userModifiedAt',
      sortReverse: undefined,
      selectedTagIds: [],
      hidePreviews: true,
      hideDates: false,
      hideTags: false,
    });
    await application.deviceInterface.setRawStorageValue('options', options);
    /** Run migration */
    const promptValueReply = (prompts) => {
      const values = [];
      for (const prompt of prompts) {
        if (
          prompt.validation === ChallengeValidation.None ||
          prompt.validation === ChallengeValidation.LocalPasscode
        ) {
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
      receiveChallenge,
    });
    await application.launch(true);

    expect(application.protocolService.keyMode).toEqual(
      KeyMode.RootKeyPlusWrapper
    );

    /** Should be decrypted */
    const storageMode = application.storageService.domainKeyForMode(
      StorageValueModes.Default
    );
    const valueStore = application.storageService.values[storageMode];
    expect(valueStore.content_type).toBeUndefined;

    const keyParams = await application.storageService.getValue(
      StorageKey.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(typeof keyParams).toEqual('object');
    const rootKey = application.protocolService.getRootKey();
    expect(rootKey.masterKey).toEqual(accountKey.masterKey);
    expect(rootKey.dataAuthenticationKey).toEqual(
      accountKey.dataAuthenticationKey
    );
    expect(rootKey.serverPassword).toBeUndefined;
    expect(rootKey.keyVersion).toEqual(ProtocolVersion.V003);
    expect(application.protocolService.keyMode).toEqual(
      KeyMode.RootKeyPlusWrapper
    );

    const keychainValue = await application.deviceInterface.getNamespacedKeychainValue(
      application.identifier
    );
    expect(keychainValue).toBeUndefined;

    /** Expect note is decrypted */
    expect(application.itemManager.notes.length).toEqual(1);
    const retrievedNote = application.itemManager.notes[0];
    expect(retrievedNote.uuid).toEqual(notePayload.uuid);
    expect(retrievedNote.content.text).toEqual(notePayload.content.text);

    expect(
      await application.storageService.getValue(
        NonwrappedStorageKey.MobileFirstRun,
        StorageValueModes.Nonwrapped
      )
    ).toEqual(false);

    expect(
      await application.storageService.getValue(
        StorageKey.BiometricsState,
        StorageValueModes.Nonwrapped
      )
    ).toEqual(biometricPrefs.enabled);
    expect(
      await application.storageService.getValue(
        StorageKey.MobileBiometricsTiming,
        StorageValueModes.Nonwrapped
      )
    ).toEqual(biometricPrefs.timing);
    expect(application.getUser().email).toEqual(identifier);

    const appId = application.identifier;
    console.warn(
      'Expecting exception due to deiniting application while trying to renew session'
    );

    /** Full sync completed event will not trigger due to mocked credentials,
     * thus we manually need to mark any sync dependent migrations as complete. */
    await application.migrationService.markMigrationsAsDone();
    application.deinit();

    /** Recreate application and ensure storage values are consistent */
    application = Factory.createApplication(appId);
    await application.prepareForLaunch({
      receiveChallenge,
    });
    await application.launch(true);
    expect(application.getUser().email).toEqual(identifier);
    expect(application.getHost()).toEqual(customServer);
    const preferences = await application.storageService.getValue(
      'preferences'
    );
    expect(preferences.sortBy).toEqual('userModifiedAt');
    expect(preferences.sortReverse).toEqual(false);
    expect(preferences.hideDate).toEqual(false);
    expect(preferences.hideTags).toEqual(false);
    expect(preferences.hideNotePreview).toEqual(true);
    expect(preferences.lastExportDate).toEqual(lastExportDate);
    expect(preferences.doNotShowAgainUnsupportedEditors).toEqual(false);
    console.warn(
      'Expecting exception due to deiniting application while trying to renew session'
    );
    application.deinit();
  }, Factory.LongTestTimeout);

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
    const operator003 = new SNProtocolOperator003(new SNCrypto());
    const identifier = 'foo';
    const passcode = 'bar';
    /** Create old version passcode parameters */
    const passcodeKey = await operator003.createRootKey(identifier, passcode);
    await application.deviceInterface.setRawStorageValue(
      'pc_params',
      JSON.stringify(passcodeKey.keyParams.getPortableValue())
    );
    const passcodeTiming = 'immediately';
    await application.deviceInterface.legacy_setRawKeychainValue({
      offline: {
        pw: passcodeKey.serverPassword,
        timing: passcodeTiming,
      },
    });

    const biometricPrefs = { enabled: true, timing: 'immediately' };
    /** Create legacy storage. Storage in mobile was never wrapped. */
    await application.deviceInterface.setRawStorageValue(
      'biometrics_prefs',
      JSON.stringify(biometricPrefs)
    );
    const passcodeKeyboardType = 'numeric';
    await application.deviceInterface.setRawStorageValue(
      'passcodeKeyboardType',
      passcodeKeyboardType
    );
    await application.deviceInterface.setRawStorageValue(
      NonwrappedStorageKey.MobileFirstRun,
      false
    );
    /** Create encrypted item and store it in db */
    const notePayload = Factory.createNotePayload();
    const noteEncryptionParams = await operator003.generateEncryptedParameters(
      notePayload,
      PayloadFormat.EncryptedString,
      passcodeKey
    );
    const noteEncryptedPayload = CreateMaxPayloadFromAnyObject(
      notePayload,
      noteEncryptionParams
    );
    await application.deviceInterface.saveRawDatabasePayload(
      noteEncryptedPayload,
      application.identifier
    );
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
      hideTags: true,
    });
    await application.deviceInterface.setRawStorageValue('options', options);
    /** Run migration */
    const promptValueReply = (prompts) => {
      const values = [];
      for (const prompt of prompts) {
        if (
          prompt.validation === ChallengeValidation.None ||
          prompt.validation === ChallengeValidation.LocalPasscode
        ) {
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
    expect(application.protocolService.keyMode).toEqual(KeyMode.WrapperOnly);
    await application.launch(true);
    /** Should be decrypted */
    const storageMode = application.storageService.domainKeyForMode(
      StorageValueModes.Default
    );
    const valueStore = application.storageService.values[storageMode];
    expect(valueStore.content_type).toBeUndefined;

    const rootKey = application.protocolService.getRootKey();
    expect(rootKey.masterKey).toEqual(passcodeKey.masterKey);
    expect(rootKey.dataAuthenticationKey).toEqual(
      passcodeKey.dataAuthenticationKey
    );
    /** Root key is in memory with passcode only, so server password can be defined */
    expect(rootKey.serverPassword).toBeDefined;
    expect(rootKey.keyVersion).toEqual(ProtocolVersion.V003);
    expect(application.protocolService.keyMode).toEqual(KeyMode.WrapperOnly);

    const keychainValue = await application.deviceInterface.getNamespacedKeychainValue(
      application.identifier
    );
    expect(keychainValue).toBeUndefined;

    /** Expect note is decrypted */
    expect(application.itemManager.notes.length).toEqual(1);
    const retrievedNote = application.itemManager.notes[0];
    expect(retrievedNote.uuid).toEqual(notePayload.uuid);
    expect(retrievedNote.content.text).toEqual(notePayload.content.text);
    expect(
      await application.storageService.getValue(
        NonwrappedStorageKey.MobileFirstRun,
        StorageValueModes.Nonwrapped
      )
    ).toEqual(false);
    expect(
      await application.storageService.getValue(
        StorageKey.BiometricsState,
        StorageValueModes.Nonwrapped
      )
    ).toEqual(biometricPrefs.enabled);
    expect(
      await application.storageService.getValue(
        StorageKey.MobileBiometricsTiming,
        StorageValueModes.Nonwrapped
      )
    ).toEqual(biometricPrefs.timing);
    expect(
      await application.storageService.getValue(
        StorageKey.MobilePasscodeTiming,
        StorageValueModes.Nonwrapped
      )
    ).toEqual(passcodeTiming);
    expect(
      await application.storageService.getValue(
        StorageKey.MobilePasscodeKeyboardType,
        StorageValueModes.Nonwrapped
      )
    ).toEqual(passcodeKeyboardType);
    const preferences = await application.storageService.getValue(
      'preferences'
    );
    expect(preferences.sortBy).toEqual(undefined);
    expect(preferences.sortReverse).toEqual(false);
    expect(preferences.hideNotePreview).toEqual(false);
    expect(preferences.hideDate).toEqual(false);
    expect(preferences.hideTags).toEqual(true);
    expect(preferences.lastExportDate).toEqual(undefined);
    expect(preferences.doNotShowAgainUnsupportedEditors).toEqual(true);
    application.deinit();
  });

  it('2020-01-15 migration with passcode-only missing keychain', async function () {
    const application = await Factory.createAppWithRandNamespace(
      Environment.Mobile,
      Platform.Ios
    );
    /** Create legacy migrations value so that base migration detects old app */
    await application.deviceInterface.setRawStorageValue(
      'migrations',
      JSON.stringify(['anything'])
    );
    const operator003 = new SNProtocolOperator003(new SNCrypto());
    const identifier = 'foo';
    const passcode = 'bar';
    /** Create old version passcode parameters */
    const passcodeKey = await operator003.createRootKey(identifier, passcode);
    await application.deviceInterface.setRawStorageValue(
      'pc_params',
      JSON.stringify(passcodeKey.keyParams.getPortableValue())
    );
    const biometricPrefs = { enabled: true, timing: 'immediately' };
    /** Create legacy storage. Storage in mobile was never wrapped. */
    await application.deviceInterface.setRawStorageValue(
      'biometrics_prefs',
      JSON.stringify(biometricPrefs)
    );
    const passcodeKeyboardType = 'numeric';
    await application.deviceInterface.setRawStorageValue(
      'passcodeKeyboardType',
      passcodeKeyboardType
    );
    await application.deviceInterface.setRawStorageValue(
      NonwrappedStorageKey.MobileFirstRun,
      false
    );
    /** Create encrypted item and store it in db */
    const notePayload = Factory.createNotePayload();
    const noteEncryptionParams = await operator003.generateEncryptedParameters(
      notePayload,
      PayloadFormat.EncryptedString,
      passcodeKey
    );
    const noteEncryptedPayload = CreateMaxPayloadFromAnyObject(
      notePayload,
      noteEncryptionParams
    );
    await application.deviceInterface.saveRawDatabasePayload(
      noteEncryptedPayload,
      application.identifier
    );
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
      hideTags: true,
    });
    await application.deviceInterface.setRawStorageValue('options', options);
    /** Run migration */
    const promptValueReply = (prompts) => {
      const values = [];
      for (const prompt of prompts) {
        if (
          prompt.validation === ChallengeValidation.None ||
          prompt.validation === ChallengeValidation.LocalPasscode
        ) {
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
    expect(application.protocolService.keyMode).toEqual(KeyMode.WrapperOnly);
    await application.launch(true);

    const retrievedNote = application.itemManager.notes[0];
    expect(retrievedNote.errorDecrypting).toBeUndefined;

    /** application should not crash */
    application.deinit();
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
    const operator003 = new SNProtocolOperator003(new SNCrypto());
    const identifier = 'foo';
    /** Create old version account parameters */
    const password = 'tar';
    const accountKey = await operator003.createRootKey(identifier, password);
    await application.deviceInterface.setRawStorageValue(
      'auth_params',
      JSON.stringify(accountKey.keyParams.getPortableValue())
    );
    await application.deviceInterface.setRawStorageValue(
      'user',
      JSON.stringify({ email: identifier })
    );
    expect(accountKey.keyVersion).toEqual(ProtocolVersion.V003);
    await application.deviceInterface.legacy_setRawKeychainValue({
      mk: accountKey.masterKey,
      pw: accountKey.serverPassword,
      ak: accountKey.dataAuthenticationKey,
      jwt: 'foo',
      version: ProtocolVersion.V003,
    });
    const biometricPrefs = {
      enabled: true,
      timing: 'immediately',
    };
    /** Create legacy storage. Storage in mobile was never wrapped. */
    await application.deviceInterface.setRawStorageValue(
      'biometrics_prefs',
      JSON.stringify(biometricPrefs)
    );
    await application.deviceInterface.setRawStorageValue(
      NonwrappedStorageKey.MobileFirstRun,
      false
    );
    /** Create encrypted item and store it in db */
    const notePayload = Factory.createNotePayload();
    const noteEncryptionParams = await operator003.generateEncryptedParameters(
      notePayload,
      PayloadFormat.EncryptedString,
      accountKey
    );
    const noteEncryptedPayload = CreateMaxPayloadFromAnyObject(
      notePayload,
      noteEncryptionParams
    );
    await application.deviceInterface.saveRawDatabasePayload(
      noteEncryptedPayload,
      application.identifier
    );
    /** setup options */
    const lastExportDate = '2020:02';
    await application.deviceInterface.setRawStorageValue(
      'LastExportDateKey',
      lastExportDate
    );
    await application.deviceInterface.setRawStorageValue(
      'DoNotShowAgainUnsupportedEditorsKey',
      false
    );
    const options = JSON.stringify({
      sortBy: 'created_at',
      sortReverse: undefined,
      selectedTagIds: [],
      hidePreviews: true,
      hideDates: false,
    });
    await application.deviceInterface.setRawStorageValue('options', options);
    const promptValueReply = (prompts) => {
      const values = [];
      for (const prompt of prompts) {
        if (prompt.validation === ChallengeValidation.None) {
          values.push(new ChallengeValue(prompt, password));
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
    /** Runs migration */
    await application.prepareForLaunch({
      receiveChallenge: receiveChallenge,
    });
    await application.launch(true);

    expect(application.protocolService.keyMode).toEqual(KeyMode.RootKeyOnly);
    /** Should be decrypted */
    const storageMode = application.storageService.domainKeyForMode(
      StorageValueModes.Default
    );
    const valueStore = application.storageService.values[storageMode];
    expect(valueStore.content_type).toBeUndefined;
    const rootKey = application.protocolService.getRootKey();
    expect(rootKey.masterKey).toEqual(accountKey.masterKey);
    expect(rootKey.dataAuthenticationKey).toEqual(
      accountKey.dataAuthenticationKey
    );
    expect(rootKey.serverPassword).toBeUndefined;
    expect(rootKey.keyVersion).toEqual(ProtocolVersion.V003);
    expect(application.protocolService.keyMode).toEqual(KeyMode.RootKeyOnly);

    const keyParams = await application.storageService.getValue(
      StorageKey.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(typeof keyParams).toEqual('object');

    /** Expect note is decrypted */
    expect(application.itemManager.notes.length).toEqual(1);
    const retrievedNote = application.itemManager.notes[0];
    expect(retrievedNote.uuid).toEqual(notePayload.uuid);
    expect(retrievedNote.content.text).toEqual(notePayload.content.text);
    expect(
      await application.storageService.getValue(
        NonwrappedStorageKey.MobileFirstRun,
        StorageValueModes.Nonwrapped
      )
    ).toEqual(false);
    expect(
      await application.storageService.getValue(
        StorageKey.BiometricsState,
        StorageValueModes.Nonwrapped
      )
    ).toEqual(biometricPrefs.enabled);
    expect(
      await application.storageService.getValue(
        StorageKey.MobileBiometricsTiming,
        StorageValueModes.Nonwrapped
      )
    ).toEqual(biometricPrefs.timing);
    expect(application.getUser().email).toEqual(identifier);
    const preferences = await application.storageService.getValue(
      'preferences'
    );
    expect(preferences.sortBy).toEqual('created_at');
    expect(preferences.sortReverse).toEqual(false);
    expect(preferences.hideDate).toEqual(false);
    expect(preferences.hideNotePreview).toEqual(true);
    expect(preferences.lastExportDate).toEqual(lastExportDate);
    expect(preferences.doNotShowAgainUnsupportedEditors).toEqual(false);
    console.warn(
      'Expecting exception due to deiniting application while trying to renew session'
    );
    application.deinit();
  }, 10000);

  it('2020-01-15 launching with account but missing keychain', async function () {
    /**
     * We expect that the keychain will attempt to be recovered
     * We expect two challenges, one to recover just the keychain
     * and another to recover the user session via a sign in request
     */

    /** Register a real user so we can attempt to sign back into this account later */
    const tempApp = await Factory.createInitAppWithRandNamespace(
      Environment.Mobile,
      Platform.Ios
    );
    const email = Uuid.GenerateUuidSynchronously();
    const password = Uuid.GenerateUuidSynchronously();
    /** Register with 003 account */
    await Factory.registerOldUser({
      application: tempApp,
      email: email,
      password: password,
      version: ProtocolVersion.V003,
    });
    const accountKey = tempApp.protocolService.getRootKey();
    tempApp.deinit();
    localStorage.clear();

    const application = await Factory.createAppWithRandNamespace(
      Environment.Mobile,
      Platform.Ios
    );
    /** Create legacy migrations value so that base migration detects old app */
    await application.deviceInterface.setRawStorageValue(
      'migrations',
      JSON.stringify(['anything'])
    );
    const operator003 = new SNProtocolOperator003(new SNCrypto());
    /** Create old version account parameters */
    await application.deviceInterface.setRawStorageValue(
      'auth_params',
      JSON.stringify(accountKey.keyParams.getPortableValue())
    );
    await application.deviceInterface.setRawStorageValue(
      'user',
      JSON.stringify({ email: email })
    );
    expect(accountKey.keyVersion).toEqual(ProtocolVersion.V003);

    /** Create encrypted item and store it in db */
    const notePayload = Factory.createNotePayload();
    const noteEncryptionParams = await operator003.generateEncryptedParameters(
      notePayload,
      PayloadFormat.EncryptedString,
      accountKey
    );
    const noteEncryptedPayload = CreateMaxPayloadFromAnyObject(
      notePayload,
      noteEncryptionParams
    );
    await application.deviceInterface.saveRawDatabasePayload(
      noteEncryptedPayload,
      application.identifier
    );

    /** Run migration */
    const promptValueReply = (prompts) => {
      const values = [];
      for (const prompt of prompts) {
        if (prompt.placeholder === SessionStrings.EmailInputPlaceholder) {
          values.push(new ChallengeValue(prompt, email));
        } else if (
          prompt.placeholder === SessionStrings.PasswordInputPlaceholder
        ) {
          values.push(new ChallengeValue(prompt, password));
        } else {
          throw Error('Unhandled prompt');
        }
      }
      return values;
    };
    let totalChallenges = 0;
    const expectedChallenges = 2;
    const receiveChallenge = async (challenge) => {
      totalChallenges++;
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

    /** Recovery migration is non-blocking, so let's block for it */
    await Factory.sleep(1.0);

    expect(application.protocolService.keyMode).toEqual(KeyMode.RootKeyOnly);
    /** Should be decrypted */
    const storageMode = application.storageService.domainKeyForMode(
      StorageValueModes.Default
    );
    const valueStore = application.storageService.values[storageMode];
    expect(valueStore.content_type).toBeUndefined;
    const rootKey = application.protocolService.getRootKey();
    expect(rootKey).toBeDefined;
    expect(rootKey.masterKey).toEqual(accountKey.masterKey);
    expect(rootKey.dataAuthenticationKey).toEqual(
      accountKey.dataAuthenticationKey
    );
    expect(rootKey.keyVersion).toEqual(ProtocolVersion.V003);
    expect(application.protocolService.keyMode).toEqual(KeyMode.RootKeyOnly);

    /** Expect note is decrypted */
    expect(application.itemManager.notes.length).toEqual(1);
    const retrievedNote = application.itemManager.notes[0];
    expect(retrievedNote.uuid).toEqual(notePayload.uuid);
    expect(retrievedNote.content.text).toEqual(notePayload.content.text);
    expect(application.getUser().email).toEqual(email);
    expect(application.apiService.getSession()).toBeDefined;
    expect(totalChallenges).toEqual(expectedChallenges);
    application.deinit();
  }, 10000);

  it('2020-01-15 migration with 002 account should not create 003 data', async function () {
    /** There was an issue where 002 account loading new app would create new default items key
     * with 003 version. Should be 002. */
    const application = await Factory.createAppWithRandNamespace(
      Environment.Mobile,
      Platform.Ios
    );
    /** Create legacy migrations value so that base migration detects old app */
    await application.deviceInterface.setRawStorageValue(
      'migrations',
      JSON.stringify(['anything'])
    );
    const operator002 = new SNProtocolOperator002(new SNCrypto());
    const identifier = 'foo';
    /** Create old version account parameters */
    const password = 'tar';
    const accountKey = await operator002.createRootKey(identifier, password);
    await application.deviceInterface.setRawStorageValue(
      'auth_params',
      JSON.stringify(accountKey.keyParams.getPortableValue())
    );
    await application.deviceInterface.setRawStorageValue(
      'user',
      JSON.stringify({ email: identifier })
    );
    expect(accountKey.keyVersion).toEqual(ProtocolVersion.V002);
    await application.deviceInterface.legacy_setRawKeychainValue({
      mk: accountKey.masterKey,
      pw: accountKey.serverPassword,
      ak: accountKey.dataAuthenticationKey,
      jwt: 'foo',
    });
    /** Create encrypted item and store it in db */
    const notePayload = Factory.createNotePayload();
    const noteEncryptionParams = await operator002.generateEncryptedParameters(
      notePayload,
      PayloadFormat.EncryptedString,
      accountKey
    );
    const noteEncryptedPayload = CreateMaxPayloadFromAnyObject(
      notePayload,
      noteEncryptionParams
    );
    await application.deviceInterface.saveRawDatabasePayload(
      noteEncryptedPayload,
      application.identifier
    );

    /** Run migration */
    const promptValueReply = (prompts) => {
      const values = [];
      for (const prompt of prompts) {
        if (prompt.validation === ChallengeValidation.None) {
          values.push(new ChallengeValue(prompt, password));
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

    const itemsKey = application.itemManager.itemsKeys()[0];
    expect(itemsKey.keyVersion).toEqual(ProtocolVersion.V002);

    /** Expect note is decrypted */
    expect(application.itemManager.notes.length).toEqual(1);
    const retrievedNote = application.itemManager.notes[0];
    expect(retrievedNote.uuid).toEqual(notePayload.uuid);
    expect(retrievedNote.content.text).toEqual(notePayload.content.text);

    expect(application.getUser().email).toEqual(identifier);
    console.warn(
      'Expecting exception due to deiniting application while trying to renew session'
    );
    application.deinit();
  }, 10000);

  it('2020-01-15 migration with 001 account detect 001 version even with missing info', async function () {
    /** If 001 account, and for some reason we dont have version stored, the migrations
     * should determine correct version based on saved payloads */
    const application = await Factory.createAppWithRandNamespace(
      Environment.Mobile,
      Platform.Ios
    );
    /** Create legacy migrations value so that base migration detects old app */
    await application.deviceInterface.setRawStorageValue(
      'migrations',
      JSON.stringify(['anything'])
    );
    const operator001 = new SNProtocolOperator001(new SNCrypto());
    const identifier = 'foo';
    /** Create old version account parameters */
    const password = 'tar';
    const accountKey = await operator001.createRootKey(identifier, password);
    await application.deviceInterface.setRawStorageValue(
      'auth_params',
      JSON.stringify({
        ...accountKey.keyParams.getPortableValue(),
        version: undefined,
      })
    );
    await application.deviceInterface.setRawStorageValue(
      'user',
      JSON.stringify({ email: identifier })
    );
    expect(accountKey.keyVersion).toEqual(ProtocolVersion.V001);
    await application.deviceInterface.legacy_setRawKeychainValue({
      mk: accountKey.masterKey,
      pw: accountKey.serverPassword,
      jwt: 'foo',
    });
    /** Create encrypted item and store it in db */
    const notePayload = Factory.createNotePayload();
    const noteEncryptionParams = await operator001.generateEncryptedParameters(
      notePayload,
      PayloadFormat.EncryptedString,
      accountKey
    );
    const noteEncryptedPayload = CreateMaxPayloadFromAnyObject(
      notePayload,
      noteEncryptionParams
    );
    await application.deviceInterface.saveRawDatabasePayload(
      noteEncryptedPayload,
      application.identifier
    );

    /** Run migration */
    const promptValueReply = (prompts) => {
      const values = [];
      for (const prompt of prompts) {
        if (prompt.validation === ChallengeValidation.None) {
          values.push(new ChallengeValue(prompt, password));
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

    const itemsKey = application.itemManager.itemsKeys()[0];
    expect(itemsKey.keyVersion).toEqual(ProtocolVersion.V001);

    /** Expect note is decrypted */
    expect(application.itemManager.notes.length).toEqual(1);
    const retrievedNote = application.itemManager.notes[0];
    expect(retrievedNote.uuid).toEqual(notePayload.uuid);
    expect(retrievedNote.content.text).toEqual(notePayload.content.text);

    expect(application.getUser().email).toEqual(identifier);
    console.warn(
      'Expecting exception due to deiniting application while trying to renew session'
    );
    application.deinit();
  }, 10000);

  it('2020-01-15 successfully creates session if jwt is stored in keychain', async function () {
    const application = await Factory.createAppWithRandNamespace(
      Environment.Mobile,
      Platform.Ios
    );
    /** Create legacy migrations value so that base migration detects old app */
    await application.deviceInterface.setRawStorageValue(
      'migrations',
      JSON.stringify(['anything'])
    );
    const operator003 = new SNProtocolOperator003(new SNCrypto());
    const identifier = 'foo';
    const password = 'tar';
    const accountKey = await operator003.createRootKey(identifier, password);
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
      jwt: 'foo',
      version: ProtocolVersion.V003,
    });

    await application.prepareForLaunch({ receiveChallenge: () => {} });
    await application.launch(true);

    expect(application.apiService.getSession()).toBeDefined;

    application.deinit();
  }, 10000);

  it('2020-01-15 successfully creates session if jwt is stored in storage', async function () {
    const application = await Factory.createAppWithRandNamespace(
      Environment.Mobile,
      Platform.Ios
    );
    /** Create legacy migrations value so that base migration detects old app */
    await application.deviceInterface.setRawStorageValue(
      'migrations',
      JSON.stringify(['anything'])
    );
    const operator003 = new SNProtocolOperator003(new SNCrypto());
    const identifier = 'foo';
    const password = 'tar';
    const accountKey = await operator003.createRootKey(identifier, password);
    await application.deviceInterface.setRawStorageValue(
      'auth_params',
      JSON.stringify(accountKey.keyParams.getPortableValue())
    );
    await application.deviceInterface.setRawStorageValue(
      'user',
      JSON.stringify({ email: identifier, jwt: 'foo' })
    );
    await application.deviceInterface.legacy_setRawKeychainValue({
      mk: accountKey.masterKey,
      pw: accountKey.serverPassword,
      ak: accountKey.dataAuthenticationKey,
      version: ProtocolVersion.V003,
    });

    await application.prepareForLaunch({ receiveChallenge: () => {} });
    await application.launch(true);

    expect(application.apiService.getSession()).toBeDefined;

    application.deinit();
  }, 10000);

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
    const operator003 = new SNProtocolOperator003(new SNCrypto());
    const biometricPrefs = {
      enabled: true,
      timing: 'immediately',
    };
    /** Create legacy storage. Storage in mobile was never wrapped. */
    await application.deviceInterface.setRawStorageValue(
      'biometrics_prefs',
      JSON.stringify(biometricPrefs)
    );
    await application.deviceInterface.setRawStorageValue(
      NonwrappedStorageKey.MobileFirstRun,
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
    await application.deviceInterface.saveRawDatabasePayload(
      noteProcessedPayload,
      application.identifier
    );
    /** setup options */
    await application.deviceInterface.setRawStorageValue(
      'DoNotShowAgainUnsupportedEditorsKey',
      true
    );
    const options = JSON.stringify({
      sortBy: 'created_at',
      sortReverse: undefined,
      selectedTagIds: [],
      hidePreviews: true,
      hideDates: false,
    });
    await application.deviceInterface.setRawStorageValue('options', options);
    /** Run migration */
    const promptValueReply = (prompts) => {
      const values = [];
      for (const prompt of prompts) {
        if (
          prompt.validation === ChallengeValidation.None ||
          prompt.validation === ChallengeValidation.LocalPasscode
        ) {
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

    expect(application.protocolService.keyMode).toEqual(KeyMode.RootKeyNone);
    /** Should be decrypted */
    const storageMode = application.storageService.domainKeyForMode(
      StorageValueModes.Default
    );
    const valueStore = application.storageService.values[storageMode];
    expect(valueStore.content_type).toBeUndefined;

    const rootKey = application.protocolService.getRootKey();
    expect(rootKey).toBeUndefined;
    expect(application.protocolService.keyMode).toEqual(KeyMode.RootKeyNone);

    /** Expect note is decrypted */
    expect(application.itemManager.notes.length).toEqual(1);
    const retrievedNote = application.itemManager.notes[0];
    expect(retrievedNote.uuid).toEqual(notePayload.uuid);
    expect(retrievedNote.content.text).toEqual(notePayload.content.text);
    expect(
      await application.storageService.getValue(
        NonwrappedStorageKey.MobileFirstRun,
        StorageValueModes.Nonwrapped
      )
    ).toEqual(false);
    expect(
      await application.storageService.getValue(
        StorageKey.BiometricsState,
        StorageValueModes.Nonwrapped
      )
    ).toEqual(biometricPrefs.enabled);
    expect(
      await application.storageService.getValue(
        StorageKey.MobileBiometricsTiming,
        StorageValueModes.Nonwrapped
      )
    ).toEqual(biometricPrefs.timing);
    const preferences = await application.storageService.getValue(
      'preferences'
    );
    expect(preferences.sortBy).toEqual('created_at');
    expect(preferences.sortReverse).toEqual(false);
    expect(preferences.hideDate).toEqual(false);
    expect(preferences.hideNotePreview).toEqual(true);
    expect(preferences.lastExportDate).toEqual(undefined);
    expect(preferences.doNotShowAgainUnsupportedEditors).toEqual(true);
    application.deinit();
  }, 10000);

  it('2020-01-15 migration from mobile version 3.0.16', async function () {
    /**
     * In version 3.0.16, encrypted account keys were stored in keychain, not storage.
     * This was migrated in version 3.0.17, but we want to be sure we can go from 3.0.16
     * to current state directly.
     */
    let application = await Factory.createAppWithRandNamespace(
      Environment.Mobile,
      Platform.Ios
    );
    /** Create legacy migrations value so that base migration detects old app */
    await application.deviceInterface.setRawStorageValue(
      'migrations',
      JSON.stringify(['anything'])
    );
    const operator003 = new SNProtocolOperator003(new SNCrypto());
    const identifier = 'foo';
    const passcode = 'bar';
    /** Create old version passcode parameters */
    const passcodeKey = await operator003.createRootKey(identifier, passcode);
    await application.deviceInterface.setRawStorageValue(
      'pc_params',
      JSON.stringify(passcodeKey.keyParams.getPortableValue())
    );
    const passcodeTiming = 'immediately';

    /** Create old version account parameters */
    const password = 'tar';
    const accountKey = await operator003.createRootKey(identifier, password);
    await application.deviceInterface.setRawStorageValue(
      'auth_params',
      JSON.stringify(accountKey.keyParams.getPortableValue())
    );
    const customServer = 'http://server-dev.standardnotes.org';
    await application.deviceInterface.setRawStorageValue(
      'user',
      JSON.stringify({ email: identifier, server: customServer })
    );
    /** Wrap account key with passcode key and store in storage */
    const keyPayload = CreateMaxPayloadFromAnyObject({
      uuid: Factory.generateUuid(),
      content_type: 'SN|Mobile|EncryptedKeys',
      content: {
        accountKeys: {
          jwt: 'foo',
          mk: accountKey.masterKey,
          ak: accountKey.dataAuthenticationKey,
          pw: accountKey.serverPassword,
        },
      },
    });
    const encryptedKeyParams = await operator003.generateEncryptedParameters(
      keyPayload,
      PayloadFormat.EncryptedString,
      passcodeKey
    );
    const wrappedKey = CreateMaxPayloadFromAnyObject(
      keyPayload,
      encryptedKeyParams
    );
    await application.deviceInterface.legacy_setRawKeychainValue({
      encryptedAccountKeys: wrappedKey,
      offline: {
        pw: passcodeKey.serverPassword,
        timing: passcodeTiming,
      },
    });
    const biometricPrefs = { enabled: true, timing: 'immediately' };
    /** Create legacy storage. Storage in mobile was never wrapped. */
    await application.deviceInterface.setRawStorageValue(
      'biometrics_prefs',
      JSON.stringify(biometricPrefs)
    );
    await application.deviceInterface.setRawStorageValue(
      NonwrappedStorageKey.MobileFirstRun,
      false
    );
    /** Create encrypted item and store it in db */
    const notePayload = Factory.createNotePayload();
    const noteEncryptionParams = await operator003.generateEncryptedParameters(
      notePayload,
      PayloadFormat.EncryptedString,
      accountKey
    );
    const noteEncryptedPayload = CreateMaxPayloadFromAnyObject(
      notePayload,
      noteEncryptionParams
    );
    await application.deviceInterface.saveRawDatabasePayload(
      noteEncryptedPayload,
      application.identifier
    );
    /** setup options */
    const lastExportDate = '2020:02';
    await application.deviceInterface.setRawStorageValue(
      'LastExportDateKey',
      lastExportDate
    );
    const options = JSON.stringify({
      sortBy: 'userModifiedAt',
      sortReverse: undefined,
      selectedTagIds: [],
      hidePreviews: true,
      hideDates: false,
      hideTags: false,
    });
    await application.deviceInterface.setRawStorageValue('options', options);
    /** Run migration */
    const promptValueReply = (prompts) => {
      const values = [];
      for (const prompt of prompts) {
        if (
          prompt.validation === ChallengeValidation.None ||
          prompt.validation === ChallengeValidation.LocalPasscode
        ) {
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
      receiveChallenge,
    });
    await application.launch(true);

    expect(application.protocolService.keyMode).toEqual(
      KeyMode.RootKeyPlusWrapper
    );

    /** Should be decrypted */
    const storageMode = application.storageService.domainKeyForMode(
      StorageValueModes.Default
    );
    const valueStore = application.storageService.values[storageMode];
    expect(valueStore.content_type).toBeUndefined;

    const keyParams = await application.storageService.getValue(
      StorageKey.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(typeof keyParams).toEqual('object');
    const rootKey = application.protocolService.getRootKey();
    expect(rootKey.masterKey).toEqual(accountKey.masterKey);
    expect(rootKey.dataAuthenticationKey).toEqual(
      accountKey.dataAuthenticationKey
    );
    expect(rootKey.serverPassword).toBeUndefined;
    expect(rootKey.keyVersion).toEqual(ProtocolVersion.V003);
    expect(application.protocolService.keyMode).toEqual(
      KeyMode.RootKeyPlusWrapper
    );

    const keychainValue = await application.deviceInterface.getNamespacedKeychainValue(
      application.identifier
    );
    expect(keychainValue).toBeUndefined;

    /** Expect note is decrypted */
    expect(application.itemManager.notes.length).toEqual(1);
    const retrievedNote = application.itemManager.notes[0];
    expect(retrievedNote.uuid).toEqual(notePayload.uuid);
    expect(retrievedNote.content.text).toEqual(notePayload.content.text);

    expect(
      await application.storageService.getValue(
        NonwrappedStorageKey.MobileFirstRun,
        StorageValueModes.Nonwrapped
      )
    ).toEqual(false);

    expect(
      await application.storageService.getValue(
        StorageKey.BiometricsState,
        StorageValueModes.Nonwrapped
      )
    ).toEqual(biometricPrefs.enabled);
    expect(
      await application.storageService.getValue(
        StorageKey.MobileBiometricsTiming,
        StorageValueModes.Nonwrapped
      )
    ).toEqual(biometricPrefs.timing);
    expect(application.getUser().email).toEqual(identifier);

    const appId = application.identifier;
    console.warn(
      'Expecting exception due to deiniting application while trying to renew session'
    );
    /** Full sync completed event will not trigger due to mocked credentials,
     * thus we manually need to mark any sync dependent migrations as complete. */
    await application.migrationService.markMigrationsAsDone();
    application.deinit();

    /** Recreate application and ensure storage values are consistent */
    application = Factory.createApplication(appId);
    await application.prepareForLaunch({
      receiveChallenge,
    });
    await application.launch(true);
    expect(application.getUser().email).toEqual(identifier);
    expect(application.getHost()).toEqual(customServer);
    const preferences = await application.storageService.getValue(
      'preferences'
    );
    expect(preferences.sortBy).toEqual('userModifiedAt');
    expect(preferences.sortReverse).toEqual(false);
    expect(preferences.hideDate).toEqual(false);
    expect(preferences.hideTags).toEqual(false);
    expect(preferences.hideNotePreview).toEqual(true);
    expect(preferences.lastExportDate).toEqual(lastExportDate);
    expect(preferences.doNotShowAgainUnsupportedEditors).toEqual(false);
    console.warn(
      'Expecting exception due to deiniting application while trying to renew session'
    );
    application.deinit();
  }, Factory.LongTestTimeout);
});
