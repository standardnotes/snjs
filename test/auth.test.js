/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("basic auth", () => {
  const BASE_ITEM_COUNT = 1; /** Default items key */

  before(async function () {
    localStorage.clear();
  });

  after(async function () {
    localStorage.clear();
  });

  beforeEach(async function() {
    this.expectedItemCount = BASE_ITEM_COUNT;
    this.application = await Factory.createInitAppWithRandNamespace();
    this.email = Uuid.GenerateUuidSynchronously();
    this.password = Uuid.GenerateUuidSynchronously();
  });

  afterEach(async function() {
    this.application.deinit();
  });

  it("successfully register new account",  async function () {
    const response = await this.application.register({
      email: this.email,
      password: this.password
    });
    expect(response).to.be.ok;
    expect(await this.application.keyManager.getRootKey()).to.be.ok;
  }).timeout(5000);

  it("successfully logs out of account", async function () {
    await this.application.register({
      email: this.email,
      password: this.password
    });

    expect(await this.application.keyManager.getRootKey()).to.be.ok;
    await this.application.signOut();
    expect(await this.application.keyManager.getRootKey()).to.not.be.ok;
    expect(this.application.keyManager.keyMode).to.equal(KEY_MODE_ROOT_KEY_NONE);
    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(BASE_ITEM_COUNT);
  });

  it("successfully logins to registered account", async function () {
    await this.application.register({
      email: this.email,
      password: this.password
    });
    await this.application.signOut();
    const response = await this.application.signIn({
      email: this.email,
      password: this.password
    });
    expect(response).to.be.ok;
    expect(response.error).to.not.be.ok;
    expect(await this.application.keyManager.getRootKey()).to.be.ok;
  }).timeout(20000);

  it("fails login with wrong password", async function () {
    await this.application.register({
      email: this.email,
      password: this.password
    });
    await this.application.signOut();
    const response = await this.application.signIn({
      email: this.email,
      password: 'wrongpassword'
    });
    expect(response).to.be.ok;
    expect(response.error).to.be.ok;
    expect(await this.application.keyManager.getRootKey()).to.not.be.ok;
  }).timeout(20000);

  it("successfully changes password", async function () {
    await this.application.register({
      email: this.email,
      password: this.password
    });

    const noteCount = 10;
    await Factory.createManyMappedNotes(this.application, noteCount);
    this.expectedItemCount += noteCount;
    await this.application.syncManager.sync();

    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);

    const newPassword = 'newpassword';
    const response = await this.application.changePassword({
      email: this.email,
      currentPassword: this.password,
      newPassword: newPassword
    });

    expect(response.error).to.not.be.ok;
    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);
    expect(this.application.modelManager.invalidItems().length).to.equal(0);

    await this.application.modelManager.setAllItemsDirty();
    await this.application.syncManager.sync();

    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);

    /** Create conflict for a note */
    const note = this.application.modelManager.notes[0];
    note.title = `${Math.random()}`
    note.updated_at = Factory.yesterday();
    await this.application.saveItem({item: note});
    this.expectedItemCount++;

    // clear sync token, clear storage, download all items, and ensure none of them have error decrypting
    await this.application.syncManager.clearSyncPositionTokens();
    await this.application.storageManager.clearAllPayloads();
    await this.application.modelManager.handleSignOut();

    expect(this.application.modelManager.allItems.length).to.equal(0);

    await this.application.syncManager.sync();

    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);
    expect(this.application.modelManager.invalidItems().length).to.equal(0);

    await this.application.signOut();

    /** Should login with new password */
    const signinResponse = await this.application.signIn({
      email: this.email,
      password: newPassword
    });
    expect(signinResponse).to.be.ok;
    expect(signinResponse.error).to.not.be.ok;
    expect(await this.application.keyManager.getRootKey()).to.be.ok;
  }).timeout(20000);

  it("changes password many times", async function () {
    await this.application.register({
      email: this.email,
      password: this.password
    });

    const noteCount = 10;
    await Factory.createManyMappedNotes(this.application, noteCount);
    this.expectedItemCount += noteCount;
    await this.application.syncManager.sync();

    const numTimesToChangePw = 5;
    let newPassword = Factory.randomString();
    let currentPassword = this.password;
    for(let i = 0; i < numTimesToChangePw; i++) {
      const response = await this.application.changePassword({
        email: this.email,
        currentPassword: currentPassword,
        newPassword: newPassword
      });

      currentPassword = newPassword;
      newPassword = Factory.randomString();

      expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);
      expect(this.application.modelManager.invalidItems().length).to.equal(0);

      await this.application.modelManager.setAllItemsDirty();
      await this.application.syncManager.sync();

      // clear sync token, clear storage, download all items, and ensure none of them have error decrypting
      await this.application.syncManager.clearSyncPositionTokens();
      await this.application.storageManager.clearAllPayloads();
      this.application.modelManager.handleSignOut();

      expect(this.application.modelManager.allItems.length).to.equal(0);

      await this.application.syncManager.sync();

      expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);
      expect(this.application.modelManager.invalidItems().length).to.equal(0);

      /** Should login with new password */
      const signinResponse = await this.application.signIn({
        email: this.email,
        password: currentPassword
      });
      expect(signinResponse).to.be.ok;
      expect(signinResponse.error).to.not.be.ok;
      expect(await this.application.keyManager.getRootKey()).to.be.ok;
    }
  }).timeout(30000);

})
