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
    this.signOut = async () => {
      this.application = await Factory.signOutApplicationAndReturnNew(this.application);
    };
    this.signIn = async () => {
      await this.application.signIn(
        this.email,
        this.password,
        undefined, undefined, undefined, undefined, undefined,
        true
      );
    };
  });

  afterEach(async function () {
    expect(this.application.syncService.isOutOfSync()).to.equal(false);
    const items = this.application.itemManager.items;
    expect(items.length).to.equal(this.expectedItemCount);
    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(this.expectedItemCount);
    await this.application.deinit();
  });

  it.only('should be refreshed if access token is expired', async function () {
    this.application = await Factory.signOutApplicationAndReturnNew(this.application);

    const promise = Factory.loginToApplication({
      application: this.application,
      email: this.email,
      password: this.password
    });
    await promise;

    // Saving the current session information for later...
    const sessionBeforeSync = this.application.apiService.session;

    // Waiting enough time for the access token to expire, before performing a new sync request.
    await Factory.sleep(3);

    // Performing a sync request with an expired access token.
    const sync = this.application.sync(syncOptions);
    await sync;

    // After the above sync request is completed, we obtain the session information.
    const sessionAfterSync = this.application.apiService.session;

    expect(sessionBeforeSync).to.not.equal(sessionAfterSync);
    expect(sessionBeforeSync.accessToken).to.not.equal(sessionAfterSync.accessToken);
    expect(sessionBeforeSync.refreshToken).to.not.equal(sessionAfterSync.refreshToken);
    expect(sessionBeforeSync.expireAt).to.be.lessThan(sessionAfterSync.expireAt);
  }).timeout(20000);
});
