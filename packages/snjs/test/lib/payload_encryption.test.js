import { CreateMaxPayloadFromAnyObject } from '@Lib/index';
import { EncryptionIntent } from '@Lib/protocol';
import { Uuid } from '@Lib/uuid';
import * as Factory from '../factory';

describe('payload encryption', function () {
  jest.setTimeout(Factory.TestTimeout);

  let application;
  let email, password;

  beforeEach(async function () {
    application = await Factory.createInitAppWithRandNamespace();
    email = Uuid.GenerateUuidSynchronously();
    password = Uuid.GenerateUuidSynchronously();
    await Factory.registerUserToApplication({
      application,
      email,
      password,
    });
  });

  afterEach(async function () {
    application.deinit();
    localStorage.clear();
  });

  it('creating payload from item should create copy not by reference', async function () {
    const item = await Factory.createMappedNote(application);
    const payload = CreateMaxPayloadFromAnyObject(item);
    expect(item.content === payload.content).toBe(false);
    expect(item.content.references === payload.content.references).toBe(false);
  });

  it('creating payload from item should preserve appData', async function () {
    const item = await Factory.createMappedNote(application);
    const payload = CreateMaxPayloadFromAnyObject(item);
    expect(item.content.appData).toBeTruthy();
    expect(JSON.stringify(item.content)).toBe(JSON.stringify(payload.content));
  });

  it('server payloads should not contain client values', async function () {
    const rawPayload = Factory.createNotePayload();
    const notePayload = CreateMaxPayloadFromAnyObject(rawPayload, {
      dirty: true,
      dirtiedDate: new Date(),
      lastSyncBegan: new Date(),
      waitingForKey: false,
      errorDecrypting: false,
    });

    const encryptedPayload = await application.protocolService.payloadByEncryptingPayload(
      notePayload,
      EncryptionIntent.Sync
    );

    expect(encryptedPayload.dirty).toBeFalsy();
    expect(encryptedPayload.errorDecrypting).toBeFalsy();
    expect(encryptedPayload.errorDecryptingValueChanged).toBeFalsy();
    expect(encryptedPayload.waitingForKey).toBeFalsy();
    expect(encryptedPayload.lastSyncBegan).toBeFalsy();
  });

  it('creating payload with override properties', async function () {
    const payload = Factory.createNotePayload();
    const uuid = payload.uuid;
    const changedUuid = 'foo';
    const changedPayload = CreateMaxPayloadFromAnyObject(payload, {
      uuid: changedUuid,
    });

    expect(payload.uuid).toBe(uuid);
    expect(changedPayload.uuid).toBe(changedUuid);
  });

  it('creating payload with deep override properties', async function () {
    const payload = Factory.createNotePayload();
    const text = payload.content.text;
    const changedText = `${Math.random()}`;
    const changedPayload = CreateMaxPayloadFromAnyObject(payload, {
      content: {
        ...payload.safeContent,
        text: changedText,
      },
    });

    expect(payload.content === changedPayload.content).toBe(false);
    expect(payload.content.text).toBe(text);
    expect(changedPayload.content.text).toBe(changedText);
  });

  it('copying payload with override content should override completely', async function () {
    const item = await Factory.createMappedNote(application);
    const payload = CreateMaxPayloadFromAnyObject(item);
    const mutated = CreateMaxPayloadFromAnyObject(payload, {
      content: {
        foo: 'bar',
      },
    });
    expect(mutated.content.text).toBeFalsy();
  });

  it('copying payload with override should copy empty arrays', async function () {
    const pair = await Factory.createRelatedNoteTagPairPayload(
      application.payloadManager
    );
    const tagPayload = pair[1];
    expect(tagPayload.content.references.length).toBe(1);

    const mutated = CreateMaxPayloadFromAnyObject(tagPayload, {
      content: {
        ...tagPayload.safeContent,
        references: [],
      },
    });
    expect(mutated.content.references.length).toBe(0);
  });

  it('returns valid encrypted params for syncing', async function () {
    jest.setTimeout(5000);

    const payload = Factory.createNotePayload();
    const encryptedPayload = await application.protocolService.payloadByEncryptingPayload(
      payload,
      EncryptionIntent.Sync
    );
    expect(encryptedPayload.enc_item_key).toBeTruthy();
    expect(encryptedPayload.uuid).toBeTruthy();
    expect(encryptedPayload.auth_hash).toBeFalsy();
    expect(encryptedPayload.content_type).toBeTruthy();
    expect(encryptedPayload.created_at).toBeTruthy();
    expect(encryptedPayload.content).to.satisfy((string) => {
      return string.startsWith(
        application.protocolService.getLatestVersion()
      );
    });
  });

  it('returns unencrypted params with no keys', async function () {
    const payload = Factory.createNotePayload();
    const encodedPayload = await application.protocolService.payloadByEncryptingPayload(
      payload,
      EncryptionIntent.FileDecrypted
    );

    expect(encodedPayload.enc_item_key).toBeFalsy();
    expect(encodedPayload.auth_hash).toBeFalsy();
    expect(encodedPayload.uuid).toBeTruthy();
    expect(encodedPayload.content_type).toBeTruthy();
    expect(encodedPayload.created_at).toBeTruthy();
    /** File decrypted will result in bare object */
    expect(encodedPayload.content.title).toBe(payload.content.title);
  });

  it('returns additional fields for local storage', async function () {
    const payload = Factory.createNotePayload();

    const encryptedPayload = await application.protocolService.payloadByEncryptingPayload(
      payload,
      EncryptionIntent.LocalStorageEncrypted
    );

    expect(encryptedPayload.enc_item_key).toBeTruthy();
    expect(encryptedPayload.auth_hash).toBeFalsy();
    expect(encryptedPayload.uuid).toBeTruthy();
    expect(encryptedPayload.content_type).toBeTruthy();
    expect(encryptedPayload.created_at).toBeTruthy();
    expect(encryptedPayload.updated_at).toBeTruthy();
    expect(encryptedPayload.deleted).toBeFalsy();
    expect(encryptedPayload.errorDecrypting).toBeFalsy();
    expect(encryptedPayload.content).to.satisfy((string) => {
      return string.startsWith(
        application.protocolService.getLatestVersion()
      );
    });
  });

  it('omits deleted for export file', async function () {
    const payload = Factory.createNotePayload();
    const encryptedPayload = await application.protocolService.payloadByEncryptingPayload(
      payload,
      EncryptionIntent.FileEncrypted
    );
    expect(encryptedPayload.enc_item_key).toBeTruthy();
    expect(encryptedPayload.uuid).toBeTruthy();
    expect(encryptedPayload.content_type).toBeTruthy();
    expect(encryptedPayload.created_at).toBeTruthy();
    expect(encryptedPayload.deleted).toBeFalsy();
    expect(encryptedPayload.content).to.satisfy((string) => {
      return string.startsWith(
        application.protocolService.getLatestVersion()
      );
    });
  });

  it('items with error decrypting should remain as is', async function () {
    const payload = Factory.createNotePayload();
    const mutatedPayload = CreateMaxPayloadFromAnyObject(payload, {
      enc_item_key: 'foo',
      errorDecrypting: true,
    });
    const encryptedPayload = await application.protocolService.payloadByEncryptingPayload(
      mutatedPayload,
      EncryptionIntent.Sync
    );
    expect(encryptedPayload.content).toEqual(payload.content);
    expect(encryptedPayload.enc_item_key).toBeTruthy();
    expect(encryptedPayload.uuid).toBeTruthy();
    expect(encryptedPayload.content_type).toBeTruthy();
    expect(encryptedPayload.created_at).toBeTruthy();
  });
});
