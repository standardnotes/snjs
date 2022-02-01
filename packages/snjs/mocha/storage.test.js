/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('storage manager', function () {
  this.timeout(Factory.TenSecondTimeout);
  /**
   * Items are saved in localStorage in tests.
   * Base keys are `storage`, `snjs_version`, and `keychain`
   */
  const BASE_KEY_COUNT = 3;
  const BASE_ITEM_COUNT = 2; /** Default items key, user preferences */

  beforeEach(async function () {
    localStorage.clear();
    this.expectedKeyCount = BASE_KEY_COUNT;
    this.application = await Factory.createInitAppWithFakeCrypto(
      Environment.Mobile
    );
    this.email = Uuid.GenerateUuidSynchronously();
    this.password = Uuid.GenerateUuidSynchronously();
  });

  afterEach(async function () {
    await Factory.safeDeinit(this.application);
    localStorage.clear();
  });

  it('should set and retrieve values', async function () {
    const key = 'foo';
    const value = 'bar';
    await this.application.storageService.setValue(key, value);
    expect(await this.application.storageService.getValue(key)).to.eql(value);
  });

  it('should set and retrieve items', async function () {
    const payload = Factory.createNotePayload();
    await this.application.storageService.savePayload(payload);
    const payloads = await this.application.storageService.getAllRawPayloads();
    expect(payloads.length).to.equal(BASE_ITEM_COUNT + 1);
  });

  it('should clear values', async function () {
    const key = 'foo';
    const value = 'bar';
    await this.application.storageService.setValue(key, value);
    await this.application.storageService.clearAllData();
    expect(await this.application.storageService.getValue(key)).to.not.be.ok;
  });

  it('serverPassword should not be saved to keychain', async function () {
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
      ephemeral: false,
    });
    const keychainValue = await this.application.deviceInterface.getNamespacedKeychainValue(
      this.application.identifier
    );
    expect(keychainValue.masterKey).to.be.ok;
    expect(keychainValue.serverPassword).to.not.be.ok;
  });

  it.skip('regular session should persist data', async function () {
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
      ephemeral: false,
    });
    const key = 'foo';
    const value = 'bar';
    await this.application.storageService.setValue(key, value);
    /** Items are stored in local storage */
    expect(Object.keys(localStorage).length).to.equal(
      this.expectedKeyCount + BASE_ITEM_COUNT
    );
    const retrievedValue = await this.application.storageService.getValue(key);
    expect(retrievedValue).to.equal(value);
  });

  it('ephemeral session should not persist data', async function () {
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
      ephemeral: true,
    });
    const key = 'foo';
    const value = 'bar';
    await this.application.storageService.setValue(key, value);
    expect(Object.keys(localStorage).length).to.equal(0);
    const retrievedValue = await this.application.storageService.getValue(key);
    expect(retrievedValue).to.equal(value);
  });

  it('ephemeral session should not persist to database', async function () {
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
      ephemeral: true,
    });
    await Factory.createSyncedNote(this.application);
    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(0);
  });

  it('storage with no account and no passcode should not be encrypted', async function () {
    await this.application.setValue('foo', 'bar');
    const wrappedValue = this.application.storageService.values[
      ValueModesKeys.Wrapped
    ];
    const payload = CreateMaxPayloadFromAnyObject(wrappedValue);
    expect(payload.format).to.equal(PayloadFormat.DecryptedBareObject);
  });

  it('storage aftering adding passcode should be encrypted', async function () {
    await this.application.setValue('foo', 'bar');
    await this.application.addPasscode('123');
    const wrappedValue = this.application.storageService.values[
      ValueModesKeys.Wrapped
    ];
    const payload = CreateMaxPayloadFromAnyObject(wrappedValue);
    expect(payload.format).to.equal(PayloadFormat.EncryptedString);
  });

  it('storage after adding passcode then removing passcode should not be encrypted', async function () {
    const passcode = '123🌂';
    Factory.handlePasswordChallenges(this.application, passcode);
    await this.application.setValue('foo', 'bar');
    await this.application.addPasscode(passcode);
    await this.application.setValue('bar', 'foo');
    await this.application.removePasscode();
    const wrappedValue = this.application.storageService.values[
      ValueModesKeys.Wrapped
    ];
    const payload = CreateMaxPayloadFromAnyObject(wrappedValue);
    expect(payload.format).to.equal(PayloadFormat.DecryptedBareObject);
  });

  it('storage aftering adding passcode/removing passcode w/account should be encrypted', async function () {
    const passcode = '123🌂';
    /**
     * After setting passcode, we expect that the keychain has been cleared, as the account keys
     * are now wrapped in storage with the passcode. Once the passcode is removed, we expect
     * the account keys to be moved to the keychain.
     * */
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
    });
    expect(
      await this.application.deviceInterface.getNamespacedKeychainValue(
        this.application.identifier
      )
    ).to.be.ok;
    await this.application.setValue('foo', 'bar');
    Factory.handlePasswordChallenges(this.application, this.password);
    await this.application.addPasscode(passcode);
    expect(
      await this.application.deviceInterface.getNamespacedKeychainValue(
        this.application.identifier
      )
    ).to.not.be.ok;
    await this.application.setValue('bar', 'foo');
    Factory.handlePasswordChallenges(this.application, passcode);
    await this.application.removePasscode();
    expect(
      await this.application.deviceInterface.getNamespacedKeychainValue(
        this.application.identifier
      )
    ).to.be.ok;

    const wrappedValue = this.application.storageService.values[
      ValueModesKeys.Wrapped
    ];
    const payload = CreateMaxPayloadFromAnyObject(wrappedValue);
    expect(payload.format).to.equal(PayloadFormat.EncryptedString);
  });

  it('adding account should encrypt storage with account keys', async function () {
    await this.application.setValue('foo', 'bar');
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
      ephemeral: true,
    });
    const accountKey = await this.application.protocolService.getRootKey();
    expect(
      await this.application.storageService.canDecryptWithKey(accountKey)
    ).to.equal(true);
  });

  it('signing out of account should decrypt storage', async function () {
    await this.application.setValue('foo', 'bar');
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
      ephemeral: true,
    });
    this.application = await Factory.signOutApplicationAndReturnNew(
      this.application
    );
    await this.application.setValue('bar', 'foo');
    const wrappedValue = this.application.storageService.values[
      ValueModesKeys.Wrapped
    ];
    const payload = CreateMaxPayloadFromAnyObject(wrappedValue);
    expect(payload.format).to.equal(PayloadFormat.DecryptedBareObject);
  });

  it('adding account then passcode should encrypt storage with account keys', async function () {
    /** Should encrypt storage with account keys and encrypt account keys with passcode */
    await this.application.setValue('foo', 'bar');
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
      ephemeral: true,
    });

    /** Should not be wrapped root key yet */
    expect(await this.application.protocolService.getWrappedRootKey()).to.not.be
      .ok;

    const passcode = '123';
    Factory.handlePasswordChallenges(this.application, this.password);
    await this.application.addPasscode(passcode);
    await this.application.setValue('bar', 'foo');

    /** Root key should now be wrapped */
    expect(await this.application.protocolService.getWrappedRootKey()).to.be.ok;

    const accountKey = await this.application.protocolService.getRootKey();
    expect(
      await this.application.storageService.canDecryptWithKey(accountKey)
    ).to.equal(true);
    const passcodeKey = await this.application.protocolService.computeWrappingKey(
      passcode
    );
    const wrappedRootKey = await this.application.protocolService.getWrappedRootKey();
    /** Expect that we can decrypt wrapped root key with passcode key */
    const payload = CreateMaxPayloadFromAnyObject(wrappedRootKey);
    const decrypted = await this.application.protocolService.payloadByDecryptingPayload(
      payload,
      passcodeKey
    );
    expect(decrypted.errorDecrypting).to.equal(false);
    expect(decrypted.format).to.equal(PayloadFormat.DecryptedBareObject);
  });

  it('disabling storage encryption should store items without encryption', async function () {
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
      ephemeral: false,
    });

    await this.application.setStorageEncryptionPolicy(
      StorageEncryptionPolicies.Disabled
    );

    const payloads = await this.application.storageService.getAllRawPayloads();
    const payload = payloads[0];
    expect(typeof payload.content).to.not.equal('string');
    expect(payload.content.references).to.be.ok;

    const identifier = this.application.identifier;
    await Factory.safeDeinit(this.application);

    const app = await Factory.createAndInitializeApplication(
      identifier,
      Environment.Mobile
    );
    expect(app.storageService.encryptionPolicy).to.equal(
      StorageEncryptionPolicies.Disabled
    );
  });

  it('stored payloads should not contain metadata fields', async function () {
    await this.application.addPasscode('123');
    await Factory.createSyncedNote(this.application);
    const payloads = await this.application.storageService.getAllRawPayloads();
    const payload = payloads[0];
    expect(payload.fields).to.not.be.ok;
    expect(payload.source).to.not.be.ok;
    expect(payload.format).to.not.be.ok;
    expect(payload.dirtiedDate).to.not.be.ok;
  });

  it('signing out should clear unwrapped value store', async function () {
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
      ephemeral: false,
    });

    this.application = await Factory.signOutApplicationAndReturnNew(
      this.application
    );
    const values = this.application.storageService.values[
      ValueModesKeys.Unwrapped
    ];
    expect(Object.keys(values).length).to.equal(0);
  });

  it('signing out should clear payloads', async function () {
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
      ephemeral: false,
    });

    await Factory.createSyncedNote(this.application);
    expect(await Factory.storagePayloadCount(this.application)).to.equal(
      BASE_ITEM_COUNT + 1
    );
    this.application = await Factory.signOutApplicationAndReturnNew(
      this.application
    );
    expect(await Factory.storagePayloadCount(this.application)).to.equal(
      BASE_ITEM_COUNT
    );
  });
});
