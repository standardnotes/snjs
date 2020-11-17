/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('backups', () => {

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

  afterEach(function () {
    this.application.deinit();
    this.application = null;
  });

  it('backup file should have a version number', async function () {
    const backupString = await this.application.createBackupFile();
    const data = JSON.parse(backupString);
    expect(data.version).to.equal(this.application.protocolService.getLatestVersion());
  });

  it('no passcode + no account backup file should have correct number of items', async function () {
    await Factory.createSyncedNote(this.application);
    await Factory.createSyncedNote(this.application);
    const backupString = await this.application.createBackupFile();
    const backupData = JSON.parse(backupString);

    expect(backupData.items.length).to.equal(2);
  });

  it('passcode + no account backup file should have correct number of items', async function () {
    await this.application.setPasscode('passcode');
    await Factory.createSyncedNote(this.application);
    await Factory.createSyncedNote(this.application);
    const backupString = await this.application.createBackupFile();
    const backupData = JSON.parse(backupString);

    expect(backupData.items.length).to.equal(3);
  });

  it('no passcode + account backup file should have correct number of items', async function () {
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
    });
    await Factory.createSyncedNote(this.application);
    await Factory.createSyncedNote(this.application);
    const backupString = await this.application.createBackupFile();
    const backupData = JSON.parse(backupString);
    console.log(backupData);
    expect(backupData.items.length).to.equal(3);
  });

  it('passcode + account backup file should have correct number of items', async function () {
    this.application.setLaunchCallback({
      receiveChallenge: (challenge) => {
        this.application.submitValuesForChallenge(
          challenge,
          [new ChallengeValue(challenge.prompts[0], 'passcode')]
        );
      }
    });
    await this.application.setPasscode('passcode');
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
    });
    await Factory.createSyncedNote(this.application);
    await Factory.createSyncedNote(this.application);
    const backupString = await this.application.createBackupFile();
    const backupData = JSON.parse(backupString);

    expect(backupData.items.length).to.equal(3);
  });

  it('backup file item should have correct fields', async function () {
    await Factory.createSyncedNote(this.application);
    await Factory.createSyncedNote(this.application);
    const backupString = await this.application.createBackupFile();
    const backupData = JSON.parse(backupString);
    const item = backupData.items[0];

    expect(item.fields).to.not.be.ok;
    expect(item.source).to.not.be.ok;
    expect(item.dirtiedDate).to.not.be.ok;
    expect(item.format).to.not.be.ok;
    expect(item.uuid).to.be.ok;
    expect(item.content_type).to.be.ok;
    expect(item.content).to.be.ok;
    expect(item.created_at).to.be.ok;
    expect(item.updated_at).to.be.ok;
  });

  it('downloading backup if item is error decrypting should succeed', async function () {
    await Factory.createSyncedNote(this.application);
    const note = await Factory.createSyncedNote(this.application);
    const encrypted = await this.application.protocolService.payloadByEncryptingPayload(
      note.payload,
      EncryptionIntent.FileEncrypted
    );
    const errored = CopyPayload(
      encrypted,
      {
        errorDecrypting: true
      }
    );
    const erroredItem = await this.application.itemManager.emitItemFromPayload(errored);
    expect(erroredItem.errorDecrypting).to.equal(true);
    const backupString = await this.application.createBackupFile();
    const backupData = JSON.parse(backupString);

    expect(backupData.items.length).to.equal(2);
  });

  it('decrypted backup file should not have keyParams', async function () {
    const backup = JSON.parse(await this.application.createBackupFile());
    expect(backup).to.not.haveOwnProperty('keyParams');
  });

  it('encrypted backup file should have keyParams', async function () {
    await this.application.setPasscode('passcode');
    const backup = JSON.parse(await this.application.createBackupFile());
    expect(backup).to.haveOwnProperty('keyParams');
  });

  it('decrypted backup file should not have itemsKeys', async function () {
    const backup = JSON.parse(await this.application.createBackupFile());
    expect(backup.items.some(
      item => item.content_type === ContentType.ItemsKey
    )).to.be.false;
  });

  it('encrypted backup file should have itemsKeys', async function () {
    await this.application.setPasscode('passcode');
    const backup = JSON.parse(await this.application.createBackupFile());
    expect(backup.items.some(
      item => item.content_type === ContentType.ItemsKey
    )).to.be.true;
  });

  it('backup file with no account and no passcode should be decrypted', async function () {
    const note = await Factory.createSyncedNote(this.application);
    const backup = JSON.parse(await this.application.createBackupFile());
    expect(backup).to.not.haveOwnProperty('keyParams');
    expect(backup.items.some(item => item.content_type === ContentType.ItemsKey)).to.be.false;
    expect(backup.items.find(item => item.content_type === ContentType.Note).uuid).to.equal(note.uuid);
  });
});
