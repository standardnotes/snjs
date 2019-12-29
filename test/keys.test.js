import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe.only('keys', () => {
  let _identifier = "hello@test.com";
  let _password = "password";
  let _key, _keyParams;
  let sharedApplication;

  before(async () => {
    sharedApplication = await Factory.createInitAppWithRandNamespace();
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
    expect(sharedApplication.keyManager.hasRootKey()).to.equal(false);
  })

  it('validates content types requiring root encryption', async () => {
    expect(sharedApplication.keyManager.contentTypeUsesRootKeyEncryption(SN_ITEMS_KEY_CONTENT_TYPE)).to.equal(true);
    expect(sharedApplication.keyManager.contentTypeUsesRootKeyEncryption(ENCRYPTED_STORAGE_CONTENT_TYPE)).to.equal(true);
    expect(sharedApplication.keyManager.contentTypeUsesRootKeyEncryption('SF|Item')).to.equal(false);
    expect(sharedApplication.keyManager.contentTypeUsesRootKeyEncryption('Note')).to.equal(false);
  })

  it('generating export params with no key should produce decrypted payload', async () => {
    const payload = Factory.createStorageItemNotePayload();
    const title = payload.content.title;
    const encryptedPayload = await sharedApplication.protocolManager.payloadByEncryptingPayload({
      payload: payload,
      intent: ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED
    })
    expect(payload.content.title).to.equal(title);
  })

  it('has root key and one items key after registering user', async () => {
    const localApplication = await Factory.createInitAppWithRandNamespace();
    await Factory.registerUserToApplication({application: localApplication});
    expect(localApplication.keyManager.hasRootKey()).to.equal(true);
    expect(localApplication.keyManager.allItemsKeys.length).to.equal(1);
  })

  it('should use root key for encryption of storage', async () => {
    const localApplication = await Factory.createInitAppWithRandNamespace();

    const email = 'foo', password = 'bar';
    const result = await localApplication.protocolManager.createRootKey({identifier: email, password});
    localApplication.keyManager.setRootKey({key: result.key, keyParams: result.keyParams});

    const storage = new SFItem({content: {foo: 'bar'}, content_type: ENCRYPTED_STORAGE_CONTENT_TYPE});
    const keyToUse = await localApplication.keyManager.keyToUseForEncryptionOfPayload({
      payload: storage,
      intent: ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED
    })
    expect(keyToUse).to.equal(await localApplication.keyManager.getRootKey());
  })

  it('should use items key for encryption of note', async function() {
    const note = Factory.createStorageItemNotePayload();
    const keyToUse = await this.application.keyManager.keyToUseForEncryptionOfPayload({
      payload: note,
      intent: ENCRYPTION_INTENT_SYNC
    })
    expect(keyToUse.content_type).to.equal(SN_ITEMS_KEY_CONTENT_TYPE);
  })

  it.only('encrypting an item should associate an items key to it', async function() {
    const note = Factory.createStorageItemNotePayload();
    const encryptedPayload = await this.application.protocolManager.payloadByEncryptingPayload({
      payload: note,
      intent: ENCRYPTION_INTENT_SYNC
    });
    // expect(note.encryptingKey).to.be.ok;
  })

  it.only('decrypt encrypted item with associated key', async function() {
    const note = Factory.createStorageItemNotePayload();
    const encryptedPayload = await this.application.protocolManager.payloadByEncryptingPayload({
      payload: note,
      intent: ENCRYPTION_INTENT_SYNC
    });


    // expect(note.encryptingKey).to.be.ok;
  })

  it('generating export params with logged in account should produce encrypted payload', async () => {
    const localApplication = await Factory.createInitAppWithRandNamespace();
    await Factory.registerUserToApplication({application: localApplication});
    const payload = Factory.createStorageItemNotePayload();
    const encryptedPayload = await localApplication.protocolManager.payloadByEncryptingPayload({
      payload: payload,
      intent: ENCRYPTION_INTENT_SYNC
    })
    expect(typeof encryptedPayload.content).to.equal('string');
    expect(encryptedPayload.content.substring(0, 3)).to.equal(localApplication.protocolManager.latestVersion());
  })

  // const protocolManager = Factory.globalProtocolManager();
  // const modelManager = Factory.globalModelManager();
  // const keyManager = Factory.globalKeyManager();
  //
  // before(async () => {
  //   // Runs before all tests in this block
  //   const result = await protocolManager.createRootKey({
  //     identifier: _identifier,
  //     password: _password
  //   });
  //   _key = result.key;
  //   _keyParams = result.keyParams;
  // });
  //
  // it('adding new items key saves it', async () => {
  //   await keyManager.createNewItemsKey();
  //   expect(modelManager.validItemsForContentType(SN_ITEMS_KEY_CONTENT_TYPE).length).to.equal(1);
  // })
  //
  // it('saves and retrieves root keys', async () => {
  //   await keyManager.setRootKey({key: _key, keyParams: _keyParams});
  //   const rootKey = await keyManager.getRootKey();
  //   expect(rootKey).to.equal(_key);
  //   expect(rootKey.content_type).to.equal(SN_ROOT_KEY_CONTENT_TYPE);
  // });
  //
  // it('key items should be encrypted with root keys', async () => {
  //   /** Keys should be encrypted with root keys, because if only 1 key object,
  //    * the items key would be contained within, and we couldn't access it.
  //    */
  // });
  //
  // it('regular items should be encrypted with items keys', async () => {
  //   const itemsKeys = await keyManager.getAllItemsKeys();
  // });
  //
  // it('rotating account keys should save new root keys and create new keys object for old keys', async () => {
  //
  // });
  //
  // it('encrypting an item with a key should add that key as a relationship', async () => {
  //
  // });
  //
  // it('setting keys as default should use that for item encryption', async () => {
  //
  // });
  //
  // it('migrating from 003 to 004 should create two new key objects and set new root keys', async () => {
  //
  // });
})
