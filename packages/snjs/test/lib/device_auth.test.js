import { ChallengeValidation, ChallengeValue } from '@Lib/challenges';
import { KeyMode } from '@Lib/services';
import { Uuid } from '@Lib/uuid';
import * as Factory from './../factory';

describe('device authentication', function () {
  it('handles application launch with passcode only', async function () {
    const namespace = Factory.randomString();
    const application = await Factory.createAndInitializeApplication(namespace);
    const passcode = 'foobar';
    const wrongPasscode = 'barfoo';
    expect(application.protectionService.createLaunchChallenge()).toBeFalsy();
    await application.addPasscode(passcode);
    expect(application.hasPasscode()).toBe(true);
    expect(application.protectionService.createLaunchChallenge()).toBeTruthy();
    expect(application.protocolService.keyMode).toBe(KeyMode.WrapperOnly);
    application.deinit();

    /** Recreate application and initialize */
    const tmpApplication = Factory.createApplication(namespace);
    let numPasscodeAttempts = 0;
    const promptValueReply = (prompts) => {
      const values = [];
      for (const prompt of prompts) {
        if (prompt.validation === ChallengeValidation.LocalPasscode) {
          values.push(
            new ChallengeValue(
              prompt,
              numPasscodeAttempts < 2 ? wrongPasscode : passcode
            )
          );
        }
      }
      return values;
    };
    const receiveChallenge = async (challenge) => {
      tmpApplication.addChallengeObserver(challenge, {
        onInvalidValue: (value) => {
          const values = promptValueReply([value.prompt]);
          tmpApplication.submitValuesForChallenge(challenge, values);
          numPasscodeAttempts++;
        },
      });
      const initialValues = promptValueReply(challenge.prompts);
      tmpApplication.submitValuesForChallenge(challenge, initialValues);
    };
    await tmpApplication.prepareForLaunch({ receiveChallenge });
    expect(tmpApplication.protocolService.getRootKey()).toBeFalsy();
    await tmpApplication.launch(true);
    expect(tmpApplication.protocolService.getRootKey()).toBeTruthy();
    expect(tmpApplication.protocolService.keyMode).toBe(KeyMode.WrapperOnly);
    tmpApplication.deinit();
  }, 10000);

  it('handles application launch with passcode and biometrics', async function () {
    const namespace = Factory.randomString();
    const application = await Factory.createAndInitializeApplication(namespace);
    const passcode = 'foobar';
    const wrongPasscode = 'barfoo';
    await application.addPasscode(passcode);
    await application.protectionService.enableBiometrics();
    expect(application.hasPasscode()).toBe(true);
    expect(
      application.protectionService.createLaunchChallenge().prompts
        .length
    ).toBe(2);
    expect(application.protocolService.keyMode).toBe(KeyMode.WrapperOnly);
    application.deinit();

    /** Recreate application and initialize */
    const tmpApplication = Factory.createApplication(namespace);
    let numPasscodeAttempts = 1;
    const promptValueReply = (prompts) => {
      const values = [];
      for (const prompt of prompts) {
        if (prompt.validation === ChallengeValidation.LocalPasscode) {
          const response = new ChallengeValue(
            prompt,
            numPasscodeAttempts < 2 ? wrongPasscode : passcode
          );
          values.push(response);
        } else if (prompt.validation === ChallengeValidation.Biometric) {
          values.push(new ChallengeValue(prompt, true));
        }
      }
      return values;
    };
    const receiveChallenge = (challenge) => {
      tmpApplication.addChallengeObserver(challenge, {
        onInvalidValue: (value) => {
          const values = promptValueReply([value.prompt]);
          tmpApplication.submitValuesForChallenge(challenge, values);
          numPasscodeAttempts++;
        },
      });
      const initialValues = promptValueReply(challenge.prompts);
      tmpApplication.submitValuesForChallenge(challenge, initialValues);
    };
    await tmpApplication.prepareForLaunch({ receiveChallenge });
    expect(tmpApplication.protocolService.getRootKey()).toBeFalsy();
    expect(
      tmpApplication.protectionService.createLaunchChallenge().prompts
        .length
    ).toBe(2);
    await tmpApplication.launch(true);
    expect(tmpApplication.protocolService.getRootKey()).toBeTruthy();
    expect(tmpApplication.protocolService.keyMode).toBe(KeyMode.WrapperOnly);
    tmpApplication.deinit();
  }, 20000);

  it.skip('handles application launch with passcode and account', async function () {
    const namespace = Factory.randomString();
    const application = await Factory.createAndInitializeApplication(namespace);
    const email = Uuid.GenerateUuidSynchronously();
    const password = Uuid.GenerateUuidSynchronously();
    await Factory.registerUserToApplication({
      application: application,
      email,
      password,
    });
    const sampleStorageKey = 'foo';
    const sampleStorageValue = 'bar';
    await application.storageService.setValue(
      sampleStorageKey,
      sampleStorageValue
    );
    expect(application.protocolService.keyMode).toBe(KeyMode.RootKeyOnly);
    const passcode = 'foobar';
    Factory.handlePasswordChallenges(application, password);
    await application.addPasscode(passcode);
    expect(application.protocolService.keyMode).toBe(KeyMode.RootKeyPlusWrapper);
    expect(application.hasPasscode()).toBe(true);
    application.deinit();

    const wrongPasscode = 'barfoo';
    let numPasscodeAttempts = 1;
    /** Recreate application and initialize */
    const tmpApplication = await Factory.createApplication(namespace);
    const promptValueReply = (prompts) => {
      const values = [];
      for (const prompt of prompts) {
        if (prompt.validation === ChallengeValidation.LocalPasscode) {
          values.push(
            new ChallengeValue(
              prompt,
              numPasscodeAttempts < 2 ? wrongPasscode : passcode
            )
          );
        }
      }
      return values;
    };
    const receiveChallenge = async (challenge) => {
      tmpApplication.addChallengeObserver(challenge, {
        onInvalidValue: (value) => {
          const values = promptValueReply([value.prompt]);
          tmpApplication.submitValuesForChallenge(challenge, values);
          numPasscodeAttempts++;
        },
      });
      const initialValues = promptValueReply(challenge.prompts);
      tmpApplication.submitValuesForChallenge(challenge, initialValues);
    };
    await tmpApplication.prepareForLaunch({
      receiveChallenge: receiveChallenge,
    });
    expect(tmpApplication.protocolService.getRootKey()).toBeFalsy();
    await tmpApplication.launch(true);
    expect(
      await tmpApplication.storageService.getValue(sampleStorageKey)
    ).toBe(sampleStorageValue);
    expect(tmpApplication.protocolService.getRootKey()).toBeTruthy();
    expect(tmpApplication.protocolService.keyMode).toBe(KeyMode.RootKeyPlusWrapper);
    tmpApplication.deinit();
  }, 10000);
});
