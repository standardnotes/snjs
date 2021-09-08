import { ChallengeValue } from '@Lib/challenges';
import {
  isLocalStorageIntent,
  isFileIntent,
  ContentTypeUsesRootKeyEncryption,
  PayloadFormat,
  KeyParamsOrigination,
  CreateMaxPayloadFromAnyObject,
  PayloadSource,
  CopyPayload,
  StorageValueModes,
  SyncModes
} from '@Lib/index';
import { ContentType } from '@Lib/models';
import { Uuid } from '@Lib/uuid';
import {
  EncryptionIntent,
  isDecryptedIntent,
  intentRequiresEncryption,
  ProtocolVersion,
  SNRootKey,
  SNProtocolOperator003
} from '@Lib/protocol';
import { StorageKey } from '@Lib/storage_keys';
import * as Factory from '../factory';
import SNCrypto from '../setup/snjs/snCrypto';

describe('keys', function () {
  jest.setTimeout(Factory.TestTimeout);

  it('validate isLocalStorageIntent', async function () {
    expect(isLocalStorageIntent(EncryptionIntent.Sync)).toBe(false);
    expect(
      isLocalStorageIntent(EncryptionIntent.LocalStorageEncrypted)
    ).toBe(true);
    expect(
      isLocalStorageIntent(EncryptionIntent.LocalStorageDecrypted)
    ).toBe(true);
    expect(
      isLocalStorageIntent(EncryptionIntent.LocalStoragePreferEncrypted)
    ).toBe(true);
    expect(isLocalStorageIntent(EncryptionIntent.FileEncrypted)).toBe(
      false
    );
    expect(isLocalStorageIntent(EncryptionIntent.FileDecrypted)).toBe(
      false
    );
  });

  it('validate isFileIntent', async function () {
    expect(isFileIntent(EncryptionIntent.Sync)).toBe(false);
    expect(isFileIntent(EncryptionIntent.LocalStorageEncrypted)).toBe(
      false
    );
    expect(isFileIntent(EncryptionIntent.LocalStorageDecrypted)).toBe(
      false
    );
    expect(isFileIntent(EncryptionIntent.LocalStoragePreferEncrypted)).toBe(
      false
    );
    expect(isFileIntent(EncryptionIntent.FileEncrypted)).toBe(true);
    expect(isFileIntent(EncryptionIntent.FileDecrypted)).toBe(true);
  });

  it('validate isDecryptedIntent', async function () {
    expect(isDecryptedIntent(EncryptionIntent.Sync)).toBe(false);
    expect(isDecryptedIntent(EncryptionIntent.LocalStorageEncrypted)).toBe(
      false
    );
    expect(isDecryptedIntent(EncryptionIntent.LocalStorageDecrypted)).toBe(
      true
    );
    expect(
      isDecryptedIntent(EncryptionIntent.LocalStoragePreferEncrypted)
    ).toBe(false);
    expect(isDecryptedIntent(EncryptionIntent.FileEncrypted)).toBe(false);
    expect(isDecryptedIntent(EncryptionIntent.FileDecrypted)).toBe(true);
  });

  it('validate intentRequiresEncryption', async function () {
    expect(intentRequiresEncryption(EncryptionIntent.Sync)).toBe(true);
    expect(
      intentRequiresEncryption(EncryptionIntent.LocalStorageEncrypted)
    ).toBe(true);
    expect(
      intentRequiresEncryption(EncryptionIntent.LocalStorageDecrypted)
    ).toBe(false);
    expect(
      intentRequiresEncryption(EncryptionIntent.LocalStoragePreferEncrypted)
    ).toBe(false);
    expect(intentRequiresEncryption(EncryptionIntent.FileEncrypted)).toBe(
      true
    );
    expect(intentRequiresEncryption(EncryptionIntent.FileDecrypted)).toBe(
      false
    );
  });

  it('should not have root key by default', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext();
    expect(application.protocolService.getRootKey()).toBeUndefined();
    application.deinit();
  });

  it('validates content types requiring root encryption', async function () {
    expect(ContentTypeUsesRootKeyEncryption(ContentType.ItemsKey)).toBe(
      true
    );
    expect(
      ContentTypeUsesRootKeyEncryption(ContentType.EncryptedStorage)
    ).toBe(true);
    expect(ContentTypeUsesRootKeyEncryption(ContentType.Item)).toBe(false);
    expect(ContentTypeUsesRootKeyEncryption(ContentType.Note)).toBe(false);
  });

  it('generating export params with no account or passcode should produce encrypted payload', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext();
    /** Items key available by default */
    const payload = Factory.createNotePayload();
    const processedPayload = await application.protocolService.payloadByEncryptingPayload(
      payload,
      EncryptionIntent.LocalStoragePreferEncrypted
    );
    expect(processedPayload.format).toBe(PayloadFormat.EncryptedString);
    application.deinit();
  });

  it('has root key and one items key after registering user', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext();
    await Factory.registerUserToApplication({ application: application });
    expect(application.protocolService.getRootKey()).toBeDefined();
    expect(application.itemManager.itemsKeys().length).toBe(1);
    application.deinit();
  });

  it('should use root key for encryption of storage', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext();
    const email = 'foo';
    const password = 'bar';
    const key = await application.protocolService.createRootKey(
      email,
      password,
      KeyParamsOrigination.Registration
    );
    application.protocolService.setRootKey(key);

    const payload = CreateMaxPayloadFromAnyObject({
      uuid: Factory.generateUuidish(),
      content: { foo: 'bar' },
      content_type: ContentType.EncryptedStorage,
    });
    const keyToUse = await application.protocolService.keyToUseForEncryptionOfPayload(
      payload,
      EncryptionIntent.LocalStoragePreferEncrypted
    );
    expect(keyToUse).toBe(
      application.protocolService.getRootKey()
    );
    await Factory.sleep(2);
    application.deinit();
  });

  it('changing root key with passcode should re-wrap root key', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext();
    const email = 'foo';
    const password = 'bar';
    const key = await application.protocolService.createRootKey(
      email,
      password,
      KeyParamsOrigination.Registration
    );
    await application.protocolService.setRootKey(key);
    Factory.handlePasswordChallenges(application, password);
    await application.addPasscode(password);

    /** We should be able to decrypt wrapped root key with passcode */
    const wrappingKeyParams = await application.protocolService.getRootKeyWrapperKeyParams();
    const wrappingKey = await application.protocolService.computeRootKey(
      password,
      wrappingKeyParams
    );
    await application.protocolService
      .unwrapRootKey(wrappingKey)
      .catch((error) => {
        expect(error).toBeFalsy();
      });

    const newPassword = 'bar';
    const newKey = await application.protocolService.createRootKey(
      email,
      newPassword,
      KeyParamsOrigination.Registration
    );
    await application.protocolService.setRootKey(newKey, wrappingKey);
    await application.protocolService
      .unwrapRootKey(wrappingKey)
      .catch((error) => {
        expect(error).toBeFalsy();
      });
    await Factory.sleep(2);
    application.deinit();
  });

  it('items key should be encrypted with root key', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext();
    await Factory.registerUserToApplication({ application: application });
    const itemsKey = application.protocolService.getDefaultItemsKey();
    /** Encrypt items key */
    const encryptedPayload = await application.protocolService.payloadByEncryptingPayload(
      itemsKey.payloadRepresentation(),
      EncryptionIntent.Sync
    );
    /** Should not have an items_key_id */
    expect(encryptedPayload.items_key_id).toBeFalsy();

    /** Attempt to decrypt with root key. Should succeed. */
    const rootKey = application.protocolService.getRootKey();
    const decryptedPayload = await application.protocolService.payloadByDecryptingPayload(
      encryptedPayload,
      rootKey
    );

    expect(decryptedPayload.errorDecrypting).toBe(false);
    expect(decryptedPayload.content.itemsKey).toBe(
      itemsKey.content.itemsKey
    );
    application.deinit();
  });

  it('should create random items key if no account and no passcode', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext();
    const itemsKeys = application.itemManager.itemsKeys();
    expect(itemsKeys.length).toBe(1);
    const notePayload = Factory.createNotePayload();
    await application.savePayload(notePayload);

    const rawPayloads = await application.storageService.getAllRawPayloads();
    const rawNotePayload = rawPayloads.find(
      (r) => r.content_type === ContentType.Note
    );
    expect(typeof rawNotePayload.content).toBe('string');
    application.deinit();
  });

  it('should keep offline created items key upon registration', async function () {
    const { application, email, password } = await Factory.createAndInitSimpleAppContext();
    expect(application.itemManager.itemsKeys().length).toBe(1);
    const originalItemsKey = application.itemManager.itemsKeys()[0];
    await application.register(email, password);

    expect(application.itemManager.itemsKeys().length).toBe(1);
    const newestItemsKey = application.itemManager.itemsKeys()[0];
    expect(newestItemsKey.uuid).toBe(originalItemsKey.uuid);
    application.deinit();
  });

  it('should use items key for encryption of note', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext();
    const note = Factory.createNotePayload();
    const keyToUse = await application.protocolService.keyToUseForEncryptionOfPayload(
      note,
      EncryptionIntent.Sync
    );
    expect(keyToUse.content_type).toBe(ContentType.ItemsKey);
    application.deinit();
  });

  it('encrypting an item should associate an items key to it', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext();
    const note = Factory.createNotePayload();
    const encryptedPayload = await application.protocolService.payloadByEncryptingPayload(
      note,
      EncryptionIntent.Sync
    );
    const itemsKey = application.protocolService.itemsKeyForPayload(
      encryptedPayload
    );
    expect(itemsKey).toBeTruthy();
    application.deinit();
  });

  it('decrypt encrypted item with associated key', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext();
    const note = Factory.createNotePayload();
    const title = note.content.title;
    const encryptedPayload = await application.protocolService.payloadByEncryptingPayload(
      note,
      EncryptionIntent.Sync
    );

    const itemsKey = application.protocolService.itemsKeyForPayload(
      encryptedPayload
    );
    expect(itemsKey).toBeTruthy();

    const decryptedPayload = await application.protocolService.payloadByDecryptingPayload(
      encryptedPayload
    );

    expect(decryptedPayload.content.title).toBe(title);
    application.deinit();
  });

  it('decrypts items waiting for keys', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext();
    const notePayload = Factory.createNotePayload();
    const title = notePayload.content.title;
    const encryptedPayload = await application.protocolService.payloadByEncryptingPayload(
      notePayload,
      EncryptionIntent.Sync
    );

    const itemsKey = application.protocolService.itemsKeyForPayload(
      encryptedPayload
    );
    application.itemManager.removeItemLocally(itemsKey);

    const decryptedPayload = await application.protocolService.payloadByDecryptingPayload(
      encryptedPayload
    );
    await application.itemManager.emitItemsFromPayloads(
      [decryptedPayload],
      PayloadSource.LocalChanged
    );

    const note = application.itemManager.notes[0];
    expect(note.uuid).toBe(notePayload.uuid);
    expect(note.errorDecrypting).toBe(true);
    expect(note.waitingForKey).toBe(true);

    const keyPayload = CreateMaxPayloadFromAnyObject(itemsKey);
    await application.itemManager.emitItemsFromPayloads(
      [keyPayload],
      PayloadSource.LocalChanged
    );

    /**
     * Sleeping is required to trigger asyncronous protocolService.decryptItemsWaitingForKeys,
     * which occurs after keys are mapped above.
     */
    await Factory.sleep(0.2);

    const updatedNote = application.itemManager.findItem(note.uuid);

    expect(updatedNote.errorDecrypting).toBe(false);
    expect(updatedNote.waitingForKey).toBe(false);
    expect(updatedNote.content.title).toBe(title);
    application.deinit();
  });

  it('attempting to emit errored items key for which there exists a non errored master copy should ignore it', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext({ registerUser: true });
    const itemsKey = application.protocolService.getDefaultItemsKey();
    expect(itemsKey.errorDecrypting).toBeFalsy();

    const errored = CopyPayload(itemsKey.payload, {
      content: {
        foo: 'bar',
      },
      errorDecrypting: true,
    });

    await application.payloadManager.emitPayload(
      errored,
      PayloadSource.Constructor
    );
    await Factory.sleep(2);

    const refreshedKey = application.findItem(itemsKey.uuid);
    expect(refreshedKey.errorDecrypting).toBeFalsy();
    expect(refreshedKey.content.foo).toBeFalsy();
    application.deinit();
  });

  it('generating export params with logged in account should produce encrypted payload', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext();
    await Factory.registerUserToApplication({ application: application });
    const payload = Factory.createNotePayload();
    const encryptedPayload = await application.protocolService.payloadByEncryptingPayload(
      payload,
      EncryptionIntent.Sync
    );
    expect(typeof encryptedPayload.content).toBe('string');
    expect(encryptedPayload.content.substring(0, 3)).toBe(
      application.protocolService.getLatestVersion()
    );
    application.deinit();
  });

  it('When setting passcode, should encrypt items keys', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext();
    await application.addPasscode('foo');
    const itemsKey = application.itemManager.itemsKeys()[0];
    const rawPayloads = await application.storageService.getAllRawPayloads();
    const itemsKeyRawPayload = rawPayloads.find(
      (p) => p.uuid === itemsKey.uuid
    );
    const itemsKeyPayload = CreateMaxPayloadFromAnyObject(itemsKeyRawPayload);
    expect(itemsKeyPayload.format).toBe(PayloadFormat.EncryptedString);
    application.deinit();
  });

  it('items key encrypted payload should contain root key params', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext();
    await application.addPasscode('foo');
    const itemsKey = application.itemManager.itemsKeys()[0];
    const rawPayloads = await application.storageService.getAllRawPayloads();
    const itemsKeyRawPayload = rawPayloads.find(
      (p) => p.uuid === itemsKey.uuid
    );
    const itemsKeyPayload = CreateMaxPayloadFromAnyObject(itemsKeyRawPayload);
    const operator = application.protocolService.operatorForVersion(
      ProtocolVersion.V004
    );
    const comps = operator.deconstructEncryptedPayloadString(
      itemsKeyPayload.content
    );
    const rawAuthenticatedData = comps.rawAuthenticatedData;
    const authenticatedData = await operator.stringToAuthenticatedData(
      rawAuthenticatedData
    );
    const rootKeyParams = await application.protocolService.getRootKeyParams();

    expect(authenticatedData.kp).toBeTruthy();
    expect(authenticatedData.kp).toEqual(rootKeyParams.getPortableValue());
    expect(authenticatedData.kp.origination).toBe(
      KeyParamsOrigination.PasscodeCreate
    );
    application.deinit();
  });

  it('correctly validates local passcode', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext();
    const passcode = 'foo';
    await application.addPasscode('foo');
    expect(
      (await application.protocolService.validatePasscode('wrong')).valid
    ).toBe(false);
    expect(
      (await application.protocolService.validatePasscode(passcode)).valid
    ).toBe(true);
    application.deinit();
  });

  it('signing into 003 account should delete latest offline items key and create 003 items key', async function () {
    const { application, email, password } = await Factory.createAndInitSimpleAppContext();
    /**
     * When starting the application it will create an items key with the latest protocol version (004).
     * Upon signing into an 003 account, the application should delete any neverSynced items keys,
     * and create a new default items key that is the default for a given protocol version.
     */
    const defaultItemsKey = application.protocolService.getDefaultItemsKey();
    const latestVersion = application.protocolService.getLatestVersion();
    expect(defaultItemsKey.keyVersion).toBe(latestVersion);

    /** Register with 003 version */
    await Factory.registerOldUser({
      application: application,
      email: email,
      password: password,
      version: ProtocolVersion.V003,
    });

    const itemsKeys = application.itemManager.itemsKeys();
    expect(itemsKeys.length).toBe(1);
    const newestItemsKey = itemsKeys[0];
    expect(newestItemsKey.keyVersion).toBe(ProtocolVersion.V003);
    const rootKey = application.protocolService.getRootKey();
    expect(newestItemsKey.itemsKey).toBe(rootKey.masterKey);
    expect(newestItemsKey.dataAuthenticationKey).toBe(
      rootKey.dataAuthenticationKey
    );
    application.deinit();
  });

  it('reencrypts existing notes when logging into an 003 account', async function () {
    let { application, email, password } = await Factory.createAndInitSimpleAppContext();
    await Factory.createManyMappedNotes(application, 10);
    await Factory.registerOldUser({
      application: application,
      email: email,
      password: password,
      version: ProtocolVersion.V003,
    });

    expect(application.itemManager.invalidItems.length).toBe(0);
    expect(application.itemManager.itemsKeys().length).toBe(1);
    expect(application.itemManager.itemsKeys()[0].dirty).toBe(false);

    /** Sign out and back in */
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

    expect(application.itemManager.itemsKeys().length).toBe(1);
    expect(application.itemManager.notes.length).toBe(10);
    expect(application.itemManager.invalidItems.length).toBe(0);
    application.deinit();
  });

  it('When root key changes, all items keys must be re-encrypted', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext();
    const passcode = 'foo';
    await application.addPasscode(passcode);
    await Factory.createSyncedNote(application);
    const itemsKeys = application.itemManager.itemsKeys();
    expect(itemsKeys.length).toBe(1);
    const originalItemsKey = itemsKeys[0];

    const originalRootKey = application.protocolService.getRootKey();
    /** Expect that we can decrypt raw payload with current root key */
    const rawPayloads = await application.storageService.getAllRawPayloads();
    const itemsKeyRawPayload = rawPayloads.find(
      (p) => p.uuid === originalItemsKey.uuid
    );
    const itemsKeyPayload = CreateMaxPayloadFromAnyObject(itemsKeyRawPayload);
    const decrypted = await application.protocolService.payloadByDecryptingPayload(
      itemsKeyPayload,
      originalRootKey
    );

    expect(decrypted.errorDecrypting).toBe(false);
    expect(decrypted.content).toEqual(originalItemsKey.content);

    /** Change passcode */
    Factory.handlePasswordChallenges(application, passcode);
    await application.changePasscode('bar');

    const newRootKey = application.protocolService.getRootKey();
    expect(newRootKey).not.toEqual(originalRootKey);
    expect(newRootKey.masterKey).not.toEqual(originalRootKey.masterKey);

    /**
     * Expect that originalRootKey can no longer decrypt originalItemsKey
     * as items key has been re-encrypted with new root key
     */
    const rawPayloads2 = await application.storageService.getAllRawPayloads();
    const itemsKeyRawPayload2 = rawPayloads2.find(
      (p) => p.uuid === originalItemsKey.uuid
    );
    expect(itemsKeyRawPayload2.content).not.toEqual(
      itemsKeyRawPayload.content
    );

    const itemsKeyPayload2 = CreateMaxPayloadFromAnyObject(itemsKeyRawPayload2);
    const decrypted2 = await application.protocolService.payloadByDecryptingPayload(
      itemsKeyPayload2,
      originalRootKey
    );
    expect(decrypted2.errorDecrypting).toBe(true);

    /** Should be able to decrypt with new root key */
    const decrypted3 = await application.protocolService.payloadByDecryptingPayload(
      itemsKeyPayload2,
      newRootKey
    );
    expect(decrypted3.errorDecrypting).toBeFalsy();
    application.deinit();
  });

  it('changing account password should create new items key and encrypt items with that key', async function () {
    const { application, email, password } = await Factory.createAndInitSimpleAppContext();
    await Factory.registerUserToApplication({
      application: application,
      email: email,
      password: password,
    });
    const itemsKeys = application.itemManager.itemsKeys();
    expect(itemsKeys.length).toBe(1);
    const defaultItemsKey = application.protocolService.getDefaultItemsKey();

    const result = await application.changePassword(
      password,
      'foobarfoo'
    );
    expect(result.error).toBeFalsy();

    expect(application.itemManager.itemsKeys().length).toBe(2);
    const newDefaultItemsKey = application.protocolService.getDefaultItemsKey();
    expect(newDefaultItemsKey.uuid).not.toEqual(defaultItemsKey.uuid);

    const note = await Factory.createSyncedNote(application);
    const payload = await application.protocolService.payloadByEncryptingPayload(
      note.payload,
      EncryptionIntent.Sync
    );
    expect(payload.items_key_id).toBe(newDefaultItemsKey.uuid);
  });

  it('changing account email should create new items key and encrypt items with that key', async function () {
    const { application, email, password } = await Factory.createAndInitSimpleAppContext();
    await Factory.registerUserToApplication({
      application: application,
      email: email,
      password: password,
    });
    const itemsKeys = application.itemManager.itemsKeys();
    expect(itemsKeys.length).toBe(1);
    const defaultItemsKey = application.protocolService.getDefaultItemsKey();

    const newEmail = Uuid.GenerateUuidSynchronously();
    const result = await application.changeEmail(
      newEmail,
      password,
    );
    expect(result.error).toBeFalsy();

    expect(application.itemManager.itemsKeys().length).toBe(2);
    const newDefaultItemsKey = application.protocolService.getDefaultItemsKey();
    expect(newDefaultItemsKey.uuid).not.toEqual(defaultItemsKey.uuid);

    const note = await Factory.createSyncedNote(application);
    const payload = await application.protocolService.payloadByEncryptingPayload(
      note.payload,
      EncryptionIntent.Sync
    );
    expect(payload.items_key_id).toBe(newDefaultItemsKey.uuid);
  });

  it('compares root keys', async function () {
    const keyParams = {};
    const a1 = await SNRootKey.Create({
      version: ProtocolVersion.V004,
      masterKey:
        '2C26B46B68FFC68FF99B453C1D30413413422D706483BFA0F98A5E886266E7AE',
      serverPassword:
        'FCDE2B2EDBA56BF408601FB721FE9B5C338D10EE429EA04FAE5511B68FBF8FB9',
      keyParams,
    });
    const a2 = await SNRootKey.Create({
      version: ProtocolVersion.V004,
      masterKey:
        '2C26B46B68FFC68FF99B453C1D30413413422D706483BFA0F98A5E886266E7AE',
      serverPassword:
        'FCDE2B2EDBA56BF408601FB721FE9B5C338D10EE429EA04FAE5511B68FBF8FB9',
      keyParams,
    });
    const b = await SNRootKey.Create({
      version: ProtocolVersion.V004,
      masterKey:
        '2CF24DBA5FB0A30E26E83B2AC5B9E29E1B161E5C1FA7425E73043362938B9824',
      serverPassword:
        '486EA46224D1BB4FB680F34F7C9AD96A8F24EC88BE73EA8E5A6C65260E9CB8A7',
      keyParams,
    });

    expect(a1.compare(a2)).toBe(true);
    expect(a2.compare(a1)).toBe(true);
    expect(a1.compare(b)).toBe(false);
    expect(b.compare(a1)).toBe(false);
  });

  it('loading the keychain root key should also load its key params', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext();
    await Factory.registerUserToApplication({ application: application });
    const rootKey = await application.protocolService.getRootKeyFromKeychain();
    expect(rootKey.keyParams).toBeTruthy();
    application.deinit();
  });

  it('key params should be persisted separately and not as part of root key', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext();
    await Factory.registerUserToApplication({ application: application });
    const rawKey = await application.deviceInterface.getNamespacedKeychainValue(
      application.identifier
    );
    expect(rawKey.keyParams).toBeFalsy();
    const rawKeyParams = await application.storageService.getValue(
      StorageKey.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(rawKeyParams).toBeTruthy();
    application.deinit();
  });

  it('persisted key params should exactly equal in memory rootKey.keyParams', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext();
    await Factory.registerUserToApplication({ application: application });
    const rootKey = application.protocolService.getRootKey();
    const rawKeyParams = await application.storageService.getValue(
      StorageKey.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(rootKey.keyParams.content).toEqual(rawKeyParams);
    application.deinit();
  });

  it('key params should have expected values', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext();
    await Factory.registerUserToApplication({ application: application });
    const keyParamsObject = await application.protocolService.getRootKeyParams();
    const keyParams = keyParamsObject.content;
    expect(keyParams.identifier).toBeTruthy();
    expect(keyParams.pw_nonce).toBeTruthy();
    expect(keyParams.version).toBe(ProtocolVersion.V004);
    expect(keyParams.created).toBeTruthy();
    expect(keyParams.origination).toBe(KeyParamsOrigination.Registration);
    expect(keyParams.email).toBeFalsy();
    expect(keyParams.pw_cost).toBeFalsy();
    expect(keyParams.pw_salt).toBeFalsy();
    application.deinit();
  });

  it('key params obtained when signing in should have created and origination', async function () {
    let { application, email, password } = await Factory.createAndInitSimpleAppContext();
    await Factory.registerUserToApplication({
      application: application,
      email,
      password,
    });
    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    await Factory.loginToApplication({
      application: application,
      email,
      password,
    });
    const keyParamsObject = await application.protocolService.getRootKeyParams();
    const keyParams = keyParamsObject.content;

    expect(keyParams.created).toBeTruthy();
    expect(keyParams.origination).toBe(KeyParamsOrigination.Registration);
    application.deinit();
  });

  it('key params for 003 account should still have origination and created', async function () {
    const { application, email, password } = await Factory.createAndInitSimpleAppContext();
    /** origination and created are new properties since 004, but they can be added retroactively
     * to previous versions. They are not essential to <= 003, but are for >= 004 */

    /** Register with 003 version */
    await Factory.registerOldUser({
      application: application,
      email: email,
      password: password,
      version: ProtocolVersion.V003,
    });
    const keyParamsObject = await application.protocolService.getRootKeyParams();
    const keyParams = keyParamsObject.content;

    expect(keyParams.created).toBeTruthy();
    expect(keyParams.origination).toBe(KeyParamsOrigination.Registration);
    application.deinit();
  });

  it('encryption name should be dependent on key params version', async function () {
    let { application, email, password } = await Factory.createAndInitSimpleAppContext();
    /** Register with 003 account */
    await Factory.registerOldUser({
      application: application,
      email: email,
      password: password,
      version: ProtocolVersion.V003,
    });
    expect(
      await application.protocolService.getEncryptionDisplayName()
    ).toBe('AES-256');

    application = await Factory.signOutApplicationAndReturnNew(
      application
    );
    /** Register with 004 account */
    await application.register(email + 'new', password);
    expect(
      await application.protocolService.getEncryptionDisplayName()
    ).toBe('XChaCha20-Poly1305');
    application.deinit();
  });

  it('when launching app with no keychain but data, should present account recovery challenge', async function () {
    const { application, email, password } = await Factory.createAndInitSimpleAppContext();
    /**
     * On iOS (and perhaps other platforms where keychains are not included in device backups),
     * when setting up a new device from restore, the keychain is deleted, but the data persists.
     * We want to make sure we're prompting the user to re-authenticate their account.
     */
    const id = application.identifier;
    await Factory.registerUserToApplication({
      application: application,
      email: email,
      password: password,
    });
    /** Simulate empty keychain */
    await application.deviceInterface.clearRawKeychainValue();
    application.deinit();

    const recreatedApp = Factory.createApplication(id);
    let totalChallenges = 0;
    const expectedChallenges = 1;
    const receiveChallenge = async (challenge) => {
      totalChallenges++;
      recreatedApp.submitValuesForChallenge(challenge, [
        new ChallengeValue(challenge.prompts[0], password),
      ]);
    };
    await recreatedApp.prepareForLaunch({ receiveChallenge });
    await recreatedApp.launch(true);

    expect(recreatedApp.protocolService.rootKey).toBeTruthy();
    expect(totalChallenges).toBe(expectedChallenges);
    application.deinit();
  });

  describe('changing password on 003 client while signed into 004 client should', function () {
    /**
     * When an 004 client signs into 003 account, it creates a root key based items key.
     * Then, if the 003 client changes its account password, and the 004 client
     * re-authenticates, incorrect behavior (2.0.13) would be not to create a new root key based
     * items key based on the new root key. The result would be that when the modified 003
     * items sync to the 004 client, it can't decrypt them with its existing items key
     * because its based on the old root key.
     */
    it.skip('add new items key', async function () {
      timeout(Factory.LongTestTimeout * 3);
      let oldClient = application;

      /** Register an 003 account */
      await Factory.registerOldUser({
        application: oldClient,
        email: email,
        password: password,
        version: ProtocolVersion.V003,
      });

      /** Sign into account from another app */
      const newClient = await Factory.createAppWithRandNamespace();
      await newClient.prepareForLaunch({
        receiveChallenge: (challenge) => {
          /** Reauth session challenge */
          newClient.submitValuesForChallenge(challenge, [
            new ChallengeValue(challenge.prompts[0], email),
            new ChallengeValue(challenge.prompts[1], password),
          ]);
        },
      });
      await newClient.launch();

      /** Change password through session manager directly instead of application,
       * as not to create any items key (to simulate 003 client behavior) */
      const currentRootKey = await oldClient.protocolService.computeRootKey(
        password,
        await oldClient.protocolService.getRootKeyParams()
      );
      const operator = oldClient.protocolService.operatorForVersion(
        ProtocolVersion.V003
      );
      const newRootKey = await operator.createRootKey(
        email,
        password
      );
      Object.defineProperty(oldClient.apiService, 'apiVersion', {
        get: function () {
          return '20190520';
        },
      });

      /**
       * Sign in as late as possible on new client to prevent session timeouts
       */
      await newClient.signIn(email, password);

      await oldClient.sessionManager.changeCredentials({
        currentServerPassword: currentRootKey.serverPassword,
        newRootKey
      });

      /** Re-authenticate on other app; allow challenge to complete */
      await newClient.sync();
      await Factory.sleep(1);

      /** Expect a new items key to be created based on the new root key */
      expect(newClient.itemManager.itemsKeys().length).toBe(2);

      newClient.deinit();
      oldClient.deinit();
    });

    it('add new items key from migration if pw change already happened', async function () {
      let { application, email, password } = await Factory.createAndInitSimpleAppContext();
      /** Register an 003 account */
      await Factory.registerOldUser({
        application: application,
        email: email,
        password: password,
        version: ProtocolVersion.V003,
      });

      /** Change password through session manager directly instead of application,
       * as not to create any items key (to simulate 003 client behavior) */
      const currentRootKey = await application.protocolService.computeRootKey(
        password,
        await application.protocolService.getRootKeyParams()
      );
      const operator = application.protocolService.operatorForVersion(
        ProtocolVersion.V003
      );
      const newRootKey = await operator.createRootKey(
        email,
        password
      );
      Object.defineProperty(application.apiService, 'apiVersion', {
        get: function () {
          return '20190520';
        },
      });

      /** Renew session to prevent timeouts */
      application = await Factory.signOutAndBackIn(
        application,
        email,
        password
      );

      await application.sessionManager.changeCredentials({
        currentServerPassword: currentRootKey.serverPassword,
        newRootKey
      });
      await application.protocolService.reencryptItemsKeys();
      await application.sync({ awaitAll: true });

      /** Relaunch application and expect new items key to be created */
      const identifier = application.identifier;
      /** Set to pre 2.0.15 version so migration runs */
      await application.deviceInterface.setRawStorageValue(
        `${identifier}-snjs_version`,
        '2.0.14'
      );
      application.deinit();

      const refreshedApp = Factory.createApplication(identifier);
      await Factory.initializeApplication(refreshedApp);

      /** Expect a new items key to be created based on the new root key */
      expect(refreshedApp.itemManager.itemsKeys().length).toBe(2);
      application.deinit();
    });
  });

  it('importing 003 account backup, then registering for account, should properly reconcile keys', async function () {
    const { application } = await Factory.createAndInitSimpleAppContext();
    /**
     * When importing a backup of an 003 account into an offline state, ItemsKeys imported
     * will have an updated_at value, which tell our protocol service that this key has been
     * synced before, which sort of "lies" to the protocol service because now it thinks it doesnt
     * need to create a new items key because one has already been synced with the account.
     * The corrective action was to do a final check in protocolService.handleDownloadFirstSyncCompletion
     * to ensure there exists an items key corresponding to the user's account version.
     */
    await application.itemManager.removeAllItemsFromMemory();
    const note = await Factory.createMappedNote(application);
    expect(application.protocolService.getDefaultItemsKey()).toBeFalsy();
    const protocol003 = new SNProtocolOperator003(new SNCrypto());
    const key = await protocol003.createItemsKey();
    await application.itemManager.emitItemFromPayload(
      CopyPayload(key.payload, {
        content: {
          ...key.payload.content,
          isDefault: true,
        },
        dirty: true,
        /** Important to indicate that the key has been synced with a server */
        updated_at: Date.now(),
      })
    );
    const defaultKey = application.protocolService.getDefaultItemsKey();
    expect(defaultKey.keyVersion).toBe(ProtocolVersion.V003);
    expect(defaultKey.uuid).toBe(key.uuid);
    await Factory.registerUserToApplication({ application: application });
    expect(
      await application.protocolService.keyToUseForEncryptionOfPayload(
        note.payload,
        EncryptionIntent.Sync
      )
    ).toBeTruthy();
    application.deinit();
  });

  it('having unsynced items keys should resync them upon download first sync completion', async function () {
    const application = await Factory.createInitAppWithRandNamespace();
    await Factory.registerUserToApplication({ application: application });
    const itemsKey = application.itemManager.itemsKeys()[0];
    await application.itemManager.emitItemFromPayload(
      CopyPayload(itemsKey.payload, {
        dirty: false,
        updated_at: new Date(0),
        deleted: false
      })
    );
    await application.syncService.sync({
      mode: SyncModes.DownloadFirst,
    });
    const updatedKey = application.findItem(itemsKey.uuid);
    expect(updatedKey.neverSynced).toBe(false);
    application.deinit();
  });
});
