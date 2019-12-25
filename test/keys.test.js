import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe.only('keys', () => {
  let _identifier = "hello@test.com";
  let _password = "password";
  let _keys;

  const protocolManager = new SNProtocolManager(new SNWebCrypto());
  const modelManager = Factory.createModelManager();
  const keysManager = new SNKeysManager(modelManager);

  before(async (done) => {
    // Runs before all tests in this block
    const result = await protocolManager.createKeysAndAuthParams({identifier: _identifier, password: _password});
    _keys = result.keys;
    done();
  });

  it('saves and retrieves root keys', async () => {
    await keysManager.saveRootKeys(_keys);
    const rootKeys = await keysManager.getRootKeys();
    expect(rootKeys).to.equal(_keys);
    expect(rootKeys.constructor.name).to.equal("SNKeys");
  });

  it('generating new keys should persist keys to account', async () => {
     const newKeys = await protocolManager.createKeysAndAuthParams({identifier: _identifier, password: "foobar"});
     await keysManager.addNewKeys(newKeys);
     expect(keysManager.allKeys.length).to.equal(1);
     expect(modelManager.validItemsForContentType("SNKeys")).length.to.equal(1);
  });

  it('key items should be encrypted with root keys', async () => {
    /** Keys should be encrypted with root keys, because if only 1 key object,
     * the items key would be contained within, and we couldn't access it.
     */
     const newKeys = await protocolManager.createKeysAndAuthParams({identifier: _identifier, password: "foobar"});
     await keysManager.addNewKeys(newKeys);

     expect(newKeys)
  });

  it('regular items should be encrypted with items keys', async () => {
    const itemKeys = await keysManager.getItemKeys();
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
