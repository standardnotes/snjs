import { ChallengeValue, ChallengeValidation } from '@Lib/challenges';
import { StorageKey } from '@Lib/storage_keys';
import { Uuid } from '@Lib/uuid';
import * as Factory from '../factory';
import DeviceInterface from './../setup/snjs/deviceInterface';

describe('server session', function () {
  jest.setTimeout(Factory.TestTimeout);

  const BASE_ITEM_COUNT = 2; /** Default items key, user preferences */

  const syncOptions = {
    checkIntegrity: true,
    awaitAll: true,
  };

  async function sleepUntilSessionExpires(
    application,
    basedOnAccessToken = true
  ) {
    const currentSession = application.apiService.session;
    const timestamp = basedOnAccessToken
      ? currentSession.accessExpiration
      : currentSession.refreshExpiration;
    const timeRemaining = (timestamp - Date.now()) / 1000; // in ms
    /*
      If the token has not expired yet, we will return the remaining time.
      Else, there's no need to add a delay.
    */
    const sleepTime =
      timeRemaining > 0 ? timeRemaining + 1 /** Safety margin */ : 0;
    await Factory.sleep(sleepTime);
  }

  async function getSessionFromStorage(application) {
    return application.storageService.getValue(StorageKey.Session);
  }

  it('should succeed when a sync request is perfomed with an expired access token', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext({
      registerUser: true
    });
    await sleepUntilSessionExpires(application);

    const response = await application.apiService.sync([]);

    expect(response.status).toBe(200);
    await Factory.safeDeinit(application);
  }, Factory.LongTestTimeout);

  it('should return the new session in the response when refreshed', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext({
      registerUser: true
    });
    const response = await application.apiService.refreshSession();

    expect(response.status).toBe(200);
    expect(typeof response.data.session.access_token).toBe('string');
    expect(response.data.session.access_token).not.toHaveLength(0);
    expect(typeof response.data.session.refresh_expiration).toBe('number');
    expect(response.data.session.refresh_token).not.toHaveLength(0);
    await Factory.safeDeinit(application);
  });

  it('should be refreshed on any api call if access token is expired', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext({
      registerUser: true
    });
    // Saving the current session information for later...
    const sessionBeforeSync = application.apiService.getSession();

    // Waiting enough time for the access token to expire, before performing a new sync request.
    await sleepUntilSessionExpires(application);

    // Performing a sync request with an expired access token.
    await application.sync(syncOptions);

    // After the above sync request is completed, we obtain the session information.
    const sessionAfterSync = application.apiService.getSession();

    expect(sessionBeforeSync).not.toBe(sessionAfterSync);
    expect(sessionBeforeSync.accessToken).not.toBe(sessionAfterSync.accessToken);
    expect(sessionBeforeSync.refreshToken).not.toBe(sessionAfterSync.refreshToken);
    expect(sessionBeforeSync.accessExpiration).toBeLessThan(sessionAfterSync.accessExpiration);
    // New token should expire in the future.
    expect(sessionAfterSync.accessExpiration).toBeGreaterThan(Date.now());
    await Factory.safeDeinit(application);
  }, Factory.LongTestTimeout);

  it('should succeed when a sync request is perfomed after signing into an ephemeral session', async function () {
    let { application, email, password } = await Factory.createAndInitSimpleAppContext({
      registerUser: true
    });
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );

    await application.signIn(email, password, false, true);

    const response = await application.apiService.sync([]);
    expect(response.status).toBe(200);
    await Factory.safeDeinit(application);
  });

  it('should succeed when a sync request is perfomed after registering into an ephemeral session', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext({
      registerUser: true
    });
    const response = await application.apiService.sync([]);
    expect(response.status).toBe(200);
    await Factory.safeDeinit(application);
  });

  it('should be consistent between storage and apiService', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext({
      registerUser: true
    });
    const sessionFromStorage = await getSessionFromStorage(application);
    const sessionFromApiService = application.apiService.getSession();

    expect(sessionFromStorage).toBe(sessionFromApiService);

    await application.apiService.refreshSession();

    const updatedSessionFromStorage = await getSessionFromStorage(
      application
    );
    const updatedSessionFromApiService = application.apiService.getSession();

    expect(updatedSessionFromStorage).toBe(updatedSessionFromApiService);
    await Factory.safeDeinit(application);
  });

  it('should be performed successfully and terminate session with a valid access token', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext({
      registerUser: true
    });
    const signOutResponse = await application.apiService.signOut();
    expect(signOutResponse.status).toBe(204);

    Factory.ignoreChallenges(application);
    const syncResponse = await application.apiService.sync([]);
    expect(syncResponse.status).toBe(401);
    expect(syncResponse.error.tag).toBe('invalid-auth');
    expect(syncResponse.error.message).toBe('Invalid login credentials.');
    await Factory.safeDeinit(application);
  });

  it('sign out request should be performed successfully and terminate session with expired access token', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext({
      registerUser: true
    });
    // Waiting enough time for the access token to expire, before performing a sign out request.
    await sleepUntilSessionExpires(application);

    const signOutResponse = await application.apiService.signOut();
    expect(signOutResponse.status).toBe(204);

    Factory.ignoreChallenges(application);
    const syncResponse = await application.apiService.sync([]);
    expect(syncResponse.status).toBe(401);
    expect(syncResponse.error.tag).toBe('invalid-auth');
    expect(syncResponse.error.message).toBe('Invalid login credentials.');
    await Factory.safeDeinit(application);
  }, Factory.LongTestTimeout);

  it('change email request should be successful with a valid access token', async function () {
    let { application, password } = await Factory.createAndInitSimpleAppContext({
      registerUser: true
    });
    const newEmail = Uuid.GenerateUuidSynchronously();
    const changeEmailResponse = await application.changeEmail(
      newEmail,
      password
    );

    expect(changeEmailResponse.status).toBe(200);
    expect(changeEmailResponse.data.user).toBeTruthy();

    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    const loginResponse = await Factory.loginToApplication({
      application: application,
      email: newEmail,
      password: password,
    });

    expect(loginResponse).toBeTruthy();
    expect(loginResponse.status).toBe(200);
    await Factory.safeDeinit(application);
  }, Factory.LongTestTimeout);

  it('change email request should fail with an invalid access token', async function () {
    let { application, password } = await Factory.createAndInitSimpleAppContext({
      registerUser: true
    });
    const fakeSession = application.apiService.getSession();
    fakeSession.accessToken = 'this-is-a-fake-token-1234';
    Factory.ignoreChallenges(application);
    const newEmail = Uuid.GenerateUuidSynchronously();
    const changeEmailResponse = await application.changeEmail(
      newEmail,
      password
    );
    expect(changeEmailResponse.error.message).toBe('Invalid login credentials.');

    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    const loginResponse = await Factory.loginToApplication({
      application: application,
      email: newEmail,
      password,
    });

    expect(loginResponse).toBeTruthy();
    expect(loginResponse.status).toBe(401);
    await Factory.safeDeinit(application);
  });

  it('change email request should fail with an expired refresh token', async function () {
    let { application, email, password } = await Factory.createAndInitSimpleAppContext({
      registerUser: true
    });
    /** Waiting for the refresh token to expire. */
    await sleepUntilSessionExpires(application, false);

    Factory.ignoreChallenges(application);
    const newEmail = Uuid.GenerateUuidSynchronously();
    const changeEmailResponse = await application.changeEmail(
      newEmail,
      password
    );

    expect(changeEmailResponse).toBeTruthy();
    expect(changeEmailResponse.error.message).toBe('Invalid login credentials.');

    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    const loginResponseWithNewEmail = await Factory.loginToApplication({
      application: application,
      email: newEmail,
      password,
    });

    expect(loginResponseWithNewEmail).toBeTruthy();
    expect(loginResponseWithNewEmail.status).toBe(401);

    const loginResponseWithOldEmail = await Factory.loginToApplication({
      application: application,
      email: email,
      password: password,
    });

    expect(loginResponseWithOldEmail).toBeTruthy();
    expect(loginResponseWithOldEmail.status).toBe(200);
    await Factory.safeDeinit(application);
  }, Factory.LongTestTimeout);

  it('change password request should be successful with a valid access token', async function () {
    let { application, email, password, newPassword } = await Factory.createAndInitSimpleAppContext({
      registerUser: true
    });
    const changePasswordResponse = await application.changePassword(
      password,
      newPassword
    );

    expect(changePasswordResponse.status).toBe(200);
    expect(changePasswordResponse.data.user).toBeTruthy();

    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    const loginResponse = await Factory.loginToApplication({
      application: application,
      email: email,
      password: newPassword,
    });

    expect(loginResponse).toBeTruthy();
    expect(loginResponse.status).toBe(200);
    await Factory.safeDeinit(application);
  }, Factory.LongTestTimeout);

  it.skip('change password request should be successful after the expired access token is refreshed', async function () {
    timeout(Factory.LongTestTimeout);

    await Factory.registerUserToApplication({
      application: application,
      email: email,
      password: password,
    });

    // Waiting enough time for the access token to expire.
    await sleepUntilSessionExpires(application);

    const changePasswordResponse = await application.changePassword(
      password,
      newPassword
    );

    expect(changePasswordResponse).toBeTruthy();
    expect(changePasswordResponse.status).toBe(200);

    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    const loginResponse = await Factory.loginToApplication({
      application: application,
      email: email,
      password: newPassword,
    });

    expect(loginResponse).toBeTruthy();
    expect(loginResponse.status).toBe(200);
  });

  it('change password request should fail with an invalid access token', async function () {
    let { application, email, password, newPassword } = await Factory.createAndInitSimpleAppContext({
      registerUser: true
    });
    const fakeSession = application.apiService.getSession();
    fakeSession.accessToken = 'this-is-a-fake-token-1234';
    Factory.ignoreChallenges(application);
    const changePasswordResponse = await application.changePassword(
      password,
      newPassword
    );
    expect(changePasswordResponse.error.message).toBe('Invalid login credentials.');

    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    const loginResponse = await Factory.loginToApplication({
      application: application,
      email: email,
      password: newPassword,
    });

    expect(loginResponse).toBeTruthy();
    expect(loginResponse.status).toBe(401);
    await Factory.safeDeinit(application);
  });

  it('change password request should fail with an expired refresh token', async function () {
    let { application, email, password, newPassword } = await Factory.createAndInitSimpleAppContext({
      registerUser: true
    });
    /** Waiting for the refresh token to expire. */
    await sleepUntilSessionExpires(application, false);

    Factory.ignoreChallenges(application);
    const changePasswordResponse = await application.changePassword(
      password,
      newPassword
    );

    expect(changePasswordResponse).toBeTruthy();
    expect(changePasswordResponse.error.message).toBe('Invalid login credentials.');

    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    const loginResponseWithNewPassword = await Factory.loginToApplication({
      application: application,
      email: email,
      password: newPassword,
    });

    expect(loginResponseWithNewPassword).toBeTruthy();
    expect(loginResponseWithNewPassword.status).toBe(401);

    const loginResponseWithOldPassword = await Factory.loginToApplication({
      application: application,
      email: email,
      password: password,
    });

    expect(loginResponseWithOldPassword).toBeTruthy();
    expect(loginResponseWithOldPassword.status).toBe(200);
    await Factory.safeDeinit(application);
  }, Factory.LongTestTimeout);

  it('should sign in successfully after signing out', async function () {
    const { application, email, password } = await Factory.createAndInitSimpleAppContext({
      registerUser: true
    });
    await application.apiService.signOut();
    application.apiService.session = undefined;

    await application.sessionManager.signIn(email, password);

    const currentSession = application.apiService.getSession();

    expect(currentSession).toBeTruthy();
    expect(currentSession.accessToken).toBeTruthy();
    expect(currentSession.refreshToken).toBeTruthy();
    expect(currentSession.accessExpiration).toBeGreaterThan(Date.now());
    await Factory.safeDeinit(application);
  });

  it('should fail when renewing a session with an expired refresh token', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext({
      registerUser: true
    });
    await sleepUntilSessionExpires(application, false);

    const refreshSessionResponse = await application.apiService.refreshSession();

    expect(refreshSessionResponse.status).toBe(400);
    expect(refreshSessionResponse.error.tag).toBe('expired-refresh-token');
    expect(refreshSessionResponse.error.message).toBe('The refresh token has expired.');

    /*
      The access token and refresh token should be expired up to this point.
      Here we make sure that any subsequent requests will fail.
    */
    Factory.ignoreChallenges(application);
    const syncResponse = await application.apiService.sync([]);
    expect(syncResponse.status).toBe(401);
    expect(syncResponse.error.tag).toBe('invalid-auth');
    expect(syncResponse.error.message).toBe('Invalid login credentials.');
    await Factory.safeDeinit(application);
  }, Factory.LongTestTimeout);

  it('should fail when renewing a session with an invalid refresh token', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext({
      registerUser: true
    });
    const fakeSession = application.apiService.getSession();
    fakeSession.refreshToken = 'this-is-a-fake-token-1234';

    await application.apiService.setSession(fakeSession, true);

    const refreshSessionResponse = await application.apiService.refreshSession();

    expect(refreshSessionResponse.status).toBe(400);
    expect(refreshSessionResponse.error.tag).toBe('invalid-refresh-token');
    expect(refreshSessionResponse.error.message).toBe('The refresh token is not valid.');

    // Access token should remain valid.
    const syncResponse = await application.apiService.sync([]);
    expect(syncResponse.status).toBe(200);
    await Factory.safeDeinit(application);
  });

  it('should fail if syncing while a session refresh is in progress', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext({
      registerUser: true
    });
    const refreshPromise = application.apiService.refreshSession();
    const syncResponse = await application.apiService.sync([]);

    expect(syncResponse.error).toBeTruthy();

    const errorMessage =
      'Your account session is being renewed with the server. Please try your request again.';
    expect(syncResponse.error.message).toBe(errorMessage);
    /** Wait for finish so that test cleans up properly */
    await refreshPromise;
    await Factory.safeDeinit(application);
  });

  it('notes should be synced as expected after refreshing a session', async function () {
    let { application, email, password } = await Factory.createAndInitSimpleAppContext({
      registerUser: true
    });
    const notesBeforeSync = await Factory.createManyMappedNotes(
      application,
      5
    );

    await sleepUntilSessionExpires(application);
    await application.syncService.sync(syncOptions);
    expect(application.syncService.isOutOfSync()).toBe(false);

    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    await application.signIn(
      email,
      password,
      undefined,
      undefined,
      undefined,
      true
    );

    const expectedNotesUuids = notesBeforeSync.map((n) => n.uuid);
    const notesResults = application.itemManager.findItems(
      expectedNotesUuids
    );

    expect(notesResults.length).toBe(notesBeforeSync.length);

    for (const aNoteBeforeSync of notesBeforeSync) {
      const noteResult = application.itemManager.findItem(
        aNoteBeforeSync.uuid
      );
      expect(aNoteBeforeSync.isItemContentEqualWith(noteResult)).toBe(true);
    }
    await Factory.safeDeinit(application);
  }, Factory.LongTestTimeout);

  it('changing password on one client should not invalidate other sessions', async function () {
    const appA = Factory.createApplication(Factory.randomString());
    await appA.prepareForLaunch({ receiveChallenge: () => {} });
    await appA.launch(true);

    const email = `${Math.random()}`;
    const password = `${Math.random()}`;

    await Factory.registerUserToApplication({
      application: appA,
      email: email,
      password: password,
    });

    /** Create simultaneous appB signed into same account */
    const appB = Factory.createApplication('another-namespace');
    await appB.prepareForLaunch({ receiveChallenge: () => {} });
    await appB.launch(true);
    await Factory.loginToApplication({
      application: appB,
      email: email,
      password: password,
    });

    /** Change password on appB */
    const newPassword = 'random';
    await appB.changePassword(password, newPassword);

    /** Create an item and sync it */
    const note = await Factory.createSyncedNote(appB);

    /** Expect appA session to still be valid */
    await appA.sync();
    expect(appA.findItem(note.uuid)).toBeTruthy();
    appA.deinit();
    appB.deinit();
  });

  it('should prompt user for account password and sign back in on invalid session', async function () {
    const email = `${Math.random()}`;
    const password = `${Math.random()}`;
    let didPromptForSignIn = false;
    const receiveChallenge = async (challenge) => {
      didPromptForSignIn = true;
      appA.submitValuesForChallenge(challenge, [
        new ChallengeValue(challenge.prompts[0], email),
        new ChallengeValue(challenge.prompts[1], password),
      ]);
    };
    const appA = Factory.createApplication(Factory.randomString());
    await appA.prepareForLaunch({ receiveChallenge });
    await appA.launch(true);

    await Factory.registerUserToApplication({
      application: appA,
      email: email,
      password: password,
    });

    const oldRootKey = appA.protocolService.getRootKey();

    /** Set the session as nonsense */
    appA.apiService.session.accessToken = 'foo';
    appA.apiService.session.refreshToken = 'bar';

    /** Perform an authenticated network request */
    await appA.sync();

    /** Allow session recovery to do its thing */
    await Factory.sleep(2.0);

    expect(didPromptForSignIn).toBe(true);
    expect(appA.apiService.session.accessToken).not.toBe('foo');
    expect(appA.apiService.session.refreshToken).not.toBe('bar');

    /** Expect that the session recovery replaces the global root key */
    const newRootKey = appA.protocolService.getRootKey();
    expect(oldRootKey).not.toBe(newRootKey);
    appA.deinit();
  });

  it('should return current session in list of sessions', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext({
      registerUser: true
    });
    const response = await application.apiService.getSessionsList();
    expect(response.data[0].current).toBe(true);
    await Factory.safeDeinit(application);
  });

  it('signing out should delete session from all list', async function () {
    const { application, email, password } = await Factory.createAndInitSimpleAppContext({
      registerUser: true
    });
    /** Create new session aside from existing one */
    const app2 = await Factory.createInitAppWithRandNamespace();
    await app2.signIn(email, password);
    await Factory.sleep(1);

    const response = await application.apiService.getSessionsList();
    expect(response.data.length).toBe(2);

    await app2.signOut();

    const response2 = await application.apiService.getSessionsList();
    expect(response2.data.length).toBe(1);
    await Factory.safeDeinit(application);
  });

  it('revoking a session should destroy local data', async function () {
    const application = await Factory.createInitAppWithRandNamespace();
    const email = Uuid.GenerateUuidSynchronously();
    const password = Uuid.GenerateUuidSynchronously();
    const app2identifier = 'app2';

    const app2 = await Factory.createAndInitializeApplication(app2identifier);
    app2.prepareForLaunch({
      receiveChallenge() {},
    });
    application.setLaunchCallback({
      receiveChallenge: (challenge) => {
        const values = challenge.prompts.map(
          (prompt) =>
            new ChallengeValue(
              prompt,
              prompt.validation === ChallengeValidation.AccountPassword
                ? password
                : 0
            )
        );
        application.submitValuesForChallenge(challenge, values);
      },
    });

    await Factory.registerUserToApplication({
      application: application,
      email: email,
      password: password,
    }),
    await app2.signIn(email, password);

    const { data: sessions } = await application.getSessions();
    const app2session = sessions.find((session) => !session.current);
    await application.revokeSession(app2session.uuid);
    void app2.sync();
    /** Wait for app2 to deinit */
    await Factory.sleep(3);
    expect(app2.dealloced).toBe(true);

    const deviceInterface = new DeviceInterface();
    const payloads = await deviceInterface.getAllRawDatabasePayloads(
      app2identifier
    );
    expect(Object.keys(payloads)).toHaveLength(0);
    await Factory.safeDeinit(application);
    app2.deinit();
  }, Factory.LongTestTimeout);

  it('signing out with invalid session token should still delete local data', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext({
      registerUser: true
    });

    const invalidSession = application.apiService.getSession();
    invalidSession.accessToken = undefined;
    invalidSession.refreshToken = undefined;

    const storageKey = application.storageService.getPersistenceKey();
    let storageValue = await application.deviceInterface.getRawStorageValue(storageKey);
    expect(storageValue).toBeTruthy();

    await application.signOut();
    storageValue = await application.deviceInterface.getRawStorageValue(storageKey);
    expect(storageValue).toBeFalsy();
    await Factory.safeDeinit(application);
  });
});
