/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
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

  afterEach(function () {
    this.application.deinit();
    this.application = null;
  });

  it('validate isLocalStorageIntent', async function () {
    expect(isLocalStorageIntent(EncryptionIntent.Sync)).to.equal(false);
    expect(isLocalStorageIntent(EncryptionIntent.LocalStorageEncrypted)).to.equal(true);
    expect(isLocalStorageIntent(EncryptionIntent.LocalStorageDecrypted)).to.equal(true);
    expect(isLocalStorageIntent(EncryptionIntent.LocalStoragePreferEncrypted)).to.equal(true);
    expect(isLocalStorageIntent(EncryptionIntent.FileEncrypted)).to.equal(false);
    expect(isLocalStorageIntent(EncryptionIntent.FileDecrypted)).to.equal(false);
  });

  it('validate isFileIntent', async function () {
    expect(isFileIntent(EncryptionIntent.Sync)).to.equal(false);
    expect(isFileIntent(EncryptionIntent.LocalStorageEncrypted)).to.equal(false);
    expect(isFileIntent(EncryptionIntent.LocalStorageDecrypted)).to.equal(false);
    expect(isFileIntent(EncryptionIntent.LocalStoragePreferEncrypted)).to.equal(false);
    expect(isFileIntent(EncryptionIntent.FileEncrypted)).to.equal(true);
    expect(isFileIntent(EncryptionIntent.FileDecrypted)).to.equal(true);
  });

  it('validate isDecryptedIntent', async function () {
    expect(isDecryptedIntent(EncryptionIntent.Sync)).to.equal(false);
    expect(isDecryptedIntent(EncryptionIntent.LocalStorageEncrypted)).to.equal(false);
    expect(isDecryptedIntent(EncryptionIntent.LocalStorageDecrypted)).to.equal(true);
    expect(isDecryptedIntent(EncryptionIntent.LocalStoragePreferEncrypted)).to.equal(false);
    expect(isDecryptedIntent(EncryptionIntent.FileEncrypted)).to.equal(false);
    expect(isDecryptedIntent(EncryptionIntent.FileDecrypted)).to.equal(true);
  });

  it('validate intentRequiresEncryption', async function () {
    expect(intentRequiresEncryption(EncryptionIntent.Sync)).to.equal(true);
    expect(intentRequiresEncryption(EncryptionIntent.LocalStorageEncrypted)).to.equal(true);
    expect(intentRequiresEncryption(EncryptionIntent.LocalStorageDecrypted)).to.equal(false);
    expect(intentRequiresEncryption(EncryptionIntent.LocalStoragePreferEncrypted)).to.equal(false);
    expect(intentRequiresEncryption(EncryptionIntent.FileEncrypted)).to.equal(true);
    expect(intentRequiresEncryption(EncryptionIntent.FileDecrypted)).to.equal(false);
  });

  it('should not have root key by default', async function () {
    expect(await this.application.protocolService.getRootKey()).to.not.be.ok;
  });

  it('validates content types requiring root encryption', async function () {
    expect(this.application.protocolService.contentTypeUsesRootKeyEncryption(ContentType.ItemsKey)).to.equal(true);
    expect(this.application.protocolService.contentTypeUsesRootKeyEncryption(ContentType.EncryptedStorage)).to.equal(true);
    expect(this.application.protocolService.contentTypeUsesRootKeyEncryption(ContentType.Item)).to.equal(false);
    expect(this.application.protocolService.contentTypeUsesRootKeyEncryption(ContentType.Note)).to.equal(false);
  });

  it('generating export params with no account or passcode should produce encrypted payload',
    async function () {
      /** Items key available by default */
      const payload = Factory.createNotePayload();
      const processedPayload = await this.application.protocolService
        .payloadByEncryptingPayload(
          payload,
          EncryptionIntent.LocalStoragePreferEncrypted
        );
      expect(processedPayload.format).to.equal(PayloadFormat.EncryptedString);
    });

  it('has root key and one items key after registering user', async function () {
    await Factory.registerUserToApplication({ application: this.application });
    expect(this.application.protocolService.getRootKey()).to.be.ok;
    expect(this.application.itemManager.itemsKeys().length).to.equal(1);
  }).timeout(5000);

  it('should use root key for encryption of storage', async function () {
    const email = 'foo';
    const password = 'bar';
    const result = await this.application.protocolService.createRootKey(email, password);
    this.application.protocolService.setNewRootKey(result.key, result.keyParams);

    const payload = CreateMaxPayloadFromAnyObject(
      {
        uuid: Factory.generateUuidish(),
        content: { foo: 'bar' },
        content_type: ContentType.EncryptedStorage
      }
    );
    const keyToUse = await this.application.protocolService.
      keyToUseForEncryptionOfPayload(
        payload,
        EncryptionIntent.LocalStoragePreferEncrypted
      );
    expect(keyToUse).to.equal(await this.application.protocolService.getRootKey());
  });

  it('changing root key should with passcode should re-wrap root key', async function () {
    const email = 'foo';
    const password = 'bar';
    const result = await this.application.protocolService.createRootKey(email, password);
    await this.application.protocolService.setNewRootKey(result.key, result.keyParams);
    await this.application.setPasscode(password);

    /** We should be able to decrypt wrapped root key with passcode */
    const wrappingKeyParams = await this.application.protocolService.getRootKeyWrapperKeyParams();
    const wrappingKey = await this.application.protocolService.computeRootKey(
      password,
      wrappingKeyParams
    );
    await this.application.protocolService.unwrapRootKey(wrappingKey).catch((error) => {
      expect(error).to.not.be.ok;
    });

    const newPassword = 'bar';
    const newResult = await this.application.protocolService.createRootKey(
      email,
      newPassword
    );
    await this.application.protocolService.setNewRootKey(
      newResult.key,
      newResult.keyParams,
      wrappingKey
    );
    await this.application.protocolService.unwrapRootKey(wrappingKey).catch((error) => {
      expect(error).to.not.be.ok;
    });
  }).timeout(5000);

  it('items key should be encrypted with root key', async function () {
    await Factory.registerUserToApplication({ application: this.application });
    const itemsKey = await this.application.protocolService.getDefaultItemsKey();
    /** Encrypt items key */
    const encryptedPayload = await this.application.protocolService.payloadByEncryptingPayload(
      itemsKey.payloadRepresentation(),
      EncryptionIntent.Sync
    );
    /** Should not have an items_key_id */
    expect(encryptedPayload.items_key_id).to.not.be.ok;

    /** Attempt to decrypt with root key. Should succeed. */
    const rootKey = await this.application.protocolService.getRootKey();
    const decryptedPayload = await this.application.protocolService.payloadByDecryptingPayload(
      encryptedPayload,
      rootKey
    );

    expect(decryptedPayload.errorDecrypting).to.equal(false);
    expect(decryptedPayload.content.itemsKey).to.equal(itemsKey.content.itemsKey);
  });

  it('should create random items key if no account and no passcode', async function () {
    const itemsKeys = this.application.itemManager.itemsKeys();
    expect(itemsKeys.length).to.equal(1);
    const notePayload = Factory.createNotePayload();
    await this.application.savePayload(notePayload);

    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    const rawNotePayload = rawPayloads.find((r) => r.content_type === ContentType.Note);
    expect(typeof rawNotePayload.content).to.equal('string');
  });

  it('should create a new items key upon registration', async function () {
    expect(this.application.itemManager.itemsKeys().length).to.equal(1);
    const originalItemsKey = this.application.itemManager.itemsKeys()[0];
    await this.application.register(this.email, this.password);

    expect(this.application.itemManager.itemsKeys().length).to.equal(1);
    const newestItemsKey = this.application.itemManager.itemsKeys()[0];
    expect(newestItemsKey.uuid).to.not.equal(originalItemsKey.uuid);
  }).timeout(5000);

  it('should use items key for encryption of note', async function () {
    const note = Factory.createNotePayload();
    const keyToUse = await this.application.protocolService.
      keyToUseForEncryptionOfPayload(
        note,
        EncryptionIntent.Sync
      );
    expect(keyToUse.content_type).to.equal(ContentType.ItemsKey);
  });

  it('encrypting an item should associate an items key to it', async function () {
    const note = Factory.createNotePayload();
    const encryptedPayload = await this.application.protocolService
      .payloadByEncryptingPayload(
        note,
        EncryptionIntent.Sync
      );
    const itemsKey = this.application.protocolService.itemsKeyForPayload(encryptedPayload);
    expect(itemsKey).to.be.ok;
  });

  it('decrypt encrypted item with associated key', async function () {
    const note = Factory.createNotePayload();
    const title = note.content.title;
    const encryptedPayload = await this.application.protocolService
      .payloadByEncryptingPayload(
        note,
        EncryptionIntent.Sync
      );

    const itemsKey = this.application.protocolService.itemsKeyForPayload(encryptedPayload);
    expect(itemsKey).to.be.ok;

    const decryptedPayload = await this.application.protocolService
      .payloadByDecryptingPayload(
        encryptedPayload
      );

    expect(decryptedPayload.content.title).to.equal(title);
  });

  it('decrypts items waiting for keys', async function () {
    const notePayload = Factory.createNotePayload();
    const title = notePayload.content.title;
    const encryptedPayload = await this.application.protocolService
      .payloadByEncryptingPayload(
        notePayload,
        EncryptionIntent.Sync
      );

    const itemsKey = this.application.protocolService.itemsKeyForPayload(encryptedPayload);
    await this.application.itemManager.removeItemLocally(itemsKey);

    const decryptedPayload = await this.application.protocolService
      .payloadByDecryptingPayload(encryptedPayload);
    await this.application.itemManager.emitItemsFromPayloads(
      [decryptedPayload],
      PayloadSource.LocalChanged
    );

    const note = this.application.itemManager.notes[0];
    expect(note.uuid).to.equal(notePayload.uuid);
    expect(note.errorDecrypting).to.equal(true);
    expect(note.waitingForKey).to.equal(true);

    const keyPayload = CreateMaxPayloadFromAnyObject(
      itemsKey
    );
    await this.application.itemManager.emitItemsFromPayloads(
      [keyPayload],
      PayloadSource.LocalChanged
    );

    /**
     * Sleeping is required to trigger asyncronous protocolService.decryptItemsWaitingForKeys,
     * which occurs after keys are mapped above.
     */
    await Factory.sleep(0.2);

    const updatedNote = this.application.itemManager.findItem(note.uuid);

    expect(updatedNote.errorDecrypting).to.equal(false);
    expect(updatedNote.waitingForKey).to.equal(false);
    expect(updatedNote.content.title).to.equal(title);
  });

  it('generating export params with logged in account should produce encrypted payload', async function () {
    await Factory.registerUserToApplication({ application: this.application });
    const payload = Factory.createNotePayload();
    const encryptedPayload = await this.application.protocolService
      .payloadByEncryptingPayload(
        payload,
        EncryptionIntent.Sync
      );
    expect(typeof encryptedPayload.content).to.equal('string');
    expect(encryptedPayload.content.substring(0, 3)).to.equal(
      this.application.protocolService.getLatestVersion()
    );
  });

  it('When setting passcode, should encrypt items keys', async function () {
    await this.application.setPasscode('foo');
    const itemsKey = this.application.itemManager.itemsKeys()[0];
    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    const itemsKeyRawPayload = rawPayloads.find((p) => p.uuid === itemsKey.uuid);
    const itemsKeyPayload = CreateMaxPayloadFromAnyObject(
      itemsKeyRawPayload
    );
    expect(itemsKeyPayload.format).to.equal(PayloadFormat.EncryptedString);
  });

  it('correctly validates local passcode', async function () {
    const passcode = 'foo';
    await this.application.setPasscode('foo');
    expect((await this.application.protocolService.validatePasscode('wrong')).valid).to.equal(false);
    expect((await this.application.protocolService.validatePasscode(passcode)).valid).to.equal(true);
  }).timeout(5000);

  it('signing into 003 account should delete latest offline items key and create 003 items key',
    async function () {
      /**
       * When starting the application it will create an items key with the latest protocol version (004).
       * Upon signing into an 003 account, the application should delete any neverSynced items keys,
       * and create a new default items key that is the default for a given protocol version.
       */
      const defaultItemsKey = await this.application.protocolService.getDefaultItemsKey();
      const latestVersion = this.application.protocolService.getLatestVersion();
      expect(defaultItemsKey.version).to.equal(latestVersion);

      /** Register with 003 version */
      await Factory.registerOldUser({
        application: this.application,
        email: this.email,
        password: this.password,
        version: ProtocolVersion.V003
      });

      const itemsKeys = this.application.itemManager.itemsKeys();
      expect(itemsKeys.length).to.equal(1);
      const newestItemsKey = itemsKeys[0];
      expect(newestItemsKey.version).to.equal(ProtocolVersion.V003);
      const rootKey = await this.application.protocolService.getRootKey();
      expect(newestItemsKey.itemsKey).to.equal(rootKey.masterKey);
      expect(newestItemsKey.dataAuthenticationKey).to.equal(rootKey.dataAuthenticationKey);
    });

  it('reencrypts existing notes when logging into an 003 account', async function () {
    await Factory.createManyMappedNotes(this.application, 10);
    await Factory.registerOldUser({
      application: this.application,
      email: this.email,
      password: this.password,
      version: ProtocolVersion.V003,
    });

    expect(this.application.itemManager.invalidItems.length).to.equal(0);
    expect(this.application.itemManager.itemsKeys().length).to.equal(1);
    expect(this.application.itemManager.itemsKeys()[0].dirty).to.equal(false);

    /** Sign out and back in */
    this.application = await Factory.signOutApplicationAndReturnNew(
      this.application
    );
    await this.application.signIn(
      this.email,
      this.password,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      true
    );

    expect(this.application.itemManager.itemsKeys().length).to.equal(1);
    expect(this.application.itemManager.notes.length).to.equal(10);
    expect(this.application.itemManager.invalidItems.length).to.equal(0);
  });

  it('When root key changes, all items keys must be re-encrypted', async function () {
    await this.application.setPasscode('foo');
    await Factory.createSyncedNote(this.application);
    const itemsKeys = this.application.itemManager.itemsKeys();
    expect(itemsKeys.length).to.equal(1);
    const originalItemsKey = itemsKeys[0];

    const originalRootKey = await this.application.protocolService.getRootKey();
    /** Expect that we can decrypt raw payload with current root key */
    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    const itemsKeyRawPayload = rawPayloads.find((p) => p.uuid === originalItemsKey.uuid);
    const itemsKeyPayload = CreateMaxPayloadFromAnyObject(
      itemsKeyRawPayload
    );
    const decrypted = await this.application.protocolService.payloadByDecryptingPayload(
      itemsKeyPayload,
      originalRootKey
    );

    expect(decrypted.errorDecrypting).to.equal(false);
    expect(decrypted.content).to.eql(originalItemsKey.content);

    /** Change passcode */
    await this.application.changePasscode('bar');

    const newRootKey = await this.application.protocolService.getRootKey();
    expect(newRootKey).to.not.equal(originalRootKey);
    expect(newRootKey.masterKey).to.not.equal(originalRootKey.masterKey);

    /**
     * Expect that originalRootKey can no longer decrypt originalItemsKey
     * as items key has been re-encrypted with new root key
     */
    const rawPayloads2 = await this.application.storageService.getAllRawPayloads();
    const itemsKeyRawPayload2 = rawPayloads2.find((p) => p.uuid === originalItemsKey.uuid);
    expect(itemsKeyRawPayload2.content).to.not.equal(itemsKeyRawPayload.content);

    const itemsKeyPayload2 = CreateMaxPayloadFromAnyObject(
      itemsKeyRawPayload2
    );
    const decrypted2 = await this.application.protocolService.payloadByDecryptingPayload(
      itemsKeyPayload2,
      originalRootKey
    );
    expect(decrypted2.errorDecrypting).to.equal(true);

    /** Should be able to decrypt with new root key */
    const decrypted3 = await this.application.protocolService.payloadByDecryptingPayload(
      itemsKeyPayload2,
      newRootKey
    );
    expect(decrypted3.errorDecrypting).to.not.be.ok;
  }).timeout(5000);

  it('changing account password should create new items key', async function () {
    await Factory.registerUserToApplication({
      application: this.application, email: this.email, password: this.password
    });
    const itemsKeys = this.application.itemManager.itemsKeys();
    expect(itemsKeys.length).to.equal(1);
    const defaultItemsKey = await this.application.protocolService.getDefaultItemsKey();

    await this.application.changePassword(
      this.password,
      'foobarfoo'
    );

    expect(this.application.itemManager.itemsKeys().length).to.equal(2);
    const newDefaultItemsKey = await this.application.protocolService.getDefaultItemsKey();
    expect(newDefaultItemsKey.uuid).to.not.equal(defaultItemsKey.uuid);
  }).timeout(5000);
});
