import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('keys', () => {
  let sharedApplication;

  before(async () => {
    localStorage.clear();
    sharedApplication = await Factory.createInitAppWithRandNamespace();
  })

  after(async () => {
    localStorage.clear();
  })

  beforeEach(async function() {
    this.application = await Factory.createInitAppWithRandNamespace();
    const email = SFItem.GenerateUuidSynchronously();
    const password = SFItem.GenerateUuidSynchronously();
    await Factory.registerUserToApplication({application: this.application, email, password});
  })

  it('validate isLocalStorageIntent', async () => {
    expect(isLocalStorageIntent(ENCRYPTION_INTENT_SYNC)).to.equal(false);
    expect(isLocalStorageIntent(ENCRYPTION_INTENT_LOCAL_STORAGE_ENCRYPTED)).to.equal(true);
    expect(isLocalStorageIntent(ENCRYPTION_INTENT_LOCAL_STORAGE_DECRYPTED)).to.equal(true);
    expect(isLocalStorageIntent(ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED)).to.equal(true);
    expect(isLocalStorageIntent(ENCRYPTION_INTENT_FILE_ENCRYPTED)).to.equal(false);
    expect(isLocalStorageIntent(ENCRYPTION_INTENT_FILE_DECRYPTED)).to.equal(false);
  })

  it('validate isFileIntent', async () => {
    expect(isFileIntent(ENCRYPTION_INTENT_SYNC)).to.equal(false);
    expect(isFileIntent(ENCRYPTION_INTENT_LOCAL_STORAGE_ENCRYPTED)).to.equal(false);
    expect(isFileIntent(ENCRYPTION_INTENT_LOCAL_STORAGE_DECRYPTED)).to.equal(false);
    expect(isFileIntent(ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED)).to.equal(false);
    expect(isFileIntent(ENCRYPTION_INTENT_FILE_ENCRYPTED)).to.equal(true);
    expect(isFileIntent(ENCRYPTION_INTENT_FILE_DECRYPTED)).to.equal(true);
  })

  it('validate isDecryptedIntent', async () => {
    expect(isDecryptedIntent(ENCRYPTION_INTENT_SYNC)).to.equal(false);
    expect(isDecryptedIntent(ENCRYPTION_INTENT_LOCAL_STORAGE_ENCRYPTED)).to.equal(false);
    expect(isDecryptedIntent(ENCRYPTION_INTENT_LOCAL_STORAGE_DECRYPTED)).to.equal(true);
    expect(isDecryptedIntent(ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED)).to.equal(false);
    expect(isDecryptedIntent(ENCRYPTION_INTENT_FILE_ENCRYPTED)).to.equal(false);
    expect(isDecryptedIntent(ENCRYPTION_INTENT_FILE_DECRYPTED)).to.equal(true);
  })

  it('validate intentRequiresEncryption', async () => {
    expect(intentRequiresEncryption(ENCRYPTION_INTENT_SYNC)).to.equal(true);
    expect(intentRequiresEncryption(ENCRYPTION_INTENT_LOCAL_STORAGE_ENCRYPTED)).to.equal(true);
    expect(intentRequiresEncryption(ENCRYPTION_INTENT_LOCAL_STORAGE_DECRYPTED)).to.equal(false);
    expect(intentRequiresEncryption(ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED)).to.equal(false);
    expect(intentRequiresEncryption(ENCRYPTION_INTENT_FILE_ENCRYPTED)).to.equal(true);
    expect(intentRequiresEncryption(ENCRYPTION_INTENT_FILE_DECRYPTED)).to.equal(false);
  })

  it('should not have root key by default', async () => {
    expect(sharedApplication.keyManager.getRootKey()).to.not.be.ok;
  })

  it('validates content types requiring root encryption', async () => {
    expect(sharedApplication.keyManager.contentTypeUsesRootKeyEncryption(CONTENT_TYPE_ITEMS_KEY)).to.equal(true);
    expect(sharedApplication.keyManager.contentTypeUsesRootKeyEncryption(CONTENT_TYPE_ENCRYPTED_STORAGE)).to.equal(true);
    expect(sharedApplication.keyManager.contentTypeUsesRootKeyEncryption('SF|Item')).to.equal(false);
    expect(sharedApplication.keyManager.contentTypeUsesRootKeyEncryption('Note')).to.equal(false);
  })

  it('generating export params with no key should produce decrypted payload', async () => {
    const payload = Factory.createStorageItemNotePayload();
    const title = payload.content.title;
    const encryptedPayload = await sharedApplication.protocolManager
    .payloadByEncryptingPayload({
      payload: payload,
      intent: ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED
    })
    expect(payload.content.title).to.equal(title);
  })

  it('has root key and one items key after registering user', async () => {
    const localApplication = await Factory.createInitAppWithRandNamespace();
    await Factory.registerUserToApplication({application: localApplication});
    expect(localApplication.keyManager.getRootKey()).to.be.ok;
    expect(localApplication.keyManager.allItemsKeys.length).to.equal(1);
  })

  it('should use root key for encryption of storage', async () => {
    const localApplication = await Factory.createInitAppWithRandNamespace();

    const email = 'foo', password = 'bar';
    const result = await localApplication.protocolManager.createRootKey({identifier: email, password});
    localApplication.keyManager.setRootKey({key: result.key, keyParams: result.keyParams});

    const payload = CreateMaxPayloadFromAnyObject({
      object: {
        content: {foo: 'bar'},
        content_type: CONTENT_TYPE_ENCRYPTED_STORAGE
      }
    });
    const keyToUse = await localApplication.keyManager.
    keyToUseForEncryptionOfPayload({
      payload: payload,
      intent: ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED
    })
    expect(keyToUse).to.equal(await localApplication.keyManager.getRootKey());
  })

  it('@todo items key should be encrypted with root key', async function() {
    expect(true).to.equal(false);
    expect(itemsKey.items_key_id).to.not.be.ok;
  })

  it('should use items key for encryption of note', async function() {
    const note = Factory.createStorageItemNotePayload();
    const keyToUse = await this.application.keyManager.
    keyToUseForEncryptionOfPayload({
      payload: note,
      intent: ENCRYPTION_INTENT_SYNC
    })
    expect(keyToUse.content_type).to.equal(CONTENT_TYPE_ITEMS_KEY);
  })

  it('encrypting an item should associate an items key to it', async function() {
    const note = Factory.createStorageItemNotePayload();
    const encryptedPayload = await this.application.protocolManager
    .payloadByEncryptingPayload({
      payload: note,
      intent: ENCRYPTION_INTENT_SYNC
    });
    const itemsKey = this.application.keyManager.itemsKeyForPayload(encryptedPayload);
    expect(itemsKey).to.be.ok;
  })

  it('decrypt encrypted item with associated key', async function() {
    const note = Factory.createStorageItemNotePayload();
    const title = note.content.title;
    const encryptedPayload = await this.application.protocolManager
    .payloadByEncryptingPayload({
      payload: note,
      intent: ENCRYPTION_INTENT_SYNC
    });

    const itemsKey = this.application.keyManager.itemsKeyForPayload(encryptedPayload);
    expect(itemsKey).to.be.ok;

    const decryptedPayload = await this.application.protocolManager
    .payloadByDecryptingPayload({
      payload: encryptedPayload
    });

    expect(decryptedPayload.content.title).to.equal(title);
  })

  it('decrypts items waiting for keys', async function() {
    const notePayload = Factory.createStorageItemNotePayload();
    const title = notePayload.content.title;
    const encryptedPayload = await this.application.protocolManager
    .payloadByEncryptingPayload({
      payload: notePayload,
      intent: ENCRYPTION_INTENT_SYNC
    });

    const itemsKey = this.application.keyManager.itemsKeyForPayload(encryptedPayload);
    await this.application.modelManager.removeItemLocally(itemsKey);

    const decryptedPayload = await this.application.protocolManager
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
     * Sleeping is required to trigger asyncronous protocolManager.decryptItemsWaitingForKeys,
     * which occurs after keys are mapped above.
     */
    await Factory.sleep(0.2);

    expect(note.errorDecrypting).to.equal(false);
    expect(note.waitingForKey).to.equal(false);
    expect(note.content.title).to.equal(title);
  })

  it('generating export params with logged in account should produce encrypted payload', async () => {
    const localApplication = await Factory.createInitAppWithRandNamespace();
    await Factory.registerUserToApplication({application: localApplication});
    const payload = Factory.createStorageItemNotePayload();
    const encryptedPayload = await localApplication.protocolManager
    .payloadByEncryptingPayload({
      payload: payload,
      intent: ENCRYPTION_INTENT_SYNC
    })
    expect(typeof encryptedPayload.content).to.equal('string');
    expect(encryptedPayload.content.substring(0, 3)).to.equal(
      localApplication.protocolManager.latestVersion()
    );
  })

  //
  // it('rotating account keys should save new root keys and create new keys object for old keys', async () => {
  //
  // });
  //
  //
  // it('setting keys as default should use that for item encryption', async () => {
  //
  // });
  //
  // it('migrating from any version to 004 should create new items key objects and set new root keys', async () => {
  //
  // });
})
