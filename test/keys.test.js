/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('keys', function () {
  this.timeout(Factory.TestTimeout);

  beforeEach(async function () {
    localStorage.clear();
    this.application = await Factory.createInitAppWithRandNamespace();
    this.email = Uuid.GenerateUuidSynchronously();
    this.password = Uuid.GenerateUuidSynchronously();
  });

  afterEach(function () {
    this.application?.deinit();
    this.application = null;
    localStorage.clear();
  });

  it('validate isLocalStorageIntent', async function () {
    expect(isLocalStorageIntent(EncryptionIntent.Sync)).to.equal(false);
    expect(
      isLocalStorageIntent(EncryptionIntent.LocalStorageEncrypted)
    ).to.equal(true);
    expect(
      isLocalStorageIntent(EncryptionIntent.LocalStorageDecrypted)
    ).to.equal(true);
    expect(
      isLocalStorageIntent(EncryptionIntent.LocalStoragePreferEncrypted)
    ).to.equal(true);
    expect(isLocalStorageIntent(EncryptionIntent.FileEncrypted)).to.equal(
      false
    );
    expect(isLocalStorageIntent(EncryptionIntent.FileDecrypted)).to.equal(
      false
    );
  });

  it('validate isFileIntent', async function () {
    expect(isFileIntent(EncryptionIntent.Sync)).to.equal(false);
    expect(isFileIntent(EncryptionIntent.LocalStorageEncrypted)).to.equal(
      false
    );
    expect(isFileIntent(EncryptionIntent.LocalStorageDecrypted)).to.equal(
      false
    );
    expect(isFileIntent(EncryptionIntent.LocalStoragePreferEncrypted)).to.equal(
      false
    );
    expect(isFileIntent(EncryptionIntent.FileEncrypted)).to.equal(true);
    expect(isFileIntent(EncryptionIntent.FileDecrypted)).to.equal(true);
  });

  it('validate isDecryptedIntent', async function () {
    expect(isDecryptedIntent(EncryptionIntent.Sync)).to.equal(false);
    expect(isDecryptedIntent(EncryptionIntent.LocalStorageEncrypted)).to.equal(
      false
    );
    expect(isDecryptedIntent(EncryptionIntent.LocalStorageDecrypted)).to.equal(
      true
    );
    expect(
      isDecryptedIntent(EncryptionIntent.LocalStoragePreferEncrypted)
    ).to.equal(false);
    expect(isDecryptedIntent(EncryptionIntent.FileEncrypted)).to.equal(false);
    expect(isDecryptedIntent(EncryptionIntent.FileDecrypted)).to.equal(true);
  });

  it('validate intentRequiresEncryption', async function () {
    expect(intentRequiresEncryption(EncryptionIntent.Sync)).to.equal(true);
    expect(
      intentRequiresEncryption(EncryptionIntent.LocalStorageEncrypted)
    ).to.equal(true);
    expect(
      intentRequiresEncryption(EncryptionIntent.LocalStorageDecrypted)
    ).to.equal(false);
    expect(
      intentRequiresEncryption(EncryptionIntent.LocalStoragePreferEncrypted)
    ).to.equal(false);
    expect(intentRequiresEncryption(EncryptionIntent.FileEncrypted)).to.equal(
      true
    );
    expect(intentRequiresEncryption(EncryptionIntent.FileDecrypted)).to.equal(
      false
    );
  });

  it('should not have root key by default', async function () {
    expect(await this.application.protocolService.getRootKey()).to.not.be.ok;
  });

  it('validates content types requiring root encryption', async function () {
    expect(ContentTypeUsesRootKeyEncryption(ContentType.ItemsKey)).to.equal(
      true
    );
    expect(
      ContentTypeUsesRootKeyEncryption(ContentType.EncryptedStorage)
    ).to.equal(true);
    expect(ContentTypeUsesRootKeyEncryption(ContentType.Item)).to.equal(false);
    expect(ContentTypeUsesRootKeyEncryption(ContentType.Note)).to.equal(false);
  });

  it('generating export params with no account or passcode should produce encrypted payload', async function () {
    /** Items key available by default */
    const payload = Factory.createNotePayload();
    const processedPayload = await this.application.protocolService.payloadByEncryptingPayload(
      payload,
      EncryptionIntent.LocalStoragePreferEncrypted
    );
    expect(processedPayload.format).to.equal(PayloadFormat.EncryptedString);
  });

  it('has root key and one items key after registering user', async function () {
    await Factory.registerUserToApplication({ application: this.application });
    expect(this.application.protocolService.getRootKey()).to.be.ok;
    expect(this.application.itemManager.itemsKeys().length).to.equal(1);
  });

  it('should use root key for encryption of storage', async function () {
    const email = 'foo';
    const password = 'bar';
    const key = await this.application.protocolService.createRootKey(
      email,
      password,
      KeyParamsOrigination.Registration
    );
    this.application.protocolService.setRootKey(key);

    const payload = CreateMaxPayloadFromAnyObject({
      uuid: Factory.generateUuidish(),
      content: { foo: 'bar' },
      content_type: ContentType.EncryptedStorage,
    });
    const keyToUse = await this.application.protocolService.keyToUseForEncryptionOfPayload(
      payload,
      EncryptionIntent.LocalStoragePreferEncrypted
    );
    expect(keyToUse).to.equal(
      await this.application.protocolService.getRootKey()
    );
  });

  it('changing root key with passcode should re-wrap root key', async function () {
    const email = 'foo';
    const password = 'bar';
    const key = await this.application.protocolService.createRootKey(
      email,
      password,
      KeyParamsOrigination.Registration
    );
    await this.application.protocolService.setRootKey(key);
    await this.application.addPasscode(password);

    /** We should be able to decrypt wrapped root key with passcode */
    const wrappingKeyParams = await this.application.protocolService.getRootKeyWrapperKeyParams();
    const wrappingKey = await this.application.protocolService.computeRootKey(
      password,
      wrappingKeyParams
    );
    await this.application.protocolService
      .unwrapRootKey(wrappingKey)
      .catch((error) => {
        expect(error).to.not.be.ok;
      });

    const newPassword = 'bar';
    const newKey = await this.application.protocolService.createRootKey(
      email,
      newPassword,
      KeyParamsOrigination.Registration
    );
    await this.application.protocolService.setRootKey(newKey, wrappingKey);
    await this.application.protocolService
      .unwrapRootKey(wrappingKey)
      .catch((error) => {
        expect(error).to.not.be.ok;
      });
  });

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
    expect(decryptedPayload.content.itemsKey).to.equal(
      itemsKey.content.itemsKey
    );
  });

  it('should create random items key if no account and no passcode', async function () {
    const itemsKeys = this.application.itemManager.itemsKeys();
    expect(itemsKeys.length).to.equal(1);
    const notePayload = Factory.createNotePayload();
    await this.application.savePayload(notePayload);

    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    const rawNotePayload = rawPayloads.find(
      (r) => r.content_type === ContentType.Note
    );
    expect(typeof rawNotePayload.content).to.equal('string');
  });

  it('should create a new items key upon registration', async function () {
    expect(this.application.itemManager.itemsKeys().length).to.equal(1);
    const originalItemsKey = this.application.itemManager.itemsKeys()[0];
    await this.application.register(this.email, this.password);

    expect(this.application.itemManager.itemsKeys().length).to.equal(1);
    const newestItemsKey = this.application.itemManager.itemsKeys()[0];
    expect(newestItemsKey.uuid).to.not.equal(originalItemsKey.uuid);
  });

  it('should use items key for encryption of note', async function () {
    const note = Factory.createNotePayload();
    const keyToUse = await this.application.protocolService.keyToUseForEncryptionOfPayload(
      note,
      EncryptionIntent.Sync
    );
    expect(keyToUse.content_type).to.equal(ContentType.ItemsKey);
  });

  it('encrypting an item should associate an items key to it', async function () {
    const note = Factory.createNotePayload();
    const encryptedPayload = await this.application.protocolService.payloadByEncryptingPayload(
      note,
      EncryptionIntent.Sync
    );
    const itemsKey = this.application.protocolService.itemsKeyForPayload(
      encryptedPayload
    );
    expect(itemsKey).to.be.ok;
  });

  it('decrypt encrypted item with associated key', async function () {
    const note = Factory.createNotePayload();
    const title = note.content.title;
    const encryptedPayload = await this.application.protocolService.payloadByEncryptingPayload(
      note,
      EncryptionIntent.Sync
    );

    const itemsKey = this.application.protocolService.itemsKeyForPayload(
      encryptedPayload
    );
    expect(itemsKey).to.be.ok;

    const decryptedPayload = await this.application.protocolService.payloadByDecryptingPayload(
      encryptedPayload
    );

    expect(decryptedPayload.content.title).to.equal(title);
  });

  it('decrypts items waiting for keys', async function () {
    const notePayload = Factory.createNotePayload();
    const title = notePayload.content.title;
    const encryptedPayload = await this.application.protocolService.payloadByEncryptingPayload(
      notePayload,
      EncryptionIntent.Sync
    );

    const itemsKey = this.application.protocolService.itemsKeyForPayload(
      encryptedPayload
    );
    await this.application.itemManager.removeItemLocally(itemsKey);

    const decryptedPayload = await this.application.protocolService.payloadByDecryptingPayload(
      encryptedPayload
    );
    await this.application.itemManager.emitItemsFromPayloads(
      [decryptedPayload],
      PayloadSource.LocalChanged
    );

    const note = this.application.itemManager.notes[0];
    expect(note.uuid).to.equal(notePayload.uuid);
    expect(note.errorDecrypting).to.equal(true);
    expect(note.waitingForKey).to.equal(true);

    const keyPayload = CreateMaxPayloadFromAnyObject(itemsKey);
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

  it('attempting to emit errored items key for which there exists a non errored master copy should ignore it', async function () {
    await Factory.registerUserToApplication({ application: this.application });
    const itemsKey = await this.application.protocolService.getDefaultItemsKey();
    expect(itemsKey.errorDecrypting).to.not.be.ok;

    const errored = CopyPayload(itemsKey.payload, {
      content: {
        foo: 'bar',
      },
      errorDecrypting: true,
    });

    await this.application.payloadManager.emitPayload(
      errored,
      PayloadSource.Constructor
    );

    const refreshedKey = this.application.findItem(itemsKey.uuid);
    expect(refreshedKey.errorDecrypting).to.not.be.ok;
    expect(refreshedKey.content.foo).to.not.be.ok;
  });

  it('generating export params with logged in account should produce encrypted payload', async function () {
    await Factory.registerUserToApplication({ application: this.application });
    const payload = Factory.createNotePayload();
    const encryptedPayload = await this.application.protocolService.payloadByEncryptingPayload(
      payload,
      EncryptionIntent.Sync
    );
    expect(typeof encryptedPayload.content).to.equal('string');
    expect(encryptedPayload.content.substring(0, 3)).to.equal(
      this.application.protocolService.getLatestVersion()
    );
  });

  it('When setting passcode, should encrypt items keys', async function () {
    await this.application.addPasscode('foo');
    const itemsKey = this.application.itemManager.itemsKeys()[0];
    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    const itemsKeyRawPayload = rawPayloads.find(
      (p) => p.uuid === itemsKey.uuid
    );
    const itemsKeyPayload = CreateMaxPayloadFromAnyObject(itemsKeyRawPayload);
    expect(itemsKeyPayload.format).to.equal(PayloadFormat.EncryptedString);
  });

  it('items key encrypted payload should contain root key params', async function () {
    await this.application.addPasscode('foo');
    const itemsKey = this.application.itemManager.itemsKeys()[0];
    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    const itemsKeyRawPayload = rawPayloads.find(
      (p) => p.uuid === itemsKey.uuid
    );
    const itemsKeyPayload = CreateMaxPayloadFromAnyObject(itemsKeyRawPayload);
    const operator = this.application.protocolService.operatorForVersion(
      ProtocolVersion.V004
    );
    const comps = operator.deconstructEncryptedPayloadString(
      itemsKeyPayload.content
    );
    const rawAuthenticatedData = comps.rawAuthenticatedData;
    const authenticatedData = await operator.stringToAuthenticatedData(
      rawAuthenticatedData
    );
    const rootKeyParams = await this.application.protocolService.getRootKeyParams();

    expect(authenticatedData.kp).to.be.ok;
    expect(authenticatedData.kp).to.eql(rootKeyParams.getPortableValue());
    expect(authenticatedData.kp.origination).to.equal(
      KeyParamsOrigination.PasscodeCreate
    );
  });

  it('correctly validates local passcode', async function () {
    const passcode = 'foo';
    await this.application.addPasscode('foo');
    expect(
      (await this.application.protocolService.validatePasscode('wrong')).valid
    ).to.equal(false);
    expect(
      (await this.application.protocolService.validatePasscode(passcode)).valid
    ).to.equal(true);
  });

  it('signing into 003 account should delete latest offline items key and create 003 items key', async function () {
    /**
     * When starting the application it will create an items key with the latest protocol version (004).
     * Upon signing into an 003 account, the application should delete any neverSynced items keys,
     * and create a new default items key that is the default for a given protocol version.
     */
    const defaultItemsKey = await this.application.protocolService.getDefaultItemsKey();
    const latestVersion = this.application.protocolService.getLatestVersion();
    expect(defaultItemsKey.keyVersion).to.equal(latestVersion);

    /** Register with 003 version */
    await Factory.registerOldUser({
      application: this.application,
      email: this.email,
      password: this.password,
      version: ProtocolVersion.V003,
    });

    const itemsKeys = this.application.itemManager.itemsKeys();
    expect(itemsKeys.length).to.equal(1);
    const newestItemsKey = itemsKeys[0];
    expect(newestItemsKey.keyVersion).to.equal(ProtocolVersion.V003);
    const rootKey = await this.application.protocolService.getRootKey();
    expect(newestItemsKey.itemsKey).to.equal(rootKey.masterKey);
    expect(newestItemsKey.dataAuthenticationKey).to.equal(
      rootKey.dataAuthenticationKey
    );
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
      true
    );

    expect(this.application.itemManager.itemsKeys().length).to.equal(1);
    expect(this.application.itemManager.notes.length).to.equal(10);
    expect(this.application.itemManager.invalidItems.length).to.equal(0);
  });

  it('When root key changes, all items keys must be re-encrypted', async function () {
    const passcode = 'foo';

    this.application.setLaunchCallback({
      receiveChallenge: (challenge) => {
        this.application.submitValuesForChallenge(
          challenge,
          challenge.prompts.map(
            (prompt) => new ChallengeValue(prompt, passcode)
          )
        );
      },
    });

    await this.application.addPasscode(passcode);
    await Factory.createSyncedNote(this.application);
    const itemsKeys = this.application.itemManager.itemsKeys();
    expect(itemsKeys.length).to.equal(1);
    const originalItemsKey = itemsKeys[0];

    const originalRootKey = await this.application.protocolService.getRootKey();
    /** Expect that we can decrypt raw payload with current root key */
    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    const itemsKeyRawPayload = rawPayloads.find(
      (p) => p.uuid === originalItemsKey.uuid
    );
    const itemsKeyPayload = CreateMaxPayloadFromAnyObject(itemsKeyRawPayload);
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
    const itemsKeyRawPayload2 = rawPayloads2.find(
      (p) => p.uuid === originalItemsKey.uuid
    );
    expect(itemsKeyRawPayload2.content).to.not.equal(
      itemsKeyRawPayload.content
    );

    const itemsKeyPayload2 = CreateMaxPayloadFromAnyObject(itemsKeyRawPayload2);
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
  });

  it('changing account password should create new items key', async function () {
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
    });
    const itemsKeys = this.application.itemManager.itemsKeys();
    expect(itemsKeys.length).to.equal(1);
    const defaultItemsKey = await this.application.protocolService.getDefaultItemsKey();

    await this.application.changePassword(this.password, 'foobarfoo');

    expect(this.application.itemManager.itemsKeys().length).to.equal(2);
    const newDefaultItemsKey = await this.application.protocolService.getDefaultItemsKey();
    expect(newDefaultItemsKey.uuid).to.not.equal(defaultItemsKey.uuid);
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

    expect(a1.compare(a2)).to.equal(true);
    expect(a2.compare(a1)).to.equal(true);
    expect(a1.compare(b)).to.equal(false);
    expect(b.compare(a1)).to.equal(false);
  });

  it('loading the keychain root key should also load its key params', async function () {
    await Factory.registerUserToApplication({ application: this.application });
    const rootKey = await this.application.protocolService.getRootKeyFromKeychain();
    expect(rootKey.keyParams).to.be.ok;
  });

  it('key params should be persisted separately and not as part of root key', async function () {
    await Factory.registerUserToApplication({ application: this.application });
    const rawKey = await this.application.deviceInterface.getNamespacedKeychainValue(
      this.application.identifier
    );
    expect(rawKey.keyParams).to.not.be.ok;
    const rawKeyParams = await this.application.storageService.getValue(
      StorageKey.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(rawKeyParams).to.be.ok;
  });

  it('persisted key params should exactly equal in memory rootKey.keyParams', async function () {
    await Factory.registerUserToApplication({ application: this.application });
    const rootKey = await this.application.protocolService.getRootKey();
    const rawKeyParams = await this.application.storageService.getValue(
      StorageKey.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    expect(rootKey.keyParams.content).to.eql(rawKeyParams);
  });

  it('key params should have expected values', async function () {
    await Factory.registerUserToApplication({ application: this.application });
    const keyParamsObject = await this.application.protocolService.getRootKeyParams();
    const keyParams = keyParamsObject.content;
    expect(keyParams.identifier).to.be.ok;
    expect(keyParams.pw_nonce).to.be.ok;
    expect(keyParams.version).to.equal(ProtocolVersion.V004);
    expect(keyParams.created).to.be.ok;
    expect(keyParams.origination).to.equal(KeyParamsOrigination.Registration);
    expect(keyParams.email).to.not.be.ok;
    expect(keyParams.pw_cost).to.not.be.ok;
    expect(keyParams.pw_salt).to.not.be.ok;
  });

  it('key params obtained when signing in should have created and origination', async function () {
    const email = this.email;
    const password = this.password;
    await Factory.registerUserToApplication({
      application: this.application,
      email,
      password,
    });
    this.application = await Factory.signOutApplicationAndReturnNew(
      this.application
    );
    await Factory.loginToApplication({
      application: this.application,
      email,
      password,
    });
    const keyParamsObject = await this.application.protocolService.getRootKeyParams();
    const keyParams = keyParamsObject.content;

    expect(keyParams.created).to.be.ok;
    expect(keyParams.origination).to.equal(KeyParamsOrigination.Registration);
  });

  it('key params for 003 account should still have origination and created', async function () {
    /** origination and created are new properties since 004, but they can be added retroactively
     * to previous versions. They are not essential to <= 003, but are for >= 004 */

    /** Register with 003 version */
    await Factory.registerOldUser({
      application: this.application,
      email: this.email,
      password: this.password,
      version: ProtocolVersion.V003,
    });
    const keyParamsObject = await this.application.protocolService.getRootKeyParams();
    const keyParams = keyParamsObject.content;

    expect(keyParams.created).to.be.ok;
    expect(keyParams.origination).to.equal(KeyParamsOrigination.Registration);
  });

  it('encryption name should be dependant on key params version', async function () {
    /** Register with 003 account */
    await Factory.registerOldUser({
      application: this.application,
      email: this.email,
      password: this.password,
      version: ProtocolVersion.V003,
    });
    expect(
      await this.application.protocolService.getEncryptionDisplayName()
    ).to.equal('AES-256');

    this.application = await Factory.signOutApplicationAndReturnNew(
      this.application
    );
    /** Register with 004 account */
    await this.application.register(this.email + 'new', this.password);
    expect(
      await this.application.protocolService.getEncryptionDisplayName()
    ).to.equal('XChaCha20-Poly1305');
  });

  it('when launching app with no keychain but data, should present account recovery challenge', async function () {
    /**
     * On iOS (and perhaps other platforms where keychains are not included in device backups),
     * when setting up a new device from restore, the keychain is deleted, but the data persists.
     * We want to make sure we're prompting the user to re-authenticate their account.
     */
    const id = this.application.identifier;
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
    });
    /** Simulate empty keychain */
    await this.application.deviceInterface.clearRawKeychainValue();
    this.application.deinit();

    const recreatedApp = await Factory.createApplication(id);
    let totalChallenges = 0;
    const expectedChallenges = 1;
    const receiveChallenge = async (challenge) => {
      totalChallenges++;
      recreatedApp.submitValuesForChallenge(challenge, [
        new ChallengeValue(challenge.prompts[0], this.password),
      ]);
    };
    await recreatedApp.prepareForLaunch({ receiveChallenge });
    await recreatedApp.launch(true);

    expect(recreatedApp.protocolService.rootKey).to.be.ok;
    expect(totalChallenges).to.equal(expectedChallenges);
    recreatedApp.deinit();
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
      this.timeout(Factory.LongTestTimeout * 3);
      let oldClient = this.application;

      /** Register an 003 account */
      await Factory.registerOldUser({
        application: oldClient,
        email: this.email,
        password: this.password,
        version: ProtocolVersion.V003,
      });

      /** Sign into account from another app */
      const newClient = await Factory.createAppWithRandNamespace();
      await newClient.prepareForLaunch({
        receiveChallenge: (challenge) => {
          /** Reauth session challenge */
          newClient.submitValuesForChallenge(challenge, [
            new ChallengeValue(challenge.prompts[0], this.email),
            new ChallengeValue(challenge.prompts[1], this.password),
          ]);
        },
      });
      await newClient.launch();

      /** Change password through session manager directly instead of application,
       * as not to create any items key (to simulate 003 client behavior) */
      const currentRootKey = await oldClient.protocolService.computeRootKey(
        this.password,
        await oldClient.protocolService.getRootKeyParams()
      );
      const operator = oldClient.protocolService.operatorForVersion(
        ProtocolVersion.V003
      );
      const newRootKey = await operator.createRootKey(
        this.email,
        this.password
      );
      Object.defineProperty(oldClient.apiService, 'apiVersion', {
        get: function () {
          return '20190520';
        },
      });

      /**
       * Sign in as late as possible on new client to prevent session timeouts
       */
      await newClient.signIn(this.email, this.password);

      await oldClient.sessionManager.changePassword(
        currentRootKey.serverPassword,
        newRootKey
      );

      /** Re-authenticate on other app; allow challenge to complete */
      await newClient.sync();
      await Factory.sleep(1);

      /** Expect a new items key to be created based on the new root key */
      expect(newClient.itemManager.itemsKeys().length).to.equal(2);

      newClient.deinit();
      oldClient.deinit();
    });

    it('add new items key from migration if pw change already happened', async function () {
      /** Register an 003 account */
      await Factory.registerOldUser({
        application: this.application,
        email: this.email,
        password: this.password,
        version: ProtocolVersion.V003,
      });

      /** Change password through session manager directly instead of application,
       * as not to create any items key (to simulate 003 client behavior) */
      const currentRootKey = await this.application.protocolService.computeRootKey(
        this.password,
        await this.application.protocolService.getRootKeyParams()
      );
      const operator = this.application.protocolService.operatorForVersion(
        ProtocolVersion.V003
      );
      const newRootKey = await operator.createRootKey(
        this.email,
        this.password
      );
      Object.defineProperty(this.application.apiService, 'apiVersion', {
        get: function () {
          return '20190520';
        },
      });

      /** Renew session to prevent timeouts */
      this.application = await Factory.signOutAndBackIn(
        this.application,
        this.email,
        this.password
      );

      await this.application.sessionManager.changePassword(
        currentRootKey.serverPassword,
        newRootKey
      );
      await this.application.protocolService.reencryptItemsKeys();
      await this.application.sync({ awaitAll: true });

      /** Relaunch application and expect new items key to be created */
      const identifier = this.application.identifier;
      /** Set to pre 2.0.15 version so migration runs */
      await this.application.deviceInterface.setRawStorageValue(
        `${identifier}-snjs_version`,
        '2.0.14'
      );
      this.application.deinit();

      const refreshedApp = await Factory.createApplication(identifier);
      await Factory.initializeApplication(refreshedApp);

      /** Expect a new items key to be created based on the new root key */
      expect(refreshedApp.itemManager.itemsKeys().length).to.equal(2);
      refreshedApp.deinit();
    });
  });
});
