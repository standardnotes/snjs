import { SNApplication } from '@Lib/application';
import { ChallengeValidation, ChallengeValue, ChallengeReason, Challenge } from '@Lib/challenges';
import { SyncEvent, ApplicationEvent } from '@Lib/events';
import { KeyParamsOrigination, Uuids, CreateMaxPayloadFromAnyObject, PayloadSource, SNLog, SNComponentManager, DeinitSource, ProtocolVersion } from '@Lib/index';
import { ContentType } from '@Lib/models';
import { Environment, Platform } from '@Lib/platforms';
import { SyncModes } from '@Lib/services';
import { Uuid } from '@Lib/uuid';
import DeviceInterface from './setup/snjs/deviceInterface';
import SNCrypto from './setup/snjs/snCrypto';
import { WebComponentManager, MobileComponentManager } from './setup/snjs/componentManager';
import { RawPayload } from '@Lib/protocol/payloads/generator';

SNLog.onLog = (message) => {
  console.log(message);
};
SNLog.onError = (error) => {
  console.error(error);
};

export const TestTimeout = 10000;
export const LongTestTimeout = 20000;

const syncOptions = {
  checkIntegrity: true,
  awaitAll: true,
};

export async function createAppContext(identifier?: string) {
  if (!identifier) {
    identifier = `${Math.random()}`;
  }
  const application = createApplication(identifier);
  const email = Uuid.GenerateUuidSynchronously();
  const password = Uuid.GenerateUuidSynchronously();
  const passcode = 'mypasscode';
  const handleChallenge = (challenge: Challenge) => {
    const responses = [];
    for (const prompt of challenge.prompts) {
      if (prompt.validation === ChallengeValidation.LocalPasscode) {
        responses.push(new ChallengeValue(prompt, passcode));
      } else if (prompt.validation === ChallengeValidation.AccountPassword) {
        responses.push(new ChallengeValue(prompt, password));
      } else if (
        prompt.validation === ChallengeValidation.ProtectionSessionDuration
      ) {
        responses.push(new ChallengeValue(prompt, 0));
      } else if (prompt.placeholder === 'Email') {
        responses.push(new ChallengeValue(prompt, email));
      } else if (prompt.placeholder === 'Password') {
        responses.push(new ChallengeValue(prompt, password));
      } else {
        throw Error(`Unhandled custom challenge in Factory.createAppContext`);
      }
    }
    application.submitValuesForChallenge(challenge, responses);
  };
  return {
    application: application,
    email,
    identifier,
    password,
    passcode,
    awaitNextSucessfulSync: () => {
      return new Promise<void>((resolve) => {
        const removeObserver = application.syncService.addEventObserver(
          (event) => {
            if (event === SyncEvent.FullSyncCompleted) {
              removeObserver();
              resolve();
            }
          }
        );
      });
    },
    launch: async ({ awaitDatabaseLoad = true } = {}) => {
      await application.prepareForLaunch({
        receiveChallenge: handleChallenge,
      });
      await application.launch(awaitDatabaseLoad);
    },
    handleChallenge,
    deinit: () => {
      application.deinit(DeinitSource.SignOut);
    },
  };
}

export function getDefaultHost() {
  return 'http://localhost:3123';
}

export function getDefaultWebSocketUrl() {
  return 'ws://localhost';
}

const getSwappedClasses = (environment?: Environment) => {
  const classMap = {
    swap: SNComponentManager,
    with: WebComponentManager
  };
  switch (environment) {
    case Environment.Mobile:
      classMap.with = MobileComponentManager;
      break;
    default:
      classMap.with = WebComponentManager;
      break;
  }
  return [classMap];
};

export function createApplication(identifier: string, environment?: Environment, platform?: Platform) {
  /**
   * Stops loading any resources or network requests.
   */
  window.stop();

  const deviceInterface = new DeviceInterface(
    setTimeout.bind(window),
    setInterval.bind(window)
  );
  return new SNApplication(
    environment || Environment.Web,
    platform || Platform.MacWeb,
    deviceInterface,
    new SNCrypto(),
    {
      confirm: async () => true,
      alert: async () => {},
      blockingDialog: () => () => {},
    },
    identifier || `${Math.random()}`,
    getSwappedClasses(environment),
    getDefaultHost(),
    getDefaultWebSocketUrl(),
  );
}

export async function createAppWithRandNamespace(environment: Environment, platform: Platform) {
  const namespace = Math.random().toString(36).substring(2, 15);
  return createApplication(namespace, environment, platform);
}

export async function createInitAppWithRandNamespace(environment?: Environment, platform?: Platform) {
  const namespace = Math.random().toString(36).substring(2, 15);
  return createAndInitializeApplication(namespace, environment, platform);
}

