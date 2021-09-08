import { ChallengeValidation, ChallengeValue } from '@Lib/challenges';
import { CreateMaxPayloadFromAnyObject } from '@Lib/index';
import { ContentType } from '@Lib/models';
import { ProtocolVersion } from '@Lib/protocol';
import { Uuid } from '@Lib/uuid';
import sinon from 'sinon';
import * as Factory from '../factory';

describe('upgrading', () => {
  let application;
  let email, password, passcode;

  const receiveChallenge = async (challenge) => {
    receiveChallengeWithApp(application, challenge);
  };

  const receiveChallengeWithApp = async (application, challenge) => {
    application.addChallengeObserver(challenge, {
      onInvalidValue: (value) => {
        const values = promptValueReply([value.prompt]);
        application.submitValuesForChallenge(challenge, values);
        numPasscodeAttempts++;
      },
    });
    const initialValues = promptValueReply(challenge.prompts);
    application.submitValuesForChallenge(challenge, initialValues);
  };

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

  beforeEach(async function () {
    application = await Factory.createInitAppWithRandNamespace();
    email = Uuid.GenerateUuidSynchronously();
    password = Uuid.GenerateUuidSynchronously();
    passcode = '1234';
  });

  afterEach(function () {
    application.deinit();
  });

  it('upgrade should be available when account only', async function () {
    const oldVersion = ProtocolVersion.V003;
    /** Register with 003 version */
    await Factory.registerOldUser({
      application: application,
      email: email,
      password: password,
      version: oldVersion,
    });

    expect(await application.protocolUpgradeAvailable()).toBe(true);
  });

  it('upgrade should be available when passcode only', async function () {
    const oldVersion = ProtocolVersion.V003;
    await Factory.setOldVersionPasscode({
      application: application,
      passcode: passcode,
      version: oldVersion,
    });

    expect(await application.protocolUpgradeAvailable()).toBe(true);
  });

  it('upgrades application protocol from 003 to 004', async function () {
    const oldVersion = ProtocolVersion.V003;
    const newVersion = ProtocolVersion.V004;

    await Factory.createMappedNote(application);

    /** Register with 003 version */
    await Factory.registerOldUser({
      application: application,
      email: email,
      password: password,
      version: oldVersion,
    });

    await Factory.setOldVersionPasscode({
      application: application,
      passcode: passcode,
      version: oldVersion,
    });

    expect(
      (await application.protocolService.getRootKeyWrapperKeyParams())
        .version
    ).toBe(oldVersion);
    expect(
      (await application.protocolService.getRootKeyParams()).version
    ).toBe(oldVersion);
    expect(
      (await application.protocolService.getRootKey()).keyVersion
    ).toBe(oldVersion);

    application.setLaunchCallback({
      receiveChallenge: receiveChallenge,
    });
    const result = await application.upgradeProtocolVersion();
    expect(result).toEqual({ success: true });

    const wrappedRootKey = await application.protocolService.getWrappedRootKey();
    const payload = CreateMaxPayloadFromAnyObject(wrappedRootKey);
    expect(payload.version).toBe(newVersion);

    expect(
      (await application.protocolService.getRootKeyWrapperKeyParams())
        .version
    ).toBe(newVersion);
    expect(
      (await application.protocolService.getRootKeyParams()).version
    ).toBe(newVersion);
    expect(
      (await application.protocolService.getRootKey()).keyVersion
    ).toBe(newVersion);

    /**
     * Immediately logging out ensures we don't rely on subsequent
     * sync events to complete the upgrade
     */
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    await application.signIn(
      email,
      password,
      undefined,
      undefined,
      undefined,
      true
    );
    expect(application.itemManager.notes.length).toBe(1);
    expect(application.itemManager.invalidItems).toHaveLength(0);
  }, 15000);

  it('upgrading from 003 to 004 with passcode only then reiniting app should create valid state', async function () {
    /**
     * There was an issue where having the old app set up with passcode,
     * then refreshing with new app, performing upgrade, then refreshing the app
     * resulted in note data being errored.
     */
    const oldVersion = ProtocolVersion.V003;

    await Factory.setOldVersionPasscode({
      application: application,
      passcode: passcode,
      version: oldVersion,
    });
    await Factory.createSyncedNote(application);

    application.setLaunchCallback({
      receiveChallenge: receiveChallenge,
    });

    const identifier = application.identifier;
    application.deinit();

    /** Recreate the app once */
    const appFirst = Factory.createApplication(identifier);
    await appFirst.prepareForLaunch({
      receiveChallenge: (challenge) => {
        receiveChallengeWithApp(appFirst, challenge);
      },
    });
    await appFirst.launch(true);
    const result = await appFirst.upgradeProtocolVersion();
    expect(result).toEqual({ success: true });
    expect(appFirst.itemManager.invalidItems).toHaveLength(0);
    appFirst.deinit();

    /** Recreate the once more */
    const appSecond = Factory.createApplication(identifier);
    await appSecond.prepareForLaunch({
      receiveChallenge: (challenge) => {
        receiveChallengeWithApp(appSecond, challenge);
      },
    });
    await appSecond.launch(true);
    expect(appSecond.itemManager.invalidItems).toHaveLength(0);
    appSecond.deinit();
  }, 15000);

  describe('upgrade failure', function () {
    jest.setTimeout(30000);

    const oldVersion = ProtocolVersion.V003;

    beforeEach(async function () {
      await Factory.createMappedNote(application);

      /** Register with 003 version */
      await Factory.registerOldUser({
        application: application,
        email: email,
        password: password,
        version: oldVersion,
      });

      await Factory.setOldVersionPasscode({
        application: application,
        passcode: passcode,
        version: oldVersion,
      });
    });

    afterEach(function () {
      sinon.restore();
    });

    it('rolls back the local protocol upgrade if syncing fails', async function () {
      sinon.replace(application.syncService, 'sync', sinon.fake());
      application.setLaunchCallback({
        receiveChallenge: receiveChallenge,
      });
      expect(
        (await application.protocolService.getRootKeyWrapperKeyParams())
          .version
      ).toBe(oldVersion);
      const errors = await application.upgradeProtocolVersion();
      expect(Object.keys(errors)).not.toHaveLength(0);

      /** Ensure we're still on 003 */
      expect(
        (await application.protocolService.getRootKeyWrapperKeyParams())
          .version
      ).toBe(oldVersion);
      expect(
        (await application.protocolService.getRootKeyParams()).version
      ).toBe(oldVersion);
      expect(
        (await application.protocolService.getRootKey()).keyVersion
      ).toBe(oldVersion);
      expect(
        (await application.protocolService.getDefaultItemsKey()).keyVersion
      ).toBe(oldVersion);
    });

    it('rolls back the local protocol upgrade if the server responds with an error', async function () {
      sinon.replace(
        application.sessionManager,
        'changeCredentials',
        async () => [Error()]
      );

      application.setLaunchCallback({
        receiveChallenge: receiveChallenge,
      });
      expect(
        (await application.protocolService.getRootKeyWrapperKeyParams())
          .version
      ).toBe(oldVersion);
      const errors = await application.upgradeProtocolVersion();
      expect(Object.keys(errors)).not.toHaveLength(0);

      /** Ensure we're still on 003 */
      expect(
        (await application.protocolService.getRootKeyWrapperKeyParams())
          .version
      ).toBe(oldVersion);
      expect(
        (await application.protocolService.getRootKeyParams()).version
      ).toBe(oldVersion);
      expect(
        (await application.protocolService.getRootKey()).keyVersion
      ).toBe(oldVersion);
      expect(
        (await application.protocolService.getDefaultItemsKey()).keyVersion
      ).toBe(oldVersion);
    });
  });

  it('protocol version should be upgraded on password change', async function () {
    /** Delete default items key that is created on launch */
    const itemsKey = await application.protocolService.getDefaultItemsKey();
    await application.itemManager.setItemToBeDeleted(itemsKey.uuid);
    expect(application.itemManager.itemsKeys().length).toBe(0);

    Factory.createMappedNote(application);

    /** Register with 003 version */
    await Factory.registerOldUser({
      application: application,
      email: email,
      password: password,
      version: ProtocolVersion.V003,
    });

    expect(application.itemManager.itemsKeys().length).toBe(1);

    expect(
      (await application.protocolService.getRootKeyParams()).version
    ).toBe(ProtocolVersion.V003);
    expect(
      (await application.protocolService.getRootKey()).keyVersion
    ).toBe(ProtocolVersion.V003);

    /** Ensure note is encrypted with 003 */
    const notePayloads = await Factory.getStoragePayloadsOfType(
      application,
      ContentType.Note
    );
    expect(notePayloads.length).toBe(1);
    expect(notePayloads[0].version).toBe(ProtocolVersion.V003);

    const { error } = await application.changePassword(
      password,
      'foobarfoo'
    );
    expect(error).toBeFalsy();

    const latestVersion = application.protocolService.getLatestVersion();
    expect(
      (await application.protocolService.getRootKeyParams()).version
    ).toBe(latestVersion);
    expect(
      (await application.protocolService.getRootKey()).keyVersion
    ).toBe(latestVersion);

    const defaultItemsKey = await application.protocolService.getDefaultItemsKey();
    expect(defaultItemsKey.keyVersion).toBe(latestVersion);

    /** After change, note should now be encrypted with latest protocol version */

    const note = application.itemManager.notes[0];
    await application.saveItem(note.uuid);

    const refreshedNotePayloads = await Factory.getStoragePayloadsOfType(
      application,
      ContentType.Note
    );
    const refreshedNotePayload = refreshedNotePayloads[0];
    expect(refreshedNotePayload.version).toBe(latestVersion);
  }, 10000);
});
