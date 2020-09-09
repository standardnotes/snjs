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

  it('backup file should have correct number of items', async function () {
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

    expect(backupData.items.length).to.equal(3);
  });
});
