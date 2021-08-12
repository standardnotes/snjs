import { ApplicationEvent } from '@Lib/events';
import * as Factory from '../factory';

describe('preferences', function () {
  it('sets preference', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext();
    await application.setPreference('editorLeft', 300);
    expect(application.getPreference('editorLeft')).toBe(300);
    application.deinit();
  });

  it('saves preference', async function () {
    let { application, email, password } = await Factory.createAndInitSimpleAppContext({ registerUser: true });
    await application.setPreference('editorLeft', 300);
    await application.sync();
    application = await Factory.signOutAndBackIn(
      application,
      email,
      password
    );
    const editorLeft = application.getPreference('editorLeft');
    expect(editorLeft).toBe(300);
    application.deinit();
  }, 10000);

  it('clears preferences on signout', async function () {
    let { application } = await Factory.createAndInitSimpleAppContext({ registerUser: true });
    await application.setPreference('editorLeft', 300);
    await application.sync();
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    expect(application.getPreference('editorLeft')).toBeUndefined();
    application.deinit();
  });

  it('returns default value for non-existent preference', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext({ registerUser: true });
    const editorLeft = application.getPreference('editorLeft', 100);
    expect(editorLeft).toBe(100);
    application.deinit();
  });

  it('emits an event when preferences change', async function () {
    const { application, email, password } = await Factory.createAndInitSimpleAppContext();
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
    application.deinit();
  });

  it('discards existing preferences when signing in', async function () {
    let { application, email, password } = await Factory.createAndInitSimpleAppContext({ registerUser: true });
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
    application.deinit();
  }, 10000);

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
    application.deinit();
  });
});
