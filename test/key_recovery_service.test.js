/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('key recovery service', function () {
  this.timeout(Factory.TestTimeout);

  before(async function () {
    localStorage.clear();
  });

  after(async function () {
    localStorage.clear();
  });

  beforeEach(async function () {
    this.email = Uuid.GenerateUuidSynchronously();
    this.password = Uuid.GenerateUuidSynchronously();
  });

  afterEach(function () {

  });

  it('when encountering an undecryptable items key, should recover through recovery wizard', async function () {
    const namespace = Factory.randomString();
    const unassociatedPassword = 'randfoo';
    const unassociatedIdentifier = 'foorand';

    const application = await Factory.createApplication(namespace);
    const receiveChallenge = async (challenge) => {
      /** Give unassociated password when prompted */
      application.submitValuesForChallenge(
        challenge,
        [new ChallengeValue(challenge.types[0], unassociatedPassword)]
      );
    };
    await application.prepareForLaunch({ receiveChallenge });
    await application.launch(true);

    await Factory.registerUserToApplication({
      application: application,
      email: this.email,
      password: this.password
    });

    /** Create items key associated with a random root key */
    const randomRootKey = await application.protocolService.createRootKey(
      unassociatedIdentifier,
      unassociatedPassword,
      KeyParamsOrigination.Registration
    );
    const randomItemsKey = await application.protocolService.defaultOperator().createItemsKey();
    const encrypted = await application.protocolService.payloadByEncryptingPayload(
      randomItemsKey.payload,
      EncryptionIntent.Sync,
      randomRootKey
    );

    /** Attempt decryption and insert into rotation in errored state  */
    const decrypted = await application.protocolService.payloadByDecryptingPayload(encrypted);
    /** Expect to be errored */
    expect(decrypted.errorDecrypting).to.equal(true);

    /** Insert into rotation */
    await application.modelManager.emitPayload(decrypted, PayloadSource.Constructor);

    /** Wait and allow recovery wizard to complete */
    await Factory.sleep(0.3);

    /** Should be decrypted now */
    expect(application.findItem(encrypted.uuid).errorDecrypting).to.equal(false);

    application.deinit();
  });

  it('when changing password on another client, it should prompt us for new account password', async function () {
    const namespace = Factory.randomString();
    const newPassword = `${Math.random()}`;
    let didPromptForNewPassword = false;

    const appA = await Factory.createApplication(namespace);
    const receiveChallenge = async (challenge) => {
      didPromptForNewPassword = true;
      /** Give newPassword when prompted */
      appA.submitValuesForChallenge(
        challenge,
        [new ChallengeValue(challenge.types[0], newPassword)]
      );
    };
    await appA.prepareForLaunch({ receiveChallenge });
    await appA.launch(true);

    await Factory.registerUserToApplication({
      application: appA,
      email: this.email,
      password: this.password
    });

    expect(appA.getItems(ContentType.ItemsKey).length).to.equal(1);

    /** Create simultaneous appB signed into same account */
    const appB = await Factory.createApplication('another-namespace');
    await appB.prepareForLaunch({});
    await appB.launch(true);
    await Factory.loginToApplication({
      application: appB,
      email: this.email,
      password: this.password
    });

    /** Change password on appB */
    await appB.changePassword(this.password, newPassword);
    expect(appB.getItems(ContentType.ItemsKey).length).to.equal(2);
    await appB.sync();

    /** Sync appA and expect a new items key to be downloaded and errored */
    expect(appA.getItems(ContentType.ItemsKey).length).to.equal(1);
    await appA.sync();

    expect(appA.getItems(ContentType.ItemsKey).length).to.equal(2);
    const itemsKeys = appA.getItems(ContentType.ItemsKey);
    const errored = itemsKeys.filter(k => k.errorDecrypting);
    expect(errored.length).to.equal(1);

    /** Allow key recovery service ample time to do its thing */
    await Factory.sleep(5.0);

    expect(didPromptForNewPassword).to.equal(true);

    /** Same previously errored key should now no longer be errored, */
    const recovered = appA.findItem(errored[0].uuid);
    expect(recovered.errorDecrypting).to.not.be.ok;

    /** appA's root key should now match appB's. */
    const aKey = await appA.protocolService.getRootKey();
    const bKey = await appB.protocolService.getRootKey();
    expect(aKey.compare(bKey)).to.equal(true);

    appA.deinit();
    appB.deinit();
  }).timeout(20000);
});
