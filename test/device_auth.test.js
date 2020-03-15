/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('device authentication', () => {

  before(async () => {
    localStorage.clear();
  });

  after(async () => {
    localStorage.clear();
  });

  it('handles application launch with passcode only', async function() {
    const namespace = Factory.randomString();
    const application = await Factory.createAndInitializeApplication(namespace);
    const passcode = 'foobar';
    const wrongPasscode = 'barfoo';
    expect((await application.deviceAuthService.getLaunchChallenges()).length).to.equal(0);
    await application.setPasscode(passcode);
    expect(await application.hasPasscode()).to.equal(true);
    expect((await application.deviceAuthService.getLaunchChallenges()).length).to.equal(1);
    expect(application.keyManager.keyMode).to.equal(KEY_MODE_WRAPPER_ONLY);
    await application.deinit();

    /** Recreate application and initialize */
    const tmpApplication = await Factory.createApplication(namespace);
    let numPasscodeAttempts = 0;
    const handleChallenges = async (challenges) => {
      const responses = [];
      for(const challenge of challenges) {
        if(challenge === Challenges.LocalPasscode) {
          const value = numPasscodeAttempts < 2 ? wrongPasscode : passcode;
          const response = new ChallengeResponse(challenge, value);
          responses.push(response);
          numPasscodeAttempts++;
        }
      }
      return responses;
    };
    await tmpApplication.prepareForLaunch({
      callbacks: {
        requiresChallengeResponses: handleChallenges,
        handleFailedChallengeResponses: () => {}
      }
    });
    expect(await tmpApplication.keyManager.getRootKey()).to.not.be.ok;
    await tmpApplication.launch({ awaitDatabaseLoad: true });
    expect(await tmpApplication.keyManager.getRootKey()).to.be.ok;
    expect(tmpApplication.keyManager.keyMode).to.equal(KEY_MODE_WRAPPER_ONLY);
    await tmpApplication.deinit();
  }).timeout(10000);

  it('handles application launch with passcode and biometrics', async function() {
    const namespace = Factory.randomString();
    const application = await Factory.createAndInitializeApplication(namespace);
    const passcode = 'foobar';
    const wrongPasscode = 'barfoo';
    await application.setPasscode(passcode);
    await application.deviceAuthService.enableBiometrics();
    expect(await application.hasPasscode()).to.equal(true);
    expect((await application.deviceAuthService.getLaunchChallenges()).length).to.equal(2);
    expect(application.keyManager.keyMode).to.equal(KEY_MODE_WRAPPER_ONLY);
    await application.deinit();

    /** Recreate application and initialize */
    const tmpApplication = await Factory.createApplication(namespace);
    let numPasscodeAttempts = 0;
    const handleChallenges = async (challenges) => {
      const responses = [];
      for(const challenge of challenges) {
        if(challenge === Challenges.LocalPasscode) {
          const value = numPasscodeAttempts < 2 ? wrongPasscode : passcode;
          const response = new ChallengeResponse(challenge, value);
          responses.push(response);
          numPasscodeAttempts++;
        } else if(challenge === Challenges.Biometric) {
          responses.push(new ChallengeResponse({
            challenge: challenge,
            value: true
          }));
        }
      }
      return responses;
    };
    await tmpApplication.prepareForLaunch({
      callbacks: {
        requiresChallengeResponses: handleChallenges,
        handleFailedChallengeResponses: () => { }
      }
    });
    expect(await tmpApplication.keyManager.getRootKey()).to.not.be.ok;
    expect((await tmpApplication.deviceAuthService.getLaunchChallenges()).length).to.equal(2);
    await tmpApplication.launch({ awaitDatabaseLoad: true });
    expect(await tmpApplication.keyManager.getRootKey()).to.be.ok;
    expect(tmpApplication.keyManager.keyMode).to.equal(KEY_MODE_WRAPPER_ONLY);
    tmpApplication.deinit();
  }).timeout(10000);

  it('handles application launch with passcode and account', async function() {
    const namespace = Factory.randomString();
    const application = await Factory.createAndInitializeApplication(namespace);
    const email = Uuid.GenerateUuidSynchronously();
    const password = Uuid.GenerateUuidSynchronously();
    await Factory.registerUserToApplication({
      application: application,
      email, password
    });
    const sampleStorageKey = 'foo';
    const sampleStorageValue = 'bar';
    await application.storageService.setValue(sampleStorageKey, sampleStorageValue);
    expect(application.keyManager.keyMode).to.equal(KEY_MODE_ROOT_KEY_ONLY);
    const passcode = 'foobar';
    await application.setPasscode(passcode);
    expect(application.keyManager.keyMode).to.equal(KEY_MODE_ROOT_KEY_PLUS_WRAPPER);
    expect(
      await application.hasPasscode()
    ).to.equal(true);
    await application.deinit();

    /** Recreate application and initialize */
    const tmpApplication = await Factory.createApplication(namespace);
    const handleChallenges = async (challenges) => {
      const responses = [];
      for(const challenge of challenges) {
        if(challenge === Challenges.LocalPasscode) {
          const value = passcode;
          const response = new ChallengeResponse(challenge, value);
          responses.push(response);
        }
      }
      return responses;
    };
    await tmpApplication.prepareForLaunch({
      callbacks: {
        requiresChallengeResponses: handleChallenges,
        handleFailedChallengeResponses: () => { }
      }
    });
    expect(await tmpApplication.keyManager.getRootKey()).to.not.be.ok;
    await tmpApplication.launch({ awaitDatabaseLoad: true });
    expect(
      await tmpApplication.storageService.getValue(sampleStorageKey)
    ).to.equal(sampleStorageValue);
    expect(await tmpApplication.keyManager.getRootKey()).to.be.ok;
    expect(tmpApplication.keyManager.keyMode).to.equal(KEY_MODE_ROOT_KEY_PLUS_WRAPPER);
    tmpApplication.deinit();
  }).timeout(10000);
});
