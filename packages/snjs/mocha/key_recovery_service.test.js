/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js'
chai.use(chaiAsPromised)
const expect = chai.expect

describe('key recovery service', function () {
  this.timeout(Factory.TwentySecondTimeout)

  const syncOptions = {
    checkIntegrity: true,
    awaitAll: true,
  }

  beforeEach(function () {
    localStorage.clear()
  })

  afterEach(function () {
    localStorage.clear()
  })

  it('when encountering an undecryptable items key, should recover through recovery wizard', async function () {
    const namespace = Factory.randomString()
    const context = await Factory.createAppContextWithFakeCrypto(namespace)
    const unassociatedPassword = 'randfoo'
    const unassociatedIdentifier = 'foorand'

    const application = context.application
    const receiveChallenge = (challenge) => {
      /** Give unassociated password when prompted */
      application.submitValuesForChallenge(challenge, [
        new ChallengeValue(challenge.prompts[0], unassociatedPassword),
      ])
    }
    await application.prepareForLaunch({ receiveChallenge })
    await application.launch(true)

    await Factory.registerUserToApplication({
      application: application,
      email: context.email,
      password: context.password,
    })

    /** Create items key associated with a random root key */
    const randomRootKey = await application.protocolService.createRootKey(
      unassociatedIdentifier,
      unassociatedPassword,
      KeyParamsOrigination.Registration,
    )
    const randomItemsKey = await application.protocolService.operatorManager
      .defaultOperator()
      .createItemsKey()

    const encrypted = await application.protocolService.encryptSplitSingle({
      usesRootKey: {
        items: [randomItemsKey.payload],
        key: randomRootKey,
      },
    })

    /** Attempt decryption and insert into rotation in errored state  */
    const decrypted = await application.protocolService.decryptSplitSingle({
      usesRootKeyWithKeyLookup: {
        items: [encrypted],
      },
    })
    /** Expect to be errored */
    expect(decrypted.errorDecrypting).to.equal(true)

    /** Insert into rotation */
    await application.payloadManager.emitPayload(decrypted, PayloadEmitSource.LocalInserted)

    /** Wait and allow recovery wizard to complete */
    await Factory.sleep(0.3)

    /** Should be decrypted now */
    expect(application.items.findItem(encrypted.uuid).errorDecrypting).to.not.be.ok

    expect(application.syncService.isOutOfSync()).to.equal(false)
    await context.deinit()
  })

  it('when encountering many undecryptable items key with same key params, should only prompt once', async function () {
    const namespace = Factory.randomString()
    const unassociatedPassword = 'randfoo'
    const unassociatedIdentifier = 'foorand'
    let totalPromptCount = 0

    const context = await Factory.createAppContextWithFakeCrypto(namespace)
    const application = context.application
    const receiveChallenge = (challenge) => {
      totalPromptCount++
      /** Give unassociated password when prompted */
      application.submitValuesForChallenge(challenge, [
        new ChallengeValue(challenge.prompts[0], unassociatedPassword),
      ])
    }
    await application.prepareForLaunch({ receiveChallenge })
    await application.launch(true)

    await Factory.registerUserToApplication({
      application: application,
      email: context.email,
      password: context.password,
    })

    /** Create items key associated with a random root key */
    const randomRootKey = await application.protocolService.createRootKey(
      unassociatedIdentifier,
      unassociatedPassword,
      KeyParamsOrigination.Registration,
    )
    const randomItemsKey = await application.protocolService.operatorManager
      .defaultOperator()
      .createItemsKey()
    const randomItemsKey2 = await application.protocolService.operatorManager
      .defaultOperator()
      .createItemsKey()

    const encrypted = await application.protocolService.encryptSplit({
      usesRootKey: {
        items: [randomItemsKey.payload, randomItemsKey2.payload],
        key: randomRootKey,
      },
    })

    /** Attempt decryption and insert into rotation in errored state  */
    const decrypted = await application.protocolService.decryptSplit({
      usesRootKeyWithKeyLookup: {
        items: encrypted,
      },
    })

    await application.payloadManager.emitPayloads(decrypted, PayloadEmitSource.LocalInserted)

    /** Wait and allow recovery wizard to complete */
    await Factory.sleep(1.5)

    /** Should be decrypted now */
    expect(application.items.findItem(randomItemsKey.uuid).errorDecrypting).not.be.ok
    expect(application.items.findItem(randomItemsKey2.uuid).errorDecrypting).not.be.ok

    expect(totalPromptCount).to.equal(1)

    expect(application.syncService.isOutOfSync()).to.equal(false)
    await context.deinit()
  })

  it('when changing password on another client, it should prompt us for new account password', async function () {
    /**
     * This test takes way too long due to all the key generation occuring
     * from registering, changing pw, logging in, verifying protections, reauthenticating expired sessions, etc,
     * and is a prime candidate for race conditions and flakiness. It should be broken down into smaller tests.
     */
    const namespace = Factory.randomString()
    const newPassword = `${Math.random()}`
    const contextA = await Factory.createAppContextWithFakeCrypto(namespace)
    const appA = contextA.application

    const receiveChallenge = (challenge) => {
      const responses = []
      for (const prompt of challenge.prompts) {
        if (prompt.validation === ChallengeValidation.AccountPassword) {
          responses.push(new ChallengeValue(prompt, contextA.password))
        } else if (prompt.validation === ChallengeValidation.ProtectionSessionDuration) {
          responses.push(new ChallengeValue(prompt, UnprotectedAccessSecondsDuration.OneMinute))
        } else if (prompt.placeholder === 'Email') {
          responses.push(new ChallengeValue(prompt, contextA.email))
        } else if (prompt.placeholder === 'Password' || challenge.heading.includes('password')) {
          /** Give newPassword when prompted to revalidate session */
          responses.push(new ChallengeValue(prompt, newPassword))
        } else {
          console.error(
            'Unhandled custom challenge in Factory.createAppContextWithFakeCrypto',
            challenge,
            prompt,
          )
        }
      }
      appA.submitValuesForChallenge(challenge, responses)
    }
    await appA.prepareForLaunch({ receiveChallenge })
    await appA.launch(true)

    await Factory.registerUserToApplication({
      application: appA,
      email: contextA.email,
      password: contextA.password,
    })

    expect(appA.items.getItems(ContentType.ItemsKey).length).to.equal(1)

    /** Create simultaneous appB signed into same account */
    const contextB = await Factory.createAppContextWithFakeCrypto('another-namespace')
    const appB = contextB.application
    contextB.ignoreChallenges()
    await appB.prepareForLaunch({})
    await appB.launch(true)

    await Factory.loginToApplication({
      application: appB,
      email: contextA.email,
      password: contextA.password,
    })

    /** Change password on appB */
    const result = await appB.changePassword(contextA.password, newPassword)
    expect(result.error).to.not.be.ok

    const note = await Factory.createSyncedNote(appB)

    expect(appB.items.getAnyItems(ContentType.ItemsKey).length).to.equal(2)

    await appB.sync.sync(syncOptions)

    expect(appA.items.getAnyItems(ContentType.ItemsKey).length).to.equal(1)

    /** Sync appA and expect a new items key to be downloaded and errored */
    const syncPromise = appA.sync.sync(syncOptions)
    await contextA.awaitNextSucessfulSync()
    await syncPromise

    expect(appA.items.getAnyItems(ContentType.ItemsKey).length).to.equal(2)

    /** Same previously errored key should now no longer be errored, */
    const keys = appA.itemManager.itemsKeys()
    for (const key of keys) {
      expect(key.errorDecrypting).to.not.be.ok
    }

    /** appA's root key should now match appB's. */
    const aKey = await appA.protocolService.getRootKey()
    const bKey = await appB.protocolService.getRootKey()
    expect(aKey.compare(bKey)).to.equal(true)

    /** Expect appB note to be decrypted */
    expect(appA.items.findItem(note.uuid).errorDecrypting).to.not.be.ok
    expect(appB.items.findItem(note.uuid).errorDecrypting).to.not.be.ok

    expect(appA.syncService.isOutOfSync()).to.equal(false)
    expect(appB.syncService.isOutOfSync()).to.equal(false)

    await contextA.deinit()
    await contextB.deinit()
  }).timeout(80000)

  it('when items key associated with item is errored, item should be marked waiting for key', async function () {
    const namespace = Factory.randomString()
    const newPassword = `${Math.random()}`
    const contextA = await Factory.createAppContextWithFakeCrypto(namespace)
    const appA = contextA.application
    await appA.prepareForLaunch({ receiveChallenge: () => {} })
    await appA.launch(true)

    await Factory.registerUserToApplication({
      application: appA,
      email: contextA.email,
      password: contextA.password,
    })

    expect(appA.items.getItems(ContentType.ItemsKey).length).to.equal(1)

    /** Create simultaneous appB signed into same account */
    const appB = await Factory.createApplicationWithFakeCrypto('another-namespace')
    await appB.prepareForLaunch({ receiveChallenge: () => {} })
    await appB.launch(true)

    await Factory.loginToApplication({
      application: appB,
      email: contextA.email,
      password: contextA.password,
    })

    /** Change password on appB */
    await appB.changePassword(contextA.password, newPassword)
    const note = await Factory.createSyncedNote(appB)
    await appB.sync.sync()

    /** We expect the item in appA to be errored at this point, but we do not want it to recover */
    await appA.sync.sync()
    expect(appA.payloadManager.findOne(note.uuid).waitingForKey).to.equal(true)

    console.warn('Expecting exceptions below as we destroy app during key recovery')
    await Factory.safeDeinit(appA)
    await Factory.safeDeinit(appB)

    const recreatedAppA = await Factory.createApplicationWithFakeCrypto(namespace)
    await recreatedAppA.prepareForLaunch({ receiveChallenge: () => {} })
    await recreatedAppA.launch(true)

    expect(recreatedAppA.payloadManager.findOne(note.uuid).errorDecrypting).to.equal(true)
    expect(recreatedAppA.payloadManager.findOne(note.uuid).waitingForKey).to.equal(true)
    await Factory.safeDeinit(recreatedAppA)
  })

  it('when client key params differ from server, and no matching items key exists, should perform sign in flow', async function () {
    /**
     * If we encounter an undecryptable items key, whose key params do not match the server's,
     * and the server's key params do not match our own, we have no way to validate a new
     * root key other than by signing in.
     */
    const unassociatedPassword = 'randfoo'
    const context = await Factory.createAppContextWithFakeCrypto('some-namespace')
    const application = context.application
    const receiveChallenge = (challenge) => {
      /** This is the sign in prompt, return proper value */
      application.submitValuesForChallenge(challenge, [
        new ChallengeValue(
          challenge.prompts[0],
          challenge.subheading.includes(KeyRecoveryStrings.KeyRecoveryLoginFlowReason)
            ? context.password
            : unassociatedPassword,
        ),
      ])
    }
    await application.prepareForLaunch({ receiveChallenge })
    await application.launch(true)

    await Factory.registerUserToApplication({
      application: application,
      email: context.email,
      password: context.password,
    })

    const correctRootKey = await application.protocolService.getRootKey()

    /**
     * 1. Change our root key locally so that its keys params doesn't match the server's
     * 2. Create an items key payload that is set to errorDecrypting, and which is encrypted
     *    with the incorrect root key, so that it cannot be used to validate the user's password
     */

    const unassociatedIdentifier = 'foorand'
    /** Create items key associated with a random root key */
    const randomRootKey = await application.protocolService.createRootKey(
      unassociatedIdentifier,
      unassociatedPassword,
      KeyParamsOrigination.Registration,
    )
    await application.protocolService.setRootKey(randomRootKey)
    const correctItemsKey = await application.protocolService.operatorManager
      .defaultOperator()
      .createItemsKey()
    const encrypted = await application.protocolService.encryptSplitSingle({
      usesRootKey: {
        items: [correctItemsKey.payload],
        key: randomRootKey,
      },
    })

    await application.payloadManager.emitPayload(
      encrypted.copy({
        errorDecrypting: true,
      }),
      PayloadEmitSource.LocalInserted,
    )

    /** At this point key recovery wizard will encounter an undecryptable items key,
     * whose key params do not match the server's. Key recovery wizard should prompt for sign in,
     * but will also prompt for detached recovery of this key, so we must await both */
    await Factory.sleep(5.0)

    const clientRootKey = await application.protocolService.getRootKey()
    expect(clientRootKey.compare(correctRootKey)).to.equal(true)

    expect(application.syncService.isOutOfSync()).to.equal(false)
    await context.deinit()
  })

  it(`when encountering an items key that cannot be decrypted for which we already have a decrypted value,
          it should be emitted as ignored`, async function () {
    const context = await Factory.createAppContextWithFakeCrypto()
    const application = context.application
    await context.launch()
    await context.register()

    /** Create and emit errored encrypted items key payload */
    const itemsKey = await application.protocolService.getSureDefaultItemsKey()
    const encrypted = await application.protocolService.encryptSplitSingle({
      usesRootKeyWithKeyLookup: {
        items: [itemsKey.payload],
      },
    })

    const newUpdated = new Date()
    const errored = encrypted.copy({
      content: '004:...',
      errorDecrypting: true,
      updated_at: newUpdated,
    })

    await context.receiveServerResponse({ retrievedItems: [errored.ejected()] })

    /** Our current items key should not be overwritten */
    const currentItemsKey = application.items.findItem(itemsKey.uuid)
    expect(currentItemsKey.errorDecrypting).to.not.be.ok
    expect(currentItemsKey.itemsKey).to.equal(itemsKey.itemsKey)

    /** The timestamp of our current key should be updated however so we do not enter out of sync state */
    expect(currentItemsKey.serverUpdatedAt.getTime()).to.equal(newUpdated.getTime())

    expect(application.syncService.isOutOfSync()).to.equal(false)

    await context.deinit()
  })

  it(`ignored key payloads should be added to undecryptables and recovered`, async function () {
    const context = await Factory.createAppContextWithFakeCrypto()
    const application = context.application
    await context.launch()
    await context.register()

    const itemsKey = await application.protocolService.getSureDefaultItemsKey()
    const encrypted = await application.protocolService.encryptSplitSingle({
      usesRootKeyWithKeyLookup: {
        items: [itemsKey.payload],
      },
    })

    const newUpdated = new Date()
    const errored = encrypted.copy({
      errorDecrypting: true,
      updated_at: newUpdated,
    })

    await application.payloadManager.emitDeltaEmit({
      emits: [],
      ignored: [errored],
      source: PayloadEmitSource.RemoteRetrieved,
    })

    await context.resolveWhenKeyRecovered(itemsKey.uuid)

    const latestItemsKey = application.items.findItem(itemsKey.uuid)

    expect(latestItemsKey.errorDecrypting).to.not.be.ok
    expect(latestItemsKey.itemsKey).to.equal(itemsKey.itemsKey)
    expect(latestItemsKey.serverUpdatedAt.getTime()).to.equal(newUpdated.getTime())
    expect(application.syncService.isOutOfSync()).to.equal(false)

    await context.deinit()
  })

  it('application should prompt to recover undecryptables on launch', async function () {
    const namespace = Factory.randomString()
    const context = await Factory.createAppContextWithFakeCrypto(namespace)
    const application = context.application
    await context.launch()
    await context.register()

    /** Create and emit errored encrypted items key payload */
    const itemsKey = await application.protocolService.getSureDefaultItemsKey()
    const encrypted = await application.protocolService.encryptSplitSingle({
      usesRootKeyWithKeyLookup: {
        items: [itemsKey.payload],
      },
    })

    context.disableKeyRecovery()

    await application.payloadManager.emitDeltaEmit({
      emits: [],
      ignored: [
        encrypted.copy({
          errorDecrypting: true,
        }),
      ],
      source: PayloadEmitSource.RemoteRetrieved,
    })

    /** Allow enough time to persist to disk, but not enough to complete recovery wizard */
    console.warn(
      'Expecting some error below because we are destroying app in the middle of processing.',
    )

    await Factory.sleep(0.1)

    expect(application.syncService.isOutOfSync()).to.equal(false)

    await context.deinit()

    const recreatedContext = await Factory.createAppContextWithFakeCrypto(
      namespace,
      context.email,
      context.password,
    )

    const recreatedApp = recreatedContext.application

    const promise = recreatedContext.resolveWhenKeyRecovered(itemsKey.uuid)

    await recreatedContext.launch()

    await promise

    await Factory.safeDeinit(recreatedApp)
  })

  it('when encountering an undecryptable 003 items key, should recover through recovery wizard', async function () {
    const namespace = Factory.randomString()
    const unassociatedPassword = 'randfoo'
    const unassociatedIdentifier = 'foorand'

    const context = await Factory.createAppContextWithFakeCrypto(namespace)
    const application = context.application
    const receiveChallenge = (challenge) => {
      /** Give unassociated password when prompted */
      application.submitValuesForChallenge(challenge, [
        new ChallengeValue(challenge.prompts[0], unassociatedPassword),
      ])
    }
    await application.prepareForLaunch({ receiveChallenge })
    await application.launch(true)

    await Factory.registerOldUser({
      application: application,
      email: context.email,
      password: context.password,
      version: ProtocolVersion.V003,
    })

    /** Create items key associated with a random root key */
    const randomRootKey = await application.protocolService.createRootKey(
      unassociatedIdentifier,
      unassociatedPassword,
      KeyParamsOrigination.Registration,
      ProtocolVersion.V003,
    )
    const randomItemsKey = await application.protocolService.operatorManager
      .operatorForVersion(ProtocolVersion.V003)
      .createItemsKey()

    const encrypted = await application.protocolService.encryptSplitSingle({
      usesRootKey: {
        items: [randomItemsKey.payload],
        key: randomRootKey,
      },
    })

    /** Attempt decryption and insert into rotation in errored state  */
    const decrypted = await application.protocolService.decryptSplitSingle({
      usesRootKeyWithKeyLookup: {
        items: [encrypted],
      },
    })
    /** Expect to be errored */
    expect(decrypted.errorDecrypting).to.equal(true)

    /** Insert into rotation */
    await application.payloadManager.emitPayload(decrypted, PayloadEmitSource.LocalInserted)

    /** Wait and allow recovery wizard to complete */
    await Factory.sleep(0.3)

    /** Should be decrypted now */
    expect(application.items.findItem(encrypted.uuid).errorDecrypting).to.not.be.ok

    expect(application.syncService.isOutOfSync()).to.equal(false)
    await context.deinit()
  })

  it('when replacing root key, new root key should be set before items key are re-saved to disk', async function () {
    const namespace = Factory.randomString()
    const newPassword = 'new-password'
    const contextA = await Factory.createAppContextWithFakeCrypto(namespace)
    const appA = contextA.application
    const receiveChallenge = (challenge) => {
      const responses = []
      for (const prompt of challenge.prompts) {
        if (prompt.validation === ChallengeValidation.AccountPassword) {
          responses.push(new ChallengeValue(prompt, contextA.password))
        } else if (prompt.validation === ChallengeValidation.ProtectionSessionDuration) {
          responses.push(new ChallengeValue(prompt, UnprotectedAccessSecondsDuration.OneMinute))
        } else if (prompt.placeholder === 'Email') {
          responses.push(new ChallengeValue(prompt, contextA.email))
        } else if (prompt.placeholder === 'Password' || challenge.heading.includes('password')) {
          /** Give newPassword when prompted to revalidate session */
          responses.push(new ChallengeValue(prompt, newPassword))
        } else {
          console.error(
            'Unhandled custom challenge in Factory.createAppContextWithFakeCrypto',
            challenge,
            prompt,
          )
        }
      }
      appA.submitValuesForChallenge(challenge, responses)
    }
    await appA.prepareForLaunch({ receiveChallenge })
    await appA.launch(true)

    await Factory.registerUserToApplication({
      application: appA,
      email: contextA.email,
      password: contextA.password,
    })

    /** Create simultaneous appB signed into same account */
    const contextB = await Factory.createAppContextWithFakeCrypto('another-namespace')
    const appB = contextB.application
    await appB.prepareForLaunch({})
    await appB.launch(true)
    await Factory.loginToApplication({
      application: appB,
      email: contextA.email,
      password: contextA.password,
    })

    /** Change password on appB */
    const result = await appB.changePassword(contextA.password, newPassword)
    expect(result.error).to.not.be.ok
    await appB.sync.sync()

    const newDefaultKey = appB.protocolService.getSureDefaultItemsKey()

    const encrypted = await appB.protocolService.encryptSplitSingle({
      usesRootKeyWithKeyLookup: {
        items: [newDefaultKey.payload],
      },
    })

    /** Insert foreign items key into appA, which shouldn't be able to decrypt it yet */
    await appA.payloadManager.emitPayload(
      encrypted.copy({
        errorDecrypting: true,
      }),
      PayloadEmitSource.LocalInserted,
    )

    await Factory.awaitFunctionInvokation(
      appA.keyRecoveryService,
      'handleDecryptionOfAllKeysMatchingCorrectRootKey',
    )

    /** Stored version of items key should use new root key */
    const stored = (await appA.deviceInterface.getAllRawDatabasePayloads(appA.identifier)).find(
      (payload) => payload.uuid === newDefaultKey.uuid,
    )
    const storedParams = await appA.protocolService.getKeyEmbeddedKeyParams(
      new EncryptedPayload(stored),
    )

    const correctStored = (
      await appB.deviceInterface.getAllRawDatabasePayloads(appB.identifier)
    ).find((payload) => payload.uuid === newDefaultKey.uuid)

    const correctParams = await appB.protocolService.getKeyEmbeddedKeyParams(
      new EncryptedPayload(correctStored),
    )

    expect(storedParams).to.eql(correctParams)

    await contextA.deinit()
    await contextB.deinit()
  }).timeout(80000)
})
