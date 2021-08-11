import {
  Platform,
  Environment,
  Uuid,
  DeinitSource,
  SNApplication,
} from '@Lib/index';
import { createApplication } from '../setup/snjs/appFactory';

const randNamespace = () => Math.random().toString(36).substring(2, 15);

describe('settings', function () {
  const fakeSetting = 'FAKE_SETTING';
  const fakePayload = 'Im so meta even this acronym';
  const updatedFakePayload = 'is meta';

  let snApp;

  beforeEach(async function () {
    snApp = await createApplication(
      randNamespace(),
      Environment.Web,
      Platform.MacWeb,
      { hostUrl: 'http://localhost:3123', webSocketUrl: 'ws://localhost' }
    );
    const email = Uuid.GenerateUuidSynchronously();
    const password = Uuid.GenerateUuidSynchronously();
    const ephemeral = false;
    const mergeLocal = true;

    await snApp.register(email, password, ephemeral, mergeLocal);

    // We have to wait for sync to finish, otherwise
    // the SNSyncService.handleSuccessServerResponse is fired
    // after the test has finished causing an error
    await snApp.sync();
  });

  afterEach(async function () {
    await snApp.deinit(DeinitSource.SignOut);
    localStorage.clear();
  });

  it('creates and reads a setting', async function () {
    // Create and validate
    await snApp.updateSetting(fakeSetting, fakePayload);
    const responseCreate = await snApp.getSetting(fakeSetting);
    expect(responseCreate).toEqual(fakePayload);
  });

  it('creates and lists settings', async function () {
    // Create and list
    await snApp.updateSetting(fakeSetting, fakePayload);
    const responseList = await snApp.listSettings();
    expect(responseList).toEqual({ [fakeSetting]: fakePayload });
  });

  it('creates and deletes a setting', async function () {
    // Create and validate
    await snApp.updateSetting(fakeSetting, fakePayload);
    const responseCreate = await snApp.getSetting(fakeSetting);
    expect(responseCreate).toEqual(fakePayload);

    // Delete and validate
    await snApp.deleteSetting(fakeSetting);
    const responseDeleted = await snApp.listSettings();
    expect(responseDeleted).toEqual({});
  });

  it('creates and updates a setting', async function () {
    // Create, Update and validate
    await snApp.updateSetting(fakeSetting, fakePayload);
    await snApp.updateSetting(fakeSetting, updatedFakePayload);
    const responseUpdated = await snApp.getSetting(fakeSetting);
    expect(responseUpdated).toEqual(updatedFakePayload);
  });
});
