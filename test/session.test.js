/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('server session', () => {
  const BASE_ITEM_COUNT = 1; /** Default items key */

  const syncOptions = {
    checkIntegrity: true,
    awaitAll: true
  };

  before(async function () {
    localStorage.clear();
  });

  after(async function () {
    this.application.deinit();
    this.application = null;
    localStorage.clear();
  });

  beforeEach(async function () {
    this.timeout(Factory.TestTimeout);
    this.expectedItemCount = BASE_ITEM_COUNT;
    this.application = await Factory.createInitAppWithRandNamespace();
    this.email = Uuid.GenerateUuidSynchronously();
    this.password = Uuid.GenerateUuidSynchronously();
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password
    });
  });

  async function sleepUntilSessionExpires(application, basedOnAccessToken = true) {
    const currentSession = application.apiService.getSession();
    const timestamp = basedOnAccessToken ? currentSession.expireAt : currentSession.validUntil;
    const timeRemaining = (timestamp - Date.now()) / 1000; // in ms
    /* 
      If the token has not expired yet, we will return the remaining time.
      Else, there's no need to add a delay.
    */
    const sleepTime = timeRemaining > 0 ? timeRemaining : 0;
    await Factory.sleep(sleepTime);
  }

  async function getSessionFromStorage(application) {
    return application.storageService.getValue(StorageKey.Session);
  }

  it('should fail when a sync request is perfomed with an expired access token', async function () {
    await sleepUntilSessionExpires(this.application);

    const response = await this.application.apiService.sync([]);

    expect(response.status).to.equal(498);
    expect(response.error.tag).to.equal('expired-access-token');
    expect(response.error.message).to.equal('The provided access token has expired.');
  }).timeout(20000);

  it('should return the new session in the response when refreshed', async function () {
    const response = await this.application.apiService.refreshSession();

    expect(response.status).to.equal(200);
    expect(response.token).to.be.a('string');
    expect(response.token).to.not.be.empty;
    expect(response.session.expire_at).to.be.a('number');
    expect(response.session.refresh_token).to.not.be.empty;
  }).timeout(20000);

  it('should be refreshed if access token is expired', async function () {
    // Saving the current session information for later...
    const sessionBeforeSync = this.application.apiService.getSession();

    // Waiting enough time for the access token to expire, before performing a new sync request.
    await sleepUntilSessionExpires(this.application);

    // Performing a sync request with an expired access token.
    await this.application.sync(syncOptions);

    // After the above sync request is completed, we obtain the session information.
    const sessionAfterSync = this.application.apiService.getSession();

    expect(sessionBeforeSync).to.not.equal(sessionAfterSync);
    expect(sessionBeforeSync.accessToken).to.not.equal(sessionAfterSync.accessToken);
    expect(sessionBeforeSync.refreshToken).to.not.equal(sessionAfterSync.refreshToken);
    expect(sessionBeforeSync.expireAt).to.be.lessThan(sessionAfterSync.expireAt);
    // New token should expire in the future.
    expect(sessionAfterSync.expireAt).to.be.greaterThan(Date.now());
  }).timeout(20000);

  it('should be consistent between storage and apiService', async function () {
    const sessionFromStorage = await getSessionFromStorage(this.application);
    const sessionFromApiService = this.application.apiService.getSession();

    expect(sessionFromStorage).to.equal(sessionFromApiService);

    await this.application.apiService.refreshSession();

    const updatedSessionFromStorage = await getSessionFromStorage(this.application);
    const updatedSessionFromApiService = this.application.apiService.getSession();

    expect(updatedSessionFromStorage).to.equal(updatedSessionFromApiService);
  });

  it(' should be performed successfully and terminate session with a valid access token', async function () {
    const signOutResponse = await this.application.apiService.signOut();
    expect(signOutResponse.status).to.equal(204);

    const syncResponse = await this.application.apiService.sync([]);
    expect(syncResponse.status).to.equal(401);
    expect(syncResponse.error.tag).to.equal('invalid-auth');
    expect(syncResponse.error.message).to.equal('Invalid login credentials.');
  }).timeout(20000);

  it('sign out request should be performed successfully and terminate session with expired access token', async function () {
    // Waiting enough time for the access token to expire, before performing a sign out request.
    await sleepUntilSessionExpires(this.application);

    const signOutResponse = await this.application.apiService.signOut();
    expect(signOutResponse.status).to.equal(204);

    const syncResponse = await this.application.apiService.sync([]);
    expect(syncResponse.status).to.equal(401);
    expect(syncResponse.error.tag).to.equal('invalid-auth');
    expect(syncResponse.error.message).to.equal('Invalid login credentials.');
  }).timeout(20000);

  describe('change password request', async function () {
    beforeEach(async function () {
      this.newPassword = Factory.randomString();
    });

    it('should be successful with a valid access token', async function () {
      const changePasswordResponse = await this.application.changePassword(
        this.password,
        this.newPassword
      );

      expect(changePasswordResponse.status).to.equal(200);
      expect(changePasswordResponse.user).to.be.ok;

      const loginResponse = await Factory.loginToApplication({
        application: this.application,
        email: this.email,
        password: this.newPassword // Using our new password.
      });

      expect(loginResponse).to.be.ok;
      expect(loginResponse.status).to.be.equal(200);

      this.password = this.newPassword;
    }).timeout(20000);

    describe('', async function () {
      afterEach(async function () {
        this.timeout(15000);
  
        // We will sign in to check that the password was not changed.
        const loginResponse = await Factory.loginToApplication({
          application: this.application,
          email: this.email,
          password: this.newPassword
        });
  
        expect(loginResponse).to.be.ok;
        expect(loginResponse.status).to.be.equal(401);
      });

      it('should fail with expired access token', async function () {
        // Waiting enough time for the access token to expire, before performing a sign out request.
        await sleepUntilSessionExpires(this.application);

        const changePasswordResponse = await this.application.changePassword(
          this.password,
          this.newPassword
        );

        expect(changePasswordResponse.status).to.equal(498);
        expect(changePasswordResponse.error.tag).to.equal('expired-access-token');
        expect(changePasswordResponse.error.message).to.equal('The provided access token has expired.');
      }).timeout(20000);

      it('should fail with invalid access token', async function () {
        const fakeSession = this.application.apiService.getSession();
        fakeSession.accessToken = 'this-is-a-fake-token-1234';

        const changePasswordResponse = await this.application.changePassword(
          this.password,
          this.newPassword
        );

        expect(changePasswordResponse.status).to.equal(401);
        expect(changePasswordResponse.error.tag).to.equal('invalid-auth');
        expect(changePasswordResponse.error.message).to.equal('Invalid login credentials.');
      }).timeout(20000);
    });
  });

  it('should sign in successfully after signing out', async function () {
    await this.application.apiService.signOut();

    await Factory.loginToApplication({
      application: this.application,
      email: this.email,
      password: this.password
    });

    const currentSession = this.application.apiService.getSession();

    expect(currentSession).to.be.ok;
    expect(currentSession.accessToken).to.be.ok;
    expect(currentSession.refreshToken).to.be.ok;
    expect(currentSession.expireAt).to.be.greaterThan(Date.now());
  }).timeout(20000);

  it('should fail when renewing a session with an expired refresh token', async function () {
    await sleepUntilSessionExpires(this.application, false);

    const refreshSessionResponse = await this.application.apiService.refreshSession();

    expect(refreshSessionResponse.status).to.equal(400);
    expect(refreshSessionResponse.error.tag).to.equal('expired-refresh-token');
    expect(refreshSessionResponse.error.message).to.equal('The refresh token has expired.');

    /*
      The access token and refresh token should be expired up to this point.
      Here we make sure that any subsequent requests will fail.
    */
    const syncResponse = await this.application.apiService.sync([]);
    expect(syncResponse.status).to.equal(401);
    expect(syncResponse.error.tag).to.equal('invalid-auth');
    expect(syncResponse.error.message).to.equal('Invalid login credentials.');
  }).timeout(20000);

  it('should fail when renewing a session with an invalid refresh token', async function () {
    const fakeSession = this.application.apiService.getSession();
    fakeSession.refreshToken = 'this-is-a-fake-token-1234';

    await this.application.apiService.setSession(fakeSession, true);

    const refreshSessionResponse = await this.application.apiService.refreshSession();

    expect(refreshSessionResponse.status).to.equal(400);
    expect(refreshSessionResponse.error.tag).to.equal('invalid-parameters');
    expect(refreshSessionResponse.error.message).to.equal('The provided parameters are not valid.');

    // Access token should remain valid.
    const syncResponse = await this.application.apiService.sync([]);
    expect(syncResponse.status).to.equal(200);
  }).timeout(20000);

  it('should fail if syncing while a refresh token is in progress', async function () {
    this.application.apiService.refreshSession();
    const syncResponse = await this.application.apiService.sync([]);

    expect(syncResponse.error).to.be.ok;

    const errorMessage = 'Your account session is being renewed with the server. Please try your request again.';
    expect(syncResponse.error.message).to.be.equal(errorMessage);
  }).timeout(20000);
});
