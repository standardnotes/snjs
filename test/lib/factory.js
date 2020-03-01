/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import WebDeviceInterface from './web_device_interface.js';
import { Environments, Platforms } from '../../lib/platforms.js';

export function createApplication(namespace, environment, platform) {
  const url = this.serverURL();
  const deviceInterface = new WebDeviceInterface({
    namespace,
    timeout: setTimeout.bind(window),
    interval: setInterval.bind(window)
  });
  return new SNApplication({
    namespace: namespace,
    deviceInterface: deviceInterface,
    environment: environment || Environments.Web,
    platform: platform || Platforms.MacWeb,
    host: url,
    skipClasses: [
      SNComponentManager
    ]
  });
}

export async function createAppWithRandNamespace(environment, platform) {
  const namespace = Math.random().toString(36).substring(2, 15);
  return this.createApplication(namespace, environment, platform);
}

export async function createInitAppWithRandNamespace(environment, platform) {
  const namespace = Math.random().toString(36).substring(2, 15);
  return this.createAndInitializeApplication(namespace, environment, platform);
}

export async function createAndInitializeApplication(namespace, environment, platform) {
  const application = this.createApplication(namespace, environment, platform);
  await this.initializeApplication(application);
  return application;
}

export async function initializeApplication(application) {
  await application.prepareForLaunch({
    callbacks: {
      requiresChallengeResponses: (handleChallengeResponses) => {
        throw 'Factory application shouldnt have challenges';
      },
      handleChallengeFailures: (responses) => {

      }
    },
  });
  await application.launch({ awaitDatabaseLoad: true });
}

export async function createInitAppWithPasscode(passcode) {
  const namespace = Factory.randomString();
  const application = await Factory.createAndInitializeApplication(namespace);
  await application.setPasscode(passcode);
  const handleChallenges = async (challenges) => {
    const responses = [];
    for (const challenge of challenges) {
      if (challenge === Challenges.LocalPasscode) {
        const value = passcode;
        const response = new ChallengeResponse({ challenge, value });
        responses.push(response);
      }
    }
    return responses;
  };
  await application.prepareForLaunch({
    callbacks: {
      requiresChallengeResponses: handleChallenges,
      handleChallengeFailures: () => { }
    }
  });
  await application.launch();
}

export async function registerUserToApplication({ application, email, password, ephemeral, mergeLocal = true }) {
  if (!email) email = this.generateUuid();
  if (!password) password = this.generateUuid();
  return application.register({ email, password, ephemeral, mergeLocal });
}

/**
 * Using application.register will always use latest version of protocol.
 * To use older version, use this method.
 */
export async function registerOldUser({ application, email, password, version }) {
  if (!email) email = this.generateUuid();
  if (!password) password = this.generateUuid();
  const operator = application.protocolService.operatorForVersion(version);
  const result = await operator.createRootKey({
    identifier: email,
    password
  });
  const accountKey = result.key;
  const accountKeyParams = result.keyParams;

  const response = await application.apiService.register({
    email: email,
    serverPassword: accountKey.serverPassword,
    keyParams: accountKeyParams
  });
  await application.sessionManager.handleAuthResponse(response);
  await application.keyManager.setNewRootKey({
    key: accountKey,
    keyParams: accountKeyParams
  });
  application.notifyEvent(ApplicationEvents.SignedIn);
  await application.syncService.sync({
    mode: SyncModes.DownloadFirst
  });
  application.protocolService.decryptErroredItems();
}

export function createStorageItemPayload(contentType) {
  return CreateMaxPayloadFromAnyObject({
    object: this.createItemParams(contentType)
  });
}

export function createNotePayload() {
  return CreateMaxPayloadFromAnyObject({ object: this.createNoteParams() });
}

export function createStorageItemTagPayload() {
  return CreateMaxPayloadFromAnyObject({ object: this.createTagParams() });
}

export function itemToStoragePayload(item) {
  return CreateMaxPayloadFromAnyObject({ object: item });
}

export function createMappedNote(application) {
  const payload = this.createNotePayload();
  return application.modelManager.mapPayloadToLocalItem({ payload });
}

export function createMappedTag(application) {
  const payload = this.createStorageItemTagPayload();
  return application.modelManager.mapPayloadToLocalItem({ payload });
}

export async function createSyncedNote(application) {
  const payload = this.createNotePayload();
  const note = await application.modelManager.mapPayloadToLocalItem({ payload });
  await application.modelManager.setItemDirty(note, true);
  await application.syncService.sync();
  return note;
}

export async function getStoragePayloadsOfType(application, type) {
  const rawPayloads = await application.storageService.getAllRawPayloads();
  return rawPayloads.filter((rp) => rp.content_type === type).map((rp) => {
    return CreateMaxPayloadFromAnyObject({
      object: rp
    });
  });
}

export async function createManyMappedNotes(application, count) {
  for (let i = 0; i < count; i++) {
    const note = await Factory.createMappedNote(application);
    await application.modelManager.setItemDirty(note, true);
  }
}

export async function loginToApplication({ application, email, password, ephemeral, mergeLocal = true }) {
  return application.signIn({
    url: Factory.serverURL(),
    email: email,
    password: password,
    ephemeral: ephemeral,
    mergeLocal: mergeLocal
  });
}

export function createItemParams(contentType) {
  const params = {
    uuid: this.generateUuid(),
    content_type: contentType,
    content: {
      title: 'hello',
      text: 'world'
    }
  };
  return params;
}

export function generateUuid() {
  const crypto = new SNWebCrypto();
  return crypto.generateUUIDSync();
}

export function createNoteParams({ title, text, dirty = true } = {}) {
  const params = {
    uuid: this.generateUuid(),
    content_type: 'Note',
    dirty: dirty,
    content: {
      title: title || 'hello',
      text: text || 'world',
      references: []
    }
  };
  return params;
}

export function createTagParams({ dirty = true } = {}) {
  const params = {
    uuid: this.generateUuid(),
    content_type: 'Tag',
    content: {
      title: 'thoughts',
      references: []
    }
  };
  return params;
}

export function createRelatedNoteTagPairPayload({ dirty = true } = {}) {
  const noteParams = this.createNoteParams({ dirty });
  const tagParams = this.createTagParams({ dirty });
  tagParams.content.references = [{
    uuid: noteParams.uuid,
    content_type: noteParams.content_type
  }];
  noteParams.content.references = [];
  return [
    CreateMaxPayloadFromAnyObject({ object: noteParams }),
    CreateMaxPayloadFromAnyObject({ object: tagParams })
  ];
}

export async function storagePayloadCount(application) {
  const payloads = await application.storageService.getAllRawPayloads();
  return payloads.length;
}

export function serverURL() {
  return 'http://localhost:3000';
}

export function yesterday() {
  return new Date(new Date().setDate(new Date().getDate() - 1));
}

export async function sleep(seconds) {
  return new Promise((resolve, reject) => {
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
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function randomArrayValue(array) {
  return array[Math.floor(Math.random() * array.length)];
}