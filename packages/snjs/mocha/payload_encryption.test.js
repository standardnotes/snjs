/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('payload encryption', function () {
  beforeEach(async function () {
    this.timeout(Factory.TenSecondTimeout);
    localStorage.clear();
    this.application = await Factory.createInitAppWithFakeCrypto();
    this.email = UuidGenerator.GenerateUuid();
    this.password = UuidGenerator.GenerateUuid();
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
    });
  });

  afterEach(async function () {
    await Factory.safeDeinit(this.application);
    localStorage.clear();
  });

  it('creating payload from item should create copy not by reference', async function () {
    const item = await Factory.createMappedNote(this.application);
    const payload = CreateMaxPayloadFromAnyObject(item);
    expect(item.content === payload.content).to.equal(false);
    expect(item.content.references === payload.content.references).to.equal(
      false
    );
  });

  it('creating payload from item should preserve appData', async function () {
    const item = await Factory.createMappedNote(this.application);
    const payload = CreateMaxPayloadFromAnyObject(item);
    expect(item.content.appData).to.be.ok;
    expect(JSON.stringify(item.content)).to.equal(
      JSON.stringify(payload.content)
    );
  });

  it('server payloads should not contain client values', async function () {
    const rawPayload = Factory.createNotePayload();
    const notePayload = CreateMaxPayloadFromAnyObject(rawPayload, {
      dirty: true,
      dirtiedDate: new Date(),
      lastSyncBegan: new Date(),
      waitingForKey: false,
      errorDecrypting: false,
    });

    const encryptedPayload = await this.application.protocolService.payloadByEncryptingPayload(
      notePayload,
      EncryptionIntent.Sync
    );

    expect(encryptedPayload.dirty).to.not.be.ok;
    expect(encryptedPayload.errorDecrypting).to.not.be.ok;
    expect(encryptedPayload.errorDecryptingValueChanged).to.not.be.ok;
    expect(encryptedPayload.waitingForKey).to.not.be.ok;
    expect(encryptedPayload.lastSyncBegan).to.not.be.ok;
  });

  it('creating payload with override properties', async function () {
    const payload = Factory.createNotePayload();
    const uuid = payload.uuid;
    const changedUuid = 'foo';
    const changedPayload = CreateMaxPayloadFromAnyObject(payload, {
      uuid: changedUuid,
    });

    expect(payload.uuid).to.equal(uuid);
    expect(changedPayload.uuid).to.equal(changedUuid);
  });

  it('creating payload with deep override properties', async function () {
    const payload = Factory.createNotePayload();
    const text = payload.content.text;
    const changedText = `${Math.random()}`;
    const changedPayload = CreateMaxPayloadFromAnyObject(payload, {
      content: {
        ...payload.safeContent,
        text: changedText,
      },
    });

    expect(payload.content === changedPayload.content).to.equal(false);
    expect(payload.content.text).to.equal(text);
    expect(changedPayload.content.text).to.equal(changedText);
  });

  it('copying payload with override content should override completely', async function () {
    const item = await Factory.createMappedNote(this.application);
    const payload = CreateMaxPayloadFromAnyObject(item);
    const mutated = CreateMaxPayloadFromAnyObject(payload, {
      content: {
        foo: 'bar',
      },
    });
    expect(mutated.content.text).to.not.be.ok;
  });

  it('copying payload with override should copy empty arrays', async function () {
    const pair = Factory.createRelatedNoteTagPairPayload();
    const tagPayload = pair[1];
    expect(tagPayload.content.references.length).to.equal(1);

    const mutated = CreateMaxPayloadFromAnyObject(tagPayload, {
      content: {
        ...tagPayload.safeContent,
        references: [],
      },
    });
    expect(mutated.content.references.length).to.equal(0);
  });

  it('returns valid encrypted params for syncing', async function () {
    const payload = Factory.createNotePayload();
    const encryptedPayload = await this.application.protocolService.payloadByEncryptingPayload(
      payload,
      EncryptionIntent.Sync
    );
    expect(encryptedPayload.enc_item_key).to.be.ok;
    expect(encryptedPayload.uuid).to.be.ok;
    expect(encryptedPayload.auth_hash).to.not.be.ok;
    expect(encryptedPayload.content_type).to.be.ok;
    expect(encryptedPayload.created_at).to.be.ok;
    expect(encryptedPayload.content).to.satisfy((string) => {
      return string.startsWith(
        this.application.protocolService.getLatestVersion()
      );
    });
  }).timeout(5000);

  it('returns unencrypted params with no keys', async function () {
    const payload = Factory.createNotePayload();
    const encodedPayload = await this.application.protocolService.payloadByEncryptingPayload(
      payload,
      EncryptionIntent.FileDecrypted
    );

    expect(encodedPayload.enc_item_key).to.not.be.ok;
    expect(encodedPayload.auth_hash).to.not.be.ok;
    expect(encodedPayload.uuid).to.be.ok;
    expect(encodedPayload.content_type).to.be.ok;
    expect(encodedPayload.created_at).to.be.ok;
    /** File decrypted will result in bare object */
    expect(encodedPayload.content.title).to.equal(payload.content.title);
  });

  it('returns additional fields for local storage', async function () {
    const payload = Factory.createNotePayload();

    const encryptedPayload = await this.application.protocolService.payloadByEncryptingPayload(
      payload,
      EncryptionIntent.LocalStorageEncrypted
    );

    expect(encryptedPayload.enc_item_key).to.be.ok;
    expect(encryptedPayload.auth_hash).to.not.be.ok;
    expect(encryptedPayload.uuid).to.be.ok;
    expect(encryptedPayload.content_type).to.be.ok;
    expect(encryptedPayload.created_at).to.be.ok;
    expect(encryptedPayload.updated_at).to.be.ok;
    expect(encryptedPayload.deleted).to.not.be.ok;
    expect(encryptedPayload.errorDecrypting).to.not.be.ok;
    expect(encryptedPayload.content).to.satisfy((string) => {
      return string.startsWith(
        this.application.protocolService.getLatestVersion()
      );
    });
  });

  it('omits deleted for export file', async function () {
    const payload = Factory.createNotePayload();
    const encryptedPayload = await this.application.protocolService.payloadByEncryptingPayload(
      payload,
      EncryptionIntent.FileEncrypted
    );
    expect(encryptedPayload.enc_item_key).to.be.ok;
    expect(encryptedPayload.uuid).to.be.ok;
    expect(encryptedPayload.content_type).to.be.ok;
    expect(encryptedPayload.created_at).to.be.ok;
    expect(encryptedPayload.deleted).to.not.be.ok;
    expect(encryptedPayload.content).to.satisfy((string) => {
      return string.startsWith(
        this.application.protocolService.getLatestVersion()
      );
    });
  });

  it('items with error decrypting should remain as is', async function () {
    const payload = Factory.createNotePayload();
    const mutatedPayload = CreateMaxPayloadFromAnyObject(payload, {
      enc_item_key: 'foo',
      errorDecrypting: true,
    });
    const encryptedPayload = await this.application.protocolService.payloadByEncryptingPayload(
      mutatedPayload,
      EncryptionIntent.Sync
    );
    expect(encryptedPayload.content).to.eql(payload.content);
    expect(encryptedPayload.enc_item_key).to.be.ok;
    expect(encryptedPayload.uuid).to.be.ok;
    expect(encryptedPayload.content_type).to.be.ok;
    expect(encryptedPayload.created_at).to.be.ok;
  });
});
