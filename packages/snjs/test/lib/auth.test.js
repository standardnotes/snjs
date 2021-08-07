import { ChallengeValidation, ChallengeValue } from '@Lib/challenges';
import { KeyMode, SyncEvent } from '@Lib/services';
import { Uuid } from '@Lib/uuid';
import * as Factory from './../factory';
import sinon from 'sinon';

describe('basic auth', () => {
  const BASE_ITEM_COUNT = 2; /** Default items key, user preferences */

  const syncOptions = {
    checkIntegrity: true,
    awaitAll: true,
  };

  it('successfully register new account', async function () {
    const { application, email, password } = await Factory.createAndInitSimpleAppContext();
    const response = await application.register(email, password);
    expect(response).toBeTruthy();
    expect(application.protocolService.getRootKey()).toBeTruthy();
  }, 5000);

  it('fails register new account with short password', async function () {
    const { application, email } = await Factory.createAndInitSimpleAppContext();
    const password = '123456';

    const response = await application.register(email, password);
    expect(response.error).toBeTruthy();
    expect(application.protocolService.getRootKey()).toBeFalsy();
  }, 5000);

  it('successfully signs out of account', async function () {
    let { application, email, password } = await Factory.createAndInitSimpleAppContext();
    await application.register(email, password);

    expect(application.protocolService.getRootKey()).toBeTruthy();
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    expect(application.protocolService.getRootKey()).toBeFalsy();
    expect(application.protocolService.keyMode).toBe(KeyMode.RootKeyNone);
    const rawPayloads = await application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).toBe(BASE_ITEM_COUNT);
  });

  it('successfully signs in to registered account', async function () {
    let { application, email, password } = await Factory.createAndInitSimpleAppContext();
    await application.register(email, password);
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    const response = await application.signIn(
      email,
      password,
      undefined,
      undefined,
      undefined,
      true
    );
    expect(response).toBeTruthy();
    expect(response.error).toBeFalsy();
    expect(application.protocolService.getRootKey()).toBeTruthy();
  }, 20000);

  it('cannot sign while already signed in', async function () {
    let { application, email, password } = await Factory.createAndInitSimpleAppContext();
    await application.register(email, password);
    await Factory.createSyncedNote(application);
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    const response = await application.signIn(
      email,
      password,
      undefined,
      undefined,
      undefined,
      true
    );
    expect(response).toBeTruthy();
    expect(response.error).toBeFalsy();
    expect(application.protocolService.getRootKey()).toBeTruthy();

    let error;
    try {
      await application.signIn(
        email,
        password,
        undefined,
        undefined,
        undefined,
        true
      );
    } catch (e) {
      error = e;
    }
    expect(error).toBeTruthy();
  }, 20000);

  it('cannot register while already signed in', async function () {
    const { application, email, password } = await Factory.createAndInitSimpleAppContext();
    await application.register(email, password);
    let error;
    try {
      await application.register(email, password);
    } catch (e) {
      error = e;
    }
    expect(error).toBeTruthy();
    expect(application.protocolService.getRootKey()).toBeTruthy();
  }, 20000);

  it('cannot perform two sign-ins at the same time', async function () {
    let { application, email, password } = await Factory.createAndInitSimpleAppContext();
    await application.register(email, password);
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );

    await Promise.all([
      (async () => {
        const response = await application.signIn(
          email,
          password,
          undefined,
          undefined,
          undefined,
          true
        );
        expect(response).toBeTruthy();
        expect(response.error).toBeFalsy();
        expect(application.protocolService.getRootKey()).toBeTruthy();
      })(),
      (async () => {
        /** Make sure the first function runs first */
        await new Promise((resolve) => setTimeout(resolve));
        /** Try to sign in while the first request is going */
        let error;
        try {
          await application.signIn(
            email,
            password,
            undefined,
            undefined,
            undefined,
            true
          );
        } catch (e) {
          error = e;
        }
        expect(error).toBeTruthy();
      })(),
    ]);
  }, 20000);

  it('cannot perform two register operations at the same time', async function () {
    const { application, email, password } = await Factory.createAndInitSimpleAppContext();
    await Promise.all([
      (async () => {
        const response = await application.register(
          email,
          password
        );
        expect(response).toBeTruthy();
        expect(response.error).toBeFalsy();
        expect(application.protocolService.getRootKey()).toBeTruthy();
      })(),
      (async () => {
        /** Make sure the first function runs first */
        await new Promise((resolve) => setTimeout(resolve));
        /** Try to register in while the first request is going */
        let error;
        try {
          await application.register(email, password);
        } catch (e) {
          error = e;
        }
        expect(error).toBeTruthy();
      })(),
    ]);
  }, 20000);

  it('successfuly signs in after failing once', async function () {
    let { application, email, password } = await Factory.createAndInitSimpleAppContext();
    await application.register(email, password);
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );

    let response = await application.signIn(
      email,
      'wrong password',
      undefined,
      undefined,
      undefined,
      true
    );
    expect(response).toHaveProperty('status', 401);
    expect(response.error).toBeTruthy();

    response = await application.signIn(
      email,
      password,
      undefined,
      undefined,
      undefined,
      true
    );

    expect(response.status).toBe(200);
    expect(response).not.toHaveProperty('error');
  }, 20000);

  it('server retrieved key params should use our client inputted value for identifier', async function () {
    const { application, password } = await Factory.createAndInitSimpleAppContext();
    /**
     * We should ensure that when we retrieve key params from the server, in order to generate a root
     * key server password for login, that the identifier used in the key params is the client side entered
     * value, and not the value returned from the server.
     *
     * Apart from wanting to minimze trust from the server, we also want to ensure that if
     * we register with an uppercase identifier, and request key params with the lowercase equivalent,
     * that even though the server performs a case-insensitive search on email fields, we correct
     * for this action locally.
     */
    const rand = `${Math.random()}`;
    const uppercase = `FOO@BAR.COM${rand}`;
    const lowercase = `foo@bar.com${rand}`;
    /**
     * Registering with an uppercase email should still allow us to sign in
     * with lowercase email
     */
    await application.register(uppercase, password);

    const response = await application.sessionManager.retrieveKeyParams(
      lowercase
    );
    const keyParams = response.keyParams;
    expect(keyParams.identifier).toBe(lowercase);
    expect(keyParams.identifier).not.toBe(uppercase);
  }, 20000);

  it('can sign into account regardless of email case', async function () {
    let { application, password } = await Factory.createAndInitSimpleAppContext();
    const rand = `${Math.random()}`;
    const uppercase = `FOO@BAR.COM${rand}`;
    const lowercase = `foo@bar.com${rand}`;
    /**
     * Registering with a lowercase email should allow us to sign in
     * with an uppercase email
     */
    await application.register(lowercase, password);
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    const response = await application.signIn(
      uppercase,
      password,
      undefined,
      undefined,
      undefined,
      true
    );
    expect(response).toBeTruthy();
    expect(response.error).toBeFalsy();
    expect(application.protocolService.getRootKey()).toBeTruthy();
  }, 20000);

  it('can sign into account regardless of whitespace', async function () {
    let { application, password } = await Factory.createAndInitSimpleAppContext();
    const rand = `${Math.random()}`;
    const withspace = `FOO@BAR.COM${rand}   `;
    const nospace = `foo@bar.com${rand}`;
    /**
     * Registering with a lowercase email should allow us to sign in
     * with an uppercase email
     */
    await application.register(nospace, password);
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    const response = await application.signIn(
      withspace,
      password,
      undefined,
      undefined,
      undefined,
      true
    );
    expect(response).toBeTruthy();
    expect(response.error).toBeFalsy();
    expect(application.protocolService.getRootKey()).toBeTruthy();
  }, 20000);

  it('fails login with wrong password', async function () {
    let { application, email, password } = await Factory.createAndInitSimpleAppContext();
    await application.register(email, password);
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    const response = await application.signIn(
      email,
      'wrongpassword',
      undefined,
      undefined,
      undefined,
      true
    );
    expect(response).toBeTruthy();
    expect(response.error).toBeTruthy();
    expect(application.protocolService.getRootKey()).toBeFalsy();
  }, 20000);

  it('fails to change to short password', async function () {
    const { application, email, password } = await Factory.createAndInitSimpleAppContext();
    await application.register(email, password);
    const newPassword = '123456';
    const response = await application.changePassword(
      password,
      newPassword
    );
    expect(response.error).toBeTruthy();
  }, 20000);

  it('fails to change password when current password is incorrect', async function () {
    let { application, email, password } = await Factory.createAndInitSimpleAppContext();
    await application.register(email, password);
    const response = await application.changePassword(
      'Invalid password',
      'New password'
    );
    expect(response.error).toBeTruthy();

    /** Ensure we can still log in */
    application = await Factory.signOutAndBackIn(
      application,
      email,
      password
    );
  }, 20000);

  it('registering for new account and completing first after download sync should not put us out of sync', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext();
    const email = Uuid.GenerateUuidSynchronously();
    const password = Uuid.GenerateUuidSynchronously();

    let outOfSync = true;
    let didCompletePostDownloadFirstSync = false;
    let didCompleteDownloadFirstSync = false;
    application.syncService.addEventObserver(async (eventName, data) => {
      if (eventName === SyncEvent.DownloadFirstSyncCompleted) {
        didCompleteDownloadFirstSync = true;
      }
      if (!didCompleteDownloadFirstSync) {
        return;
      }
      if (
        !didCompletePostDownloadFirstSync &&
        eventName === SyncEvent.SingleSyncCompleted
      ) {
        didCompletePostDownloadFirstSync = true;
        /** Should be in sync */
        outOfSync = application.syncService.isOutOfSync();
      }
    });

    await Factory.registerUserToApplication({
      application: application,
      email: email,
      password: password,
    });

    expect(didCompleteDownloadFirstSync).toEqual(true);
    expect(didCompletePostDownloadFirstSync).toEqual(true);
    expect(outOfSync).toEqual(false);
  });

  async function changePassword() {
    let { application, email, password } = await Factory.createAndInitSimpleAppContext();
    await application.register(email, password);

    const noteCount = 10;
    await Factory.createManyMappedNotes(application, noteCount);
    let expectedItemCount = BASE_ITEM_COUNT;
    expectedItemCount += noteCount;
    await application.syncService.sync(syncOptions);

    expect(application.itemManager.items.length).toBe(expectedItemCount);

    const newPassword = 'newpassword';
    const response = await application.changePassword(
      password,
      newPassword
    );
    /** New items key */
    expectedItemCount++;

    expect(application.itemManager.items.length).toBe(expectedItemCount);

    expect(response.error).toBeFalsy();
    expect(application.itemManager.items.length).toBe(expectedItemCount);
    expect(application.itemManager.invalidItems.length).toBe(0);

    await application.syncService.markAllItemsAsNeedingSync();
    await application.syncService.sync(syncOptions);

    expect(application.itemManager.items.length).toBe(expectedItemCount);

    const note = application.itemManager.notes[0];
    /** Create conflict for a note */
    /** First modify the item without saving so that
     * our local contents digress from the server's */
    await application.changeItem(note.uuid, (mutator) => {
      mutator.title = `${Math.random()}`;
    });
    await application.changeAndSaveItem(
      note.uuid,
      (mutator) => {
        mutator.title = `${Math.random()}`;
        mutator.updated_at_timestamp = Factory.dateToMicroseconds(Factory.yesterday());
      },
      undefined,
      undefined,
      syncOptions
    );
    expectedItemCount++;

    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    /** Should login with new password */
    const signinResponse = await application.signIn(
      email,
      newPassword,
      undefined,
      undefined,
      undefined,
      true
    );

    expect(signinResponse).toBeTruthy();
    expect(signinResponse.error).toBeFalsy();
    expect(application.protocolService.getRootKey()).toBeTruthy();
    expect(application.itemManager.items.length).toBe(expectedItemCount);
    expect(application.itemManager.invalidItems.length).toBe(0);
  }

  it('successfully changes password', changePassword, 20000);

  it.skip(
    'successfully changes password when passcode is set',
    async function () {
      const passcode = 'passcode';
      const promptValueReply = (prompts) => {
        const values = [];
        for (const prompt of prompts) {
          if (prompt.validation === ChallengeValidation.LocalPasscode) {
            values.push(new ChallengeValue(prompt, passcode));
          } else {
            values.push(new ChallengeValue(prompt, password));
          }
        }
        return values;
      };
      application.setLaunchCallback({
        receiveChallenge: (challenge) => {
          application.addChallengeObserver(challenge, {
            onInvalidValue: (value) => {
              const values = promptValueReply([value.prompt]);
              application.submitValuesForChallenge(challenge, values);
              numPasscodeAttempts++;
            },
          });
          const initialValues = promptValueReply(challenge.prompts);
          application.submitValuesForChallenge(challenge, initialValues);
        },
      });
      await application.setPasscode(passcode);
      await changePassword();
    }, 20000);

  it('changes password many times', async function () {
    let { application, email, password } = await Factory.createAndInitSimpleAppContext();
    await application.register(email, password);

    const noteCount = 10;
    await Factory.createManyMappedNotes(application, noteCount);
    let expectedItemCount = BASE_ITEM_COUNT;
    expectedItemCount += noteCount;
    await application.syncService.sync(syncOptions);

    const numTimesToChangePw = 5;
    let newPassword = Factory.randomString();
    let currentPassword = password;
    for (let i = 0; i < numTimesToChangePw; i++) {
      await application.changePassword(currentPassword, newPassword);
      /** New items key */
      expectedItemCount++;

      currentPassword = newPassword;
      newPassword = Factory.randomString();

      expect(application.itemManager.items.length).toBe(expectedItemCount);
      expect(application.itemManager.invalidItems.length).toBe(0);

      await application.syncService.markAllItemsAsNeedingSync();
      await application.syncService.sync(syncOptions);
      application = await Factory.signOutApplicationAndReturnNew(
        application
      );
      expect(application.itemManager.items.length).toBe(BASE_ITEM_COUNT);
      expect(application.itemManager.invalidItems.length).toBe(0);

      /** Should login with new password */
      const signinResponse = await application.signIn(
        email,
        currentPassword,
        undefined,
        undefined,
        undefined,
        true
      );
      expect(signinResponse).toBeTruthy();
      expect(signinResponse.error).toBeFalsy();
      expect(application.protocolService.getRootKey()).toBeTruthy();
    }
  }, 60000);

  it('signing in with a clean email string should only try once', async function () {
    let { application, email, password } = await Factory.createAndInitSimpleAppContext();
    await Factory.registerUserToApplication({
      application: application,
      email: email,
      password: password,
    });
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    const performSignIn = sinon.spy(
      application.sessionManager,
      'performSignIn'
    );
    await application.signIn(
      email,
      'wrong password',
      undefined,
      undefined,
      undefined,
      true
    );
    expect(performSignIn.callCount).toBe(1);
  });

  describe('add passcode', function () {
    it('should set passcode successfully', async function () {
      const { application } = await Factory.createAndInitSimpleAppContext();
      const passcode = 'passcode';
      const result = await application.addPasscode(passcode);
      expect(result).toBe(true);
    });

    it('should fail when attempting to set 0 character passcode', async function () {
      const { application } = await Factory.createAndInitSimpleAppContext();
      const passcode = '';
      const result = await application.addPasscode(passcode);
      expect(result).toBe(false);
    });
  });

  describe('change passcode', function () {
    it('should change passcode successfully', async function () {
      const { application } = await Factory.createAndInitSimpleAppContext();
      const passcode = 'passcode';
      const newPasscode = 'newPasscode';
      await application.addPasscode(passcode);
      Factory.handlePasswordChallenges(application, passcode);
      const result = await application.changePasscode(newPasscode);
      expect(result).toBe(true);
    });

    it('should fail when attempting to change to a 0 character passcode', async function () {
      const { application } = await Factory.createAndInitSimpleAppContext();
      const passcode = 'passcode';
      const newPasscode = '';
      await application.addPasscode(passcode);
      Factory.handlePasswordChallenges(application, passcode);
      const result = await application.changePasscode(newPasscode);
      expect(result).toBe(false);
    });
  });
});
