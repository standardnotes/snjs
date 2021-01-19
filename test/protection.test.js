/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('protections', function () {
  this.timeout(Factory.TestTimeout);

  before(async function () {
    localStorage.clear();
  });

  after(async function () {
    localStorage.clear();
  });

  beforeEach(async function () {});

  afterEach(async function () {
    await this.application.deinit();
  });

  it('prompts for password when accessing protected note', async function () {
    const password = Uuid.GenerateUuidSynchronously();

    let challengePrompts = 0;

    this.application = await Factory.createApplication(Factory.randomString());
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
    note = await this.application.changeItem(note.uuid, (mutator) => {
      mutator.protected = true;
    });

    expect(await this.application.authorizeNoteAccess(note)).to.be.true;
    expect(challengePrompts).to.equal(1);
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

    await this.application.setPasscode(passcode);
    let note = await Factory.createMappedNote(this.application);
    note = await this.application.changeItem(note.uuid, (mutator) => {
      mutator.protected = true;
    });

    expect(await this.application.authorizeNoteAccess(note)).to.be.true;
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

    await this.application.setPasscode(passcode);
    let note = await Factory.createMappedNote(this.application);
    note = await this.application.changeItem(note.uuid, (mutator) => {
      mutator.protected = true;
    });

    expect(await this.application.authorizeNoteAccess(note)).to.be.true;
    expect(await this.application.authorizeNoteAccess(note)).to.be.true;
    expect(challengePrompts).to.equal(1);
  });

  it('authorizes note access when no password or passcode are set', async function () {
    this.application = await Factory.createInitAppWithRandNamespace();

    const note = await Factory.createMappedNote(this.application);
    await this.application.changeItem(note.uuid, (mutator) => {
      mutator.protected = true;
    });

    expect(await this.application.authorizeNoteAccess(note)).to.be.true;
  });

  it('authorizes file import', async function () {
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

    await this.application.setPasscode(passcode);

    expect(await this.application.authorizeFileImport()).to.be.true;
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

    await this.application.setPasscode(passcode);

    expect(await this.application.authorizeAutolockIntervalChange()).to.be.true;
  });

  it('handles session length', async function () {
    this.application = await Factory.createInitAppWithRandNamespace();
    await this.application.protectionService.setSessionLength(300);
    const length = await this.application.protectionService.getSessionLength();
    expect(length).to.equal(300);
    const expirey = await this.application.protectionService.getSessionExpirey();
    expect(expirey).to.be.ok;
  });
});