export async function createAndInitializeApplication(
  namespace: string,
  environment?: Environment,
  platform?: Platform
) {
  const application = createApplication(namespace, environment, platform);
  await initializeApplication(application);
  return application;
}

export async function initializeApplication(application: SNApplication) {
  await application.prepareForLaunch({
    receiveChallenge: (challenge) => {
      if (challenge.reason !== ChallengeReason.Custom) {
        throw Error("Factory application shouldn't have challenges");
      }
    },
  });
  await application.launch(true);
}

type RegisterUserToApplication = {
  application: SNApplication;
  email?: string;
  password?: string;
  ephemeral?: boolean;
  mergeLocal?: boolean;
};

export async function registerUserToApplication({
  application,
  email = generateUuid(),
  password = generateUuid(),
  ephemeral = false,
  mergeLocal = true,
}: RegisterUserToApplication) {
  return application.register(email, password, ephemeral, mergeLocal);
}

type SetOldVersionPasscode = {
  application: SNApplication;
  passcode: string;
  version: ProtocolVersion;
};

export async function setOldVersionPasscode({
  application,
  passcode,
  version,
}: SetOldVersionPasscode) {
  const identifier = await application.protocolService.crypto.generateUUID();
  const operator = application.protocolService.operatorForVersion(version);
  const key = await operator.createRootKey(
    identifier,
    passcode,
    KeyParamsOrigination.PasscodeCreate
  );
  await application.protocolService.setNewRootKeyWrapper(key);
  await application.credentialService.rewriteItemsKeys();
  await application.syncService.sync(syncOptions);
}

type RegisterOldUser = {
  application: SNApplication;
  email: string;
  password: string;
  version: ProtocolVersion;
};

/**
 * Using application.register will always use latest version of protocol.
 * To use older version, use this method.
 */
export async function registerOldUser({
  application,
  email,
  password,
  version,
}: RegisterOldUser) {
  if (!email) email = generateUuid();
  if (!password) password = generateUuid();
  const operator = application.protocolService.operatorForVersion(version);
  const accountKey = await operator.createRootKey(
    email,
    password,
    KeyParamsOrigination.Registration
  );

  const response = await application.apiService.register(
    email,
    accountKey.serverPassword!,
    accountKey.keyParams,
    false
  );
  /** Mark all existing items as dirty. */
  await application.itemManager.changeItems(
    Uuids(application.itemManager.items),
    (m) => {
      m.dirty = true;
    }
  );
  await application.sessionManager.handleSuccessAuthResponse(
    response,
    accountKey
  );
  application.notifyEvent(ApplicationEvent.SignedIn);
  await application.syncService.sync({
    mode: SyncModes.DownloadFirst,
    ...syncOptions,
  });
  await application.protocolService.decryptErroredItems();
}

export function createStorageItemPayload(contentType: ContentType) {
  return CreateMaxPayloadFromAnyObject(createItemParams(contentType));
}

export function createNotePayload(title?: string, text?: string) {
  return CreateMaxPayloadFromAnyObject(createNoteParams({ title, text }));
}

export function createStorageItemTagPayload() {
  return CreateMaxPayloadFromAnyObject(createTagParams());
}

export function itemToStoragePayload(item: RawPayload) {
  return CreateMaxPayloadFromAnyObject(item);
}

export function createMappedNote(application: SNApplication) {
  const payload = createNotePayload('test');
  return application.itemManager.emitItemFromPayload(
    payload,
    PayloadSource.LocalChanged
  );
}

export function createMappedTag(application: SNApplication) {
  const payload = createStorageItemTagPayload();
  return application.itemManager.emitItemFromPayload(
    payload,
    PayloadSource.LocalChanged
  );
}

export async function createSyncedNote(application: SNApplication, title?: string, text?: string) {
  const payload = createNotePayload(title, text);
  await application.itemManager.emitItemFromPayload(
    payload,
    PayloadSource.LocalChanged
  );
  await application.itemManager.setItemDirty(payload.uuid);
  await application.syncService.sync(syncOptions);
  const note = application.findItem(payload.uuid);
  return note;
}

export async function getStoragePayloadsOfType(application: SNApplication, type: ContentType) {
  const rawPayloads = await application.storageService.getAllRawPayloads();
  return rawPayloads
    .filter((rp) => rp.content_type === type)
    .map((rp) => {
      return CreateMaxPayloadFromAnyObject(rp);
    });
}

export async function createManyMappedNotes(application: SNApplication, count: number) {
  const createdNotes = [];
  for (let i = 0; i < count; i++) {
    const note = await createMappedNote(application);
    await application.itemManager.setItemDirty(note.uuid);
    createdNotes.push(note);
  }
  return createdNotes;
}

