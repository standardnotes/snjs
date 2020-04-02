/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('upgrading', () => {

  before(async function () {
    localStorage.clear();
  });

  after(async function () {
    localStorage.clear();
  });

  beforeEach(async function () {
    this.application = await Factory.createInitAppWithRandNamespace();
    this.email = Uuid.GenerateUuidSynchronously();
    this.password = Uuid.GenerateUuidSynchronously();
  });

  afterEach(async function () {
    await this.application.deinit();
  });

  it('upgrade should be available when account only', async function () {
    const oldVersion = ProtocolVersions.V003;
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
    const oldVersion = ProtocolVersions.V003;
    const passcode = '1234';
    await Factory.setOldVersionPasscode({
      application: this.application,
      passcode: passcode,
      version: oldVersion
    });

    expect(await this.application.protocolUpgradeAvailable()).to.equal(true);
  });

  it('application protocol upgrade', async function () {
    const oldVersion = ProtocolVersions.V003;
    const newVersion = ProtocolVersions.V004;
    /** Register with 003 version */
    await Factory.registerOldUser({
      application: this.application,
      email: this.email,
      password: this.password,
      version: oldVersion
    });

    const passcode = '1234';
    await Factory.setOldVersionPasscode({
      application: this.application,
      passcode: passcode,
      version: oldVersion
    });

    expect(
      (await this.application.protocolService.getRootKeyWrapperKeyParams()).version
    ).to.equal(oldVersion);
    expect(
      (await this.application.protocolService.getRootKeyParams()).version
    ).to.equal(oldVersion);
    expect(
      (await this.application.protocolService.getRootKey()).version
    ).to.equal(oldVersion);

    const promptForValuesForTypes = (types) => {
      const values = [];
      for (const type of types) {
        if (type === ChallengeType.LocalPasscode) {
          values.push(new ChallengeValue(type,passcode));
        } else {
          values.push(new ChallengeValue(type, this.password));
        }
      }
      return values;
    };
    const receiveChallenge = async (challenge, orchestrator) => {
      orchestrator.setCallbacks(
        undefined,
        (value) => {
          const values = promptForValuesForTypes([value.type]);
          orchestrator.submitValues(values);
          numPasscodeAttempts++;
        },
      );
      const initialValues = promptForValuesForTypes(challenge.types);
      orchestrator.submitValues(initialValues);
    };
    this.application.setLaunchCallback({
      receiveChallenge: receiveChallenge
    });
    await this.application.upgradeProtocolVersion();

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
      (await this.application.protocolService.getRootKey()).version
    ).to.equal(newVersion);
  }).timeout(5000);;

  it('protocol version should be upgraded on password change', async function () {
    /** Delete default items key that is created on launch */
    const itemsKey = this.application.protocolService.getDefaultItemsKey();
    await this.application.modelManager.setItemToBeDeleted(itemsKey);
    expect(this.application.protocolService.itemsKeys.length).to.equal(0);

    /** Register with 003 version */
    await Factory.registerOldUser({
      application: this.application,
      email: this.email,
      password: this.password,
      version: ProtocolVersions.V003
    });

    expect(this.application.protocolService.itemsKeys.length).to.equal(1);

    expect(
      (await this.application.protocolService.getRootKeyParams()).version
    ).to.equal(ProtocolVersions.V003);
    expect(
      (await this.application.protocolService.getRootKey()).version
    ).to.equal(ProtocolVersions.V003);

    /** Create note and ensure its encrypted with 003 */
    await Factory.createSyncedNote(this.application);

    const notePayloads = await Factory.getStoragePayloadsOfType(
      this.application,
      'Note'
    );
    const notePayload003 = notePayloads[0];
    expect(notePayload003.version).to.equal(ProtocolVersions.V003);

    await this.application.changePassword(
      this.password,
      'foobarfoo'
    );

    const latestVersion = this.application.protocolService.getLatestVersion();
    expect(
      (await this.application.protocolService.getRootKeyParams()).version
    ).to.equal(latestVersion);
    expect(
      (await this.application.protocolService.getRootKey()).version
    ).to.equal(latestVersion);

    const defaultItemsKey = this.application.protocolService.getDefaultItemsKey();
    expect(defaultItemsKey.version).to.equal(latestVersion);

    /** After change, note should now be encrypted with latest protocol version */

    const note = this.application.modelManager.notes[0];
    await this.application.saveItem(note);

    const refreshedNotePayloads = await Factory.getStoragePayloadsOfType(
      this.application,
      'Note'
    );
    const refreshedNotePayload = refreshedNotePayloads[0];
    expect(refreshedNotePayload.version).to.equal(latestVersion);
  }).timeout(5000);
});
