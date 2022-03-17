import * as Factory from './lib/factory.js'
chai.use(chaiAsPromised)
const expect = chai.expect

describe('settings service', function () {
  const validSetting = SettingName.GoogleDriveBackupFrequency
  const fakePayload = 'Im so meta even this acronym'
  const updatedFakePayload = 'is meta'

  let snApp

  beforeEach(async function () {
    snApp = await Factory.createInitAppWithFakeCrypto(Environment.Web, Platform.MacWeb)
    const email = UuidGenerator.GenerateUuid()
    const password = UuidGenerator.GenerateUuid()
    const ephemeral = false
    const mergeLocal = true

    await snApp.register(email, password, ephemeral, mergeLocal)
  })

  afterEach(async function () {
    await Factory.safeDeinit(snApp)
  })

  it('creates and reads a setting', async function () {
    await snApp.settings.updateSetting(validSetting, fakePayload)
    const responseCreate = await snApp.settings.getSetting(validSetting)
    expect(responseCreate).to.equal(fakePayload)
  })

  it('throws error on an invalid setting update', async function () {
    const invalidSetting = 'FAKE_SETTING'
    let caughtError = undefined
    try {
      await snApp.settings.updateSetting(invalidSetting, fakePayload)
    } catch (error) {
      caughtError = error
    }

    expect(caughtError).not.to.equal(undefined)
  })

  it('creates and lists settings', async function () {
    await snApp.settings.updateSetting(validSetting, fakePayload)
    const responseList = await snApp.settings.listSettings()
    expect(responseList.getSettingValue(validSetting)).to.eql(fakePayload)
  })

  it('creates and deletes a setting', async function () {
    await snApp.settings.updateSetting(validSetting, fakePayload)
    const responseCreate = await snApp.settings.getSetting(validSetting)
    expect(responseCreate).to.eql(fakePayload)

    await snApp.settings.deleteSetting(validSetting)
    const responseDeleted = await snApp.settings.listSettings()
    expect(responseDeleted.getSettingValue(validSetting)).to.not.be.ok
  })

  it('creates and updates a setting', async function () {
    await snApp.settings.updateSetting(validSetting, fakePayload)
    await snApp.settings.updateSetting(validSetting, updatedFakePayload)
    const responseUpdated = await snApp.settings.getSetting(validSetting)
    expect(responseUpdated).to.eql(updatedFakePayload)
  })

  it('reads a nonexistent setting', async () => {
    const setting = await snApp.settings.getSetting(validSetting)
    expect(setting).to.equal(undefined)
  })

  it('reads a nonexistent sensitive setting', async () => {
    const setting = await snApp.settings.getDoesSensitiveSettingExist(SettingName.MfaSecret)
    expect(setting).to.equal(false)
  })

  it('creates and reads a sensitive setting', async () => {
    await snApp.settings.updateSetting(SettingName.MfaSecret, 'fake_secret', true)
    const setting = await snApp.settings.getDoesSensitiveSettingExist(SettingName.MfaSecret)
    expect(setting).to.equal(true)
  })

  it('creates and lists a sensitive setting', async () => {
    await snApp.settings.updateSetting(SettingName.MfaSecret, 'fake_secret', true)
    await snApp.settings.updateSetting(
      SettingName.MuteFailedBackupsEmails,
      MuteFailedBackupsEmailsOption.Muted,
    )
    const settings = await snApp.settings.listSettings()
    expect(settings.getSettingValue(SettingName.MuteFailedBackupsEmails)).to.eql(
      MuteFailedBackupsEmailsOption.Muted,
    )
    expect(settings.getSettingValue(SettingName.MfaSecret)).to.not.be.ok
  })
})
