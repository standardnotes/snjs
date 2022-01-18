/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('2022-01-18 web native folders migration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('migration with flat tag folders', async function () {
    const application = await prepareApp();

    // Save a few tags
    const titles = ['a', 'b', 'c'];

    const createTag = (title) => {
      return Factory.createMappedTag(application, title);
    };

    const tags = await Promise.all(titles.map(createTag));

    // Run the migration
    await runMigrationAndWaitForLaunch(application);
    expect(application.sessionManager.online()).to.equal(true);

    // Check new tags
    expect(application.itemManager.tags.length).lessThanOrEqual(3);

    await Factory.safeDeinit(application);
  }).timeout(15000);
});

const prepareApp = async () => {
  const application = await Factory.createAppWithRandNamespace();
  /** Create legacy migrations value so that base migration detects old app */
  await application.deviceInterface.setRawStorageValue(
    'migrations',
    JSON.stringify(['anything'])
  );
  return application;
};

const runMigrationAndWaitForLaunch = async (application) => {
  await application.prepareForLaunch({
    receiveChallenge: async (challenge) => {
      application.submitValuesForChallenge(challenge, [
        new ChallengeValue(challenge.prompts[0], passcode),
      ]);
    },
  });

  await application.launch(true);
};
