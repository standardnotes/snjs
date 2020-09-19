/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('basic auth', () => {
  const BASE_ITEM_COUNT = 1; /** Default items key */

  const syncOptions = {
    checkIntegrity: true,
    awaitAll: true
  };

  before(async function () {
    localStorage.clear();
  });

  after(async function () {
    localStorage.clear();
  });

  beforeEach(async function () {
    this.expectedItemCount = BASE_ITEM_COUNT;
    this.application = await Factory.createInitAppWithRandNamespace();
    this.email = Uuid.GenerateUuidSynchronously();
    this.password = Uuid.GenerateUuidSynchronously();
  });

  afterEach(async function () {
    this.application.deinit();
  });

  it('successfully register new account', async function () {
    const response = await this.application.register(
      this.email,
      this.password
    );
    expect(response).to.be.ok;
    expect(await this.application.protocolService.getRootKey()).to.be.ok;
  }).timeout(5000);

  it('fails register new account with short password', async function () {
    const password = '123456';
    const response = await this.application.register(
      this.email,
      password
    );
    expect(response.error).to.be.ok;
    expect(await this.application.protocolService.getRootKey()).to.not.be.ok;
  }).timeout(5000);

  it('successfully logs out of account', async function () {
    await this.application.register(
      this.email,
      this.password
    );

    expect(await this.application.protocolService.getRootKey()).to.be.ok;
    this.application = await Factory.signOutApplicationAndReturnNew(this.application);
    expect(await this.application.protocolService.getRootKey()).to.not.be.ok;
    expect(this.application.protocolService.keyMode).to.equal(KeyMode.RootKeyNone);
    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(BASE_ITEM_COUNT);
  });

  it('successfully logins to registered account', async function () {
    await this.application.register(
      this.email,
      this.password
    );
    this.application = await Factory.signOutApplicationAndReturnNew(this.application);
    const response = await this.application.signIn(
      this.email,
      this.password,
      undefined, undefined, undefined,
      true
    );
    expect(response).to.be.ok;
    expect(response.error).to.not.be.ok;
    expect(await this.application.protocolService.getRootKey()).to.be.ok;
  }).timeout(20000);

  it('fails login with wrong password', async function () {
    await this.application.register(
      this.email,
      this.password
    );
    this.application = await Factory.signOutApplicationAndReturnNew(this.application);
    const response = await this.application.signIn(
      this.email,
      'wrongpassword',
      undefined, undefined, undefined,
      true
    );
    expect(response).to.be.ok;
    expect(response.error).to.be.ok;
    expect(await this.application.protocolService.getRootKey()).to.not.be.ok;
  }).timeout(20000);

  it('fails to change to short password', async function () {
    await this.application.register(
      this.email,
      this.password
    );
    const newPassword = '123456';
    const response = await this.application.changePassword(
      this.password,
      newPassword
    );
    expect(response.error).to.be.ok;
  }).timeout(20000);

  it('fails to change password when current password is incorrect', async function () {
    await this.application.register(
      this.email,
      this.password
    );
    const response = await this.application.changePassword(
      'Invalid password',
      'New password'
    );
    expect(response.error).to.be.ok;

    /** Ensure we can still log in */
    this.application = await Factory.signOutAndBackIn(this.application, this.email, this.password);
  }).timeout(20000);

  async function changePassword() {
    await this.application.register(
      this.email,
      this.password
    );

    const noteCount = 10;
    await Factory.createManyMappedNotes(this.application, noteCount);
    this.expectedItemCount += noteCount;
    await this.application.syncService.sync(syncOptions);

    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);

    const newPassword = 'newpassword';
    const response = await this.application.changePassword(
      this.password,
      newPassword
    );
    /** New items key */
    this.expectedItemCount++;

    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);

    expect(response.error).to.not.be.ok;
    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);
    expect(this.application.itemManager.invalidItems.length).to.equal(0);

    await this.application.syncService.markAllItemsAsNeedingSync();
    await this.application.syncService.sync(syncOptions);

    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);

    /** Create conflict for a note */
    const note = this.application.itemManager.notes[0];
    await this.application.changeAndSaveItem(
      note.uuid,
      (mutator) => {
        mutator.title = `${Math.random()}`;
        mutator.updated_at = Factory.yesterday();
      },
      undefined,
      undefined,
      syncOptions
    );
    this.expectedItemCount++;

    this.application = await Factory.signOutApplicationAndReturnNew(this.application);
    /** Should login with new password */
    const signinResponse = await this.application.signIn(
      this.email,
      newPassword,
      undefined, undefined, undefined,
      true
    );

    expect(signinResponse).to.be.ok;
    expect(signinResponse.error).to.not.be.ok;
    expect(await this.application.protocolService.getRootKey()).to.be.ok;
    expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);
    expect(this.application.itemManager.invalidItems.length).to.equal(0);
  }

  it('successfully changes password', changePassword).timeout(20000);

  it('successfully changes password when passcode is set', async function () {
    const passcode = 'passcode';
    const promptForValuesForTypes = (types) => {
      const values = [];
      for (const type of types) {
        if (type === ChallengeType.LocalPasscode) {
          values.push(new ChallengeValue(type, passcode));
        } else {
          values.push(new ChallengeValue(type, this.password));
        }
      }
      return values;
    };
    this.application.setLaunchCallback({
      receiveChallenge: (challenge) => {
        this.application.setChallengeCallbacks({
          challenge,
          onInvalidValue: (value) => {
            const values = promptForValuesForTypes([value.type]);
            this.application.submitValuesForChallenge(challenge, values);
            numPasscodeAttempts++;
          },
        });
        const initialValues = promptForValuesForTypes(challenge.types);
        this.application.submitValuesForChallenge(challenge, initialValues);
      }
    });
    await this.application.setPasscode(passcode);
    await (changePassword.bind(this))();
  }).timeout(20000);

  it('changes password many times', async function () {
    await this.application.register(
      this.email,
      this.password
    );

    const noteCount = 10;
    await Factory.createManyMappedNotes(this.application, noteCount);
    this.expectedItemCount += noteCount;
    await this.application.syncService.sync(syncOptions);

    const numTimesToChangePw = 5;
    let newPassword = Factory.randomString();
    let currentPassword = this.password;
    for (let i = 0; i < numTimesToChangePw; i++) {
      await this.application.changePassword(
        currentPassword,
        newPassword
      );
      /** New items key */
      this.expectedItemCount++;

      currentPassword = newPassword;
      newPassword = Factory.randomString();

      expect(this.application.itemManager.items.length).to.equal(this.expectedItemCount);
      expect(this.application.itemManager.invalidItems.length).to.equal(0);

      await this.application.syncService.markAllItemsAsNeedingSync();
      await this.application.syncService.sync(syncOptions);
      this.application = await Factory.signOutApplicationAndReturnNew(this.application);
      expect(this.application.itemManager.items.length).to.equal(BASE_ITEM_COUNT);
      expect(this.application.itemManager.invalidItems.length).to.equal(0);

      /** Should login with new password */
      const signinResponse = await this.application.signIn(
        this.email,
        currentPassword,
        undefined, undefined, undefined,
        true
      );
      expect(signinResponse).to.be.ok;
      expect(signinResponse.error).to.not.be.ok;
      expect(await this.application.protocolService.getRootKey()).to.be.ok;
    }
  }).timeout(60000);
});
