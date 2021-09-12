import { Platform, Environment, Uuid, SNApplication } from '@Lib/index';
import * as Factory from '../factory';

const createApp = async () =>
  Factory.createInitAppWithRandNamespace(Environment.Web, Platform.MacWeb);

const registerApp = async (snApp: SNApplication) => {
  const email = Uuid.GenerateUuidSynchronously();
  const password = Uuid.GenerateUuidSynchronously();
  const ephemeral = false;
  const mergeLocal = true;

  await snApp.register(email, password, ephemeral, mergeLocal);
  return snApp;
};

describe('mfa service', () => {
  it('generates 160 bit base32-encoded mfa secret', async () => {
    const RFC4648 = /[ABCDEFGHIJKLMNOPQRSTUVWXYZ234567]/g;

    const snApp = await createApp();
    const secret = await snApp.generateMfaSecret();
    expect(secret).toHaveLength(32);
    expect(secret.replace(RFC4648, '')).toHaveLength(0);

    Factory.safeDeinit(snApp);
  });

  it('activates mfa, checks if enabled, deactivates mfa', async () => {
    const snApp = await createApp().then(registerApp);

    expect(await snApp.isMfaActivated()).toEqual(false);

    const secret = await snApp.generateMfaSecret();
    const token = await snApp.getOtpToken(secret);

    await snApp.enableMfa(secret, token);

    expect(await snApp.isMfaActivated()).toEqual(true);

    await snApp.disableMfa();

    expect(await snApp.isMfaActivated()).toEqual(false);

    Factory.safeDeinit(snApp);
  });

  it("doesn't allow mfa for basic user", async () => {
    const snApp = await createApp().then(registerApp);
    expect(await snApp.isMfaFeatureAvailable()).toBe(false);

    Factory.safeDeinit(snApp);
  });
});
