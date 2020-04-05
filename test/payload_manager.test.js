/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('payload manager', () => {

  before(async function () {
    const crypto = new SNWebCrypto();
    Uuid.SetGenerators(
      crypto.generateUUIDSync,
      crypto.generateUUID
    );
  });

  beforeEach(function () {
    this.modelManager = new PayloadManager();
    this.createNotePayload = async () => {
      return CreateMaxPayloadFromAnyObject(
        {
          uuid: Factory.generateUuidish(),
          content_type: ContentType.Note,
          content: BuildItemContent({
            title: 'hello',
            text: 'world'
          })
        }
      );
    };
  });

  it('emit payload should create local record', async function () {
    const payload = await this.createNotePayload();
    await this.modelManager.emitPayload(payload);

    expect(this.modelManager.collection.find(payload.uuid)).to.be.ok;
  });

  it('emit collection', async function () {
    const payload = await this.createNotePayload();
    const collection = new PayloadCollection([payload], PayloadSource.RemoteRetrieved);
    await this.modelManager.emitCollection(collection);

    expect(this.modelManager.collection.find(payload.uuid)).to.be.ok;
  });

  it('merge payloads onto master', async function () {
    const payload = await this.createNotePayload();
    await this.modelManager.emitPayload(payload);

    const newTitle = `${Math.random()}`;
    const changedPayload = CopyPayload(
      payload,
      {
        content: {
          title: newTitle
        }
      }
    );
    const { changed, inserted } = await this.modelManager.mergePayloadsOntoMaster([changedPayload]);
    expect(changed.length).to.equal(1);
    expect(inserted.length).to.equal(0);
    expect(this.modelManager.collection.find(payload.uuid).content.title).to.equal(newTitle);
  });

  it('insertion observer', async function () {
    const observations = [];
    const changeObservations = [];
    this.modelManager.addInsertionObserver((payloads) => {
      observations.push({ payloads });
    });
    this.modelManager.addChangeObserver((payloads) => {
      changeObservations.push({ payloads });
    });
    const payload = await this.createNotePayload();
    await this.modelManager.emitPayload(payload);

    expect(observations.length).equal(1);
    expect(observations[0].payloads[0]).equal(payload);
    expect(changeObservations.length).to.equal(0);
  });

  it('change observer', async function () {
    const observations = [];
    this.modelManager.addChangeObserver(ContentType.Any, (payloads) => {
      observations.push({ payloads });
    });
    const payload = await this.createNotePayload();
    await this.modelManager.emitPayload(payload);
    await this.modelManager.emitPayload(CopyPayload(
      payload,
      {
        content: {
          title: 'new title'
        }
      }
    ));

    expect(observations.length).equal(1);
    expect(observations[0].payloads[0].uuid).equal(payload.uuid);
  });

  it('reset state', async function () {
    this.modelManager.addInsertionObserver((payloads) => {});
    this.modelManager.addChangeObserver((payloads) => {});
    const payload = await this.createNotePayload();
    await this.modelManager.emitPayload(payload);
    await this.modelManager.resetState();

    expect(this.modelManager.collection.all().length).to.equal(0);
    expect(this.modelManager.creationObservers.length).equal(1);
    expect(this.modelManager.changeObservers.length).equal(1);
  });

});