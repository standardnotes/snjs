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

  function getDelayBeforeNextRequest(currentSession) {
    const tokenExpireAt = currentSession.expireAt;
    const timeRemaining = Math.ceil(tokenExpireAt - Date.now() / 1000);
    /* 
      If the token has not expired yet, we will return the remaining time, plus one second.
      Else, there's no need to add a delay.
    */
    return timeRemaining > 0 ? timeRemaining + 1 : 0;
  }

  async function getSessionFromStorage(application) {
    return application.storageService.getValue(StorageKey.Session);
  }

  it('should fail when a sync request is perfomed with an expired access token', async function () {
    const currentSession = this.application.apiService.session;

    const delayBeforeNextRequest = getDelayBeforeNextRequest(currentSession);
    await Factory.sleep(delayBeforeNextRequest);

    const response = await this.application.apiService.sync([]);

    expect(response).to.have.property('status');
    expect(response.status).to.equal(498);

    expect(response).to.have.property('error');

    expect(response.error).to.have.property('tag');
    expect(response.error.tag).to.equal('expired-access-token');

    expect(response.error).to.have.property('message');
    expect(response.error.message).to.equal('The provided access token has expired.');
  }).timeout(10000);

  it('should return the new session in the response when refreshed', async function () {
    const response = await this.application.apiService.refreshSession();

    expect(response).to.have.property('status');
    expect(response.status).to.equal(200);

    expect(response).to.have.property('token');
    expect(response.token).to.be.a('string');
    expect(response.token).to.not.be.empty;

    expect(response).to.have.property('session');

    expect(response.session).to.have.property('expire_at');
    expect(response.session.expire_at).to.be.a('number');

    expect(response.session).to.have.property('refresh_token');
    expect(response.session.refresh_token).to.not.be.empty;
  }).timeout(10000);

  it('should be refreshed if access token is expired', async function () {
    // Saving the current session information for later...
    const sessionBeforeSync = this.application.apiService.session;

    // Waiting enough time for the access token to expire, before performing a new sync request.
    const delayBeforeNextRequest = getDelayBeforeNextRequest(sessionBeforeSync);
    await Factory.sleep(delayBeforeNextRequest);

    // Performing a sync request with an expired access token.
    await this.application.sync(syncOptions);

    // After the above sync request is completed, we obtain the session information.
    const sessionAfterSync = this.application.apiService.session;

    expect(sessionBeforeSync).to.not.equal(sessionAfterSync);
    expect(sessionBeforeSync.accessToken).to.not.equal(sessionAfterSync.accessToken);
    expect(sessionBeforeSync.refreshToken).to.not.equal(sessionAfterSync.refreshToken);
    expect(sessionBeforeSync.expireAt).to.be.lessThan(sessionAfterSync.expireAt);
  }).timeout(20000);

  it('should keep session consistent between storage and apiService', async function () {
    const sessionFromStorage = await getSessionFromStorage(this.application);
    const sessionFromApiService = this.application.apiService.session;

    expect(sessionFromStorage).to.equal(sessionFromApiService);

    await this.application.apiService.refreshSession();

    const updatedSessionFromStorage = await getSessionFromStorage(this.application);
    const updatedSessionFromApiService = this.application.apiService.session;

    expect(updatedSessionFromStorage).to.equal(updatedSessionFromApiService);
  });
});
