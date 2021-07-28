import { ApplicationEvent } from '@Lib/events';
import { Uuid } from '@Lib/uuid';
import * as Factory from '../factory';

describe('preferences', function () {
  async function setupApplication(registerUser = false) {
    const application = await Factory.createInitAppWithRandNamespace();
    const email = Uuid.GenerateUuidSynchronously();
    const password = Uuid.GenerateUuidSynchronously();

    if (registerUser) {
      await Factory.registerUserToApplication({
        application: application,
        email: email,
        password: password,
      });
    }

    return {
      application,
      email,
      password
    };
  }

  it('sets preference', async function () {
    const { application } = await setupApplication();
    await application.setPreference('editorLeft', 300);
    expect(application.getPreference('editorLeft')).toBe(300);
  });

  it('saves preference', async function () {
    let { application, email, password } = await setupApplication(true);
    await application.setPreference('editorLeft', 300);
    await application.sync();
    application = await Factory.signOutAndBackIn(
      application,
      email,
      password
    );
    const editorLeft = application.getPreference('editorLeft');
    expect(editorLeft).toBe(300);
  }, 10000);

  it('clears preferences on signout', async function () {
    let { application } = await setupApplication(true);
    await application.setPreference('editorLeft', 300);
    await application.sync();
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    expect(application.getPreference('editorLeft')).toBeUndefined();
  });

  it('returns default value for non-existent preference', async function () {
    const { application } = await setupApplication(true);
    const editorLeft = application.getPreference('editorLeft', 100);
    expect(editorLeft).toBe(100);
  });

  it('emits an event when preferences change', async function () {
    const { application, email, password } = await setupApplication();
    let callTimes = 0;
    application.addEventObserver(() => {
      callTimes++;
    }, ApplicationEvent.PreferencesChanged);
    callTimes += 1;
    await Factory.sleep(0); /** Await next tick */
    expect(callTimes).toBe(1); /** App start */
    await Factory.registerUserToApplication({
      application: application,
      email: email,
      password: password,
    });
    await application.setPreference('editorLeft', 300);
    expect(callTimes).toBe(2);
  });

  it('discards existing preferences when signing in', async function () {
    let { application, email, password } = await setupApplication(true);
    await application.setPreference('editorLeft', 300);
    await application.sync();
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    await application.setPreference('editorLeft', 200);
    await application.signIn(email, password);
    await application.sync({ awaitAll: true });
    const editorLeft = application.getPreference('editorLeft');
    expect(editorLeft).toBe(300);
  });

  it.skip('reads stored preferences on start without waiting for syncing to complete', async function () {
    const prefKey = 'editorLeft';
    const prefValue = 300;
    const identifier = application.identifier;

    await register();
    await application.setPreference(prefKey, prefValue);
    await application.sync();

    application.deinit();

    application = Factory.createApplication(identifier);
    const willSyncPromise = new Promise((resolve) => {
      application.addEventObserver(resolve, ApplicationEvent.WillSync);
    });
    Factory.initializeApplication(application);
    await willSyncPromise;

    expect(application.preferencesService.preferences).toBeDefined();
    expect(application.getPreference(prefKey)).toBe(prefValue);
  });
});
