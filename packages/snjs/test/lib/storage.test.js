import { ValueModesKeys, CreateMaxPayloadFromAnyObject, PayloadFormat } from '@Lib/index';
import { Environment } from '@Lib/platforms';
import { StorageEncryptionPolicies } from '@Lib/services';
import * as Factory from '../factory';

describe('storage manager', function () {
  jest.setTimeout(Factory.TestTimeout);
  /**
   * Items are saved in localStorage in tests.
   * Base keys are `storage`, `snjs_version`, and `keychain`
   */
  const BASE_KEY_COUNT = 3;
  const BASE_ITEM_COUNT = 2; /** Default items key, user preferences */

  it('should set and retrieve values', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext({
      registerUser: false, environment: Environment.Mobile
    });
    const key = 'foo';
    const value = 'bar';
    await application.storageService.setValue(key, value);
    expect(await application.storageService.getValue(key)).toEqual(value);
  });

  it('should set and retrieve items', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext({
      registerUser: false, environment: Environment.Mobile
    });
    const payload = Factory.createNotePayload();
    await application.storageService.savePayload(payload);
    const payloads = await application.storageService.getAllRawPayloads();
    expect(payloads.length).toBe(BASE_ITEM_COUNT + 1);
  });

  it('should clear values', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext({
      registerUser: false, environment: Environment.Mobile
    });
    const key = 'foo';
    const value = 'bar';
    await application.storageService.setValue(key, value);
    await application.storageService.clearAllData();
    expect(await application.storageService.getValue(key)).toBeFalsy();
  });

  it('serverPassword should not be saved to keychain', async function () {
    const { application, email, password } = await Factory.createAndInitSimpleAppContext({
      registerUser: false, environment: Environment.Mobile
    });
    await Factory.registerUserToApplication({
      application: application,
      email: email,
      password: password,
      ephemeral: false,
    });
    const keychainValue = await application.deviceInterface.getNamespacedKeychainValue(
      application.identifier
    );
    expect(keychainValue.masterKey).toBeTruthy();
    expect(keychainValue.serverPassword).toBeFalsy();
  });

  it.skip('regular session should persist data', async function () {
    await Factory.registerUserToApplication({
      application: application,
      email: email,
      password: password,
      ephemeral: false,
    });
    const key = 'foo';
    const value = 'bar';
    await application.storageService.setValue(key, value);
    console.log('localStorage keys', Object.keys(localStorage));
    /** Items are stored in local storage */
    expect(Object.keys(localStorage).length).toBe(expectedKeyCount + BASE_ITEM_COUNT);
    const retrievedValue = await application.storageService.getValue(key);
    expect(retrievedValue).toBe(value);
  });

  it('ephemeral session should not persist data', async function () {
    const { application, email, password } = await Factory.createAndInitSimpleAppContext({
      registerUser: false, environment: Environment.Mobile
    });
    await Factory.registerUserToApplication({
      application: application,
      email: email,
      password: password,
      ephemeral: true,
    });
    const key = 'foo';
    const value = 'bar';
    await application.storageService.setValue(key, value);
    expect(Object.keys(localStorage).length).toBe(0);
    const retrievedValue = await application.storageService.getValue(key);
    expect(retrievedValue).toBe(value);
  });

  it('ephemeral session should not persist to database', async function () {
    const { application, email, password } = await Factory.createAndInitSimpleAppContext({
      registerUser: false, environment: Environment.Mobile
    });
    await Factory.registerUserToApplication({
      application: application,
      email: email,
      password: password,
      ephemeral: true,
    });
    await Factory.createSyncedNote(application);
    const rawPayloads = await application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).toBe(0);
  });

  it('storage with no account and no passcode should not be encrypted', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext({
      registerUser: false, environment: Environment.Mobile
    });
    await application.setValue('foo', 'bar');
    const wrappedValue = application.storageService.values[
      ValueModesKeys.Wrapped
    ];
    const payload = CreateMaxPayloadFromAnyObject(wrappedValue);
    expect(payload.format).toBe(PayloadFormat.DecryptedBareObject);
  });

  it('storage aftering adding passcode should be encrypted', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext({
      registerUser: false, environment: Environment.Mobile
    });
    await application.setValue('foo', 'bar');
    await application.addPasscode('123');
    const wrappedValue = application.storageService.values[
      ValueModesKeys.Wrapped
    ];
    const payload = CreateMaxPayloadFromAnyObject(wrappedValue);
    expect(payload.format).toBe(PayloadFormat.EncryptedString);
  });

  it('storage after adding passcode then removing passcode should not be encrypted', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext({
      registerUser: false, environment: Environment.Mobile
    });
    const passcode = '123🌂';
    Factory.handlePasswordChallenges(application, passcode);
    await application.setValue('foo', 'bar');
    await application.addPasscode(passcode);
    await application.setValue('bar', 'foo');
    await application.removePasscode();
    const wrappedValue = application.storageService.values[
      ValueModesKeys.Wrapped
    ];
    const payload = CreateMaxPayloadFromAnyObject(wrappedValue);
    expect(payload.format).toBe(PayloadFormat.DecryptedBareObject);
  });

  it('storage aftering adding passcode/removing passcode w/account should be encrypted', async function () {
    const { application, email, password } = await Factory.createAndInitSimpleAppContext({
      registerUser: false, environment: Environment.Mobile
    });
    const passcode = '123🌂';
    /**
     * After setting passcode, we expect that the keychain has been cleared, as the account keys
     * are now wrapped in storage with the passcode. Once the passcode is removed, we expect
     * the account keys to be moved to the keychain.
     * */
    await Factory.registerUserToApplication({
      application: application,
      email: email,
      password: password,
    });
    expect(
      await application.deviceInterface.getNamespacedKeychainValue(
        application.identifier
      )
    ).toBeTruthy();
    await application.setValue('foo', 'bar');
    Factory.handlePasswordChallenges(application, password);
    await application.addPasscode(passcode);
    expect(
      await application.deviceInterface.getNamespacedKeychainValue(
        application.identifier
      )
    ).toBeFalsy();
    await application.setValue('bar', 'foo');
    Factory.handlePasswordChallenges(application, passcode);
    await application.removePasscode();
    expect(
      await application.deviceInterface.getNamespacedKeychainValue(
        application.identifier
      )
    ).toBeTruthy();

    const wrappedValue = application.storageService.values[
      ValueModesKeys.Wrapped
    ];
    const payload = CreateMaxPayloadFromAnyObject(wrappedValue);
    expect(payload.format).toBe(PayloadFormat.EncryptedString);
  });

  it('adding account should encrypt storage with account keys', async function () {
    const { application, email, password } = await Factory.createAndInitSimpleAppContext({
      registerUser: false, environment: Environment.Mobile
    });
    await application.setValue('foo', 'bar');
    await Factory.registerUserToApplication({
      application: application,
      email: email,
      password: password,
      ephemeral: true,
    });
    const accountKey = application.protocolService.getRootKey();
    expect(
      await application.storageService.canDecryptWithKey(accountKey)
    ).toBe(true);
  });

  it('signing out of account should decrypt storage', async function () {
    let { application, email, password } = await Factory.createAndInitSimpleAppContext({
      registerUser: false, environment: Environment.Mobile
    });
    await application.setValue('foo', 'bar');
    await Factory.registerUserToApplication({
      application: application,
      email: email,
      password: password,
      ephemeral: true,
    });
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    await application.setValue('bar', 'foo');
    const wrappedValue = application.storageService.values[
      ValueModesKeys.Wrapped
    ];
    const payload = CreateMaxPayloadFromAnyObject(wrappedValue);
    expect(payload.format).toBe(PayloadFormat.DecryptedBareObject);
  });

  it('adding account then passcode should encrypt storage with account keys', async function () {
    const { application, email, password } = await Factory.createAndInitSimpleAppContext({
      registerUser: false, environment: Environment.Mobile
    });
    /** Should encrypt storage with account keys and encrypt account keys with passcode */
    await application.setValue('foo', 'bar');
    await Factory.registerUserToApplication({
      application: application,
      email: email,
      password: password,
      ephemeral: true,
    });

    /** Should not be wrapped root key yet */
    expect(await application.protocolService.getWrappedRootKey()).toBeFalsy();

    const passcode = '123';
    Factory.handlePasswordChallenges(application, password);
    await application.addPasscode(passcode);
    await application.setValue('bar', 'foo');

    /** Root key should now be wrapped */
    expect(await application.protocolService.getWrappedRootKey()).toBeTruthy();

    const accountKey = await application.protocolService.getRootKey();
    expect(
      await application.storageService.canDecryptWithKey(accountKey)
    ).toBe(true);
    const passcodeKey = await application.protocolService.computeWrappingKey(
      passcode
    );
    const wrappedRootKey = await application.protocolService.getWrappedRootKey();
    /** Expect that we can decrypt wrapped root key with passcode key */
    const payload = CreateMaxPayloadFromAnyObject(wrappedRootKey);
    const decrypted = await application.protocolService.payloadByDecryptingPayload(
      payload,
      passcodeKey
    );
    expect(decrypted.errorDecrypting).toBe(false);
    expect(decrypted.format).toBe(PayloadFormat.DecryptedBareObject);
  });

  it('disabling storage encryption should store items without encryption', async function () {
    const { application, email, password } = await Factory.createAndInitSimpleAppContext({
      registerUser: false, environment: Environment.Mobile
    });
    await Factory.registerUserToApplication({
      application: application,
      email: email,
      password: password,
      ephemeral: false,
    });

    await application.setStorageEncryptionPolicy(
      StorageEncryptionPolicies.Disabled
    );

    const payloads = await application.storageService.getAllRawPayloads();
    const payload = payloads[0];
    expect(typeof payload.content).not.toBe('string');
    expect(payload.content.references).toBeTruthy();

    const identifier = application.identifier;
    application.deinit();

    const app = await Factory.createAndInitializeApplication(
      identifier,
      Environment.Mobile
    );
    expect(app.storageService.encryptionPolicy).toBe(StorageEncryptionPolicies.Disabled);
  });

  it('stored payloads should not contain metadata fields', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext({
      registerUser: false, environment: Environment.Mobile
    });
    await application.addPasscode('123');
    await Factory.createSyncedNote(application);
    const payloads = await application.storageService.getAllRawPayloads();
    const payload = payloads[0];
    expect(payload.fields).toBeFalsy();
    expect(payload.source).toBeFalsy();
    expect(payload.format).toBeFalsy();
    expect(payload.dirtiedDate).toBeFalsy();
  });

  it('signing out should clear unwrapped value store', async function () {
    let { application, email, password } = await Factory.createAndInitSimpleAppContext({
      registerUser: false, environment: Environment.Mobile
    });
    await Factory.registerUserToApplication({
      application: application,
      email: email,
      password: password,
      ephemeral: false,
    });

    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    const values = application.storageService.values[
      ValueModesKeys.Unwrapped
    ];
    expect(Object.keys(values).length).toBe(0);
  });

  it('signing out should clear payloads', async function () {
    let { application, email, password } = await Factory.createAndInitSimpleAppContext({
      registerUser: false, environment: Environment.Mobile
    });
    await Factory.registerUserToApplication({
      application: application,
      email: email,
      password: password,
      ephemeral: false,
    });

    await Factory.createSyncedNote(application);
    expect(await Factory.storagePayloadCount(application)).toBe(BASE_ITEM_COUNT + 1);
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    expect(await Factory.storagePayloadCount(application)).toBe(BASE_ITEM_COUNT);
  });
});
