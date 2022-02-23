import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('settings service', function () {
  const validSetting = SettingName.GoogleDriveBackupFrequency;
  const fakePayload = 'Im so meta even this acronym';
  const updatedFakePayload = 'is meta';

  let snApp;

  beforeEach(async function () {
    snApp = await Factory.createInitAppWithFakeCrypto(
      Environment.Web,
      Platform.MacWeb
    );
    const email = Uuid.GenerateUuid();
    const password = Uuid.GenerateUuid();
    const ephemeral = false;
    const mergeLocal = true;

    await snApp.register(email, password, ephemeral, mergeLocal);
  });

  afterEach(async function () {
    await Factory.safeDeinit(snApp);
  });

  it('creates and reads a setting', async function () {
    await snApp.updateSetting(validSetting, fakePayload);
    const responseCreate = await snApp.getSetting(validSetting);
    expect(responseCreate).to.equal(fakePayload);
  });

  it('throws error on an invalid setting update', async function () {
    const invalidSetting = 'FAKE_SETTING';
    let caughtError = null;
    try {
      await snApp.updateSetting(invalidSetting, fakePayload);
    } catch (error) {
      caughtError = error
    }

    expect(caughtError).not.to.equal(null)
  });

  it('creates and lists settings', async function () {
    await snApp.updateSetting(validSetting, fakePayload);
    const responseList = await snApp.listSettings();
    expect(responseList).to.eql({ [validSetting]: fakePayload });
  });

  it('creates and deletes a setting', async function () {
    await snApp.updateSetting(validSetting, fakePayload);
    const responseCreate = await snApp.getSetting(validSetting);
    expect(responseCreate).to.eql(fakePayload);

    await snApp.deleteSetting(validSetting);
    const responseDeleted = await snApp.listSettings();
    expect(responseDeleted).to.eql({});
  });

  it('creates and updates a setting', async function () {
    await snApp.updateSetting(validSetting, fakePayload);
    await snApp.updateSetting(validSetting, updatedFakePayload);
    const responseUpdated = await snApp.getSetting(validSetting);
    expect(responseUpdated).to.eql(updatedFakePayload);
  });

  it('reads a nonexistent setting', async () => {
    const setting = await snApp.getSetting(validSetting);
    expect(setting).to.equal(null);
  });

  it('reads a nonexistent sensitive setting', async () => {
    const setting = await snApp.getSensitiveSetting(SettingName.MfaSecret);
    expect(setting).to.equal(false);
  });

  it('creates and reads a sensitive setting', async () => {
    await snApp.updateSetting(SettingName.MfaSecret, 'fake_secret', true);
    const setting = await snApp.getSensitiveSetting(SettingName.MfaSecret);
    expect(setting).to.equal(true);
  });

  it('creates and lists a sensitive setting', async () => {
    await snApp.updateSetting(SettingName.MfaSecret, 'fake_secret', true);
    await snApp.updateSetting(SettingName.MuteFailedBackupsEmails, MuteFailedBackupsEmailsOption.Muted);
    const settings = await snApp.listSettings();
    expect(settings).to.eql({ 'MUTE_FAILED_BACKUPS_EMAILS': 'muted' });
  });
});
