/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('protections', function () {
  this.timeout(Factory.TestTimeout);

  beforeEach(async function () {
    localStorage.clear();
  });

  afterEach(async function () {
    await this.application.deinit();
    localStorage.clear();
  });

  it('prompts for password when accessing protected note', async function () {
    let challengePrompts = 0;

    this.application = await Factory.createApplication(Factory.randomString());
    const password = Uuid.GenerateUuidSynchronously();
    await this.application.prepareForLaunch({
      receiveChallenge: (challenge) => {
        challengePrompts += 1;
        expect(
          challenge.prompts.find(
            (prompt) =>
              prompt.validation === ChallengeValidation.AccountPassword
          )
        ).to.be.ok;
        const values = challenge.prompts.map(
          (prompt) =>
            new ChallengeValue(
              prompt,
              prompt.validation === ChallengeValidation.AccountPassword
                ? password
                : 0
            )
        );

        this.application.submitValuesForChallenge(challenge, values);
      },
    });
    await this.application.launch(true);
    await Factory.registerUserToApplication({
      application: this.application,
      email: Uuid.GenerateUuidSynchronously(),
      password,
    });

    let note = await Factory.createMappedNote(this.application);
    note = await this.application.protectNote(note);

    expect(await this.application.authorizeNoteAccess(note)).to.be.true;
    expect(challengePrompts).to.equal(1);
  });

  it('sets `note.protected` to true', async function () {
    this.application = await Factory.createInitAppWithRandNamespace();
    let note = await Factory.createMappedNote(this.application);
    note = await this.application.protectNote(note);
    expect(note.protected).to.be.true;
  });

  it('prompts for passcode when accessing protected note', async function () {
    const passcode = 'passcode🌂';
    let challengePrompts = 0;

    this.application = await Factory.createApplication(Factory.randomString());
    await this.application.prepareForLaunch({
      receiveChallenge: (challenge) => {
        challengePrompts += 1;
        expect(
          challenge.prompts.find(
            (prompt) => prompt.validation === ChallengeValidation.LocalPasscode
          )
        ).to.be.ok;
        const values = challenge.prompts.map(
          (prompt) =>
            new ChallengeValue(
              prompt,
              prompt.validation === ChallengeValidation.LocalPasscode
                ? passcode
                : 0
            )
        );

        this.application.submitValuesForChallenge(challenge, values);
      },
    });
    await this.application.launch(true);

    await this.application.addPasscode(passcode);
    let note = await Factory.createMappedNote(this.application);
    note = await this.application.protectNote(note);

    expect(await this.application.authorizeNoteAccess(note)).to.be.true;
    expect(challengePrompts).to.equal(1);
  });

  it('prompts for passcode when unprotecting a note', async function () {
    const passcode = 'passcode🌂';
    let challengePrompts = 0;

    this.application = await Factory.createApplication(Factory.randomString());
    await this.application.prepareForLaunch({
      receiveChallenge: (challenge) => {
        challengePrompts += 1;
        expect(
          challenge.prompts.find(
            (prompt) => prompt.validation === ChallengeValidation.LocalPasscode
          )
        ).to.be.ok;
        const values = challenge.prompts.map(
          (prompt) =>
            new ChallengeValue(
              prompt,
              prompt.validation === ChallengeValidation.LocalPasscode
                ? passcode
                : 0
            )
        );

        this.application.submitValuesForChallenge(challenge, values);
      },
    });
    await this.application.launch(true);

    await this.application.addPasscode(passcode);
    let note = await Factory.createMappedNote(this.application);
    const uuid = note.uuid;
    note = await this.application.protectNote(note);
    note = await this.application.unprotectNote(note);
    expect(note.uuid).to.equal(uuid);
    expect(note.protected).to.equal(false);
    expect(challengePrompts).to.equal(1);
  });

  it('does not unprotect note if challenge is canceled', async function () {
    const passcode = 'passcode🌂';
    let challengePrompts = 0;

    this.application = await Factory.createApplication(Factory.randomString());
    await this.application.prepareForLaunch({
      receiveChallenge: (challenge) => {
        challengePrompts++;
        this.application.cancelChallenge(challenge);
      },
    });
    await this.application.launch(true);

    await this.application.addPasscode(passcode);
    let note = await Factory.createMappedNote(this.application);
    note = await this.application.protectNote(note);
    const result = await this.application.unprotectNote(note);
    expect(result).to.be.undefined;
    expect(challengePrompts).to.equal(1);
  });

  it('does not prompt for passcode again after setting a remember duration', async function () {
    const passcode = 'passcode🌂';

    let challengePrompts = 0;
    this.application = await Factory.createApplication(Factory.randomString());
    await this.application.prepareForLaunch({
      receiveChallenge: (challenge) => {
        challengePrompts += 1;
        expect(
          challenge.prompts.find(
            (prompt) => prompt.validation === ChallengeValidation.LocalPasscode
          )
        ).to.be.ok;
        const values = challenge.prompts.map(
          (prompt) =>
            new ChallengeValue(
              prompt,
              prompt.validation === ChallengeValidation.LocalPasscode
                ? passcode
                : 3600
            )
        );

        this.application.submitValuesForChallenge(challenge, values);
      },
    });
    await this.application.launch(true);

    await this.application.addPasscode(passcode);
    let note = await Factory.createMappedNote(this.application);
    note = await this.application.protectNote(note);

    expect(await this.application.authorizeNoteAccess(note)).to.be.true;
    expect(await this.application.authorizeNoteAccess(note)).to.be.true;
    expect(challengePrompts).to.equal(1);
  });

  it('prompts for password when adding a passcode', async function () {
    this.application = await Factory.createInitAppWithRandNamespace();
    const password = Uuid.GenerateUuidSynchronously();
    await Factory.registerUserToApplication({
      application: this.application,
      email: Uuid.GenerateUuidSynchronously(),
      password,
    });
    const promise = new Promise((resolve, reject) => {
      this.application.setLaunchCallback({
        receiveChallenge(challenge) {
          if (
            challenge.reason === ChallengeReason.AddPasscode &&
            challenge.prompts[0].validation ===
              ChallengeValidation.AccountPassword
          ) {
            resolve();
          } else {
            reject(Error('Received unknown challenge.'));
          }
        },
      });
    });
    this.application.addPasscode('passcode');
    return promise;
  });

  it('authorizes note access when no password or passcode are set', async function () {
    this.application = await Factory.createInitAppWithRandNamespace();

    let note = await Factory.createMappedNote(this.application);
    note = await this.application.protectNote(note);

    expect(await this.application.authorizeNoteAccess(note)).to.be.true;
  });

  it('authorizes autolock interval change', async function () {
    const passcode = 'passcode🌂';

    this.application = await Factory.createApplication(Factory.randomString());
    await this.application.prepareForLaunch({
      receiveChallenge: (challenge) => {
        expect(
          challenge.prompts.find(
            (prompt) => prompt.validation === ChallengeValidation.LocalPasscode
          )
        ).to.be.ok;
        const values = challenge.prompts.map(
          (prompt) =>
            new ChallengeValue(
              prompt,
              prompt.validation === ChallengeValidation.LocalPasscode
                ? passcode
                : 0
            )
        );

        this.application.submitValuesForChallenge(challenge, values);
      },
    });
    await this.application.launch(true);

    await this.application.addPasscode(passcode);

    expect(await this.application.authorizeAutolockIntervalChange()).to.be.true;
  });

  it('authorizes batch manager access', async function () {
    const passcode = 'passcode🌂';

    this.application = await Factory.createApplication(Factory.randomString());
    await this.application.prepareForLaunch({
      receiveChallenge: (challenge) => {
        expect(
          challenge.prompts.find(
            (prompt) => prompt.validation === ChallengeValidation.LocalPasscode
          )
        ).to.be.ok;
        const values = challenge.prompts.map(
          (prompt) =>
            new ChallengeValue(
              prompt,
              prompt.validation === ChallengeValidation.LocalPasscode
                ? passcode
                : 0
            )
        );

        this.application.submitValuesForChallenge(challenge, values);
      },
    });
    await this.application.launch(true);

    await this.application.addPasscode(passcode);

    expect(await this.application.authorizeAutolockIntervalChange()).to.be.true;
  });

  it('handles session length', async function () {
    this.application = await Factory.createInitAppWithRandNamespace();
    await this.application.protectionService.setSessionLength(300);
    const length = await this.application.protectionService.getSessionLength();
    expect(length).to.equal(300);
    const expirey = await this.application.getProtectionSessionExpiryDate();
    expect(expirey).to.be.ok;
  });

  it('handles session length', async function () {
    this.application = await Factory.createInitAppWithRandNamespace();
    await this.application.protectionService.setSessionLength(300);
    const length = await this.application.protectionService.getSessionLength();
    expect(length).to.equal(300);
    const expirey = await this.application.getProtectionSessionExpiryDate();
    expect(expirey).to.be.ok;
  });

  describe('hasProtectionSources', async function () {
    it('no account, no passcode, no biometrics', async function () {
      this.application = await Factory.createInitAppWithRandNamespace();
      expect(this.application.hasProtectionSources()).to.be.false;
    });

    it('no account, no passcode, biometrics', async function () {
      this.application = await Factory.createInitAppWithRandNamespace();
      await this.application.enableBiometrics();
      expect(this.application.hasProtectionSources()).to.be.true;
    });

    it('no account, passcode, no biometrics', async function () {
      this.application = await Factory.createInitAppWithRandNamespace();
      await this.application.addPasscode('passcode');
      expect(this.application.hasProtectionSources()).to.be.true;
    });

    it('no account, passcode, biometrics', async function () {
      this.application = await Factory.createInitAppWithRandNamespace();
      await this.application.addPasscode('passcode');
      await this.application.enableBiometrics();
      expect(this.application.hasProtectionSources()).to.be.true;
    });

    it('account, no passcode, no biometrics', async function () {
      this.application = await Factory.createInitAppWithRandNamespace();
      await Factory.registerUserToApplication({
        application: this.application,
        email: Uuid.GenerateUuidSynchronously(),
        password: Uuid.GenerateUuidSynchronously(),
      });
      expect(this.application.hasProtectionSources()).to.be.true;
    });

    it('account, no passcode, biometrics', async function () {
      this.application = await Factory.createInitAppWithRandNamespace();
      await Factory.registerUserToApplication({
        application: this.application,
        email: Uuid.GenerateUuidSynchronously(),
        password: Uuid.GenerateUuidSynchronously(),
      });
      await this.application.enableBiometrics();
      expect(this.application.hasProtectionSources()).to.be.true;
    });

    it('account, passcode, no biometrics', async function () {
      this.application = await Factory.createInitAppWithRandNamespace();
      const password = Uuid.GenerateUuidSynchronously();
      await Factory.registerUserToApplication({
        application: this.application,
        email: Uuid.GenerateUuidSynchronously(),
        password,
      });
      Factory.handlePasswordChallenges(this.application, password);
      await this.application.addPasscode('passcode');
      expect(this.application.hasProtectionSources()).to.be.true;
    });

    it('account, passcode, biometrics', async function () {
      this.application = await Factory.createInitAppWithRandNamespace();
      const password = Uuid.GenerateUuidSynchronously();
      await Factory.registerUserToApplication({
        application: this.application,
        email: Uuid.GenerateUuidSynchronously(),
        password,
      });
      Factory.handlePasswordChallenges(this.application, password);
      await this.application.addPasscode('passcode');
      await this.application.enableBiometrics();
      expect(this.application.hasProtectionSources()).to.be.true;
    });
  });

  describe('areProtectionsEnabled', async function () {
    it('should return true when session length has not been set', async function () {
      this.application = await Factory.createInitAppWithRandNamespace();
      await this.application.addPasscode('passcode');
      expect(this.application.areProtectionsEnabled()).to.be.true;
    });

    it('should return false when session length has been set', async function () {
      this.application = await Factory.createInitAppWithRandNamespace();
      await this.application.addPasscode('passcode');
      await this.application.protectionService.setSessionLength(300);
      expect(this.application.areProtectionsEnabled()).to.be.false;
    });

    it('should return false when there are no protection sources', async function () {
      this.application = await Factory.createInitAppWithRandNamespace();
      expect(this.application.areProtectionsEnabled()).to.be.false;
    });
  });

  describe('authorizeProtectedActionForNotes', async function () {
    it('prompts for password once with the right challenge reason when one or more notes are protected', async function () {
      let challengePrompts = 0;
      this.application = await Factory.createApplication(Factory.randomString());
      const password = Uuid.GenerateUuidSynchronously();

      await this.application.prepareForLaunch({
        receiveChallenge: (challenge) => {
          challengePrompts += 1;
          expect(
            challenge.prompts.find(
              (prompt) =>
                prompt.validation === ChallengeValidation.AccountPassword
            )
          ).to.be.ok;
          expect(challenge.reason).to.equal(ChallengeReason.SelectProtectedNote);
          const values = challenge.prompts.map(
            (prompt) =>
              new ChallengeValue(
                prompt,
                prompt.validation === ChallengeValidation.AccountPassword
                  ? password
                  : 0
              )
          );
          this.application.submitValuesForChallenge(challenge, values);
        },
      });
      await this.application.launch(true);
      await Factory.registerUserToApplication({
        application: this.application,
        email: Uuid.GenerateUuidSynchronously(),
        password,
      });

      const NOTE_COUNT = 3;
      let notes = await Factory.createManyMappedNotes(this.application, NOTE_COUNT);

      notes[0] = await this.application.protectNote(notes[0]);
      notes[1] = await this.application.protectNote(notes[1]);

      expect(await this.application.authorizeProtectedActionForNotes(
        notes,
        ChallengeReason.SelectProtectedNote
      )).lengthOf(NOTE_COUNT);
      expect(challengePrompts).to.equal(1);
    });

    it('prompts for passcode once with the right challenge reason when one or more notes are protected', async function () {
      let challengePrompts = 0;
      this.application = await Factory.createApplication(Factory.randomString());
      const passcode = 'passcode🌂';

      await this.application.prepareForLaunch({
        receiveChallenge: (challenge) => {
          challengePrompts += 1;
          expect(
            challenge.prompts.find(
              (prompt) => prompt.validation === ChallengeValidation.LocalPasscode
            )
          ).to.be.ok;
          expect(challenge.reason).to.equal(ChallengeReason.SelectProtectedNote);
          const values = challenge.prompts.map(
            (prompt) =>
              new ChallengeValue(
                prompt,
                prompt.validation === ChallengeValidation.LocalPasscode
                  ? passcode
                  : 0
              )
          );

          this.application.submitValuesForChallenge(challenge, values);
        },
      });
      await this.application.launch(true);
      await this.application.addPasscode(passcode);

      const NOTE_COUNT = 3;
      let notes = await Factory.createManyMappedNotes(this.application, NOTE_COUNT);
      notes[0] = await this.application.protectNote(notes[0]);
      notes[1] = await this.application.protectNote(notes[1]);

      expect(await this.application.authorizeProtectedActionForNotes(
        notes,
        ChallengeReason.SelectProtectedNote
      )).lengthOf(NOTE_COUNT);
      expect(challengePrompts).to.equal(1);
    });

    it('does not return protected notes if challenge is canceled', async function () {
      const passcode = 'passcode🌂';
      let challengePrompts = 0;

      this.application = await Factory.createApplication(Factory.randomString());
      await this.application.prepareForLaunch({
        receiveChallenge: (challenge) => {
          challengePrompts++;
          this.application.cancelChallenge(challenge);
        },
      });
      await this.application.launch(true);
      await this.application.addPasscode(passcode);

      const NOTE_COUNT = 3;
      let notes = await Factory.createManyMappedNotes(this.application, NOTE_COUNT);
      notes[0] = await this.application.protectNote(notes[0]);
      notes[1] = await this.application.protectNote(notes[1]);

      expect(await this.application.authorizeProtectedActionForNotes(
        notes,
        ChallengeReason.SelectProtectedNote
      )).lengthOf(1);
      expect(challengePrompts).to.equal(1);
    });
  });

  describe('protectNotes', async function () {
    it('protects all notes', async function () {
      this.application = await Factory.createApplication(Factory.randomString());

      const NOTE_COUNT = 3;
      let notes = await Factory.createManyMappedNotes(this.application, NOTE_COUNT);
      notes = await this.application.protectNotes(notes);

      for (const note of notes) {
        expect(note.protected).to.be.true;
      }
    })
  });

  describe('unprotect notes', async function () {
    it('prompts for password and unprotects all notes if challenge is succesful', async function () {
      let challengePrompts = 0;
      this.application = await Factory.createApplication(Factory.randomString());
      const passcode = 'passcode🌂';

      await this.application.prepareForLaunch({
        receiveChallenge: (challenge) => {
          challengePrompts += 1;
          expect(
            challenge.prompts.find(
              (prompt) => prompt.validation === ChallengeValidation.LocalPasscode
            )
          ).to.be.ok;
          expect(challenge.reason).to.equal(ChallengeReason.UnprotectNote);
          const values = challenge.prompts.map(
            (prompt) =>
              new ChallengeValue(
                prompt,
                prompt.validation === ChallengeValidation.LocalPasscode
                  ? passcode
                  : 0
              )
          );

          this.application.submitValuesForChallenge(challenge, values);
        },
      });
      await this.application.launch(true);
      await this.application.addPasscode(passcode);

      const NOTE_COUNT = 3;
      let notes = await Factory.createManyMappedNotes(this.application, NOTE_COUNT);
      notes = await this.application.protectNotes(notes);
      notes = await this.application.unprotectNotes(notes);
      
      for (const note of notes) {
        expect(note.protected).to.be.false;
      }
      expect(challengePrompts).to.equal(1);
    });

    it('prompts for passcode and unprotects all notes if challenge is succesful', async function () {
      let challengePrompts = 0;
      this.application = await Factory.createApplication(Factory.randomString());
      const passcode = 'passcode🌂';

      await this.application.prepareForLaunch({
        receiveChallenge: (challenge) => {
          challengePrompts += 1;
          expect(
            challenge.prompts.find(
              (prompt) => prompt.validation === ChallengeValidation.LocalPasscode
            )
          ).to.be.ok;
          expect(challenge.reason).to.equal(ChallengeReason.UnprotectNote);
          const values = challenge.prompts.map(
            (prompt) =>
              new ChallengeValue(
                prompt,
                prompt.validation === ChallengeValidation.LocalPasscode
                  ? passcode
                  : 0
              )
          );

          this.application.submitValuesForChallenge(challenge, values);
        },
      });
      await this.application.launch(true);
      await this.application.addPasscode(passcode);

      const NOTE_COUNT = 3;
      let notes = await Factory.createManyMappedNotes(this.application, NOTE_COUNT);
      notes = await this.application.protectNotes(notes);
      notes = await this.application.unprotectNotes(notes);
      
      for (const note of notes) {
        expect(note.protected).to.be.false;
      }
      expect(challengePrompts).to.equal(1);
    });

    it('does not unprotect any notes if challenge is canceled', async function () {
      const passcode = 'passcode🌂';
      let challengePrompts = 0;

      this.application = await Factory.createApplication(Factory.randomString());
      await this.application.prepareForLaunch({
        receiveChallenge: (challenge) => {
          challengePrompts++;
          this.application.cancelChallenge(challenge);
        },
      });
      await this.application.launch(true);
      await this.application.addPasscode(passcode);

      const NOTE_COUNT = 3;
      let notes = await Factory.createManyMappedNotes(this.application, NOTE_COUNT);
      notes = await this.application.protectNotes(notes);
      notes = await this.application.unprotectNotes(notes);
      
      for (const note of notes) {
        expect(note.protected).to.be(true);
      }
      expect(challengePrompts).to.equal(1);
    })
  })
});
