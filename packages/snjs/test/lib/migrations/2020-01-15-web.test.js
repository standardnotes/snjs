import * as Factory from './../../factory';
import {
  CreateMaxPayloadFromAnyObject,
  SNProtocolOperator003,
  PayloadFormat,
  ContentType,
  KeyMode,
  StorageValueModes,
  ChallengeValidation,
  ChallengeValue,
  omitInPlace,
  ProtocolVersion,
  SNProtocolOperator001,
  SNProtocolOperator002,
  StorageKey
} from '@Lib/index';
import SNCrypto from './../../setup/snjs/snCrypto';

describe('2020-01-15 web migration', () => {
  /**
   * This test will pass but sync afterwards will not be successful
   * as we are using a random value for the legacy session token
   */
  it('2020-01-15 migration with passcode and account', async function () {
    jest.setTimeout(15000);

    const application = await Factory.createAppWithRandNamespace();
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
      'offlineParams',
      JSON.stringify(passcodeKey.keyParams.getPortableValue())
    );

    /** Create arbitrary storage values and make sure they're migrated */
    const arbitraryValues = {
      foo: 'bar',
      zar: 'tar',
      har: 'car',
    };
    for (const key of Object.keys(arbitraryValues)) {
      await application.deviceInterface.setRawStorageValue(
        key,
        arbitraryValues[key]
      );
    }
    /** Create old version account parameters */
    const password = 'tar';
    const accountKey = await operator003.createRootKey(identifier, password);

    /** Create legacy storage and encrypt it with passcode */
    const embeddedStorage = {
      mk: accountKey.masterKey,
      ak: accountKey.dataAuthenticationKey,
      pw: accountKey.serverPassword,
      jwt: 'anything',
      /** Legacy versions would store json strings inside of embedded storage */
      auth_params: JSON.stringify(accountKey.keyParams.getPortableValue()),
    };
    const storagePayload = CreateMaxPayloadFromAnyObject({
      uuid: await operator003.crypto.generateUUID(),
      content_type: ContentType.EncryptedStorage,
      content: {
        storage: embeddedStorage,
      },
    });
    const encryptionParams = await operator003.generateEncryptedParameters(
      storagePayload,
      PayloadFormat.EncryptedString,
      passcodeKey
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
    await application.prepareForLaunch({
      receiveChallenge: async (challenge) => {
        application.submitValuesForChallenge(challenge, [
          new ChallengeValue(challenge.prompts[0], passcode),
        ]);
      },
    });

    await application.launch(true);
    expect(application.sessionManager.online()).toBe(true);
    expect(application.protocolService.keyMode).toBe(KeyMode.RootKeyPlusWrapper);
    /** Should be decrypted */
    const storageMode = application.storageService.domainKeyForMode(
      StorageValueModes.Default
    );
    const valueStore = application.storageService.values[storageMode];
    expect(valueStore.content_type).toBeFalsy();

    expect(
      await application.deviceInterface.getRawStorageValue('offlineParams')
    ).toBeFalsy();

    const keyParams = await application.storageService.getValue(
      StorageKey.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(typeof keyParams).toBe('object');

    /** Embedded value should match */
    const migratedKeyParams = await application.storageService.getValue(
      StorageKey.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(migratedKeyParams).toEqual(JSON.parse(embeddedStorage.auth_params));
    const rootKey = await application.protocolService.getRootKey();
    expect(rootKey.masterKey).toBe(accountKey.masterKey);
    expect(rootKey.dataAuthenticationKey).toBe(accountKey.dataAuthenticationKey);
    /** Application should not retain server password from legacy versions */
    expect(rootKey.serverPassword).toBeFalsy();
    expect(rootKey.keyVersion).toBe(ProtocolVersion.V003);
    expect(application.protocolService.keyMode).toBe(KeyMode.RootKeyPlusWrapper);

    /** Expect note is decrypted */
    expect(application.itemManager.notes.length).toBe(1);
    const retrievedNote = application.itemManager.notes[0];
    expect(retrievedNote.uuid).toBe(notePayload.uuid);
    expect(retrievedNote.content.text).toBe(notePayload.content.text);

    /** Ensure arbitrary values have been migrated */
    for (const key of Object.keys(arbitraryValues)) {
      const value = await application.storageService.getValue(key);
      expect(arbitraryValues[key]).toBe(value);
    }

    console.warn(
      'Expecting exception due to deiniting application while trying to renew session'
    );
    await application.deinit();
  });

  it('2020-01-15 migration with passcode only', async function () {
    const application = await Factory.createAppWithRandNamespace();
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
      'offlineParams',
      JSON.stringify(passcodeKey.keyParams.getPortableValue())
    );

    /** Create arbitrary storage values and make sure they're migrated */
    const arbitraryValues = {
      foo: 'bar',
      zar: 'tar',
      har: 'car',
    };
    for (const key of Object.keys(arbitraryValues)) {
      await application.deviceInterface.setRawStorageValue(
        key,
        arbitraryValues[key]
      );
    }

    const embeddedStorage = {
      ...arbitraryValues,
    };
    const storagePayload = CreateMaxPayloadFromAnyObject({
      uuid: await operator003.crypto.generateUUID(),
      content: {
        storage: embeddedStorage,
      },
      content_type: ContentType.EncryptedStorage,
    });
    const encryptionParams = await operator003.generateEncryptedParameters(
      storagePayload,
      PayloadFormat.EncryptedString,
      passcodeKey
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

    await application.prepareForLaunch({
      receiveChallenge: async (challenge) => {
        application.submitValuesForChallenge(challenge, [
          new ChallengeValue(challenge.prompts[0], passcode),
        ]);
      },
    });
    await application.launch(true);
    expect(application.protocolService.keyMode).toBe(KeyMode.WrapperOnly);
    /** Should be decrypted */
    const storageMode = application.storageService.domainKeyForMode(
      StorageValueModes.Default
    );
    const valueStore = application.storageService.values[storageMode];
    expect(valueStore.content_type).toBeFalsy();

    expect(
      await application.deviceInterface.getRawStorageValue('offlineParams')
    ).toBeFalsy();

    /** Embedded value should match */
    const migratedKeyParams = await application.storageService.getValue(
      StorageKey.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(migratedKeyParams).toEqual(embeddedStorage.auth_params);
    const rootKey = await application.protocolService.getRootKey();
    expect(rootKey.masterKey).toBe(passcodeKey.masterKey);
    expect(rootKey.dataAuthenticationKey).toBe(passcodeKey.dataAuthenticationKey);
    /** Root key is in memory with passcode only, so server password can be defined */
    expect(rootKey.serverPassword).toBeTruthy();
    expect(rootKey.keyVersion).toBe(ProtocolVersion.V003);
    expect(application.protocolService.keyMode).toBe(KeyMode.WrapperOnly);

    /** Expect note is decrypted */
    expect(application.itemManager.notes.length).toBe(1);
    const retrievedNote = application.itemManager.notes[0];
    expect(retrievedNote.uuid).toBe(notePayload.uuid);
    expect(retrievedNote.content.text).toBe(notePayload.content.text);

    /** Ensure arbitrary values have been migrated */
    for (const key of Object.keys(arbitraryValues)) {
      const value = await application.storageService.getValue(key);
      expect(arbitraryValues[key]).toBe(value);
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
    const operator003 = new SNProtocolOperator003(new SNCrypto());
    const identifier = 'foo';

    /** Create old version account parameters */
    const password = 'tar';
    const accountKey = await operator003.createRootKey(identifier, password);

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
      auth_params: JSON.stringify(accountKey.keyParams.getPortableValue()),
    };
    for (const key of Object.keys(storage)) {
      await application.deviceInterface.setRawStorageValue(key, storage[key]);
    }
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
        if (prompt.validation === ChallengeValidation.LocalPasscode) {
          values.push(new ChallengeValue(prompt, passcode));
        } else {
          /** We will be prompted to reauthetnicate our session, not relevant to this test
           * but pass any value to avoid exception
           */
          values.push(new ChallengeValue(prompt, 'foo'));
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
    expect(application.sessionManager.online()).toBe(true);
    expect(application.protocolService.keyMode).toBe(KeyMode.RootKeyOnly);
    /** Should be decrypted */
    const storageMode = application.storageService.domainKeyForMode(
      StorageValueModes.Default
    );
    const valueStore = application.storageService.values[storageMode];
    expect(valueStore.content_type).toBeFalsy();
    /** Embedded value should match */
    const migratedKeyParams = await application.storageService.getValue(
      StorageKey.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(migratedKeyParams).toEqual(accountKey.keyParams.getPortableValue());
    const rootKey = await application.protocolService.getRootKey();
    expect(rootKey).toBeTruthy();

    expect(await application.deviceInterface.getRawStorageValue('migrations')).toBeFalsy();
    expect(await application.deviceInterface.getRawStorageValue('auth_params')).toBeFalsy();
    expect(await application.deviceInterface.getRawStorageValue('jwt')).toBeFalsy();

    const keyParams = await application.storageService.getValue(
      StorageKey.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(typeof keyParams).toBe('object');

    expect(rootKey.masterKey).toBe(accountKey.masterKey);
    expect(rootKey.dataAuthenticationKey).toBe(accountKey.dataAuthenticationKey);
    expect(rootKey.serverPassword).toBeFalsy();
    expect(rootKey.keyVersion).toBe(ProtocolVersion.V003);
    expect(application.protocolService.keyMode).toBe(KeyMode.RootKeyOnly);

    /** Expect note is decrypted */
    expect(application.itemManager.notes.length).toBe(1);
    const retrievedNote = application.itemManager.notes[0];
    expect(retrievedNote.uuid).toBe(notePayload.uuid);
    expect(retrievedNote.content.text).toBe(notePayload.content.text);

    /** Ensure arbitrary values have been migrated */
    for (const key of Object.keys(storage)) {
      /** Is stringified in storage, but parsed in storageService */
      if (key === 'auth_params') {
        continue;
      }
      const value = await application.storageService.getValue(key);
      expect(storage[key]).toBe(value);
    }

    console.warn(
      'Expecting exception due to deiniting application while trying to renew session'
    );
    await application.deinit();
  });

  it('2020-01-15 migration with no account and no passcode', async function () {
    const application = await Factory.createAppWithRandNamespace();
    /** Create legacy migrations value so that base migration detects old app */
    await application.deviceInterface.setRawStorageValue(
      'migrations',
      JSON.stringify(['anything'])
    );
    const operator003 = new SNProtocolOperator003(new SNCrypto());
    /** Create arbitrary storage values and make sure they're migrated */
    const storage = {
      foo: 'bar',
      zar: 'tar',
      har: 'car',
    };
    for (const key of Object.keys(storage)) {
      await application.deviceInterface.setRawStorageValue(key, storage[key]);
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
    await application.deviceInterface.saveRawDatabasePayload(
      noteProcessedPayload,
      application.identifier
    );

    /** Run migration */
    await application.prepareForLaunch({
      receiveChallenge: (challenge) => {
        return null;
      },
    });
    await application.launch(true);

    expect(application.protocolService.keyMode).toBe(KeyMode.RootKeyNone);

    /** Should be decrypted */
    const storageMode = application.storageService.domainKeyForMode(
      StorageValueModes.Default
    );
    const valueStore = application.storageService.values[storageMode];
    expect(valueStore.content_type).toBeFalsy();
    const rootKey = await application.protocolService.getRootKey();
    expect(rootKey).toBeFalsy();
    expect(application.protocolService.keyMode).toBe(KeyMode.RootKeyNone);

    expect(await application.deviceInterface.getRawStorageValue('migrations')).toBeFalsy();

    /** Expect note is decrypted */
    expect(application.itemManager.notes.length).toBe(1);
    const retrievedNote = application.itemManager.notes[0];
    expect(retrievedNote.uuid).toBe(notePayload.uuid);
    expect(retrievedNote.content.text).toBe(notePayload.content.text);

    /** Ensure arbitrary values have been migrated */
    for (const key of Object.keys(storage)) {
      const value = await application.storageService.getValue(key);
      expect(storage[key]).toBe(value);
    }

    await application.deinit();
  });

  /**
   * This test will pass but sync afterwards will not be successful
   * as we are using a random value for the legacy session token
   */
  it('2020-01-15 migration from app v1.0.1 with account only', async function () {
    const application = await Factory.createAppWithRandNamespace();
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

    /** Create arbitrary storage values and make sure they're migrated */
    const storage = {
      mk: accountKey.masterKey,
      pw: accountKey.serverPassword,
      jwt: 'anything',
      /** Legacy versions would store json strings inside of embedded storage */
      auth_params: JSON.stringify(accountKey.keyParams.getPortableValue()),
      user: JSON.stringify({ uuid: 'anything', email: 'anything' }),
    };
    for (const key of Object.keys(storage)) {
      await application.deviceInterface.setRawStorageValue(key, storage[key]);
    }
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
        /** We will be prompted to reauthetnicate our session, not relevant to this test
         * but pass any value to avoid exception
         */
        values.push(new ChallengeValue(prompt, 'foo'));
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
    expect(application.sessionManager.online()).toBe(true);
    expect(application.sessionManager.getUser()).toBeTruthy();
    expect(application.protocolService.keyMode).toBe(KeyMode.RootKeyOnly);
    /** Should be decrypted */
    const storageMode = application.storageService.domainKeyForMode(
      StorageValueModes.Default
    );
    const valueStore = application.storageService.values[storageMode];
    expect(valueStore.content_type).toBeFalsy();
    /** Embedded value should match */
    const migratedKeyParams = await application.storageService.getValue(
      StorageKey.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(migratedKeyParams).toEqual(accountKey.keyParams.getPortableValue());
    const rootKey = await application.protocolService.getRootKey();
    expect(rootKey).toBeTruthy();

    expect(await application.deviceInterface.getRawStorageValue('migrations')).toBeFalsy();
    expect(await application.deviceInterface.getRawStorageValue('auth_params')).toBeFalsy();
    expect(await application.deviceInterface.getRawStorageValue('jwt')).toBeFalsy();
    expect(await application.deviceInterface.getRawStorageValue('ak')).toBeFalsy();
    expect(await application.deviceInterface.getRawStorageValue('mk')).toBeFalsy();
    expect(await application.deviceInterface.getRawStorageValue('pw')).toBeFalsy();

    const keyParams = await application.storageService.getValue(
      StorageKey.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(typeof keyParams).toBe('object');

    expect(rootKey.masterKey).toBe(accountKey.masterKey);
    expect(rootKey.dataAuthenticationKey).toBe(accountKey.dataAuthenticationKey);
    expect(rootKey.serverPassword).toBeFalsy();
    expect(rootKey.keyVersion).toBe(ProtocolVersion.V001);
    expect(application.protocolService.keyMode).toBe(KeyMode.RootKeyOnly);

    /** Expect note is decrypted */
    expect(application.itemManager.notes.length).toBe(1);
    const retrievedNote = application.itemManager.notes[0];
    expect(retrievedNote.uuid).toBe(notePayload.uuid);
    expect(retrievedNote.content.text).toBe(notePayload.content.text);

    /** Ensure arbitrary values have been migrated */
    for (const key of Object.keys(storage)) {
      /** Is stringified in storage, but parsed in storageService */
      const value = await application.storageService.getValue(key);
      if (key === 'auth_params') {
        continue;
      } else if (key === 'user') {
        expect(storage[key]).toBe(JSON.stringify(value));
      } else {
        expect(storage[key]).toBe(value);
      }
    }
    await application.deinit();
  });

  it('2020-01-15 migration from 002 app with account and passcode but missing offlineParams.version', async function () {
    /**
     * There was an issue where if the user had offlineParams but it was missing the version key,
     * the user could not get past the passcode migration screen.
     */
    const application = await Factory.createAppWithRandNamespace();
    /** Create legacy migrations value so that base migration detects old app */
    await application.deviceInterface.setRawStorageValue(
      'migrations',
      JSON.stringify(['anything'])
    );
    const operator002 = new SNProtocolOperator002(new SNCrypto());
    const identifier = 'foo';
    const passcode = 'bar';
    /** Create old version passcode parameters */
    const passcodeKey = await operator002.createRootKey(identifier, passcode);

    /** The primary chaos agent */
    const offlineParams = passcodeKey.keyParams.getPortableValue();
    omitInPlace(offlineParams, ['version']);

    await application.deviceInterface.setRawStorageValue(
      'offlineParams',
      JSON.stringify(offlineParams)
    );

    /** Create old version account parameters */
    const password = 'tar';
    const accountKey = await operator002.createRootKey(identifier, password);

    /** Create legacy storage and encrypt it with passcode */
    const embeddedStorage = {
      mk: accountKey.masterKey,
      ak: accountKey.dataAuthenticationKey,
      pw: accountKey.serverPassword,
      jwt: 'anything',
      /** Legacy versions would store json strings inside of embedded storage */
      auth_params: JSON.stringify(accountKey.keyParams.getPortableValue()),
      user: JSON.stringify({ uuid: 'anything', email: 'anything' }),
    };
    const storagePayload = CreateMaxPayloadFromAnyObject({
      uuid: await operator002.crypto.generateUUID(),
      content_type: ContentType.EncryptedStorage,
      content: {
        storage: embeddedStorage,
      },
    });
    const encryptionParams = await operator002.generateEncryptedParameters(
      storagePayload,
      PayloadFormat.EncryptedString,
      passcodeKey
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

    /** Runs migration */
    await application.prepareForLaunch({
      receiveChallenge: async (challenge) => {
        await application.submitValuesForChallenge(challenge, [
          new ChallengeValue(challenge.prompts[0], passcode),
        ]);
      },
    });
    await application.launch(true);
    expect(application.sessionManager.online()).toBe(true);
    expect(application.sessionManager.getUser()).toBeTruthy();
    expect(application.protocolService.keyMode).toBe(KeyMode.RootKeyPlusWrapper);
    /** Should be decrypted */
    const storageMode = application.storageService.domainKeyForMode(
      StorageValueModes.Default
    );
    const valueStore = application.storageService.values[storageMode];
    expect(valueStore.content_type).toBeFalsy();
    /** Embedded value should match */
    const migratedKeyParams = await application.storageService.getValue(
      StorageKey.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(migratedKeyParams).toEqual(accountKey.keyParams.getPortableValue());
    const rootKey = application.protocolService.getRootKey();
    expect(rootKey).toBeTruthy();

    expect(await application.deviceInterface.getRawStorageValue('migrations')).toBeFalsy();
    expect(await application.deviceInterface.getRawStorageValue('auth_params')).toBeFalsy();
    expect(await application.deviceInterface.getRawStorageValue('jwt')).toBeFalsy();
    expect(await application.deviceInterface.getRawStorageValue('ak')).toBeFalsy();
    expect(await application.deviceInterface.getRawStorageValue('mk')).toBeFalsy();
    expect(await application.deviceInterface.getRawStorageValue('pw')).toBeFalsy();

    const keyParams = await application.storageService.getValue(
      StorageKey.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(typeof keyParams).toBe('object');

    expect(rootKey.masterKey).toBe(accountKey.masterKey);
    expect(rootKey.dataAuthenticationKey).toBe(accountKey.dataAuthenticationKey);
    expect(rootKey.serverPassword).toBeFalsy();
    expect(rootKey.keyVersion).toBe(ProtocolVersion.V002);

    /** Expect note is decrypted */
    expect(application.itemManager.notes.length).toBe(1);
    const retrievedNote = application.itemManager.notes[0];
    expect(retrievedNote.uuid).toBe(notePayload.uuid);
    expect(retrievedNote.content.text).toBe(notePayload.content.text);

    application.deinit();
  });
});
