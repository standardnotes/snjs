/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('upgrading', () => {

  before(async function () {
    const promptValueReply = (prompts) => {
      const values = [];
      for (const prompt of prompts) {
        if (prompt.validation === ChallengeValidation.LocalPasscode) {
          values.push(new ChallengeValue(prompt, this.passcode));
        } else {
          values.push(new ChallengeValue(prompt, this.password));
        }
      }
      return values;
    };
    this.receiveChallenge = async (challenge) => {
      this.application.addChallengeObserver(challenge, {
        onInvalidValue: (value) => {
          const values = promptValueReply([value.prompt]);
          this.application.submitValuesForChallenge(challenge, values);
          numPasscodeAttempts++;
        },
      });
      const initialValues = promptValueReply(challenge.prompts);
      this.application.submitValuesForChallenge(challenge, initialValues);
    };
    localStorage.clear();
  });

  after(async function () {
    localStorage.clear();
  });

  beforeEach(async function () {
    this.application = await Factory.createInitAppWithRandNamespace();
    this.email = Uuid.GenerateUuidSynchronously();
    this.password = Uuid.GenerateUuidSynchronously();
    this.passcode = '1234';
  });

  afterEach(async function () {
    await this.application.deinit();
  });

  it('upgrade should be available when account only', async function () {
    const oldVersion = ProtocolVersion.V003;
    /** Register with 003 version */
    await Factory.registerOldUser({
      application: this.application,
      email: this.email,
      password: this.password,
      version: oldVersion
    });

    expect(await this.application.protocolUpgradeAvailable()).to.equal(true);
  });

  it('upgrade should be available when passcode only', async function () {
    const oldVersion = ProtocolVersion.V003;
    await Factory.setOldVersionPasscode({
      application: this.application,
      passcode: this.passcode,
      version: oldVersion
    });

    expect(await this.application.protocolUpgradeAvailable()).to.equal(true);
  });

  it('upgrades application protocol from 003 to 004', async function () {
    const oldVersion = ProtocolVersion.V003;
    const newVersion = ProtocolVersion.V004;

    await Factory.createMappedNote(this.application);

    /** Register with 003 version */
    await Factory.registerOldUser({
      application: this.application,
      email: this.email,
      password: this.password,
      version: oldVersion
    });

    await Factory.setOldVersionPasscode({
      application: this.application,
      passcode: this.passcode,
      version: oldVersion
    });

    expect(
      (await this.application.protocolService.getRootKeyWrapperKeyParams()).version
    ).to.equal(oldVersion);
    expect(
      (await this.application.protocolService.getRootKeyParams()).version
    ).to.equal(oldVersion);
    expect(
      (await this.application.protocolService.getRootKey()).keyVersion
    ).to.equal(oldVersion);

    this.application.setLaunchCallback({
      receiveChallenge: this.receiveChallenge
    });
    const result = await this.application.upgradeProtocolVersion();
    expect(result).to.deep.equal({ success: true });

    const wrappedRootKey = await this.application.protocolService.getWrappedRootKey();
    const payload = CreateMaxPayloadFromAnyObject(wrappedRootKey);
    expect(payload.version).to.equal(newVersion);

    expect(
      (await this.application.protocolService.getRootKeyWrapperKeyParams()).version
    ).to.equal(newVersion);
    expect(
      (await this.application.protocolService.getRootKeyParams()).version
    ).to.equal(newVersion);
    expect(
      (await this.application.protocolService.getRootKey()).keyVersion
    ).to.equal(newVersion);

    /**
     * Immediately logging out ensures we don't rely on subsequent
     * sync events to complete the upgrade
     */
    this.application = await Factory.signOutApplicationAndReturnNew(this.application);
    await this.application.signIn(this.email, this.password,
      undefined,
      undefined,
      undefined,
      true
    );
    expect(this.application.itemManager.notes.length).to.equal(1);
    expect(this.application.itemManager.invalidItems).to.be.empty;
  }).timeout(15000);

  describe('upgrade failure', function () {
    this.timeout(30000);
    const oldVersion = ProtocolVersion.V003;

    beforeEach(async function () {
      await Factory.createMappedNote(this.application);

      /** Register with 003 version */
      await Factory.registerOldUser({
        application: this.application,
        email: this.email,
        password: this.password,
        version: oldVersion
      });

      await Factory.setOldVersionPasscode({
        application: this.application,
        passcode: this.passcode,
        version: oldVersion
      });
    });

    afterEach(function () {
      sinon.restore();
    });

    it('rolls back the local protocol upgrade if syncing fails', async function() {
      sinon.replace(this.application.syncService, 'sync', sinon.fake());
      this.application.setLaunchCallback({
        receiveChallenge: this.receiveChallenge
      });
      expect(
        (await this.application.protocolService.getRootKeyWrapperKeyParams()).version
      ).to.equal(oldVersion);
      const errors = await this.application.upgradeProtocolVersion();
      expect(errors).to.not.be.empty;

      /** Ensure we're still on 003 */
      expect(
        (await this.application.protocolService.getRootKeyWrapperKeyParams()).version
      ).to.equal(oldVersion);
      expect(
        (await this.application.protocolService.getRootKeyParams()).version
      ).to.equal(oldVersion);
      expect(
        (await this.application.protocolService.getRootKey()).keyVersion
      ).to.equal(oldVersion);
      expect(
        (await this.application.protocolService.getDefaultItemsKey()).keyVersion
      ).to.equal(oldVersion);
    });

    it('rolls back the local protocol upgrade if the server responds with an error', async function () {
      sinon.replace(this.application.protocolService, 'changePassword', async () => ([Error()]));

      this.application.setLaunchCallback({
        receiveChallenge: this.receiveChallenge
      });
      expect(
        (await this.application.protocolService.getRootKeyWrapperKeyParams()).version
      ).to.equal(oldVersion);
      const errors = await this.application.upgradeProtocolVersion();
      expect(errors).to.not.be.empty;

      /** Ensure we're still on 003 */
      expect(
        (await this.application.protocolService.getRootKeyWrapperKeyParams()).version
      ).to.equal(oldVersion);
      expect(
        (await this.application.protocolService.getRootKeyParams()).version
      ).to.equal(oldVersion);
      expect(
        (await this.application.protocolService.getRootKey()).keyVersion
      ).to.equal(oldVersion);
      expect(
        (await this.application.protocolService.getDefaultItemsKey()).keyVersion
      ).to.equal(oldVersion);
    });
  });

  it('protocol version should be upgraded on password change', async function () {
    /** Delete default items key that is created on launch */
    const itemsKey = await this.application.protocolService.getDefaultItemsKey();
    await this.application.itemManager.setItemToBeDeleted(itemsKey.uuid);
    expect(this.application.itemManager.itemsKeys().length).to.equal(0);

    Factory.createMappedNote(this.application);

    /** Register with 003 version */
    await Factory.registerOldUser({
      application: this.application,
      email: this.email,
      password: this.password,
      version: ProtocolVersion.V003
    });

    expect(this.application.itemManager.itemsKeys().length).to.equal(1);

    expect(
      (await this.application.protocolService.getRootKeyParams()).version
    ).to.equal(ProtocolVersion.V003);
    expect(
      (await this.application.protocolService.getRootKey()).keyVersion
    ).to.equal(ProtocolVersion.V003);

    /** Ensure note is encrypted with 003 */
    const notePayloads = await Factory.getStoragePayloadsOfType(
      this.application,
      ContentType.Note
    );
    expect(notePayloads.length).to.equal(1);
    expect(notePayloads[0].version).to.equal(ProtocolVersion.V003);

    const { error } = await this.application.changePassword(
      this.password,
      'foobarfoo'
    );
    expect(error).to.not.exist;

    const latestVersion = this.application.protocolService.getLatestVersion();
    expect(
      (await this.application.protocolService.getRootKeyParams()).version
    ).to.equal(latestVersion);
    expect(
      (await this.application.protocolService.getRootKey()).keyVersion
    ).to.equal(latestVersion);

    const defaultItemsKey = await this.application.protocolService.getDefaultItemsKey();
    expect(defaultItemsKey.keyVersion).to.equal(latestVersion);

    /** After change, note should now be encrypted with latest protocol version */

    const note = this.application.itemManager.notes[0];
    await this.application.saveItem(note.uuid);

    const refreshedNotePayloads = await Factory.getStoragePayloadsOfType(
      this.application,
      ContentType.Note
    );
    const refreshedNotePayload = refreshedNotePayloads[0];
    expect(refreshedNotePayload.version).to.equal(latestVersion);
  }).timeout(5000);
});
