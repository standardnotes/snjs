import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('keys', () => {

  before(async () => {
    localStorage.clear();
  });

  after(async () => {
    // localStorage.clear();
  })

  beforeEach(async function() {
    this.namespace = Factory.randomString();
    this.application = await Factory.createAndInitializeApplication(
      this.namespace
    );
    const email = SFItem.GenerateUuidSynchronously();
    const password = SFItem.GenerateUuidSynchronously();
    // await Factory.registerUserToApplication({
    //   application: this.application,
    //   email, password
    // });
  })

  it('handles application locked with passcode', async function() {
    const passcode = 'foobar';
    const wrongPasscode = 'barfoo';
    await this.application.setPasscode(passcode);
    expect(
      await this.application.deviceAuthService.hasPasscodeEnabled()
    ).to.equal(true);
    await this.application.deinit();

    /** Recreate application and initialize */
    const tmpApplication = await Factory.createApplication(
      this.namespace
    );

    await tmpApplication.prepareForLaunch();

    expect(await tmpApplication.keyManager.getRootKey()).to.not.be.ok;

    let numPasswordAttempts = 0;

    const handleChallenges = async (sources) => {
      const responses = [];
      for(const source of sources) {
        if(source === DEVICE_AUTH_SOURCE_LOCAL_PASSCODE) {
          const value = numPasswordAttempts < 2 ? wrongPasscode : passcode;
          const response = new DeviceAuthResponse({source, value});
          responses.push(response);
          numPasswordAttempts++;
        }
      }

      return responses;
    }

    await tmpApplication.launch({
      callbacks: {
        authSourcesResponses: handleChallenges
      }
    })

    expect(await tmpApplication.keyManager.getRootKey()).to.be.ok;
  })
})
