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
    const passcodeResult = await operator003.createRootKey({
      identifier: identifier,
      password: passcode
    });
    await application.deviceInterface.setRawStorageValue(
      'offlineParams',
      JSON.stringify(passcodeResult.keyParams.getPortableValue())
    );

    /** Create arbitrary storage values and make sure they're migrated */
    const arbitraryValues = {
      foo: 'bar',
      zar: 'tar',
      har: 'car'
    };
    for(const key of Object.keys(arbitraryValues)) {
      await application.deviceInterface.setRawStorageValue(
        key,
        arbitraryValues[key]
      );
    }
    /** Create old version account parameters */
    const password = 'tar';
    const accountResult = await operator003.createRootKey({
      identifier: identifier,
      password: password
    });

    /** Create legacy storage and encrypt it with passcode */
    const accountKey = accountResult.key;
    const embeddedStorage = {
      mk: accountKey.masterKey,
      ak: accountKey.dataAuthenticationKey,
      pw: accountKey.serverPassword,
      jwt: 'anything',
      auth_params: accountResult.keyParams.getPortableValue()
    };
    const storagePayload = CreateMaxPayloadFromAnyObject({
      object: {
        uuid: await operator003.crypto.generateUUID(),
        content: {
          storage: embeddedStorage
        },
        content_type: ContentTypes.EncryptedStorage
      }
    });
    const encryptionParams = await operator003.generateEncryptionParameters({
      payload: storagePayload,
      key: passcodeResult.key,
      format: PayloadFormats.EncryptedString
    });
    const persistPayload = CreateMaxPayloadFromAnyObject({
      object: storagePayload,
      override: encryptionParams
    });
    await application.deviceInterface.setRawStorageValue(
      'encryptedStorage',
      JSON.stringify(persistPayload)
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
          for(const challenge of challenges) {
            if(challenge === Challenges.LocalPasscode) {
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
    expect(application.sessionManager.online()).to.equal(true);
    expect(application.keyManager.keyMode).to.equal(
      KEY_MODE_ROOT_KEY_PLUS_WRAPPER
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
      StorageKeys.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(migratedKeyParams).to.eql(embeddedStorage.auth_params);
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

    /** Ensure arbitrary values have been migrated */
    for(const key of Object.keys(arbitraryValues)) {
      const value = await application.storageService.getValue(key);
      expect(arbitraryValues[key]).to.equal(value);
    }

    await application.deinit();
  });

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
    const passcodeResult = await operator003.createRootKey({
      identifier: identifier,
      password: passcode
    });
    await application.deviceInterface.setRawStorageValue(
      'offlineParams',
      JSON.stringify(passcodeResult.keyParams.getPortableValue())
    );
    const passcodeKey = passcodeResult.key;

    /** Create arbitrary storage values and make sure they're migrated */
    const arbitraryValues = {
      foo: 'bar',
      zar: 'tar',
      har: 'car'
    };
    for(const key of Object.keys(arbitraryValues)) {
      await application.deviceInterface.setRawStorageValue(
        key,
        arbitraryValues[key]
      );
    }

    const embeddedStorage = {
      ...arbitraryValues
    };
    const storagePayload = CreateMaxPayloadFromAnyObject({
      object: {
        uuid: await operator003.crypto.generateUUID(),
        content: {
          storage: embeddedStorage
        },
        content_type: ContentTypes.EncryptedStorage
      }
    });
    const encryptionParams = await operator003.generateEncryptionParameters({
      payload: storagePayload,
      key: passcodeResult.key,
      format: PayloadFormats.EncryptedString
    });
    const persistPayload = CreateMaxPayloadFromAnyObject({
      object: storagePayload,
      override: encryptionParams
    });
    await application.deviceInterface.setRawStorageValue(
      'encryptedStorage',
      JSON.stringify(persistPayload)
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
          for(const challenge of challenges) {
            if(challenge === Challenges.LocalPasscode) {
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
      KEY_MODE_WRAPPER_ONLY
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
      StorageKeys.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(migratedKeyParams).to.eql(embeddedStorage.auth_params);
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

    /** Ensure arbitrary values have been migrated */
    for(const key of Object.keys(arbitraryValues)) {
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
    const accountResult = await operator003.createRootKey({
      identifier: identifier,
      password: password
    });
    const accountKey = accountResult.key;
    /** Create arbitrary storage values and make sure they're migrated */
    const storage = {
      foo: 'bar',
      zar: 'tar',
      har: 'car',
      mk: accountKey.masterKey,
      ak: accountKey.dataAuthenticationKey,
      pw: accountKey.serverPassword,
      jwt: 'anything',
      auth_params: JSON.stringify(accountResult.keyParams.getPortableValue())
    };
    for(const key of Object.keys(storage)) {
      await application.deviceInterface.setRawStorageValue(
        key,
        storage[key]
      );
    }
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
          return null;
        }
      }
    });
    await application.launch({
      awaitDatabaseLoad: true
    });
    expect(application.sessionManager.online()).to.equal(true);
    expect(application.keyManager.keyMode).to.equal(
      KEY_MODE_ROOT_KEY_ONLY
    );
    /** Should be decrypted */
    const storageMode = application.storageService.domainKeyForMode(
      StorageValueModes.Default
    );
    const valueStore = application.storageService.values[storageMode];
    expect(valueStore.content_type).to.not.be.ok;
    /** Embedded value should match */
    const migratedKeyParams = await application.storageService.getValue(
      StorageKeys.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(migratedKeyParams).to.eql(accountResult.keyParams.getPortableValue());
    const rootKey = await application.keyManager.getRootKey();
    expect(rootKey).to.be.ok;

    expect(await application.deviceInterface.getRawStorageValue('migrations')).to.not.be.ok;
    expect(await application.deviceInterface.getRawStorageValue('auth_params')).to.not.be.ok;
    expect(await application.deviceInterface.getRawStorageValue('jwt')).to.not.be.ok;
    
    expect(rootKey.masterKey).to.equal(accountKey.masterKey);
    expect(rootKey.dataAuthenticationKey).to.equal(accountKey.dataAuthenticationKey);
    expect(rootKey.serverPassword).to.not.be.ok;
    expect(rootKey.version).to.equal(SNProtocolOperator003.versionString());
    expect(application.keyManager.keyMode).to.equal(KEY_MODE_ROOT_KEY_ONLY);

    /** Expect note is decrypted */
    expect(application.modelManager.notes.length).to.equal(1);
    const retrievedNote = application.modelManager.notes[0];
    expect(retrievedNote.uuid).to.equal(notePayload.uuid);
    expect(retrievedNote.content.text).to.equal(notePayload.content.text);

    /** Ensure arbitrary values have been migrated */
    for(const key of Object.keys(storage)) {
      /** Is stringified in storage, but parsed in storageService */
      if(key === 'auth_params') {
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
    for(const key of Object.keys(storage)) {
      await application.deviceInterface.setRawStorageValue(
        key,
        storage[key]
      );
    }

    /** Create item and store it in db */
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
          return null;
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
    const storageMode = application.storageService.domainKeyForMode(
      StorageValueModes.Default
    );
    const valueStore = application.storageService.values[storageMode];
    expect(valueStore.content_type).to.not.be.ok;
    const rootKey = await application.keyManager.getRootKey();
    expect(rootKey).to.not.be.ok;
    expect(application.keyManager.keyMode).to.equal(KEY_MODE_ROOT_KEY_NONE);

    expect(await application.deviceInterface.getRawStorageValue('migrations')).to.not.be.ok;

    /** Expect note is decrypted */
    expect(application.modelManager.notes.length).to.equal(1);
    const retrievedNote = application.modelManager.notes[0];
    expect(retrievedNote.uuid).to.equal(notePayload.uuid);
    expect(retrievedNote.content.text).to.equal(notePayload.content.text);

    /** Ensure arbitrary values have been migrated */
    for(const key of Object.keys(storage)) {
      const value = await application.storageService.getValue(key);
      expect(storage[key]).to.equal(value);
    }

    await application.deinit();
  });
});
