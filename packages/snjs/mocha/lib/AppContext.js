import FakeWebCrypto from './fake_web_crypto.js'
import * as Applications from './Applications.js'
import * as Utils from './Utils.js'

UuidGenerator.SetGenerator(new FakeWebCrypto().generateUUID)

export class AppContext {
  constructor({ identifier, crypto, email, password, passcode } = {}) {
    if (!identifier) {
      identifier = `${Math.random()}`
    }

    if (!email) {
      email = UuidGenerator.GenerateUuid()
    }

    if (!password) {
      password = UuidGenerator.GenerateUuid()
    }

    if (!passcode) {
      passcode = 'mypasscode'
    }

    this.identifier = identifier
    this.crypto = crypto
    this.email = email
    this.password = password
    this.passcode = passcode
  }

  async initialize() {
    this.application = await Applications.createApplication(
      this.identifier,
      undefined,
      undefined,
      undefined,
      this.crypto || new FakeWebCrypto(),
    )
  }

  ignoreChallenges() {
    this.ignoringChallenges = true
  }

  resumeChallenges() {
    this.ignoringChallenges = false
  }

  disableKeyRecovery() {
    this.application.keyRecoveryService.beginProcessingQueue = () => {
      console.warn('Key recovery is disabled for this test')
    }
  }

  handleChallenge = (challenge) => {
    if (this.ignoringChallenges) {
      this.application.challengeService.cancelChallenge(challenge)

      return
    }

    const responses = []

    for (const prompt of challenge.prompts) {
      if (prompt.validation === ChallengeValidation.LocalPasscode) {
        responses.push(new ChallengeValue(prompt, this.passcode))
      } else if (prompt.validation === ChallengeValidation.AccountPassword) {
        responses.push(new ChallengeValue(prompt, this.password))
      } else if (prompt.validation === ChallengeValidation.ProtectionSessionDuration) {
        responses.push(new ChallengeValue(prompt, 0))
      } else if (prompt.placeholder === 'Email') {
        responses.push(new ChallengeValue(prompt, this.email))
      } else if (prompt.placeholder === 'Password') {
        responses.push(new ChallengeValue(prompt, this.password))
      } else if (challenge.heading.includes('Enter your account password')) {
        responses.push(new ChallengeValue(prompt, this.password))
      } else {
        throw Error(`Unhandled custom challenge in Factory.createAppContext`)
      }
    }

    this.application.submitValuesForChallenge(challenge, responses)
  }

  signIn() {
    return this.application.signIn(this.email, this.password)
  }

  register() {
    return this.application.register(this.email, this.password)
  }

  receiveServerResponse({ retrievedItems }) {
    const response = new ServerSyncResponse({
      data: {
        retrieved_items: retrievedItems,
      },
    })

    return this.application.syncService.handleSuccessServerResponse(
      { payloadsSavedOrSaving: [] },
      response,
    )
  }

  resolveWhenKeyRecovered(uuid) {
    return new Promise((resolve) => {
      this.application.keyRecoveryService.addEventObserver((_eventName, keys) => {
        if (Uuids(keys).includes(uuid)) {
          resolve()
        }
      })
    })
  }

  async restart() {
    const id = this.application.identifier
    await Utils.safeDeinit(this.application)
    const newApplication = await Applications.createAndInitializeApplication(id)
    this.application = newApplication
    return newApplication
  }

  syncWithIntegrityCheck() {
    return this.application.sync.sync({ checkIntegrity: true, awaitAll: true })
  }

  awaitNextSucessfulSync() {
    return new Promise((resolve) => {
      const removeObserver = this.application.syncService.addEventObserver((event) => {
        if (event === SyncEvent.SyncCompletedWithAllItemsUploadedAndDownloaded) {
          removeObserver()
          resolve()
        }
      })
    })
  }

  awaitNextSyncEvent(eventName) {
    return new Promise((resolve) => {
      const removeObserver = this.application.syncService.addEventObserver((event, data) => {
        if (event === eventName) {
          removeObserver()
          resolve(data)
        }
      })
    })
  }

  async launch({ awaitDatabaseLoad = true } = {}) {
    await this.application.prepareForLaunch({
      receiveChallenge: this.handleChallenge,
    })
    await this.application.launch(awaitDatabaseLoad)
  }

  async deinit() {
    await Utils.safeDeinit(this.application)
  }
}
