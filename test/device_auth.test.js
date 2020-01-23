import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('device authentication', () => {

  before(async () => {
    localStorage.clear();
  });

  after(async () => {
    localStorage.clear();
  })

  it('handles application launch with passcode only', async function() {
    const namespace = Factory.randomString();
    const application = await Factory.createAndInitializeApplication(namespace);
    const passcode = 'foobar';
    const wrongPasscode = 'barfoo';
    expect((await application.deviceAuthService.getLaunchChallenges()).length).to.equal(0);
    await application.setPasscode(passcode);
    expect(await application.deviceAuthService.hasPasscodeEnabled()).to.equal(true);
    expect((await application.deviceAuthService.getLaunchChallenges()).length).to.equal(1);
    expect(application.keyManager.keyMode).to.equal(KEY_MODE_WRAPPER_ONLY);
    await application.deinit();

    /** Recreate application and initialize */
    const tmpApplication = await Factory.createApplication(namespace);
    let numPasscodeAttempts = 0;
    const handleChallenges = async (challenges) => {
      const responses = [];
      for(const challenge of challenges) {
        if(challenge === CHALLENGE_LOCAL_PASSCODE) {
          const value = numPasscodeAttempts < 2 ? wrongPasscode : passcode;
          const response = new DeviceAuthResponse({challenge, value});
          responses.push(response);
          numPasscodeAttempts++;
        }
      }
      return responses;
    }
    await tmpApplication.prepareForLaunch({
      callbacks: {
        authChallengeResponses: handleChallenges
      }
    });
    expect(await tmpApplication.keyManager.getRootKey()).to.not.be.ok;
    await tmpApplication.launch();
    expect(await tmpApplication.keyManager.getRootKey()).to.be.ok;
    expect(tmpApplication.keyManager.keyMode).to.equal(KEY_MODE_WRAPPER_ONLY);
  });

  it('handles application launch with passcode and biometrics', async function() {
    const namespace = Factory.randomString();
    const application = await Factory.createAndInitializeApplication(namespace);
    const passcode = 'foobar';
    const wrongPasscode = 'barfoo';
    await application.setPasscode(passcode);
    await application.deviceAuthService.enableBiometrics();
    expect(await application.deviceAuthService.hasPasscodeEnabled()).to.equal(true);
    expect((await application.deviceAuthService.getLaunchChallenges()).length).to.equal(2);
    expect(application.keyManager.keyMode).to.equal(KEY_MODE_WRAPPER_ONLY);
    await application.deinit();

    /** Recreate application and initialize */
    const tmpApplication = await Factory.createApplication(namespace);
    expect(await tmpApplication.keyManager.getRootKey()).to.not.be.ok;
    let numPasscodeAttempts = 0;
    const handleChallenges = async (challenges) => {
      const responses = [];
      for(const challenge of challenges) {
        if(challenge === CHALLENGE_LOCAL_PASSCODE) {
          const value = numPasscodeAttempts < 2 ? wrongPasscode : passcode;
          const response = new DeviceAuthResponse({challenge, value});
          responses.push(response);
          numPasscodeAttempts++;
        } else if(challenge === CHALLENGE_BIOMETRIC) {
          responses.push(new DeviceAuthResponse({
            challenge: challenge,
            value: true
          }));
        }
      }
      return responses;
    }
    await tmpApplication.prepareForLaunch({
      callbacks: {
        authChallengeResponses: handleChallenges
      }
    });
    expect((await tmpApplication.deviceAuthService.getLaunchChallenges()).length).to.equal(2);
    await tmpApplication.launch();
    expect(await tmpApplication.keyManager.getRootKey()).to.be.ok;
    expect(tmpApplication.keyManager.keyMode).to.equal(KEY_MODE_WRAPPER_ONLY);
  });

  it('handles application launch with passcode and account', async function() {
    const namespace = Factory.randomString();
    const application = await Factory.createAndInitializeApplication(namespace);
    const email = SFItem.GenerateUuidSynchronously();
    const password = SFItem.GenerateUuidSynchronously();
    await Factory.registerUserToApplication({
      application: application,
      email, password
    });
    const sampleStorageKey = 'foo';
    const sampleStorageValue = 'bar';
    await application.storageManager.setValue(sampleStorageKey, sampleStorageValue);
    expect(application.keyManager.keyMode).to.equal(KEY_MODE_ROOT_KEY_ONLY);
    const passcode = 'foobar';
    await application.setPasscode(passcode);
    expect(application.keyManager.keyMode).to.equal(KEY_MODE_ROOT_KEY_PLUS_WRAPPER);
    expect(
      await application.deviceAuthService.hasPasscodeEnabled()
    ).to.equal(true);
    await application.deinit();

    console.warn('Creating tmpApplication');

    /** Recreate application and initialize */
    const tmpApplication = await Factory.createApplication(namespace);
    const handleChallenges = async (challenges) => {
      const responses = [];
      for(const challenge of challenges) {
        if(challenge === CHALLENGE_LOCAL_PASSCODE) {
          const value = passcode;
          const response = new DeviceAuthResponse({challenge, value});
          responses.push(response);
        }
      }
      return responses;
    }
    await tmpApplication.prepareForLaunch({
      callbacks: {
        authChallengeResponses: handleChallenges
      }
    });
    expect(await tmpApplication.keyManager.getRootKey()).to.not.be.ok;
    await tmpApplication.launch();
    expect(
      await tmpApplication.storageManager.getValue(sampleStorageKey)
    ).to.equal(sampleStorageValue);
    expect(await tmpApplication.keyManager.getRootKey()).to.be.ok;
    expect(tmpApplication.keyManager.keyMode).to.equal(KEY_MODE_ROOT_KEY_PLUS_WRAPPER);
  }).timeout(5000);
})
