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
   * Default items key for registered user is stored on registration.
   */
  const BASE_KEY_COUNT = 1;
  const sharedApplication = Factory.createApplication();

  before(async function () {
    localStorage.clear();
    await Factory.initializeApplication(sharedApplication);
  });

  after(async function () {
  })

  beforeEach(async function() {
    localStorage.clear();
    this.expectedKeyCount = BASE_KEY_COUNT;
    this.application = await Factory.createInitAppWithRandNamespace();
    this.email = SFItem.GenerateUuidSynchronously();
    this.password = SFItem.GenerateUuidSynchronously();
  })

  afterEach(async function() {
    localStorage.clear();
  })

  it("should set and retrieve values", async function () {
    const key = "foo";
    const value = "bar";
    await sharedApplication.storageManager.setValue(key, value);
    expect(await sharedApplication.storageManager.getValue(key)).to.eql(value);
  })

  it("should set and retrieve items", async function () {
    const payload = Factory.createStorageItemNotePayload();
    await sharedApplication.storageManager.savePayload(payload);
    const payloads = await sharedApplication.storageManager.getAllRawPayloads();
    expect(payloads.length).to.equal(1);
  })

  it("should clear values", async function () {
    const key = "foo";
    const value = "bar";
    await sharedApplication.storageManager.setValue(key, value);
    await sharedApplication.storageManager.clearAllData();
    expect(await sharedApplication.storageManager.getValue(key)).to.not.be.ok;
  })

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
  })

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
  })

  it("disabling storage encryption should store items without encryption", async function () {
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
      ephemeral: false
    });

    await this.application.setStorageEncryptionPolicy(
      STORAGE_ENCRYPTION_POLICY_DISABLED
    );

    const payloads = await this.application.storageManager.getAllRawPayloads();
    const payload = payloads[0];
    expect(typeof payload.content).to.not.equal('string');
    expect(payload.content.references).to.be.ok;
  })
})
