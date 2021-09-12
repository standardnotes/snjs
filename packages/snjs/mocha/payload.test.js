/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('payload', () => {
  beforeEach(async function () {
    this.createBarePayload = () => {
      return new PurePayload({
        uuid: '123',
        content_type: ContentType.Note,
        content: {
          title: 'hello',
        },
      });
    };

    this.createEncryptedPayload = () => {
      return new PurePayload({
        uuid: '123',
        content_type: ContentType.Note,
        content: '004:foo:bar',
      });
    };
  });

  it('constructor should set expected fields', function () {
    const payload = this.createBarePayload();

    expect(payload.uuid).to.be.ok;
    expect(payload.content_type).to.be.ok;
    expect(payload.content).to.be.ok;
  });

  it('not supplying fields should infer them', function () {
    const payload = new PurePayload({
      uuid: '123',
      content_type: ContentType.Note,
      content: {
        title: 'hello',
      },
    });

    const expectedFields = [
      PayloadField.Uuid,
      PayloadField.ContentType,
      PayloadField.Content,
    ];

    expect(payload.fields).to.eql(expectedFields);
  });

  it('not supplying source should default to constructor source', function () {
    const payload = new PurePayload({
      uuid: '123',
      content_type: ContentType.Note,
      content: {
        title: 'hello',
      },
    });

    expect(payload.source).to.equal(PayloadSource.Constructor);
  });

  it('created at should default to present', function () {
    const payload = this.createBarePayload();

    expect(payload.created_at - new Date()).to.be.below(1);
  });

  it('updated at should default to epoch', function () {
    const payload = this.createBarePayload();

    expect(payload.updated_at.getTime()).to.equal(0);
  });

  it('payload format bare', function () {
    const payload = this.createBarePayload();

    expect(payload.format).to.equal(PayloadFormat.DecryptedBareObject);
  });

  it('payload format encrypted string', function () {
    const payload = this.createEncryptedPayload();

    expect(payload.format).to.equal(PayloadFormat.EncryptedString);
  });

  it('payload format base64 string', function () {
    const payload = new PurePayload({
      uuid: '123',
      content_type: ContentType.Note,
      content: '000:somebase64string',
    });

    expect(payload.format).to.equal(PayloadFormat.DecryptedBase64String);
  });

  it('payload format deleted', function () {
    const payload = new PurePayload({
      uuid: '123',
      content_type: ContentType.Note,
      deleted: true,
    });

    expect(payload.format).to.equal(PayloadFormat.Deleted);
  });

  it('payload version 004', function () {
    const payload = this.createEncryptedPayload();

    expect(payload.version).to.equal('004');
  });

  it('merged with absent content', function () {
    const payload = this.createBarePayload();
    const otherPayload = new PurePayload({
      uuid: '123',
      content_type: ContentType.Note,
      updated_at: new Date(),
      dirty: true,
      dirtiedDate: new Date(),
    });
    const merged = PayloadByMerging(payload, otherPayload);

    expect(merged.content).to.eql(payload.content);
    expect(merged.uuid).to.equal(payload.uuid);
    expect(merged.dirty).to.equal(true);
    expect(merged.updated_at.getTime()).to.be.above(1);
  });

  it('merged with undefined content', function () {
    const payload = this.createBarePayload();
    const otherPayload = new PurePayload({
      content: undefined,
    });
    const merged = PayloadByMerging(payload, otherPayload);

    expect(merged.uuid).to.equal(payload.uuid);
    expect(merged.content).to.not.be.ok;
  });

  it('deleted and not dirty should be discardable', function () {
    const payload = new PurePayload({
      uuid: '123',
      content_type: ContentType.Note,
      deleted: true,
      dirty: false,
    });

    expect(payload.discardable).to.equal(true);
  });

  it('should be immutable', function () {
    const payload = this.createBarePayload();

    const changeFn = () => {
      payload.foo = 'bar';
    };
    expect(changeFn).to.throw();
  });

  it('CreateIntentPayloadFromObject', function () {
    const payload = this.createBarePayload();
    const override = new PurePayload(
      {
        content: '004:...',
      },
      [PayloadField.Content]
    );
    const intentPayload = CreateIntentPayloadFromObject(
      payload,
      EncryptionIntent.LocalStoragePreferEncrypted,
      override
    );

    expect(intentPayload.content_type).to.be.ok;
  });

  it('Encryption params with override of select fields should only merge provided fields', function () {
    const payload = this.createBarePayload();
    const override = CreateEncryptionParameters({
      waitingForKey: true,
      errorDecrypting: true,
    });
    const intentPayload = CreateIntentPayloadFromObject(
      payload,
      EncryptionIntent.LocalStoragePreferEncrypted,
      override
    );

    expect(intentPayload.uuid).to.be.ok;
    expect(intentPayload.content).to.be.ok;
    expect(intentPayload.content_type).to.be.ok;
  });
});
