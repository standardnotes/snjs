import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('keys', () => {

  before(async function () {
    localStorage.clear();
  })

  after(async function () {
    localStorage.clear();
  })

  beforeEach(async function() {
    this.application = await Factory.createInitAppWithRandNamespace();
    this.email = SFItem.GenerateUuidSynchronously();
    this.password = SFItem.GenerateUuidSynchronously();
  })

  it('validate isLocalStorageIntent', async function () {
    expect(isLocalStorageIntent(ENCRYPTION_INTENT_SYNC)).to.equal(false);
    expect(isLocalStorageIntent(ENCRYPTION_INTENT_LOCAL_STORAGE_ENCRYPTED)).to.equal(true);
    expect(isLocalStorageIntent(ENCRYPTION_INTENT_LOCAL_STORAGE_DECRYPTED)).to.equal(true);
    expect(isLocalStorageIntent(ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED)).to.equal(true);
    expect(isLocalStorageIntent(ENCRYPTION_INTENT_FILE_ENCRYPTED)).to.equal(false);
    expect(isLocalStorageIntent(ENCRYPTION_INTENT_FILE_DECRYPTED)).to.equal(false);
  })

  it('validate isFileIntent', async function () {
    expect(isFileIntent(ENCRYPTION_INTENT_SYNC)).to.equal(false);
    expect(isFileIntent(ENCRYPTION_INTENT_LOCAL_STORAGE_ENCRYPTED)).to.equal(false);
    expect(isFileIntent(ENCRYPTION_INTENT_LOCAL_STORAGE_DECRYPTED)).to.equal(false);
    expect(isFileIntent(ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED)).to.equal(false);
    expect(isFileIntent(ENCRYPTION_INTENT_FILE_ENCRYPTED)).to.equal(true);
    expect(isFileIntent(ENCRYPTION_INTENT_FILE_DECRYPTED)).to.equal(true);
  })

  it('validate isDecryptedIntent', async function () {
    expect(isDecryptedIntent(ENCRYPTION_INTENT_SYNC)).to.equal(false);
    expect(isDecryptedIntent(ENCRYPTION_INTENT_LOCAL_STORAGE_ENCRYPTED)).to.equal(false);
    expect(isDecryptedIntent(ENCRYPTION_INTENT_LOCAL_STORAGE_DECRYPTED)).to.equal(true);
    expect(isDecryptedIntent(ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED)).to.equal(false);
    expect(isDecryptedIntent(ENCRYPTION_INTENT_FILE_ENCRYPTED)).to.equal(false);
    expect(isDecryptedIntent(ENCRYPTION_INTENT_FILE_DECRYPTED)).to.equal(true);
  })

  it('validate intentRequiresEncryption', async function () {
    expect(intentRequiresEncryption(ENCRYPTION_INTENT_SYNC)).to.equal(true);
    expect(intentRequiresEncryption(ENCRYPTION_INTENT_LOCAL_STORAGE_ENCRYPTED)).to.equal(true);
    expect(intentRequiresEncryption(ENCRYPTION_INTENT_LOCAL_STORAGE_DECRYPTED)).to.equal(false);
    expect(intentRequiresEncryption(ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED)).to.equal(false);
    expect(intentRequiresEncryption(ENCRYPTION_INTENT_FILE_ENCRYPTED)).to.equal(true);
    expect(intentRequiresEncryption(ENCRYPTION_INTENT_FILE_DECRYPTED)).to.equal(false);
  })

  it('should not have root key by default', async function () {
    expect(await this.application.keyManager.getRootKey()).to.not.be.ok;
  })

  it('validates content types requiring root encryption', async function () {
    expect(this.application.keyManager.contentTypeUsesRootKeyEncryption(CONTENT_TYPE_ITEMS_KEY)).to.equal(true);
    expect(this.application.keyManager.contentTypeUsesRootKeyEncryption(CONTENT_TYPE_ENCRYPTED_STORAGE)).to.equal(true);
    expect(this.application.keyManager.contentTypeUsesRootKeyEncryption('SF|Item')).to.equal(false);
    expect(this.application.keyManager.contentTypeUsesRootKeyEncryption('Note')).to.equal(false);
  })

  it('generating export params with no key should produce decrypted payload', async function () {
    const payload = Factory.createNotePayload();
    const title = payload.content.title;
    const encryptedPayload = await this.application.protocolService
    .payloadByEncryptingPayload({
      payload: payload,
      intent: ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED
    })
    expect(payload.content.title).to.equal(title);
  })

  it('has root key and one items key after registering user', async function () {
    await Factory.registerUserToApplication({application: this.application});
    expect(this.application.keyManager.getRootKey()).to.be.ok;
    expect(this.application.keyManager.allItemsKeys.length).to.equal(1);
  })

  it('should use root key for encryption of storage', async function () {
    const email = 'foo', password = 'bar';
    const result = await this.application.protocolService.createRootKey({identifier: email, password});
    this.application.keyManager.setNewRootKey({key: result.key, keyParams: result.keyParams});

    const payload = CreateMaxPayloadFromAnyObject({
      object: {
        content: {foo: 'bar'},
        content_type: CONTENT_TYPE_ENCRYPTED_STORAGE
      }
    });
    const keyToUse = await this.application.keyManager.
    keyToUseForEncryptionOfPayload({
      payload: payload,
      intent: ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED
    })
    expect(keyToUse).to.equal(await this.application.keyManager.getRootKey());
  })

  it('items key should be encrypted with root key', async function() {
    await Factory.registerUserToApplication({application: this.application});
    const itemsKey = this.application.keyManager.getDefaultItemsKey();
    /** Encrypt items key */
    const encryptedPayload = await this.application.protocolService.payloadByEncryptingPayload({
      payload: itemsKey.payloadRepresentation(),
      intent: ENCRYPTION_INTENT_SYNC
    });
    /** Should not have an items_key_id */
    expect(encryptedPayload.items_key_id).to.not.be.ok;

    /** Attempt to decrypt with root key. Should succeed. */
    const rootKey = await this.application.keyManager.getRootKey();
    const decryptedPayload = await this.application.protocolService.payloadByDecryptingPayload({
      payload: encryptedPayload,
      key: rootKey
    });

    expect(decryptedPayload.errorDecrypting).to.equal(false);
    expect(decryptedPayload.content.itemsKey).to.equal(itemsKey.content.itemsKey);
  });

  it('should create random items key if no account and no passcode', async function() {
    const itemsKeys = this.application.keyManager.allItemsKeys;
    expect(itemsKeys.length).to.equal(1);
    const notePayload = Factory.createNotePayload();
    await this.application.savePayload({payload: notePayload});

    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    const rawNotePayload = rawPayloads.find((r) => r.content_type === 'Note');
    expect(typeof rawNotePayload.content).to.equal('string');
  });

  it('should use items key for encryption of note', async function() {
    const note = Factory.createNotePayload();
    const keyToUse = await this.application.keyManager.
    keyToUseForEncryptionOfPayload({
      payload: note,
      intent: ENCRYPTION_INTENT_SYNC
    })
    expect(keyToUse.content_type).to.equal(CONTENT_TYPE_ITEMS_KEY);
  })

  it('encrypting an item should associate an items key to it', async function() {
    const note = Factory.createNotePayload();
    const encryptedPayload = await this.application.protocolService
    .payloadByEncryptingPayload({
      payload: note,
      intent: ENCRYPTION_INTENT_SYNC
    });
    const itemsKey = this.application.keyManager.itemsKeyForPayload(encryptedPayload);
    expect(itemsKey).to.be.ok;
  })

  it('decrypt encrypted item with associated key', async function() {
    const note = Factory.createNotePayload();
    const title = note.content.title;
    const encryptedPayload = await this.application.protocolService
    .payloadByEncryptingPayload({
      payload: note,
      intent: ENCRYPTION_INTENT_SYNC
    });

    const itemsKey = this.application.keyManager.itemsKeyForPayload(encryptedPayload);
    expect(itemsKey).to.be.ok;

    const decryptedPayload = await this.application.protocolService
    .payloadByDecryptingPayload({
      payload: encryptedPayload
    });

    expect(decryptedPayload.content.title).to.equal(title);
  })

  it('decrypts items waiting for keys', async function() {
    const notePayload = Factory.createNotePayload();
    const title = notePayload.content.title;
    const encryptedPayload = await this.application.protocolService
    .payloadByEncryptingPayload({
      payload: notePayload,
      intent: ENCRYPTION_INTENT_SYNC
    });

    const itemsKey = this.application.keyManager.itemsKeyForPayload(encryptedPayload);
    await this.application.modelManager.removeItemLocally(itemsKey);

    const decryptedPayload = await this.application.protocolService
    .payloadByDecryptingPayload({
      payload: encryptedPayload
    })
    await this.application.modelManager.mapPayloadsToLocalItems({
      payloads: [decryptedPayload]
    })

    const note = this.application.modelManager.notes[0];
    expect(note.uuid).to.equal(notePayload.uuid);
    expect(note.errorDecrypting).to.equal(true);
    expect(note.waitingForKey).to.equal(true);

    const keyPayload = CreateMaxPayloadFromAnyObject({
      object: itemsKey
    })
    await this.application.modelManager.mapPayloadsToLocalItems({
      payloads: [keyPayload]
    })

    /**
     * Sleeping is required to trigger asyncronous protocolService.decryptItemsWaitingForKeys,
     * which occurs after keys are mapped above.
     */
    await Factory.sleep(0.2);

    expect(note.errorDecrypting).to.equal(false);
    expect(note.waitingForKey).to.equal(false);
    expect(note.content.title).to.equal(title);
  })

  it('generating export params with logged in account should produce encrypted payload', async function () {
    await Factory.registerUserToApplication({application: this.application});
    const payload = Factory.createNotePayload();
    const encryptedPayload = await this.application.protocolService
    .payloadByEncryptingPayload({
      payload: payload,
      intent: ENCRYPTION_INTENT_SYNC
    })
    expect(typeof encryptedPayload.content).to.equal('string');
    expect(encryptedPayload.content.substring(0, 3)).to.equal(
      this.application.protocolService.getLatestVersion()
    );
  })

  it('When setting passcode, should encrypt items keys', async function () {
    await this.application.setPasscode('foo');
    const itemsKey = this.application.keyManager.allItemsKeys[0];
    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    const itemsKeyRawPayload = rawPayloads.find((p) => p.uuid === itemsKey.uuid);
    const itemsKeyPayload = CreateMaxPayloadFromAnyObject({
      object: itemsKeyRawPayload
    });
    expect(itemsKeyPayload.isEncrypted).to.equal(true);
  });

  it('When root key changes, all items keys must be re-encrypted', async function () {
    await this.application.setPasscode('foo');
    await Factory.createSyncedNote(this.application);
    const itemsKeys = this.application.keyManager.allItemsKeys;
    expect(itemsKeys.length).to.equal(1);
    const originalItemsKey = itemsKeys[0];

    const originalRootKey = await this.application.keyManager.getRootKey();
    /** Expect that we can decrypt raw payload with current root key */
    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    const itemsKeyRawPayload = rawPayloads.find((p) => p.uuid === originalItemsKey.uuid);
    const itemsKeyPayload = CreateMaxPayloadFromAnyObject({
      object: itemsKeyRawPayload
    });
    const decrypted = await this.application.protocolService.payloadByDecryptingPayload({
      payload: itemsKeyPayload,
      key: originalRootKey
    });
    expect(decrypted.errorDecrypting).to.equal(false);
    expect(decrypted.content).to.eql(originalItemsKey.content);

    /** Change passcode */
    await this.application.changePasscode('bar');

    const newRootKey = await this.application.keyManager.getRootKey();
    expect(newRootKey).to.not.equal(originalRootKey);
    expect(newRootKey.masterKey).to.not.equal(originalRootKey.masterKey);

    /**
     * Expect that originalRootKey can no longer decrypt originalItemsKey
     * as items key has been re-encrypted with new root key
     */
    const rawPayloads2 = await this.application.storageManager.getAllRawPayloads();
    const itemsKeyRawPayload2 = rawPayloads2.find((p) => p.uuid === originalItemsKey.uuid);
    expect(itemsKeyRawPayload2.content).to.not.equal(itemsKeyRawPayload.content);

    const itemsKeyPayload2 = CreateMaxPayloadFromAnyObject({
      object: itemsKeyRawPayload2
    });
    const decrypted2 = await this.application.protocolService.payloadByDecryptingPayload({
     payload: itemsKeyRawPayload2,
     key: originalRootKey
    });
    expect(decrypted2.errorDecrypting).to.equal(true);

    /** Should be able to decrypt with new root key */
    const decrypted3 = await this.application.protocolService.payloadByDecryptingPayload({
     payload: itemsKeyRawPayload2,
     key: newRootKey
    });
    expect(decrypted3.errorDecrypting).to.equal(false);
  });

  it('changing account password with key rotation option should create new items key', async function () {
    await Factory.registerUserToApplication({
      application: this.application, email: this.email, password: this.password
    });
    const itemsKeys = this.application.keyManager.allItemsKeys;
    expect(itemsKeys.length).to.equal(1);
    const defaultItemsKey = this.application.keyManager.getDefaultItemsKey();

    await this.application.changePassword({
      email: this.email,
      currentPassword: this.password,
      currentKeyParams: await this.application.keyManager.getRootKeyParams(),
      newPassword: 'foobar',
      rotateItemsKey: true
    });

    expect(this.application.keyManager.allItemsKeys.length).to.equal(2);
    const newDefaultItemsKey = this.application.keyManager.getDefaultItemsKey();
    expect(newDefaultItemsKey.uuid).to.not.equal(defaultItemsKey.uuid);
  });

  it('protocol version should be upgraded on password change', async function () {
    /** Register with 003 version */
    const operator_003 = new SNProtocolOperator003(new SNWebCrypto());
    const identifier = this.email;
    const password = this.password;
    const result = await operator_003.createRootKey({
      identifier,
      password
    });
    const accountKey = result.key;
    const accountKeyParams = result.keyParams;
    /** Delete default items key that is created on launch */
    const itemsKey = this.application.keyManager.getDefaultItemsKey();
    await this.application.modelManager.setItemToBeDeleted(itemsKey);
    expect(this.application.keyManager.allItemsKeys.length).to.equal(0);

    /** We must manually hook into API, otherwise using wrapper methods
    always registers with latest version */
    const response = await this.application.apiService.register({
      email: identifier,
      serverPassword: accountKey.serverPassword,
      keyParams: accountKeyParams
    });
    await this.application.sessionManager.handleAuthResponse(response);
    await this.application.keyManager.setNewRootKey({
      key: accountKey,
      keyParams: accountKeyParams
    });
    await this.application.syncManager.sync();
    expect(this.application.keyManager.allItemsKeys.length).to.equal(1);

    expect(
      (await this.application.keyManager.getRootKeyParams()).version
    ).to.equal('003');
    expect(
      (await this.application.keyManager.getRootKey()).version
    ).to.equal('003');

    /** Create note and ensure its encrypted with 003 */
    await Factory.createSyncedNote(this.application);

    const notePayloads = await Factory.getStoragePayloadsOfType(
      this.application,
      'Note'
    );
    const notePayload003 = notePayloads[0];
    expect(notePayload003.version).to.equal('003');

    await this.application.changePassword({
      email: this.email,
      currentPassword: this.password,
      currentKeyParams: await this.application.keyManager.getRootKeyParams(),
      newPassword: 'foobar'
    });

    const latestVersion = this.application.protocolService.getLatestVersion();
    expect(
      (await this.application.keyManager.getRootKeyParams()).version
    ).to.equal(latestVersion);
    expect(
      (await this.application.keyManager.getRootKey()).version
    ).to.equal(latestVersion);

    const defaultItemsKey = this.application.keyManager.getDefaultItemsKey();
    expect(defaultItemsKey.version).to.equal(latestVersion);

    /** After change, note should now be encrypted with latest protocol version */

    const note = this.application.modelManager.notes[0];
    await this.application.saveItem({item: note});

    const refreshedNotePayloads = await Factory.getStoragePayloadsOfType(
      this.application,
      'Note'
    );
    const refreshedNotePayload = refreshedNotePayloads[0];
    expect(refreshedNotePayload.version).to.equal(latestVersion);
  });
})
