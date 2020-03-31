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

  it('handles application launch with passcode only', async function () {
    const namespace = Factory.randomString();
    const application = await Factory.createAndInitializeApplication(namespace);
    const passcode = 'foobar';
    const wrongPasscode = 'barfoo';
    expect((await application.challengeService.getLaunchChallenge())).to.not.be.ok;
    await application.setPasscode(passcode);
    expect(await application.hasPasscode()).to.equal(true);
    expect((await application.challengeService.getLaunchChallenge())).to.be.ok;
    expect(application.protocolService.keyMode).to.equal(KeyMode.WrapperOnly);
    await application.deinit();

    /** Recreate application and initialize */
    const tmpApplication = await Factory.createApplication(namespace);
    let numPasscodeAttempts = 0;
    const promptForValuesForTypes = (types) => {
      const values = [];
      for (const type of types) {
        if (type === ChallengeType.LocalPasscode) {
          values.push(new ChallengeValue(type, numPasscodeAttempts < 2 ? wrongPasscode : passcode));
        }
      }
      return values;
    };
    const receiveChallenge = async (challenge, orchestrator) => {
      orchestrator.setCallbacks(
        undefined,
        (value) => {
          const values = promptForValuesForTypes([value.type]);
          orchestrator.submitValues(values);
          numPasscodeAttempts++;
        },
      );
      const initialValues = promptForValuesForTypes(challenge.types);
      orchestrator.submitValues(initialValues);
    };
    await tmpApplication.prepareForLaunch({ receiveChallenge });
    expect(await tmpApplication.protocolService.getRootKey()).to.not.be.ok;
    await tmpApplication.launch(true);
    expect(await tmpApplication.protocolService.getRootKey()).to.be.ok;
    expect(tmpApplication.protocolService.keyMode).to.equal(KeyMode.WrapperOnly);
    await tmpApplication.deinit();
  }).timeout(10000);

  it('handles application launch with passcode and biometrics', async function () {
    const namespace = Factory.randomString();
    const application = await Factory.createAndInitializeApplication(namespace);
    const passcode = 'foobar';
    const wrongPasscode = 'barfoo';
    await application.setPasscode(passcode);
    await application.challengeService.enableBiometrics();
    expect(await application.hasPasscode()).to.equal(true);
    expect(((await application.challengeService.getLaunchChallenge()).types.length)).to.equal(2);
    expect(application.protocolService.keyMode).to.equal(KeyMode.WrapperOnly);
    await application.deinit();

    /** Recreate application and initialize */
    const tmpApplication = await Factory.createApplication(namespace);
    let numPasscodeAttempts = 1;
    const promptForValuesForTypes = (types) => {
      const values = [];
      for (const type of types) {
        if (type === ChallengeType.LocalPasscode) {
          const response = new ChallengeValue(type, numPasscodeAttempts < 2 ? wrongPasscode : passcode);
          values.push(response);
        } else if (type === ChallengeType.Biometric) {
          values.push(new ChallengeValue(type, true));
        }
      }
      return values;
    };
    const receiveChallenge = async (challenge, orchestrator) => {
      orchestrator.setCallbacks(
        undefined,
        (value) => {
          const values = promptForValuesForTypes([value.type]);
          orchestrator.submitValues(values);
          numPasscodeAttempts++;
        },
      );
      const initialValues = promptForValuesForTypes(challenge.types);
      orchestrator.submitValues(initialValues);
    };
    await tmpApplication.prepareForLaunch({ receiveChallenge });
    expect(await tmpApplication.protocolService.getRootKey()).to.not.be.ok;
    expect(((await tmpApplication.challengeService.getLaunchChallenge()).types.length)).to.equal(2);
    await tmpApplication.launch(true);
    expect(await tmpApplication.protocolService.getRootKey()).to.be.ok;
    expect(tmpApplication.protocolService.keyMode).to.equal(KeyMode.WrapperOnly);
    tmpApplication.deinit();
  }).timeout(10000);

  it('handles application launch with passcode and account', async function () {
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
    expect(application.protocolService.keyMode).to.equal(KeyMode.RootKeyOnly);
    const passcode = 'foobar';
    await application.setPasscode(passcode);
    expect(application.protocolService.keyMode).to.equal(KeyMode.RootKeyPlusWrapper);
    expect(
      await application.hasPasscode()
    ).to.equal(true);
    await application.deinit();

    const wrongPasscode = 'barfoo';
    let numPasscodeAttempts = 1;
    /** Recreate application and initialize */
    const tmpApplication = await Factory.createApplication(namespace);
    const promptForValuesForTypes = (types) => {
      const values = [];
      for (const type of types) {
        if (type === ChallengeType.LocalPasscode) {
          values.push(new ChallengeValue(type, numPasscodeAttempts < 2 ? wrongPasscode : passcode));
        }
      }
      return values;
    };
    const receiveChallenge = async (challenge, orchestrator) => {
      orchestrator.setCallbacks(
        undefined,
        (value) => {
          const values = promptForValuesForTypes([value.type]);
          orchestrator.submitValues(values);
          numPasscodeAttempts++;
        },
      );
      const initialValues = promptForValuesForTypes(challenge.types);
      orchestrator.submitValues(initialValues);
    };
    await tmpApplication.prepareForLaunch({
      receiveChallenge: receiveChallenge,
    });
    expect(await tmpApplication.protocolService.getRootKey()).to.not.be.ok;
    await tmpApplication.launch(true);
    expect(
      await tmpApplication.storageService.getValue(sampleStorageKey)
    ).to.equal(sampleStorageValue);
    expect(await tmpApplication.protocolService.getRootKey()).to.be.ok;
    expect(tmpApplication.protocolService.keyMode).to.equal(KeyMode.RootKeyPlusWrapper);
    tmpApplication.deinit();
  }).timeout(10000);
});
