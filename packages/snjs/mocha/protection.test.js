/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js'
chai.use(chaiAsPromised)
const expect = chai.expect

describe('protections', function () {
  this.timeout(Factory.TenSecondTimeout)

  beforeEach(async function () {
    localStorage.clear()
  })

  afterEach(async function () {
    await Factory.safeDeinit(this.application)
    localStorage.clear()
  })

  it('prompts for password when accessing protected note', async function () {
    let challengePrompts = 0

    this.application = await Factory.createApplicationWithFakeCrypto(Factory.randomString())
    const password = UuidGenerator.GenerateUuid()
    await this.application.prepareForLaunch({
      receiveChallenge: (challenge) => {
        challengePrompts += 1
        expect(
          challenge.prompts.find(
            (prompt) => prompt.validation === ChallengeValidation.AccountPassword,
          ),
        ).to.be.ok
        const values = challenge.prompts.map(
          (prompt) =>
            new ChallengeValue(
              prompt,
              prompt.validation === ChallengeValidation.AccountPassword
                ? password
                : UnprotectedAccessSecondsDuration.OneMinute,
            ),
        )

        this.application.submitValuesForChallenge(challenge, values)
      },
    })
    await this.application.launch(true)
    await Factory.registerUserToApplication({
      application: this.application,
      email: UuidGenerator.GenerateUuid(),
      password,
    })

    let note = await Factory.createMappedNote(this.application)
    note = await this.application.mutations.protectNote(note)

    expect(await this.application.authorizeNoteAccess(note)).to.be.true
    expect(challengePrompts).to.equal(1)
  })

  it('sets `note.protected` to true', async function () {
    this.application = await Factory.createInitAppWithFakeCrypto()
    let note = await Factory.createMappedNote(this.application)
    note = await this.application.mutations.protectNote(note)
    expect(note.protected).to.be.true
  })

  it('prompts for passcode when accessing protected note', async function () {
    const passcode = 'passcode'
    let challengePrompts = 0

    this.application = await Factory.createApplicationWithFakeCrypto(Factory.randomString())
    await this.application.prepareForLaunch({
      receiveChallenge: (challenge) => {
        challengePrompts += 1
        expect(
          challenge.prompts.find(
            (prompt) => prompt.validation === ChallengeValidation.LocalPasscode,
          ),
        ).to.be.ok
        const values = challenge.prompts.map(
          (prompt) =>
            new ChallengeValue(
              prompt,
              prompt.validation === ChallengeValidation.LocalPasscode
                ? passcode
                : UnprotectedAccessSecondsDuration.OneMinute,
            ),
        )

        this.application.submitValuesForChallenge(challenge, values)
      },
    })
    await this.application.launch(true)

    await this.application.addPasscode(passcode)
    let note = await Factory.createMappedNote(this.application)
    note = await this.application.mutations.protectNote(note)

    expect(await this.application.authorizeNoteAccess(note)).to.be.true
    expect(challengePrompts).to.equal(1)
  })

  it('prompts for passcode when unprotecting a note', async function () {
    const passcode = 'passcode'
    let challengePrompts = 0

    this.application = await Factory.createApplicationWithFakeCrypto(Factory.randomString())
    await this.application.prepareForLaunch({
      receiveChallenge: (challenge) => {
        challengePrompts += 1
        expect(
          challenge.prompts.find(
            (prompt) => prompt.validation === ChallengeValidation.LocalPasscode,
          ),
        ).to.be.ok
        const values = challenge.prompts.map(
          (prompt) =>
            new ChallengeValue(
              prompt,
              prompt.validation === ChallengeValidation.LocalPasscode
                ? passcode
                : UnprotectedAccessSecondsDuration.OneMinute,
            ),
        )

        this.application.submitValuesForChallenge(challenge, values)
      },
    })
    await this.application.launch(true)

    await this.application.addPasscode(passcode)
    let note = await Factory.createMappedNote(this.application)
    const uuid = note.uuid
    note = await this.application.mutations.protectNote(note)
    note = await this.application.mutations.unprotectNote(note)
    expect(note.uuid).to.equal(uuid)
    expect(note.protected).to.equal(false)
    expect(challengePrompts).to.equal(1)
  })

  it('does not unprotect note if challenge is canceled', async function () {
    const passcode = 'passcode'
    let challengePrompts = 0

    this.application = await Factory.createApplicationWithFakeCrypto(Factory.randomString())
    await this.application.prepareForLaunch({
      receiveChallenge: (challenge) => {
        challengePrompts++
        this.application.cancelChallenge(challenge)
      },
    })
    await this.application.launch(true)

    await this.application.addPasscode(passcode)
    let note = await Factory.createMappedNote(this.application)
    note = await this.application.mutations.protectNote(note)
    const result = await this.application.mutations.unprotectNote(note)
    expect(result).to.be.undefined
    expect(challengePrompts).to.equal(1)
  })

  it('does not prompt for passcode again after setting a remember duration', async function () {
    const passcode = 'passcode'

    let challengePrompts = 0
    this.application = await Factory.createApplicationWithFakeCrypto(Factory.randomString())
    await this.application.prepareForLaunch({
      receiveChallenge: (challenge) => {
        challengePrompts += 1
        expect(
          challenge.prompts.find(
            (prompt) => prompt.validation === ChallengeValidation.LocalPasscode,
          ),
        ).to.be.ok
        const values = challenge.prompts.map(
          (prompt) =>
            new ChallengeValue(
              prompt,
              prompt.validation === ChallengeValidation.LocalPasscode
                ? passcode
                : UnprotectedAccessSecondsDuration.OneHour,
            ),
        )

        this.application.submitValuesForChallenge(challenge, values)
      },
    })
    await this.application.launch(true)

    await this.application.addPasscode(passcode)
    let note = await Factory.createMappedNote(this.application)
    note = await this.application.mutations.protectNote(note)

    expect(await this.application.authorizeNoteAccess(note)).to.be.true
    expect(await this.application.authorizeNoteAccess(note)).to.be.true
    expect(challengePrompts).to.equal(1)
  })

  it('prompts for password when adding a passcode', async function () {
    const application = Factory.createApplicationWithFakeCrypto(Factory.randomString())
    const password = UuidGenerator.GenerateUuid()
    const passcode = 'passcode'
    let didPromptForPassword = false
    await application.prepareForLaunch({
      receiveChallenge: (challenge) => {
        let values
        if (challenge.prompts[0].validation === ChallengeValidation.AccountPassword) {
          if (challenge.reason === ChallengeReason.AddPasscode) {
            didPromptForPassword = true
          }
          values = challenge.prompts.map(
            (prompt) =>
              new ChallengeValue(
                prompt,
                prompt.validation === ChallengeValidation.AccountPassword
                  ? password
                  : UnprotectedAccessSecondsDuration.OneHour,
              ),
          )
        } else {
          values = [new ChallengeValue(challenge.prompts[0], passcode)]
        }

        application.submitValuesForChallenge(challenge, values)
      },
    })
    await application.launch(true)
    await Factory.registerUserToApplication({
      application: application,
      email: UuidGenerator.GenerateUuid(),
      password,
    })

    await application.addPasscode(passcode)
    expect(didPromptForPassword).to.equal(true)
    await Factory.safeDeinit(application)
  })

  it('authorizes note access when no password or passcode are set', async function () {
    this.application = await Factory.createInitAppWithFakeCrypto()

    let note = await Factory.createMappedNote(this.application)
    note = await this.application.mutations.protectNote(note)

    expect(await this.application.authorizeNoteAccess(note)).to.be.true
  })

  it('authorizes autolock interval change', async function () {
    const passcode = 'passcode'

    this.application = await Factory.createApplicationWithFakeCrypto(Factory.randomString())
    await this.application.prepareForLaunch({
      receiveChallenge: (challenge) => {
        expect(
          challenge.prompts.find(
            (prompt) => prompt.validation === ChallengeValidation.LocalPasscode,
          ),
        ).to.be.ok
        const values = challenge.prompts.map(
          (prompt) =>
            new ChallengeValue(
              prompt,
              prompt.validation === ChallengeValidation.LocalPasscode
                ? passcode
                : UnprotectedAccessSecondsDuration.OneMinute,
            ),
        )

        this.application.submitValuesForChallenge(challenge, values)
      },
    })
    await this.application.launch(true)

    await this.application.addPasscode(passcode)

    expect(await this.application.authorizeAutolockIntervalChange()).to.be.true
  })

  it('authorizes batch manager access', async function () {
    const passcode = 'passcode'

    this.application = await Factory.createApplicationWithFakeCrypto(Factory.randomString())
    await this.application.prepareForLaunch({
      receiveChallenge: (challenge) => {
        expect(
          challenge.prompts.find(
            (prompt) => prompt.validation === ChallengeValidation.LocalPasscode,
          ),
        ).to.be.ok
        const values = challenge.prompts.map(
          (prompt) =>
            new ChallengeValue(
              prompt,
              prompt.validation === ChallengeValidation.LocalPasscode
                ? passcode
                : UnprotectedAccessSecondsDuration.OneMinute,
            ),
        )

        this.application.submitValuesForChallenge(challenge, values)
      },
    })
    await this.application.launch(true)

    await this.application.addPasscode(passcode)

    expect(await this.application.authorizeAutolockIntervalChange()).to.be.true
  })

  it('handles session length', async function () {
    this.application = await Factory.createInitAppWithFakeCrypto()
    await this.application.protectionService.setSessionLength(300)
    const length = await this.application.protectionService.getLastSessionLength()
    expect(length).to.equal(300)
    const expirey = await this.application.getProtectionSessionExpiryDate()
    expect(expirey).to.be.ok
  })

  it('handles session length', async function () {
    this.application = await Factory.createInitAppWithFakeCrypto()
    await this.application.protectionService.setSessionLength(
      UnprotectedAccessSecondsDuration.OneMinute,
    )
    const length = await this.application.protectionService.getLastSessionLength()
    expect(length).to.equal(UnprotectedAccessSecondsDuration.OneMinute)
    const expirey = await this.application.getProtectionSessionExpiryDate()
    expect(expirey).to.be.ok
  })

  describe('hasProtectionSources', async function () {
    it('no account, no passcode, no biometrics', async function () {
      this.application = await Factory.createInitAppWithFakeCrypto()
      expect(this.application.hasProtectionSources()).to.be.false
    })

    it('no account, no passcode, biometrics', async function () {
      this.application = await Factory.createInitAppWithFakeCrypto()
      await this.application.enableBiometrics()
      expect(this.application.hasProtectionSources()).to.be.true
    })

    it('no account, passcode, no biometrics', async function () {
      this.application = await Factory.createInitAppWithFakeCrypto()
      await this.application.addPasscode('passcode')
      expect(this.application.hasProtectionSources()).to.be.true
    })

    it('no account, passcode, biometrics', async function () {
      this.application = await Factory.createInitAppWithFakeCrypto()
      await this.application.addPasscode('passcode')
      await this.application.enableBiometrics()
      expect(this.application.hasProtectionSources()).to.be.true
    })

    it('account, no passcode, no biometrics', async function () {
      this.application = await Factory.createInitAppWithFakeCrypto()
      await Factory.registerUserToApplication({
        application: this.application,
        email: UuidGenerator.GenerateUuid(),
        password: UuidGenerator.GenerateUuid(),
      })
      expect(this.application.hasProtectionSources()).to.be.true
    })

    it('account, no passcode, biometrics', async function () {
      this.application = await Factory.createInitAppWithFakeCrypto()
      await Factory.registerUserToApplication({
        application: this.application,
        email: UuidGenerator.GenerateUuid(),
        password: UuidGenerator.GenerateUuid(),
      })
      await this.application.enableBiometrics()
      expect(this.application.hasProtectionSources()).to.be.true
    })

    it('account, passcode, no biometrics', async function () {
      this.application = await Factory.createInitAppWithFakeCrypto()
      const password = UuidGenerator.GenerateUuid()
      await Factory.registerUserToApplication({
        application: this.application,
        email: UuidGenerator.GenerateUuid(),
        password,
      })
      Factory.handlePasswordChallenges(this.application, password)
      await this.application.addPasscode('passcode')
      expect(this.application.hasProtectionSources()).to.be.true
    })

    it('account, passcode, biometrics', async function () {
      this.application = await Factory.createInitAppWithFakeCrypto()
      const password = UuidGenerator.GenerateUuid()
      await Factory.registerUserToApplication({
        application: this.application,
        email: UuidGenerator.GenerateUuid(),
        password,
      })
      Factory.handlePasswordChallenges(this.application, password)
      await this.application.addPasscode('passcode')
      await this.application.enableBiometrics()
      expect(this.application.hasProtectionSources()).to.be.true
    })
  })

  describe('hasUnprotectedAccessSession', async function () {
    it('should return false when session length has not been set', async function () {
      this.foo = 'tar'
      this.application = await Factory.createInitAppWithFakeCrypto()
      await this.application.addPasscode('passcode')
      expect(this.application.hasUnprotectedAccessSession()).to.be.false
    })

    it('should return true when session length has been set', async function () {
      this.application = await Factory.createInitAppWithFakeCrypto()
      await this.application.addPasscode('passcode')
      await this.application.protectionService.setSessionLength(
        UnprotectedAccessSecondsDuration.OneMinute,
      )
      expect(this.application.hasUnprotectedAccessSession()).to.be.true
    })

    it('should return true when there are no protection sources', async function () {
      this.application = await Factory.createInitAppWithFakeCrypto()
      expect(this.application.hasUnprotectedAccessSession()).to.be.true
    })
  })

  describe('authorizeProtectedActionForNotes', async function () {
    it('prompts for password once with the right challenge reason when one or more notes are protected', async function () {
      let challengePrompts = 0
      this.application = await Factory.createApplicationWithFakeCrypto(Factory.randomString())
      const password = UuidGenerator.GenerateUuid()

      await this.application.prepareForLaunch({
        receiveChallenge: (challenge) => {
          challengePrompts += 1
          expect(
            challenge.prompts.find(
              (prompt) => prompt.validation === ChallengeValidation.AccountPassword,
            ),
          ).to.be.ok
          expect(challenge.reason).to.equal(ChallengeReason.SelectProtectedNote)
          const values = challenge.prompts.map(
            (prompt) =>
              new ChallengeValue(
                prompt,
                prompt.validation === ChallengeValidation.AccountPassword
                  ? password
                  : UnprotectedAccessSecondsDuration.OneMinute,
              ),
          )
          this.application.submitValuesForChallenge(challenge, values)
        },
      })
      await this.application.launch(true)
      await Factory.registerUserToApplication({
        application: this.application,
        email: UuidGenerator.GenerateUuid(),
        password,
      })

      const NOTE_COUNT = 3
      let notes = await Factory.createManyMappedNotes(this.application, NOTE_COUNT)

      notes[0] = await this.application.mutations.protectNote(notes[0])
      notes[1] = await this.application.mutations.protectNote(notes[1])

      expect(
        await this.application.authorizeProtectedActionForNotes(
          notes,
          ChallengeReason.SelectProtectedNote,
        ),
      ).lengthOf(NOTE_COUNT)
      expect(challengePrompts).to.equal(1)
    })

    it('prompts for passcode once with the right challenge reason when one or more notes are protected', async function () {
      let challengePrompts = 0
      this.application = await Factory.createApplicationWithFakeCrypto(Factory.randomString())
      const passcode = 'passcode'

      await this.application.prepareForLaunch({
        receiveChallenge: (challenge) => {
          challengePrompts += 1
          expect(
            challenge.prompts.find(
              (prompt) => prompt.validation === ChallengeValidation.LocalPasscode,
            ),
          ).to.be.ok
          expect(challenge.reason).to.equal(ChallengeReason.SelectProtectedNote)
          const values = challenge.prompts.map(
            (prompt) =>
              new ChallengeValue(
                prompt,
                prompt.validation === ChallengeValidation.LocalPasscode
                  ? passcode
                  : UnprotectedAccessSecondsDuration.OneMinute,
              ),
          )

          this.application.submitValuesForChallenge(challenge, values)
        },
      })
      await this.application.launch(true)
      await this.application.addPasscode(passcode)

      const NOTE_COUNT = 3
      let notes = await Factory.createManyMappedNotes(this.application, NOTE_COUNT)
      notes[0] = await this.application.mutations.protectNote(notes[0])
      notes[1] = await this.application.mutations.protectNote(notes[1])

      expect(
        await this.application.authorizeProtectedActionForNotes(
          notes,
          ChallengeReason.SelectProtectedNote,
        ),
      ).lengthOf(NOTE_COUNT)
      expect(challengePrompts).to.equal(1)
    })

    it('does not return protected notes if challenge is canceled', async function () {
      const passcode = 'passcode'
      let challengePrompts = 0

      this.application = await Factory.createApplicationWithFakeCrypto(Factory.randomString())
      await this.application.prepareForLaunch({
        receiveChallenge: (challenge) => {
          challengePrompts++
          this.application.cancelChallenge(challenge)
        },
      })
      await this.application.launch(true)
      await this.application.addPasscode(passcode)

      const NOTE_COUNT = 3
      let notes = await Factory.createManyMappedNotes(this.application, NOTE_COUNT)
      notes[0] = await this.application.mutations.protectNote(notes[0])
      notes[1] = await this.application.mutations.protectNote(notes[1])

      expect(
        await this.application.authorizeProtectedActionForNotes(
          notes,
          ChallengeReason.SelectProtectedNote,
        ),
      ).lengthOf(1)
      expect(challengePrompts).to.equal(1)
    })
  })

  describe('protectNotes', async function () {
    it('protects all notes', async function () {
      this.application = await Factory.createApplicationWithFakeCrypto(Factory.randomString())
      await this.application.prepareForLaunch({
        receiveChallenge: (challenge) => {
          this.application.cancelChallenge(challenge)
        },
      })
      await this.application.launch(true)

      const NOTE_COUNT = 3
      let notes = await Factory.createManyMappedNotes(this.application, NOTE_COUNT)
      notes = await this.application.mutations.protectNotes(notes)

      for (const note of notes) {
        expect(note.protected).to.be.true
      }
    })
  })

  describe('unprotect notes', async function () {
    it('prompts for password and unprotects all notes if challenge is succesful', async function () {
      let challengePrompts = 0
      this.application = await Factory.createApplicationWithFakeCrypto(Factory.randomString())
      const passcode = 'passcode'

      await this.application.prepareForLaunch({
        receiveChallenge: (challenge) => {
          challengePrompts += 1
          expect(
            challenge.prompts.find(
              (prompt) => prompt.validation === ChallengeValidation.LocalPasscode,
            ),
          ).to.be.ok
          expect(challenge.reason).to.equal(ChallengeReason.UnprotectNote)
          const values = challenge.prompts.map(
            (prompt) =>
              new ChallengeValue(
                prompt,
                prompt.validation === ChallengeValidation.LocalPasscode
                  ? passcode
                  : UnprotectedAccessSecondsDuration.OneMinute,
              ),
          )

          this.application.submitValuesForChallenge(challenge, values)
        },
      })
      await this.application.launch(true)
      await this.application.addPasscode(passcode)

      const NOTE_COUNT = 3
      let notes = await Factory.createManyMappedNotes(this.application, NOTE_COUNT)
      notes = await this.application.mutations.protectNotes(notes)
      notes = await this.application.mutations.unprotectNotes(notes)

      for (const note of notes) {
        expect(note.protected).to.be.false
      }
      expect(challengePrompts).to.equal(1)
    })

    it('prompts for passcode and unprotects all notes if challenge is succesful', async function () {
      let challengePrompts = 0
      this.application = await Factory.createApplicationWithFakeCrypto(Factory.randomString())
      const passcode = 'passcode'

      await this.application.prepareForLaunch({
        receiveChallenge: (challenge) => {
          challengePrompts += 1
          expect(
            challenge.prompts.find(
              (prompt) => prompt.validation === ChallengeValidation.LocalPasscode,
            ),
          ).to.be.ok
          expect(challenge.reason).to.equal(ChallengeReason.UnprotectNote)
          const values = challenge.prompts.map(
            (prompt) =>
              new ChallengeValue(
                prompt,
                prompt.validation === ChallengeValidation.LocalPasscode
                  ? passcode
                  : UnprotectedAccessSecondsDuration.OneMinute,
              ),
          )

          this.application.submitValuesForChallenge(challenge, values)
        },
      })
      await this.application.launch(true)
      await this.application.addPasscode(passcode)

      const NOTE_COUNT = 3
      let notes = await Factory.createManyMappedNotes(this.application, NOTE_COUNT)
      notes = await this.application.mutations.protectNotes(notes)
      notes = await this.application.mutations.unprotectNotes(notes)

      for (const note of notes) {
        expect(note.protected).to.be.false
      }
      expect(challengePrompts).to.equal(1)
    })

    it('does not unprotect any notes if challenge is canceled', async function () {
      const passcode = 'passcode'
      let challengePrompts = 0

      this.application = await Factory.createApplicationWithFakeCrypto(Factory.randomString())
      await this.application.prepareForLaunch({
        receiveChallenge: (challenge) => {
          challengePrompts++
          this.application.cancelChallenge(challenge)
        },
      })
      await this.application.launch(true)
      await this.application.addPasscode(passcode)

      const NOTE_COUNT = 3
      let notes = await Factory.createManyMappedNotes(this.application, NOTE_COUNT)
      notes = await this.application.mutations.protectNotes(notes)
      notes = await this.application.mutations.unprotectNotes(notes)

      for (const note of notes) {
        expect(note.protected).to.be(true)
      }
      expect(challengePrompts).to.equal(1)
    })
  })
})
