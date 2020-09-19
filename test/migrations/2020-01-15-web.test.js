/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('2020-01-15 web migration', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('2020-01-15 migration with passcode and account', async function () {
    const application = await Factory.createAppWithRandNamespace();
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
      'offlineParams',
      JSON.stringify(passcodeKey.keyParams.getPortableValue())
    );

    /** Create arbitrary storage values and make sure they're migrated */
    const arbitraryValues = {
      foo: 'bar',
      zar: 'tar',
      har: 'car'
    };
    for (const key of Object.keys(arbitraryValues)) {
      await application.deviceInterface.setRawStorageValue(
        key,
        arbitraryValues[key]
      );
    }
    /** Create old version account parameters */
    const password = 'tar';
    const accountKey = await operator003.createRootKey(
      identifier,
      password
    );

    /** Create legacy storage and encrypt it with passcode */
    const embeddedStorage = {
      mk: accountKey.masterKey,
      ak: accountKey.dataAuthenticationKey,
      pw: accountKey.serverPassword,
      jwt: 'anything',
      /** Legacy versions would store json strings inside of embedded storage */
      auth_params: JSON.stringify(accountKey.keyParams.getPortableValue())
    };
    const storagePayload = CreateMaxPayloadFromAnyObject(
      {
        uuid: await operator003.crypto.generateUUID(),
        content_type: ContentType.EncryptedStorage,
        content: {
          storage: embeddedStorage
        },
      }
    );
    const encryptionParams = await operator003.generateEncryptedParameters(
      storagePayload,
      PayloadFormat.EncryptedString,
      passcodeKey,
    );
    const persistPayload = CreateMaxPayloadFromAnyObject(
      storagePayload,
      encryptionParams
    );
    await application.deviceInterface.setRawStorageValue(
      'encryptedStorage',
      JSON.stringify(persistPayload)
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

    await application.prepareForLaunch({
      receiveChallenge: async (challenge) => {
        application.setChallengeCallbacks({
          challenge,
          onInvalidValue: (value) => {
            const values = promptForValuesForTypes([value.type]);
            application.submitValuesForChallenge(challenge, values);
          },
        });
        await Factory.sleep(0);
        const initialValues = promptForValuesForTypes(challenge.types);
        application.submitValuesForChallenge(challenge, initialValues);
      },
    });

    await application.launch(true);
    expect(application.sessionManager.online()).to.equal(true);
    expect(application.protocolService.keyMode).to.equal(
      KeyMode.RootKeyPlusWrapper
    );
    /** Should be decrypted */
    const storageMode = application.storageService.domainKeyForMode(
      StorageValueModes.Default
    );
    const valueStore = application.storageService.values[storageMode];
    expect(valueStore.content_type).to.not.be.ok;

    expect(await application.deviceInterface.getRawStorageValue('offlineParams')).to.not.be.ok;

    const keyParams = await application.storageService.getValue(
      StorageKey.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(typeof keyParams).to.equal('object');

    /** Embedded value should match */
    const migratedKeyParams = await application.storageService.getValue(
      StorageKey.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(migratedKeyParams).to.eql(JSON.parse(embeddedStorage.auth_params));
    const rootKey = await application.protocolService.getRootKey();
    expect(rootKey.masterKey).to.equal(accountKey.masterKey);
    expect(rootKey.dataAuthenticationKey).to.equal(accountKey.dataAuthenticationKey);
    expect(rootKey.serverPassword).to.equal(accountKey.serverPassword);
    expect(rootKey.keyVersion).to.equal(ProtocolVersion.V003);
    expect(application.protocolService.keyMode).to.equal(KeyMode.RootKeyPlusWrapper);

    /** Expect note is decrypted */
    expect(application.itemManager.notes.length).to.equal(1);
    const retrievedNote = application.itemManager.notes[0];
    expect(retrievedNote.uuid).to.equal(notePayload.uuid);
    expect(retrievedNote.content.text).to.equal(notePayload.content.text);

    /** Ensure arbitrary values have been migrated */
    for (const key of Object.keys(arbitraryValues)) {
      const value = await application.storageService.getValue(key);
      expect(arbitraryValues[key]).to.equal(value);
    }

    await application.deinit();
  }).timeout(15000);

  it('2020-01-15 migration with passcode only', async function () {
    const application = await Factory.createAppWithRandNamespace();
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
      'offlineParams',
      JSON.stringify(passcodeKey.keyParams.getPortableValue())
    );

    /** Create arbitrary storage values and make sure they're migrated */
    const arbitraryValues = {
      foo: 'bar',
      zar: 'tar',
      har: 'car'
    };
    for (const key of Object.keys(arbitraryValues)) {
      await application.deviceInterface.setRawStorageValue(
        key,
        arbitraryValues[key]
      );
    }

    const embeddedStorage = {
      ...arbitraryValues
    };
    const storagePayload = CreateMaxPayloadFromAnyObject(
      {
        uuid: await operator003.crypto.generateUUID(),
        content: {
          storage: embeddedStorage
        },
        content_type: ContentType.EncryptedStorage
      }
    );
    const encryptionParams = await operator003.generateEncryptedParameters(
      storagePayload,
      PayloadFormat.EncryptedString,
      passcodeKey,
    );
    const persistPayload = CreateMaxPayloadFromAnyObject(
      storagePayload,
      encryptionParams
    );
    await application.deviceInterface.setRawStorageValue(
      'encryptedStorage',
      JSON.stringify(persistPayload)
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
    await application.prepareForLaunch({
      receiveChallenge: async (challenge) => {
        application.setChallengeCallbacks({
          challenge,
          onInvalidValue: (value) => {
            const values = promptForValuesForTypes([value.type]);
            application.submitValuesForChallenge(challenge, values);
          },
        });
        await Factory.sleep(0);
        const initialValues = promptForValuesForTypes(challenge.types);
        application.submitValuesForChallenge(challenge, initialValues);
      },
    });
    await application.launch(true);
    expect(application.protocolService.keyMode).to.equal(
      KeyMode.WrapperOnly
    );
    /** Should be decrypted */
    const storageMode = application.storageService.domainKeyForMode(
      StorageValueModes.Default
    );
    const valueStore = application.storageService.values[storageMode];
    expect(valueStore.content_type).to.not.be.ok;

    expect(await application.deviceInterface.getRawStorageValue('offlineParams')).to.not.be.ok;

    /** Embedded value should match */
    const migratedKeyParams = await application.storageService.getValue(
      StorageKey.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(migratedKeyParams).to.eql(embeddedStorage.auth_params);
    const rootKey = await application.protocolService.getRootKey();
    expect(rootKey.masterKey).to.equal(passcodeKey.masterKey);
    expect(rootKey.dataAuthenticationKey).to.equal(passcodeKey.dataAuthenticationKey);
    expect(rootKey.serverPassword).to.equal(passcodeKey.serverPassword);
    expect(rootKey.keyVersion).to.equal(ProtocolVersion.V003);
    expect(application.protocolService.keyMode).to.equal(KeyMode.WrapperOnly);

    /** Expect note is decrypted */
    expect(application.itemManager.notes.length).to.equal(1);
    const retrievedNote = application.itemManager.notes[0];
    expect(retrievedNote.uuid).to.equal(notePayload.uuid);
    expect(retrievedNote.content.text).to.equal(notePayload.content.text);

    /** Ensure arbitrary values have been migrated */
    for (const key of Object.keys(arbitraryValues)) {
      const value = await application.storageService.getValue(key);
      expect(arbitraryValues[key]).to.equal(value);
    }
    await application.deinit();
  });

  /**
   * This test will pass but sync afterwards will not be successful
   * as we are using a random value for the legacy session token
   */
  it('2020-01-15 migration with account only', async function () {
    const application = await Factory.createAppWithRandNamespace();
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

    /** Create arbitrary storage values and make sure they're migrated */
    const storage = {
      foo: 'bar',
      zar: 'tar',
      har: 'car',
      mk: accountKey.masterKey,
      ak: accountKey.dataAuthenticationKey,
      pw: accountKey.serverPassword,
      jwt: 'anything',
      /** Legacy versions would store json strings inside of embedded storage */
      auth_params: JSON.stringify(accountKey.keyParams.getPortableValue())
    };
    for (const key of Object.keys(storage)) {
      await application.deviceInterface.setRawStorageValue(
        key,
        storage[key]
      );
    }
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
    const receiveChallenge = async (challenge) => {
      application.setChallengeCallbacks({
        challenge,
        onInvalidValue: (value) => {
          const values = promptForValuesForTypes([value.type]);
          application.submitValuesForChallenge(challenge, values);
        },
      });
      const initialValues = promptForValuesForTypes(challenge.types);
      application.submitValuesForChallenge(challenge, initialValues);
    };
    await application.prepareForLaunch({
      receiveChallenge: receiveChallenge,
    });
    await application.launch(true);
    expect(application.sessionManager.online()).to.equal(true);
    expect(application.protocolService.keyMode).to.equal(
      KeyMode.RootKeyOnly
    );
    /** Should be decrypted */
    const storageMode = application.storageService.domainKeyForMode(
      StorageValueModes.Default
    );
    const valueStore = application.storageService.values[storageMode];
    expect(valueStore.content_type).to.not.be.ok;
    /** Embedded value should match */
    const migratedKeyParams = await application.storageService.getValue(
      StorageKey.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(migratedKeyParams).to.eql(accountKey.keyParams.getPortableValue());
    const rootKey = await application.protocolService.getRootKey();
    expect(rootKey).to.be.ok;

    expect(await application.deviceInterface.getRawStorageValue('migrations')).to.not.be.ok;
    expect(await application.deviceInterface.getRawStorageValue('auth_params')).to.not.be.ok;
    expect(await application.deviceInterface.getRawStorageValue('jwt')).to.not.be.ok;

    const keyParams = await application.storageService.getValue(
      StorageKey.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(typeof keyParams).to.equal('object');

    expect(rootKey.masterKey).to.equal(accountKey.masterKey);
    expect(rootKey.dataAuthenticationKey).to.equal(accountKey.dataAuthenticationKey);
    expect(rootKey.serverPassword).to.not.be.ok;
    expect(rootKey.keyVersion).to.equal(ProtocolVersion.V003);
    expect(application.protocolService.keyMode).to.equal(KeyMode.RootKeyOnly);

    /** Expect note is decrypted */
    expect(application.itemManager.notes.length).to.equal(1);
    const retrievedNote = application.itemManager.notes[0];
    expect(retrievedNote.uuid).to.equal(notePayload.uuid);
    expect(retrievedNote.content.text).to.equal(notePayload.content.text);

    /** Ensure arbitrary values have been migrated */
    for (const key of Object.keys(storage)) {
      /** Is stringified in storage, but parsed in storageService */
      if (key === 'auth_params') {
        continue;
      }
      const value = await application.storageService.getValue(key);
      expect(storage[key]).to.equal(value);
    }

    await application.deinit();
  });

  it('2020-01-15 migration with no account and no passcode', async function () {
    const application = await Factory.createAppWithRandNamespace();
    /** Create legacy migrations value so that base migration detects old app */
    await application.deviceInterface.setRawStorageValue(
      'migrations',
      JSON.stringify(['anything'])
    );
    const operator003 = new SNProtocolOperator003(new SNWebCrypto());
    /** Create arbitrary storage values and make sure they're migrated */
    const storage = {
      foo: 'bar',
      zar: 'tar',
      har: 'car',
    };
    for (const key of Object.keys(storage)) {
      await application.deviceInterface.setRawStorageValue(
        key,
        storage[key]
      );
    }

    /** Create item and store it in db */
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

    /** Run migration */
    await application.prepareForLaunch({
      receiveChallenge: (challenge) => {
        return null;
      }
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

    expect(await application.deviceInterface.getRawStorageValue('migrations')).to.not.be.ok;

    /** Expect note is decrypted */
    expect(application.itemManager.notes.length).to.equal(1);
    const retrievedNote = application.itemManager.notes[0];
    expect(retrievedNote.uuid).to.equal(notePayload.uuid);
    expect(retrievedNote.content.text).to.equal(notePayload.content.text);

    /** Ensure arbitrary values have been migrated */
    for (const key of Object.keys(storage)) {
      const value = await application.storageService.getValue(key);
      expect(storage[key]).to.equal(value);
    }

    await application.deinit();
  });
});
