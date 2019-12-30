import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';
chai.use(chaiAsPromised);
var expect = chai.expect;

describe('payloads', () => {
  const _identifier = "hello@test.com";
  const _password = "password";
  let _keyParams, _key;

  const application = Factory.createApplication();

  before(async () => {
    await Factory.initializeApplication(application);
  });

  it('creating payload from item should create copy not by reference', async () => {
    const item = await Factory.createMappedNote(application.modelManager);
    const payload = CreatePayloadFromAnyObject({object: item});
    expect(item.content === payload.content).to.equal(false);
    expect(item.content.references === payload.content.references).to.equal(false);
  });

  it('creating payload from item should preserve appData', async () => {
    const item = await Factory.createMappedNote(application.modelManager);
    const payload = CreatePayloadFromAnyObject({object: item});
    expect(item.content.appData).to.be.ok;
    expect(JSON.stringify(item.content)).to.equal(JSON.stringify(payload.content));
  });

  it('creating payload with override properties', async () => {
    const payload = Factory.createNotePayload();
    const uuid = payload.uuid;
    const changedUuid = 'foo';
    const changedPayload = CreatePayloadFromAnyObject({
      object: payload,
      override: {
        uuid: changedUuid
      }
    })

    expect(payload.uuid).to.equal(uuid);
    expect(changedPayload.uuid).to.equal(changedUuid);
  });

  it('creating payload with deep override properties', async () => {
    const payload = Factory.createNotePayload();
    const text = payload.content.text;
    const changedText = `${Math.random()}`;
    const changedPayload = CreatePayloadFromAnyObject({
      object: payload,
      override: {
        content: {
          text: changedText
        }
      }
    })

    expect(payload.content === changedPayload.content).to.equal(false);
    expect(payload.content.text).to.equal(text);
    expect(changedPayload.content.text).to.equal(changedText);
  });

  it('creating payload with omit fields', async () => {
    const payload = Factory.createNotePayload();
    const uuid = payload.uuid;
    const changedUuid = 'foo';
    const changedPayload = CreatePayloadFromAnyObject({
      object: payload,
      omit: ['uuid']
    })

    expect(payload.uuid).to.equal(uuid);
    expect(changedPayload.uuid).to.not.be.ok;
  });

  it("returns valid encrypted params for syncing", async () => {
    var item = Factory.createStorageItemNotePayload();

    const itemParams = await protocolManager.payloadByEncryptingPayload({
      item: item,
      intent: ENCRYPTION_INTENT_SYNC
    })

    expect(itemParams.enc_item_key).to.not.be.null;
    expect(itemParams.uuid).to.not.be.null;
    expect(itemParams.auth_hash).to.be.null;
    expect(itemParams.content_type).to.not.be.null;
    expect(itemParams.created_at).to.not.be.null;
    expect(itemParams.content).to.satisfy((string) => {
      return string.startsWith(Factory.globalProtocolManager().latestVersion());
    });
  });

  it("returns unencrypted params with no keys", async () => {
    var item = Factory.createStorageItemNotePayload();
    const itemParams = await protocolManager.payloadByEncryptingPayload({
      item: item,
      intent: ENCRYPTION_INTENT_SYNC
    })

    expect(itemParams.enc_item_key).to.be.null;
    expect(itemParams.auth_hash).to.be.null;
    expect(itemParams.uuid).to.not.be.null;
    expect(itemParams.content_type).to.not.be.null;
    expect(itemParams.created_at).to.not.be.null;
    expect(itemParams.content).to.satisfy((string) => {
      return string.startsWith("000");
    });
  });

  it("returns additional fields for local storage", async () => {
    var item = Factory.createStorageItemNotePayload();

    const itemParams = await protocolManager.payloadByEncryptingPayload({
      item: item,
      intent: ENCRYPTION_INTENT_LOCAL_STORAGE_ENCRYPTED
    })

    expect(itemParams.enc_item_key).to.not.be.null;
    expect(itemParams.auth_hash).to.be.null;
    expect(itemParams.uuid).to.not.be.null;
    expect(itemParams.content_type).to.not.be.null;
    expect(itemParams.created_at).to.not.be.null;
    expect(itemParams.updated_at).to.not.be.null;
    expect(itemParams.deleted).to.not.be.null;
    expect(itemParams.errorDecrypting).to.not.be.null;
    expect(itemParams.content).to.satisfy((string) => {
      return string.startsWith(Factory.globalProtocolManager().latestVersion());
    });
  });

  it("omits deleted for export file", async () => {
    var item = Factory.createStorageItemNotePayload();
    const itemParams = await protocolManager.payloadByEncryptingPayload({
      item: item,
      intent: ENCRYPTION_INTENT_FILE_ENCRYPTED
    })
    expect(itemParams.enc_item_key).to.not.be.null;
    expect(itemParams.uuid).to.not.be.null;
    expect(itemParams.content_type).to.not.be.null;
    expect(itemParams.created_at).to.not.be.null;
    expect(itemParams.deleted).to.not.be.ok;
    expect(itemParams.content).to.satisfy((string) => {
      return string.startsWith(Factory.globalProtocolManager().latestVersion());
    });
  });

  it("items with error decrypting should remain as is", async () => {
    var item = Factory.createStorageItemNotePayload();
    item.errorDecrypting = true;
    const itemParams = await protocolManager.payloadByEncryptingPayload({
      item: item,
      intent: ENCRYPTION_INTENT_SYNC
    })
    expect(itemParams.content).to.eql(item.content);
    expect(itemParams.enc_item_key).to.not.be.null;
    expect(itemParams.uuid).to.not.be.null;
    expect(itemParams.content_type).to.not.be.null;
    expect(itemParams.created_at).to.not.be.null;
  });

})
