/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('key recovery service', function () {
  this.timeout(Factory.LongTestTimeout);

  const syncOptions = {
    checkIntegrity: true,
    awaitAll: true,
  };

  beforeEach(async function () {
    localStorage.clear();
  });

  afterEach(function () {
    localStorage.clear();
  });

  it('when encountering an undecryptable items key, should recover through recovery wizard', async function () {
    const namespace = Factory.randomString();
    const context = await Factory.createAppContext(namespace);
    const unassociatedPassword = 'randfoo';
    const unassociatedIdentifier = 'foorand';

    const application = context.application;
    const receiveChallenge = async (challenge) => {
      /** Give unassociated password when prompted */
      application.submitValuesForChallenge(challenge, [
        new ChallengeValue(challenge.prompts[0], unassociatedPassword),
      ]);
    };
    await application.prepareForLaunch({ receiveChallenge });
    await application.launch(true);

    await Factory.registerUserToApplication({
      application: application,
      email: context.email,
      password: context.password,
    });

    /** Create items key associated with a random root key */
    const randomRootKey = await application.protocolService.createRootKey(
      unassociatedIdentifier,
      unassociatedPassword,
      KeyParamsOrigination.Registration
    );
    const randomItemsKey = await application.protocolService
      .defaultOperator()
      .createItemsKey();
    const encrypted = await application.protocolService.payloadByEncryptingPayload(
      randomItemsKey.payload,
      EncryptionIntent.Sync,
      randomRootKey
    );

    /** Attempt decryption and insert into rotation in errored state  */
    const decrypted = await application.protocolService.payloadByDecryptingPayload(
      encrypted
    );
    /** Expect to be errored */
    expect(decrypted.errorDecrypting).to.equal(true);

    /** Insert into rotation */
    await application.payloadManager.emitPayload(
      decrypted,
      PayloadSource.Constructor
    );

    /** Wait and allow recovery wizard to complete */
    await Factory.sleep(0.3);

    /** Should be decrypted now */
    expect(application.findItem(encrypted.uuid).errorDecrypting).to.equal(
      false
    );

    expect(application.syncService.isOutOfSync()).to.equal(false);
    context.deinit();
  });

  it('when encountering many undecryptable items key with same key params, should only prompt once', async function () {
    const namespace = Factory.randomString();
    const unassociatedPassword = 'randfoo';
    const unassociatedIdentifier = 'foorand';
    let totalPromptCount = 0;

    const context = await Factory.createAppContext(namespace);
    const application = context.application;
    const receiveChallenge = async (challenge) => {
      totalPromptCount++;
      /** Give unassociated password when prompted */
      application.submitValuesForChallenge(challenge, [
        new ChallengeValue(challenge.prompts[0], unassociatedPassword),
      ]);
    };
    await application.prepareForLaunch({ receiveChallenge });
    await application.launch(true);

    await Factory.registerUserToApplication({
      application: application,
      email: context.email,
      password: context.password,
    });

    /** Create items key associated with a random root key */
    const randomRootKey = await application.protocolService.createRootKey(
      unassociatedIdentifier,
      unassociatedPassword,
      KeyParamsOrigination.Registration
    );
    const randomItemsKey = await application.protocolService
      .defaultOperator()
      .createItemsKey();
    const randomItemsKey2 = await application.protocolService
      .defaultOperator()
      .createItemsKey();
    const encrypted = await application.protocolService.payloadsByEncryptingPayloads(
      [randomItemsKey.payload, randomItemsKey2.payload],
      EncryptionIntent.Sync,
      randomRootKey
    );

    /** Attempt decryption and insert into rotation in errored state  */
    const decrypted = await application.protocolService.payloadsByDecryptingPayloads(
      encrypted
    );

    await application.payloadManager.emitPayloads(
      decrypted,
      PayloadSource.Constructor
    );

    /** Wait and allow recovery wizard to complete */
    await Factory.sleep(1.5);

    /** Should be decrypted now */
    expect(application.findItem(randomItemsKey.uuid).errorDecrypting).to.equal(
      false
    );
    expect(application.findItem(randomItemsKey2.uuid).errorDecrypting).to.equal(
      false
    );

    expect(totalPromptCount).to.equal(1);

    expect(application.syncService.isOutOfSync()).to.equal(false);
    context.deinit();
  });

  it(
    'when changing password on another client, it should prompt us for new account password',
    async function () {
      /**
       * This test takes way too long due to all the key generation occuring
       * from registering, changing pw, logging in, verifying protections, reauthenticating expired sessions, etc,
       * and is a prime candidate for race conditions and flakiness. It should be broken down into smaller tests.
       */
      const namespace = Factory.randomString();
      const newPassword = `${Math.random()}`;
      const contextA = await Factory.createAppContext(namespace);
      const appA = contextA.application;
      const receiveChallenge = async (challenge) => {
        const responses = [];
        for (const prompt of challenge.prompts) {
          if (prompt.validation === ChallengeValidation.AccountPassword) {
            responses.push(new ChallengeValue(prompt, contextA.password));
          } else if (
            prompt.validation === ChallengeValidation.ProtectionSessionDuration
          ) {
            responses.push(new ChallengeValue(prompt, 0));
          } else if (prompt.placeholder === 'Email') {
            responses.push(new ChallengeValue(prompt, contextA.email));
          } else if (
            prompt.placeholder === 'Password' ||
            challenge.heading.includes('password')
          ) {
            /** Give newPassword when prompted to revalidate session */
            responses.push(new ChallengeValue(prompt, newPassword));
          } else {
            console.error(
              `Unhandled custom challenge in Factory.createAppContext`,
              challenge,
              prompt
            );
          }
        }
        appA.submitValuesForChallenge(challenge, responses);
      };
      await appA.prepareForLaunch({ receiveChallenge });
      await appA.launch(true);

      await Factory.registerUserToApplication({
        application: appA,
        email: contextA.email,
        password: contextA.password,
      });

      expect(appA.getItems(ContentType.ItemsKey).length).to.equal(1);

      /** Create simultaneous appB signed into same account */
      const contextB = await Factory.createAppContext('another-namespace');
      const appB = contextB.application;
      await appB.prepareForLaunch({});
      await appB.launch(true);
      await Factory.loginToApplication({
        application: appB,
        email: contextA.email,
        password: contextA.password,
      });

      /** Change password on appB */
      const result = await appB.changePassword(contextA.password, newPassword);
      console.log(result);
      expect(result.error).to.not.be.ok;
      const note = await Factory.createSyncedNote(appB);
      expect(appB.getItems(ContentType.ItemsKey).length).to.equal(2);
      await appB.sync(syncOptions);

      /** Sync appA and expect a new items key to be downloaded and errored */
      expect(appA.getItems(ContentType.ItemsKey).length).to.equal(1);
      await appA.sync(syncOptions);
      await contextA.awaitNextSucessfulSync();
      // await Factory.sleep(4);

      /** Same previously errored key should now no longer be errored, */
      const keys = appA.itemManager.itemsKeys();
      for (const key of keys) {
        expect(key.errorDecrypting).to.not.be.ok;
      }

      /** appA's root key should now match appB's. */
      const aKey = await appA.protocolService.getRootKey();
      const bKey = await appB.protocolService.getRootKey();
      expect(aKey.compare(bKey)).to.equal(true);

      /** Expect appB note to be decrypted */
      expect(appA.findItem(note.uuid).errorDecrypting).to.not.be.ok;
      expect(appB.findItem(note.uuid).errorDecrypting).to.not.be.ok;

      expect(appA.syncService.isOutOfSync()).to.equal(false);
      expect(appB.syncService.isOutOfSync()).to.equal(false);

      contextA.deinit();
      contextB.deinit();
    }
  ).timeout(80000);

  it.skip('when items key associated with item is errored, item should be marked waiting for key', async function () {
    const namespace = Factory.randomString();
    const newPassword = `${Math.random()}`;
    const appA = await Factory.createApplication(namespace);
    const receiveChallenge = async (challenge) => {
      const prompt = challenge.prompts[0];
      /** Give newPassword when prompted */
      appA.submitValuesForChallenge(challenge, [
        new ChallengeValue(prompt, newPassword),
      ]);
    };
    await appA.prepareForLaunch({ receiveChallenge });
    await appA.launch(true);

    await Factory.registerUserToApplication({
      application: appA,
      email: this.email,
      password: this.password,
    });

    expect(appA.getItems(ContentType.ItemsKey).length).to.equal(1);

    /** Create simultaneous appB signed into same account */
    const appB = await Factory.createApplication('another-namespace');
    await appB.prepareForLaunch({ receiveChallenge: () => {} });
    await appB.launch(true);
    await Factory.loginToApplication({
      application: appB,
      email: this.email,
      password: this.password,
    });

    /** Change password on appB */
    await appB.changePassword(this.password, newPassword);
    const note = await Factory.createSyncedNote(appB);
    await appB.sync();

    /** We expect the item in appA to be errored at this point, but we do not want it to recover */
    await appA.sync();
    expect(appA.findItem(note.uuid).waitingForKey).to.equal(true);
    console.warn(
      'Expecting exceptions below as we destroy app during key recovery'
    );
    appA.deinit();
    appB.deinit();

    const recreatedAppA = await Factory.createApplication(namespace);
    await recreatedAppA.prepareForLaunch({ receiveChallenge: () => {} });
    await recreatedAppA.launch(true);

    expect(recreatedAppA.findItem(note.uuid).errorDecrypting).to.equal(true);
    expect(recreatedAppA.findItem(note.uuid).waitingForKey).to.equal(true);
    recreatedAppA.deinit();
  });

  it('when client key params differ from server, and no matching items key exists, should perform sign in flow', async function () {
    /**
     * If we encounter an undecryptable items key, whose key params do not match the server's,
     * and the server's key params do not match our own, we have no way to validate a new
     * root key other than by signing in.
     */
    const unassociatedPassword = 'randfoo';
    const context = await Factory.createAppContext('some-namespace');
    const application = context.application;
    const receiveChallenge = async (challenge) => {
      /** This is the sign in prompt, return proper value */
      application.submitValuesForChallenge(challenge, [
        new ChallengeValue(
          challenge.prompts[0],
          challenge.subheading.includes(
            KeyRecoveryStrings.KeyRecoveryLoginFlowReason
          )
            ? context.password
            : unassociatedPassword
        ),
      ]);
    };
    await application.prepareForLaunch({ receiveChallenge });
    await application.launch(true);

    await Factory.registerUserToApplication({
      application: application,
      email: context.email,
      password: context.password,
    });

    const correctRootKey = await application.protocolService.getRootKey();

    /**
     * 1. Change our root key locally so that its keys params doesn't match the server's
     * 2. Create an items key payload that is set to errorDecrypting, and which is encrypted
     *    with the incorrect root key, so that it cannot be used to validate the user's password
     */

    const unassociatedIdentifier = 'foorand';
    /** Create items key associated with a random root key */
    const randomRootKey = await application.protocolService.createRootKey(
      unassociatedIdentifier,
      unassociatedPassword,
      KeyParamsOrigination.Registration
    );
    await application.protocolService.setRootKey(randomRootKey);
    const correctItemsKey = await application.protocolService
      .defaultOperator()
      .createItemsKey();
    const encrypted = await application.protocolService.payloadByEncryptingPayload(
      correctItemsKey.payload,
      EncryptionIntent.Sync,
      randomRootKey
    );
    await application.payloadManager.emitPayload(
      CopyPayload(encrypted, {
        errorDecrypting: true,
      }),
      PayloadSource.Constructor
    );

    /** At this point key recovery wizard will encounter an undecryptable items key,
     * whose key params do not match the server's. Key recovery wizard should prompt for sign in,
     * but will also prompt for detached recovery of this key, so we must await both */
    await Factory.sleep(5.0);

    const clientRootKey = await application.protocolService.getRootKey();
    expect(clientRootKey.compare(correctRootKey)).to.equal(true);

    expect(application.syncService.isOutOfSync()).to.equal(false);
    context.deinit();
  });

  it(`when encountering an items key that cannot be decrypted, for which we already have a decrypted value,
          it should be temporarily ignored and recovered separately`, async function () {
    const context = await Factory.createAppContext(Factory.randomString());
    const application = context.application;
    const receiveChallenge = async (challenge) => {
      application.submitValuesForChallenge(challenge, [
        new ChallengeValue(challenge.prompts[0], context.password),
      ]);
    };
    await application.prepareForLaunch({ receiveChallenge });
    await application.launch(true);

    await Factory.registerUserToApplication({
      application: application,
      email: context.email,
      password: context.password,
    });

    /** Create and emit errored encrypted items key payload */
    const itemsKey = await application.protocolService.getDefaultItemsKey();
    const encrypted = await application.protocolService.payloadByEncryptingPayload(
      itemsKey.payload,
      EncryptionIntent.Sync
    );
    const newUpdated = new Date();
    await application.payloadManager.emitPayload(
      CopyPayload(encrypted, {
        errorDecrypting: true,
        updated_at: newUpdated,
      }),
      PayloadSource.Constructor
    );

    /** Our current items key should not be overwritten */
    const currentItemsKey = application.findItem(itemsKey.uuid);
    expect(currentItemsKey.errorDecrypting).to.not.be.ok;
    expect(currentItemsKey.itemsKey).to.equal(itemsKey.itemsKey);
    expect(currentItemsKey.serverUpdatedAt.getTime()).to.equal(
      itemsKey.serverUpdatedAt.getTime()
    );

    /** Payload should be persisted as unrecoverable */
    const undecryptables = await application.keyRecoveryService.getUndecryptables();
    expect(Object.keys(undecryptables).length).to.equal(1);

    /** Allow key recovery wizard to finish its processes */
    await Factory.sleep(1.5);

    /** Unrecoverable should be cleared, and key recovered and emitted */
    const latestUndecryptables = await application.keyRecoveryService.getUndecryptables();
    expect(Object.keys(latestUndecryptables).length).to.equal(0);

    const latestItemsKey = application.findItem(itemsKey.uuid);
    expect(latestItemsKey.errorDecrypting).to.not.be.ok;
    expect(latestItemsKey.itemsKey).to.equal(itemsKey.itemsKey);
    expect(latestItemsKey.serverUpdatedAt.getTime()).to.not.equal(
      currentItemsKey.serverUpdatedAt.getTime()
    );
    expect(latestItemsKey.serverUpdatedAt.getTime()).to.equal(
      newUpdated.getTime()
    );

    expect(application.syncService.isOutOfSync()).to.equal(false);
    application.deinit();
  });

  it('application should prompt to recover undecryptables on launch', async function () {
    const namespace = Factory.randomString();
    const context = await Factory.createAppContext(namespace);
    const application = context.application;
    await application.prepareForLaunch({});
    await application.launch(true);

    await Factory.registerUserToApplication({
      application: application,
      email: context.email,
      password: context.password,
    });

    /** Create and emit errored encrypted items key payload */
    const itemsKey = await application.protocolService.getDefaultItemsKey();
    const encrypted = await application.protocolService.payloadByEncryptingPayload(
      itemsKey.payload,
      EncryptionIntent.Sync
    );

    await application.payloadManager.emitPayload(
      CopyPayload(encrypted, {
        errorDecrypting: true,
      }),
      PayloadSource.Constructor
    );
    /** Allow enough time to persist to disk, but not enough to complete recovery wizard */
    console.warn(
      'Expecting some error below because we are destroying app in the middle of processing.'
    );
    await Factory.sleep(0.1);
    expect(application.syncService.isOutOfSync()).to.equal(false);
    context.deinit();

    /** Recreate application, and expect key recovery wizard to complete */
    const recreatedApp = await Factory.createApplication(namespace);
    let didReceivePasswordPrompt = false;
    const receiveChallenge = async (challenge) => {
      didReceivePasswordPrompt = true;
      recreatedApp.submitValuesForChallenge(challenge, [
        new ChallengeValue(challenge.prompts[0], context.password),
      ]);
    };
    await recreatedApp.prepareForLaunch({ receiveChallenge });
    await recreatedApp.launch(true);

    /** Allow key recovery wizard to complete its processes */
    await Factory.sleep(1.5);

    /** Unrecoverable should be cleared, and key recovered and emitted */
    expect(didReceivePasswordPrompt).to.equal(true);
    const latestUndecryptables = await recreatedApp.keyRecoveryService.getUndecryptables();
    expect(Object.keys(latestUndecryptables).length).to.equal(0);

    const latestItemsKey = recreatedApp.findItem(itemsKey.uuid);
    expect(latestItemsKey.errorDecrypting).to.not.be.ok;
    expect(latestItemsKey.itemsKey).to.equal(itemsKey.itemsKey);

    expect(recreatedApp.syncService.isOutOfSync()).to.equal(false);
    recreatedApp.deinit();
  });

  it('when encountering an undecryptable 003 items key, should recover through recovery wizard', async function () {
    const namespace = Factory.randomString();
    const unassociatedPassword = 'randfoo';
    const unassociatedIdentifier = 'foorand';

    const context = await Factory.createAppContext(namespace);
    const application = context.application;
    const receiveChallenge = async (challenge) => {
      /** Give unassociated password when prompted */
      application.submitValuesForChallenge(challenge, [
        new ChallengeValue(challenge.prompts[0], unassociatedPassword),
      ]);
    };
    await application.prepareForLaunch({ receiveChallenge });
    await application.launch(true);

    await Factory.registerOldUser({
      application: application,
      email: context.email,
      password: context.password,
      version: ProtocolVersion.V003,
    });

    /** Create items key associated with a random root key */
    const randomRootKey = await application.protocolService.createRootKey(
      unassociatedIdentifier,
      unassociatedPassword,
      KeyParamsOrigination.Registration,
      ProtocolVersion.V003
    );
    const randomItemsKey = await application.protocolService
      .operatorForVersion(ProtocolVersion.V003)
      .createItemsKey();
    const encrypted = await application.protocolService.payloadByEncryptingPayload(
      randomItemsKey.payload,
      EncryptionIntent.Sync,
      randomRootKey
    );

    /** Attempt decryption and insert into rotation in errored state  */
    const decrypted = await application.protocolService.payloadByDecryptingPayload(
      encrypted
    );
    /** Expect to be errored */
    expect(decrypted.errorDecrypting).to.equal(true);

    /** Insert into rotation */
    await application.payloadManager.emitPayload(
      decrypted,
      PayloadSource.Constructor
    );

    /** Wait and allow recovery wizard to complete */
    await Factory.sleep(0.3);

    /** Should be decrypted now */
    expect(application.findItem(encrypted.uuid).errorDecrypting).to.equal(
      false
    );

    expect(application.syncService.isOutOfSync()).to.equal(false);
    context.deinit();
  });
});
