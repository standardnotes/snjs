/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('backups', function () {
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

  const BASE_ITEM_COUNT_ENCRYPTED = ['ItemsKey', 'UserPreferences'].length;
  const BASE_ITEM_COUNT_DECRYPTED = ['UserPreferences'].length;

  it('backup file should have a version number', async function () {
    let data = await this.application.createBackupFile(
      EncryptionIntent.FileDecrypted
    );
    expect(data.version).to.equal(
      this.application.protocolService.getLatestVersion()
    );
    await this.application.addPasscode('passcode');
    data = await this.application.createBackupFile(
      EncryptionIntent.FileEncrypted
    );
    expect(data.version).to.equal(
      this.application.protocolService.getLatestVersion()
    );
  });

  it('no passcode + no account backup file should have correct number of items', async function () {
    await Promise.all([
      Factory.createSyncedNote(this.application),
      Factory.createSyncedNote(this.application),
    ]);
    const data = await this.application.createBackupFile(
      EncryptionIntent.FileDecrypted
    );
    expect(data.items.length).to.equal(BASE_ITEM_COUNT_DECRYPTED + 2);
  });

  it('passcode + no account backup file should have correct number of items', async function () {
    const passcode = 'passcode';
    await this.application.addPasscode(passcode);
    await Promise.all([
      Factory.createSyncedNote(this.application),
      Factory.createSyncedNote(this.application),
    ]);

    // Encrypted backup without authorization
    const encryptedData = await this.application.createBackupFile(
      EncryptionIntent.FileEncrypted
    );
    expect(encryptedData.items.length).to.equal(BASE_ITEM_COUNT_ENCRYPTED + 2);

    // Encrypted backup with authorization
    Factory.handlePasswordChallenges(this.application, passcode);
    const authorizedEncryptedData = await this.application.createBackupFile(
      EncryptionIntent.FileEncrypted,
      true
    );
    expect(authorizedEncryptedData.items.length).to.equal(
      BASE_ITEM_COUNT_ENCRYPTED + 2
    );
  });

  it('no passcode + account backup file should have correct number of items', async function () {
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
    });
    await Promise.all([
      Factory.createSyncedNote(this.application),
      Factory.createSyncedNote(this.application),
    ]);

    // Encrypted backup without authorization
    const encryptedData = await this.application.createBackupFile(
      EncryptionIntent.FileEncrypted
    );
    expect(encryptedData.items.length).to.equal(BASE_ITEM_COUNT_ENCRYPTED + 2);

    // Decrypted backup
    const decryptedData = await this.application.createBackupFile(
      EncryptionIntent.FileDecrypted
    );
    expect(decryptedData.items.length).to.equal(BASE_ITEM_COUNT_DECRYPTED + 2);

    // Encrypted backup with authorization
    Factory.handlePasswordChallenges(this.application, this.password);
    const authorizedEncryptedData = await this.application.createBackupFile(
      EncryptionIntent.FileEncrypted,
      true
    );
    expect(authorizedEncryptedData.items.length).to.equal(
      BASE_ITEM_COUNT_ENCRYPTED + 2
    );
  });

  it('passcode + account backup file should have correct number of items', async function () {
    this.timeout(10000);
    const passcode = 'passcode';
    await this.application.register(this.email, this.password);
    Factory.handlePasswordChallenges(this.application, this.password);
    await this.application.addPasscode(passcode);
    await Promise.all([
      Factory.createSyncedNote(this.application),
      Factory.createSyncedNote(this.application),
    ]);

    // Encrypted backup without authorization
    const encryptedData = await this.application.createBackupFile(
      EncryptionIntent.FileEncrypted
    );
    expect(encryptedData.items.length).to.equal(BASE_ITEM_COUNT_ENCRYPTED + 2);

    Factory.handlePasswordChallenges(this.application, passcode);

    // Decrypted backup
    const decryptedData = await this.application.createBackupFile(
      EncryptionIntent.FileDecrypted
    );
    expect(decryptedData.items.length).to.equal(BASE_ITEM_COUNT_DECRYPTED + 2);

    // Encrypted backup with authorization
    const authorizedEncryptedData = await this.application.createBackupFile(
      EncryptionIntent.FileEncrypted,
      true
    );
    expect(authorizedEncryptedData.items.length).to.equal(
      BASE_ITEM_COUNT_ENCRYPTED + 2
    );
  });

  it('backup file item should have correct fields', async function () {
    await Factory.createSyncedNote(this.application);
    let backupData = await this.application.createBackupFile(
      EncryptionIntent.FileDecrypted
    );
    let rawItem = backupData.items.find(
      (i) => i.content_type === ContentType.Note
    );

    expect(rawItem.fields).to.not.be.ok;
    expect(rawItem.source).to.not.be.ok;
    expect(rawItem.dirtiedDate).to.not.be.ok;
    expect(rawItem.format).to.not.be.ok;
    expect(rawItem.uuid).to.be.ok;
    expect(rawItem.content_type).to.be.ok;
    expect(rawItem.content).to.be.ok;
    expect(rawItem.created_at).to.be.ok;
    expect(rawItem.updated_at).to.be.ok;

    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
    });

    backupData = await this.application.createBackupFile(
      EncryptionIntent.FileEncrypted
    );
    rawItem = backupData.items.find((i) => i.content_type === ContentType.Note);

    expect(rawItem.fields).to.not.be.ok;
    expect(rawItem.source).to.not.be.ok;
    expect(rawItem.dirtiedDate).to.not.be.ok;
    expect(rawItem.format).to.not.be.ok;
    expect(rawItem.uuid).to.be.ok;
    expect(rawItem.content_type).to.be.ok;
    expect(rawItem.content).to.be.ok;
    expect(rawItem.created_at).to.be.ok;
    expect(rawItem.updated_at).to.be.ok;
  });

  it('downloading backup if item is error decrypting should succeed', async function () {
    await Factory.createSyncedNote(this.application);
    const note = await Factory.createSyncedNote(this.application);
    const encrypted = await this.application.protocolService.payloadByEncryptingPayload(
      note.payload,
      EncryptionIntent.FileEncrypted
    );
    const errored = CopyPayload(encrypted, {
      errorDecrypting: true,
    });
    const erroredItem = await this.application.itemManager.emitItemFromPayload(
      errored
    );
    expect(erroredItem.errorDecrypting).to.equal(true);
    const backupData = await this.application.createBackupFile(
      EncryptionIntent.FileDecrypted
    );

    expect(backupData.items.length).to.equal(BASE_ITEM_COUNT_DECRYPTED + 2);
  });

  it('decrypted backup file should not have keyParams', async function () {
    const backup = await this.application.createBackupFile(
      EncryptionIntent.FileDecrypted
    );
    expect(backup).to.not.haveOwnProperty('keyParams');
  });

  it('encrypted backup file should have keyParams', async function () {
    await this.application.addPasscode('passcode');
    const backup = await this.application.createBackupFile(
      EncryptionIntent.FileEncrypted
    );
    expect(backup).to.haveOwnProperty('keyParams');
  });

  it('decrypted backup file should not have itemsKeys', async function () {
    const backup = await this.application.createBackupFile(
      EncryptionIntent.FileDecrypted
    );
    expect(
      backup.items.some((item) => item.content_type === ContentType.ItemsKey)
    ).to.be.false;
  });

  it('encrypted backup file should have itemsKeys', async function () {
    await this.application.addPasscode('passcode');
    const backup = await this.application.createBackupFile(
      EncryptionIntent.FileEncrypted
    );
    expect(
      backup.items.some((item) => item.content_type === ContentType.ItemsKey)
    ).to.be.true;
  });

  it('backup file with no account and no passcode should be decrypted', async function () {
    const note = await Factory.createSyncedNote(this.application);
    const backup = await this.application.createBackupFile(
      EncryptionIntent.FileDecrypted
    );
    expect(backup).to.not.haveOwnProperty('keyParams');
    expect(
      backup.items.some((item) => item.content_type === ContentType.ItemsKey)
    ).to.be.false;
    expect(
      backup.items.find((item) => item.content_type === ContentType.Note).uuid
    ).to.equal(note.uuid);
    let error;
    try {
      await this.application.createBackupFile(EncryptionIntent.Encrypted);
    } catch (e) {
      error = e;
    }
    expect(error).to.be.ok;
  });
});