type LoginToApplication = RegisterUserToApplication;

export async function loginToApplication({
  application,
  email,
  password,
  ephemeral = false,
  mergeLocal = true,
}: LoginToApplication) {
  return application.signIn(
    email,
    password,
    undefined,
    ephemeral,
    mergeLocal,
    true
  );
}

/**
 * Signing out of an application deinits it.
 * A new one must be created.
 */
export async function signOutApplicationAndReturnNew(application: SNApplication) {
  await application.signOut();
  application.deinit(DeinitSource.SignOut);
  return createInitAppWithRandNamespace();
}

export async function signOutAndBackIn(application: SNApplication, email: string, password: string) {
  await application.signOut();
  const newApplication = await createInitAppWithRandNamespace();
  await loginToApplication({
    application: newApplication,
    email,
    password,
    ephemeral: false,
  });
  return newApplication;
}

export async function restartApplication(application: SNApplication) {
  const id = application.identifier;
  application.deinit(DeinitSource.SignOut);
  const newApplication = await createAndInitializeApplication(id);
  return newApplication;
}

export function createItemParams(contentType: ContentType) {
  const params = {
    uuid: generateUuid(),
    content_type: contentType,
    content: {
      title: 'hello',
      text: 'world',
    },
  };
  return (params as unknown) as RawPayload;
}

export function generateUuid() {
  const crypto = new SNCrypto();
  return crypto.generateUUIDSync();
}

type CreateNoteParams = {
  title?: string;
  text?: string;
  dirty?: boolean;
};

export function createNoteParams({ title, text, dirty = true }: CreateNoteParams = {}) {
  const params = {
    uuid: generateUuid(),
    content_type: ContentType.Note,
    dirty: dirty,
    content: {
      title: title || 'hello',
      text: text || 'world',
      references: [],
    },
  };
  return params;
}

export function createTagParams({ dirty = true } = {}) {
  const params = {
    uuid: generateUuid(),
    content_type: ContentType.Tag,
    dirty: dirty,
    content: {
      title: 'thoughts',
      references: [],
    },
  };
  return params;
}

export function createRelatedNoteTagPairPayload({ dirty = true } = {}) {
  const noteParams = createNoteParams({ dirty });
  const tagParams = createTagParams({ dirty });
  tagParams.content.references = [
    {
      uuid: noteParams.uuid,
      content_type: noteParams.content_type,
    },
  ];
  noteParams.content.references = [];
  return [
    CreateMaxPayloadFromAnyObject(noteParams),
    CreateMaxPayloadFromAnyObject(tagParams),
  ];
}

export async function createSyncedNoteWithTag(application: SNApplication) {
  const payloads = createRelatedNoteTagPairPayload();
  await application.itemManager.emitItemsFromPayloads(payloads);
  return application.sync(syncOptions);
}

export async function storagePayloadCount(application: SNApplication) {
  const payloads = await application.storageService.getAllRawPayloads();
  return payloads.length;
}

export function yesterday() {
  return new Date(new Date().setDate(new Date().getDate() - 1));
}

export function dateToMicroseconds(date: Date) {
  return date.getTime() * 1_000;
}

export function tomorrow() {
  return new Date(new Date().setDate(new Date().getDate() + 1));
}

export async function sleep(seconds: number) {
  console.warn(`Test sleeping for ${seconds}s`);
  return new Promise<void>((resolve, reject) => {
    setTimeout(function () {
      resolve();
    }, seconds * 1000);
  });
}

export function shuffleArray(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function randomString(length = 10) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function generateUuidish() {
  return randomString(32);
}

export function randomArrayValue(array: Array<any>) {
  return array[Math.floor(Math.random() * array.length)];
}

export async function expectThrowsAsync(method: () => void, errorMessage?: string) {
  let error = null;
  try {
    await method();
  } catch (err) {
    error = err;
  }
  expect(error).toBeInstanceOf(Error);
  if (errorMessage) {
    expect(typeof error.message).toBe("string");
    expect(error.message.startsWith(errorMessage)).toBe(true);
  }
}

export function ignoreChallenges(application: SNApplication) {
  application.setLaunchCallback({
    receiveChallenge() {
      /** no-op */
    },
  });
}

export function handlePasswordChallenges(application: SNApplication, password: string) {
  application.setLaunchCallback({
    receiveChallenge: (challenge) => {
      const values = challenge.prompts.map(
        (prompt) =>
          new ChallengeValue(
            prompt,
            prompt.validation === ChallengeValidation.ProtectionSessionDuration
              ? 0
              : password
          )
      );
      application.submitValuesForChallenge(challenge, values);
    },
  });
}
