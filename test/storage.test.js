/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("storage manager", () => {
  /**
   * Items are saved in localStorage in tests.
   * Base keys are `storage` and `last_migration_timestamp`
   */
  const BASE_KEY_COUNT = 2;
  const BASE_ITEM_COUNT = 1; /** Default items key */
  const sharedApplication = Factory.createApplication();

  before(async function () {
    localStorage.clear();
    await Factory.initializeApplication(sharedApplication);
  });

  after(async function () {
    // localStorage.clear();
    await sharedApplication.deinit();
  });

  beforeEach(async function() {
    localStorage.clear();
    this.expectedKeyCount = BASE_KEY_COUNT;
    this.application = await Factory.createInitAppWithRandNamespace();
    this.email = Uuid.GenerateUuidSynchronously();
    this.password = Uuid.GenerateUuidSynchronously();
  });

  afterEach(async function() {
    await this.application.deinit();
    // localStorage.clear();
  });

  it("should set and retrieve values", async function () {
    const key = "foo";
    const value = "bar";
    await sharedApplication.storageManager.setValue(key, value);
    expect(await sharedApplication.storageManager.getValue(key)).to.eql(value);
  });

  it("should set and retrieve items", async function () {
    const payload = Factory.createNotePayload();
    await sharedApplication.storageManager.savePayload(payload);
    const payloads = await sharedApplication.storageManager.getAllRawPayloads();
    expect(payloads.length).to.equal(1);
  });

  it("should clear values", async function () {
    const key = "foo";
    const value = "bar";
    await sharedApplication.storageManager.setValue(key, value);
    await sharedApplication.storageManager.clearAllData();
    expect(await sharedApplication.storageManager.getValue(key)).to.not.be.ok;
  });

  it("serverPassword should not be saved to keychain", async function () {
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
      ephemeral: false
    });
    const keychainValue = await this.application.deviceInterface.getKeychainValue();
    expect(keychainValue.masterKey).to.be.ok;
    expect(keychainValue.serverPassword).to.not.be.ok;
  });

  it("regular session should persist data", async function () {
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
      ephemeral: false
    });
    this.expectedKeyCount++;
    const key = 'foo';
    const value = 'bar';
    await this.application.storageManager.setValue(
      key,
      value
    );
    expect(Object.keys(localStorage).length).to.equal(this.expectedKeyCount);
    const retrievedValue = await this.application.storageManager.getValue(key);
    expect(retrievedValue).to.equal(value);
  });

  it("ephemeral session should not persist data", async function () {
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
      ephemeral: true
    });
    const key = 'foo';
    const value = 'bar';
    await this.application.storageManager.setValue(
      key,
      value
    );
    expect(Object.keys(localStorage).length).to.equal(0);
    const retrievedValue = await this.application.storageManager.getValue(key);
    expect(retrievedValue).to.equal(value);
  });

  it("storage with no account and no passcode should not be encrypted", async function () {
    await this.application.setValue('foo', 'bar');
    const wrappedValue = this.application.storageManager.values[ValueModesKeys.Wrapped];
    const payload = CreateMaxPayloadFromAnyObject({
      object: wrappedValue
    });
    expect(payload.getFormat()).to.equal(PayloadFormats.DecryptedBareObject);
  });

  it("storage aftering adding passcode should be encrypted", async function () {
    await this.application.setValue('foo', 'bar');
    await this.application.setPasscode('123');
    const wrappedValue = this.application.storageManager.values[ValueModesKeys.Wrapped];
    const payload = CreateMaxPayloadFromAnyObject({
      object: wrappedValue
    });
    expect(payload.getFormat()).to.equal(PayloadFormats.EncryptedString);
  });

  it("storage aftering adding passcode then removing passcode should not be encrypted", async function () {
    await this.application.setValue('foo', 'bar');
    await this.application.setPasscode('123');
    await this.application.setValue('bar', 'foo');
    await this.application.removePasscode();
    const wrappedValue = this.application.storageManager.values[ValueModesKeys.Wrapped];
    const payload = CreateMaxPayloadFromAnyObject({
      object: wrappedValue
    });
    expect(payload.getFormat()).to.equal(PayloadFormats.DecryptedBareObject);
  });

  it("storage aftering adding passcode/removing passcode w/account should be encrypted", async function () {
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
    expect(await this.application.deviceInterface.getKeychainValue()).to.be.ok;
    await this.application.setValue('foo', 'bar');
    await this.application.setPasscode('123');
    expect(await this.application.deviceInterface.getKeychainValue()).to.not.be.ok;
    await this.application.setValue('bar', 'foo');
    await this.application.removePasscode();
    expect(await this.application.deviceInterface.getKeychainValue()).to.be.ok;

    const wrappedValue = this.application.storageManager.values[ValueModesKeys.Wrapped];
    const payload = CreateMaxPayloadFromAnyObject({
      object: wrappedValue
    });
    expect(payload.getFormat()).to.equal(PayloadFormats.EncryptedString);
  });

  it("adding account should encrypt storage with account keys", async function () {
    await this.application.setValue('foo', 'bar');
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
      ephemeral: true
    });
    const accountKey = await this.application.keyManager.getRootKey();
    expect(await this.application.storageManager.canDecryptWithKey(accountKey)).to.equal(true);
  });

  it("signing out of account should decrypt storage", async function () {
    await this.application.setValue('foo', 'bar');
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
      ephemeral: true
    });
    await this.application.signOut();
    await this.application.setValue('bar', 'foo');
    const wrappedValue = this.application.storageManager.values[ValueModesKeys.Wrapped];
    const payload = CreateMaxPayloadFromAnyObject({
      object: wrappedValue
    });
    expect(payload.getFormat()).to.equal(PayloadFormats.DecryptedBareObject);
  });
  
  it("adding account then passcode should encrypt storage with account keys", async function () {
    /** Should encrypt storage with account keys and encrypt account keys with passcode */
    await this.application.setValue('foo', 'bar');
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
      ephemeral: true
    });

    /** Should not be wrapped root key yet */
    expect(await this.application.keyManager.getWrappedRootKeyFromStorage()).to.not.be.ok;
    
    const passcode = '123';
    await this.application.setPasscode(passcode);
    await this.application.setValue('bar', 'foo');
    
    /** Root key should now be wrapped */
    expect(await this.application.keyManager.getWrappedRootKeyFromStorage()).to.be.ok;
  
    const accountKey = await this.application.keyManager.getRootKey();
    expect(await this.application.storageManager.canDecryptWithKey(accountKey)).to.equal(true);
    const passcodeKey = await this.application.keyManager.computeWrappingKey({
      passcode: passcode
    });
    const wrappedRootKey = await this.application.keyManager.getWrappedRootKeyFromStorage();
    /** Expect that we can decrypt wrapped root key with passcode key */
    const payload = CreateMaxPayloadFromAnyObject({object: wrappedRootKey});
    const decrypted = await this.application.protocolService.payloadByDecryptingPayload({
      payload: payload,
      key: passcodeKey
    });
    expect(decrypted.errorDecrypting).to.equal(false);
    expect(decrypted.getFormat()).to.equal(PayloadFormats.DecryptedBareObject);
  });

  it("disabling storage encryption should store items without encryption", async function () {
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
      ephemeral: false
    });

    await this.application.setStorageEncryptionPolicy(
      StorageEncryptionPolicies.Disabled
    );

    const payloads = await this.application.storageManager.getAllRawPayloads();
    const payload = payloads[0];
    expect(typeof payload.content).to.not.equal('string');
    expect(payload.content.references).to.be.ok;
  });

  it("signing out should clear unwrapped value store", async function () {
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
      ephemeral: false
    });

    await this.application.signOut();
    const values = this.application.storageManager.values[ValueModesKeys.Unwrapped];
    expect(Object.keys(values).length).to.equal(0);
  });

  it("signing out should clear payloads", async function () {
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
      ephemeral: false
    });

    await Factory.createSyncedNote(this.application);
    expect(await Factory.storagePayloadCount(this.application)).to.equal(BASE_ITEM_COUNT + 1);
    await this.application.signOut();
    expect(await Factory.storagePayloadCount(this.application)).to.equal(BASE_ITEM_COUNT);
  });
});
