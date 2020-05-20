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

  afterEach(async function () {
    expect(this.application.syncService.isOutOfSync()).to.equal(false);
    const items = this.application.itemManager.items;
    expect(items.length).to.equal(this.expectedItemCount);
    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(this.expectedItemCount);
    await this.application.deinit();
  });

  async function sleepUntilSessionExpires(currentSession) {
    const tokenExpireAt = currentSession.expireAt;
    const timeRemaining = Math.ceil(tokenExpireAt - Date.now() / 1000);
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
    const currentSession = this.application.apiService.getSession();
    await sleepUntilSessionExpires(currentSession);

    const response = await this.application.apiService.sync([]);

    expect(response.status).to.equal(498);
    expect(response.error.tag).to.equal('expired-access-token');
    expect(response.error.message).to.equal('The provided access token has expired.');
  }).timeout(10000);

  it('should return the new session in the response when refreshed', async function () {
    const response = await this.application.apiService.refreshSession();

    expect(response.status).to.equal(200);
    expect(response.token).to.be.a('string');
    expect(response.token).to.not.be.empty;
    expect(response.session.expire_at).to.be.a('number');
    expect(response.session.refresh_token).to.not.be.empty;
  }).timeout(10000);

  it('should be refreshed if access token is expired', async function () {
    // Saving the current session information for later...
    const sessionBeforeSync = this.application.apiService.getSession();

    // Waiting enough time for the access token to expire, before performing a new sync request.
    await sleepUntilSessionExpires(sessionBeforeSync);

    // Performing a sync request with an expired access token.
    await this.application.sync(syncOptions);

    // After the above sync request is completed, we obtain the session information.
    const sessionAfterSync = this.application.apiService.getSession();

    expect(sessionBeforeSync).to.not.equal(sessionAfterSync);
    expect(sessionBeforeSync.accessToken).to.not.equal(sessionAfterSync.accessToken);
    expect(sessionBeforeSync.refreshToken).to.not.equal(sessionAfterSync.refreshToken);
    expect(sessionBeforeSync.expireAt).to.be.lessThan(sessionAfterSync.expireAt);
    expect(Date.now()).to.be.greaterThan(sessionAfterSync.expireAt);
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

  describe('with expired access token', async function () {
    describe('sign out request', async function () {
      it('should be performed successfully and terminate session', async function () {
        const sessionBeforeSignOut = this.application.apiService.getSession();

        // Waiting enough time for the access token to expire, before performing a sign out request.
        await sleepUntilSessionExpires(sessionBeforeSignOut);
  
        const signOutResponse = await this.application.apiService.signOut();
  
        expect(signOutResponse.status).to.equal(204);

        const syncResponse = await this.application.apiService.sync([]);
  
        expect(syncResponse.status).to.equal(401);
        expect(syncResponse.error.tag).to.equal('invalid-auth');
        expect(syncResponse.error.message).to.equal('Invalid login credentials.');
      }).timeout(10000);
    });
  });

  it('should sign out successfully with a valid access token', async function () {
    // Waiting enough time for the access token to expire, before performing a sign out request.
    await sleepUntilSessionExpires(sessionBeforeSync);
    const signOutResponse = await this.application.apiService.signOut();

    expect(signOutResponse.status).to.equal(204);
  }).timeout(20000);
});
