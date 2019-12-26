import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('keys', () => {
  let _identifier = "hello@test.com";
  let _password = "password";
  let _key, _keyParams;

  const protocolManager = Factory.globalProtocolManager();
  const modelManager = Factory.globalModelManager();
  const keyManager = Factory.globalKeyManager();

  before(async () => {
    // Runs before all tests in this block
    const result = await protocolManager.createRootKey({
      identifier: _identifier,
      password: _password
    });
    _key = result.key;
    _keyParams = result.keyParams;
  });

  it('adding new items key saves it', async () => {
    await keyManager.createNewItemsKey();
    expect(modelManager.validItemsForContentType(SN_ITEMS_KEY_CONTENT_TYPE).length).to.equal(1);
  })

  it('saves and retrieves root keys', async () => {
    await keyManager.setRootKey({key: _key, keyParams: _keyParams});
    const rootKey = await keyManager.getRootKey();
    expect(rootKey).to.equal(_key);
    expect(rootKey.content_type).to.equal(SN_ROOT_KEY_CONTENT_TYPE);
  });

  it('key items should be encrypted with root keys', async () => {
    /** Keys should be encrypted with root keys, because if only 1 key object,
     * the items key would be contained within, and we couldn't access it.
     */
  });

  it('regular items should be encrypted with items keys', async () => {
    const itemsKeys = await keyManager.getAllItemsKeys();
  });

  it('rotating account keys should save new root keys and create new keys object for old keys', async () => {

  });

  it('encrypting an item with a key should add that key as a relationship', async () => {

  });

  it('setting keys as default should use that for item encryption', async () => {

  });

  it('migrating from 003 to 004 should create two new key objects and set new root keys', async () => {

  });
})
