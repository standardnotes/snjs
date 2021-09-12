/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('payload manager', () => {
  before(async function () {
    const crypto = new SNWebCrypto();
    Uuid.SetGenerators(crypto.generateUUIDSync, crypto.generateUUID);
  });

  beforeEach(function () {
    this.payloadManager = new PayloadManager();
    this.createNotePayload = async () => {
      return CreateMaxPayloadFromAnyObject({
        uuid: Factory.generateUuidish(),
        content_type: ContentType.Note,
        content: {
          title: 'hello',
          text: 'world',
        },
      });
    };
  });

  it('emit payload should create local record', async function () {
    const payload = await this.createNotePayload();
    await this.payloadManager.emitPayload(payload);

    expect(this.payloadManager.collection.find(payload.uuid)).to.be.ok;
  });

  it('emit collection', async function () {
    const payload = await this.createNotePayload();
    const collection = ImmutablePayloadCollection.WithPayloads(
      [payload],
      PayloadSource.RemoteRetrieved
    );
    await this.payloadManager.emitCollection(collection);

    expect(this.payloadManager.collection.find(payload.uuid)).to.be.ok;
  });

  it('merge payloads onto master', async function () {
    const payload = await this.createNotePayload();
    await this.payloadManager.emitPayload(payload);

    const newTitle = `${Math.random()}`;
    const changedPayload = CopyPayload(payload, {
      content: {
        ...payload.safeContent,
        title: newTitle,
      },
    });
    const {
      changed,
      inserted,
    } = await this.payloadManager.mergePayloadsOntoMaster([changedPayload]);
    expect(changed.length).to.equal(1);
    expect(inserted.length).to.equal(0);
    expect(
      this.payloadManager.collection.find(payload.uuid).content.title
    ).to.equal(newTitle);
  });

  it('insertion observer', async function () {
    const observations = [];
    this.payloadManager.addObserver(ContentType.Any, (_, inserted) => {
      observations.push({ inserted });
    });
    const payload = await this.createNotePayload();
    await this.payloadManager.emitPayload(payload);

    expect(observations.length).equal(1);
    expect(observations[0].inserted[0]).equal(payload);
  });

  it('change observer', async function () {
    const observations = [];
    this.payloadManager.addObserver(ContentType.Any, (changed) => {
      if (changed.length > 0) {
        observations.push({ changed });
      }
    });
    const payload = await this.createNotePayload();
    await this.payloadManager.emitPayload(payload);
    await this.payloadManager.emitPayload(
      CopyPayload(payload, {
        content: {
          ...payload.safeContent,
          title: 'new title',
        },
      })
    );

    expect(observations.length).equal(1);
    expect(observations[0].changed[0].uuid).equal(payload.uuid);
  });

  it('reset state', async function () {
    this.payloadManager.addObserver(ContentType.Any, (payloads) => {});
    const payload = await this.createNotePayload();
    await this.payloadManager.emitPayload(payload);
    await this.payloadManager.resetState();

    expect(this.payloadManager.collection.all().length).to.equal(0);
    expect(this.payloadManager.changeObservers.length).equal(1);
  });
});
