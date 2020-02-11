/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
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
  });

  after(async function () {
    localStorage.clear();
  });

  beforeEach(async function () {
    this.application = await Factory.createInitAppWithRandNamespace();
    this.email = Uuid.GenerateUuidSynchronously();
    this.password = Uuid.GenerateUuidSynchronously();
  });

  afterEach(async function () {
    await this.application.deinit();
  });

  it('validate isLocalStorageIntent', async function () {
    expect(isLocalStorageIntent(EncryptionIntents.Sync)).to.equal(false);
    expect(isLocalStorageIntent(EncryptionIntents.LocalStorageEncrypted)).to.equal(true);
    expect(isLocalStorageIntent(EncryptionIntents.LocalStorageDecrypted)).to.equal(true);
    expect(isLocalStorageIntent(EncryptionIntents.LocalStoragePreferEncrypted)).to.equal(true);
    expect(isLocalStorageIntent(EncryptionIntents.FileEncrypted)).to.equal(false);
    expect(isLocalStorageIntent(EncryptionIntents.FileDecrypted)).to.equal(false);
  });

  it('validate isFileIntent', async function () {
    expect(isFileIntent(EncryptionIntents.Sync)).to.equal(false);
    expect(isFileIntent(EncryptionIntents.LocalStorageEncrypted)).to.equal(false);
    expect(isFileIntent(EncryptionIntents.LocalStorageDecrypted)).to.equal(false);
    expect(isFileIntent(EncryptionIntents.LocalStoragePreferEncrypted)).to.equal(false);
    expect(isFileIntent(EncryptionIntents.FileEncrypted)).to.equal(true);
    expect(isFileIntent(EncryptionIntents.FileDecrypted)).to.equal(true);
  });

  it('validate isDecryptedIntent', async function () {
    expect(isDecryptedIntent(EncryptionIntents.Sync)).to.equal(false);
    expect(isDecryptedIntent(EncryptionIntents.LocalStorageEncrypted)).to.equal(false);
    expect(isDecryptedIntent(EncryptionIntents.LocalStorageDecrypted)).to.equal(true);
    expect(isDecryptedIntent(EncryptionIntents.LocalStoragePreferEncrypted)).to.equal(false);
    expect(isDecryptedIntent(EncryptionIntents.FileEncrypted)).to.equal(false);
    expect(isDecryptedIntent(EncryptionIntents.FileDecrypted)).to.equal(true);
  });

  it('validate intentRequiresEncryption', async function () {
    expect(intentRequiresEncryption(EncryptionIntents.Sync)).to.equal(true);
    expect(intentRequiresEncryption(EncryptionIntents.LocalStorageEncrypted)).to.equal(true);
    expect(intentRequiresEncryption(EncryptionIntents.LocalStorageDecrypted)).to.equal(false);
    expect(intentRequiresEncryption(EncryptionIntents.LocalStoragePreferEncrypted)).to.equal(false);
    expect(intentRequiresEncryption(EncryptionIntents.FileEncrypted)).to.equal(true);
    expect(intentRequiresEncryption(EncryptionIntents.FileDecrypted)).to.equal(false);
  });

  it('should not have root key by default', async function () {
    expect(await this.application.keyManager.getRootKey()).to.not.be.ok;
  });

  it('validates content types requiring root encryption', async function () {
    expect(this.application.keyManager.contentTypeUsesRootKeyEncryption(ContentTypes.ItemsKey)).to.equal(true);
    expect(this.application.keyManager.contentTypeUsesRootKeyEncryption(ContentTypes.EncryptedStorage)).to.equal(true);
    expect(this.application.keyManager.contentTypeUsesRootKeyEncryption('SF|Item')).to.equal(false);
    expect(this.application.keyManager.contentTypeUsesRootKeyEncryption('Note')).to.equal(false);
  });

  it('generating export params with no account or passcode should produce encrypted payload',
    async function () {
      /** Items key available by default */
      const payload = Factory.createNotePayload();
      const processedPayload = await this.application.protocolService
        .payloadByEncryptingPayload({
          payload: payload,
          intent: EncryptionIntents.LocalStoragePreferEncrypted
        });
      expect(processedPayload.getFormat()).to.equal(PayloadFormats.EncryptedString);
    });

  it('has root key and one items key after registering user', async function () {
    await Factory.registerUserToApplication({ application: this.application });
    expect(this.application.keyManager.getRootKey()).to.be.ok;
    expect(this.application.itemsKeyManager.allItemsKeys.length).to.equal(1);
  });

  it('should use root key for encryption of storage', async function () {
    const email = 'foo';
    const password = 'bar';
    const result = await this.application.protocolService.createRootKey({ identifier: email, password });
    this.application.keyManager.setNewRootKey({ key: result.key, keyParams: result.keyParams });

    const payload = CreateMaxPayloadFromAnyObject({
      object: {
        content: { foo: 'bar' },
        content_type: ContentTypes.EncryptedStorage
      }
    });
    const keyToUse = await this.application.keyManager.
      keyToUseForEncryptionOfPayload({
        payload: payload,
        intent: EncryptionIntents.LocalStoragePreferEncrypted
      });
    expect(keyToUse).to.equal(await this.application.keyManager.getRootKey());
  });

  it('items key should be encrypted with root key', async function () {
    await Factory.registerUserToApplication({ application: this.application });
    const itemsKey = this.application.itemsKeyManager.getDefaultItemsKey();
    /** Encrypt items key */
    const encryptedPayload = await this.application.protocolService.payloadByEncryptingPayload({
      payload: itemsKey.payloadRepresentation(),
      intent: EncryptionIntents.Sync
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

  it('should create random items key if no account and no passcode', async function () {
    const itemsKeys = this.application.itemsKeyManager.allItemsKeys;
    expect(itemsKeys.length).to.equal(1);
    const notePayload = Factory.createNotePayload();
    await this.application.savePayload({ payload: notePayload });

    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    const rawNotePayload = rawPayloads.find((r) => r.content_type === 'Note');
    expect(typeof rawNotePayload.content).to.equal('string');
  });

  it('should use items key for encryption of note', async function () {
    const note = Factory.createNotePayload();
    const keyToUse = await this.application.keyManager.
      keyToUseForEncryptionOfPayload({
        payload: note,
        intent: EncryptionIntents.Sync
      });
    expect(keyToUse.content_type).to.equal(ContentTypes.ItemsKey);
  });

  it('encrypting an item should associate an items key to it', async function () {
    const note = Factory.createNotePayload();
    const encryptedPayload = await this.application.protocolService
      .payloadByEncryptingPayload({
        payload: note,
        intent: EncryptionIntents.Sync
      });
    const itemsKey = this.application.itemsKeyManager.itemsKeyForPayload(encryptedPayload);
    expect(itemsKey).to.be.ok;
  });

  it('decrypt encrypted item with associated key', async function () {
    const note = Factory.createNotePayload();
    const title = note.content.title;
    const encryptedPayload = await this.application.protocolService
      .payloadByEncryptingPayload({
        payload: note,
        intent: EncryptionIntents.Sync
      });

    const itemsKey = this.application.itemsKeyManager.itemsKeyForPayload(encryptedPayload);
    expect(itemsKey).to.be.ok;

    const decryptedPayload = await this.application.protocolService
      .payloadByDecryptingPayload({
        payload: encryptedPayload
      });

    expect(decryptedPayload.content.title).to.equal(title);
  });

  it('decrypts items waiting for keys', async function () {
    const notePayload = Factory.createNotePayload();
    const title = notePayload.content.title;
    const encryptedPayload = await this.application.protocolService
      .payloadByEncryptingPayload({
        payload: notePayload,
        intent: EncryptionIntents.Sync
      });

    const itemsKey = this.application.itemsKeyManager.itemsKeyForPayload(encryptedPayload);
    await this.application.modelManager.removeItemLocally(itemsKey);

    const decryptedPayload = await this.application.protocolService
      .payloadByDecryptingPayload({
        payload: encryptedPayload
      });
    await this.application.modelManager.mapPayloadsToLocalItems({
      payloads: [decryptedPayload]
    });

    const note = this.application.modelManager.notes[0];
    expect(note.uuid).to.equal(notePayload.uuid);
    expect(note.errorDecrypting).to.equal(true);
    expect(note.waitingForKey).to.equal(true);

    const keyPayload = CreateMaxPayloadFromAnyObject({
      object: itemsKey
    });
    await this.application.modelManager.mapPayloadsToLocalItems({
      payloads: [keyPayload]
    });

    /**
     * Sleeping is required to trigger asyncronous protocolService.decryptItemsWaitingForKeys,
     * which occurs after keys are mapped above.
     */
    await Factory.sleep(0.2);

    expect(note.errorDecrypting).to.equal(false);
    expect(note.waitingForKey).to.equal(false);
    expect(note.content.title).to.equal(title);
  });

  it('generating export params with logged in account should produce encrypted payload', async function () {
    await Factory.registerUserToApplication({ application: this.application });
    const payload = Factory.createNotePayload();
    const encryptedPayload = await this.application.protocolService
      .payloadByEncryptingPayload({
        payload: payload,
        intent: EncryptionIntents.Sync
      });
    expect(typeof encryptedPayload.content).to.equal('string');
    expect(encryptedPayload.content.substring(0, 3)).to.equal(
      this.application.protocolService.getLatestVersion()
    );
  });

  it('When setting passcode, should encrypt items keys', async function () {
    await this.application.setPasscode('foo');
    const itemsKey = this.application.itemsKeyManager.allItemsKeys[0];
    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    const itemsKeyRawPayload = rawPayloads.find((p) => p.uuid === itemsKey.uuid);
    const itemsKeyPayload = CreateMaxPayloadFromAnyObject({
      object: itemsKeyRawPayload
    });
    expect(itemsKeyPayload.getFormat()).to.equal(PayloadFormats.EncryptedString);
  });

  it('signing into 003 account should delete latest offline items key and create 003 items key', 
  async function () {
    /** 
     * When starting the application it will create an items key with the latest protocol version (004).
     * Upon signing into an 003 account, the application should delete any neverSynced items keys,
     * and create a new default items key that is the default for a given protocol version.
     */
    const defaultItemsKey = this.application.itemsKeyManager.getDefaultItemsKey();
    const latestVersion = this.application.protocolService.getLatestVersion();
    expect(defaultItemsKey.version).to.equal(latestVersion);

    /** Register with 003 version */
    await Factory.registerOldUser({
      application: this.application,
      email: this.email,
      password: this.password,
      version: ProtocolVersions.V003
    });

    const itemsKeys = this.application.itemsKeyManager.allItemsKeys;
    expect(itemsKeys.length).to.equal(1);
    const newestItemsKey = itemsKeys[0];
    expect(newestItemsKey.version).to.equal(SNProtocolOperator003.versionString());
    const rootKey = await this.application.keyManager.getRootKey();
    expect(newestItemsKey.itemsKey).to.equal(rootKey.masterKey);
    expect(newestItemsKey.dataAuthenticationKey).to.equal(rootKey.dataAuthenticationKey);
  });

  it('When root key changes, all items keys must be re-encrypted', async function () {
    await this.application.setPasscode('foo');
    await Factory.createSyncedNote(this.application);
    const itemsKeys = this.application.itemsKeyManager.allItemsKeys;
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
      payload: itemsKeyPayload2,
      key: originalRootKey
    });
    expect(decrypted2.errorDecrypting).to.equal(true);

    /** Should be able to decrypt with new root key */
    const decrypted3 = await this.application.protocolService.payloadByDecryptingPayload({
      payload: itemsKeyPayload2,
      key: newRootKey
    });
    expect(decrypted3.errorDecrypting).to.not.be.ok;
  });

  it('changing account password with key rotation option should create new items key', async function () {
    await Factory.registerUserToApplication({
      application: this.application, email: this.email, password: this.password
    });
    const itemsKeys = this.application.itemsKeyManager.allItemsKeys;
    expect(itemsKeys.length).to.equal(1);
    const defaultItemsKey = this.application.itemsKeyManager.getDefaultItemsKey();

    await this.application.changePassword({
      email: this.email,
      currentPassword: this.password,
      newPassword: 'foobar',
      rotateItemsKey: true
    });

    expect(this.application.itemsKeyManager.allItemsKeys.length).to.equal(2);
    const newDefaultItemsKey = this.application.itemsKeyManager.getDefaultItemsKey();
    expect(newDefaultItemsKey.uuid).to.not.equal(defaultItemsKey.uuid);
  }).timeout(5000);

  it('protocol version should be upgraded on password change', async function () {
    /** Delete default items key that is created on launch */
    const itemsKey = this.application.itemsKeyManager.getDefaultItemsKey();
    await this.application.modelManager.setItemToBeDeleted(itemsKey);
    expect(this.application.itemsKeyManager.allItemsKeys.length).to.equal(0);
    
    /** Register with 003 version */
    await Factory.registerOldUser({
      application: this.application,
      email: this.email,
      password: this.password,
      version: ProtocolVersions.V003
    });

    expect(this.application.itemsKeyManager.allItemsKeys.length).to.equal(1);

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
      newPassword: 'foobar'
    });

    const latestVersion = this.application.protocolService.getLatestVersion();
    expect(
      (await this.application.keyManager.getRootKeyParams()).version
    ).to.equal(latestVersion);
    expect(
      (await this.application.keyManager.getRootKey()).version
    ).to.equal(latestVersion);

    const defaultItemsKey = this.application.itemsKeyManager.getDefaultItemsKey();
    expect(defaultItemsKey.version).to.equal(latestVersion);

    /** After change, note should now be encrypted with latest protocol version */

    const note = this.application.modelManager.notes[0];
    await this.application.saveItem({ item: note });

    const refreshedNotePayloads = await Factory.getStoragePayloadsOfType(
      this.application,
      'Note'
    );
    const refreshedNotePayload = refreshedNotePayloads[0];
    expect(refreshedNotePayload.version).to.equal(latestVersion);
  });
});
