import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe.only('files', function () {
  this.timeout(Factory.TwentySecondTimeout);

  beforeEach(async function () {
    localStorage.clear();

    this.context = await Factory.createAppContext();
    await this.context.launch();

    this.application = this.context.application;
    this.fileService = this.context.application.fileService;
    this.itemManager = this.context.application.itemManager;

    await Factory.registerUserToApplication({
      application: this.context.application,
      email: this.context.email,
      password: this.context.password,
    });

    await Factory.publishMockedEvent('SUBSCRIPTION_PURCHASED', {
      userEmail: this.context.email,
      subscriptionId: 1,
      subscriptionName: 'PLUS_PLAN',
      subscriptionExpiresAt: (new Date().getTime() + 3_600_000) * 1_000,
      timestamp: Date.now(),
      offline: false,
    });
    /** Wait and allow server to apply subscription to user */
    await Factory.sleep(0.5);
  });

  afterEach(async function () {
    expect(this.application.syncService.isOutOfSync()).to.equal(false);
    await Factory.safeDeinit(this.application);
    localStorage.clear();
  });

  const uploadFile = async (fileService, buffer, name, ext) => {
    const chunkSize = FileProtocolV1.DecryptedChunkSize;

    const operation = await fileService.beginNewFileUpload();

    let chunkId = 1;
    for (let i = 0; i < buffer.length; i += chunkSize) {
      const readUntil =
        i + chunkSize > buffer.length ? buffer.length : i + chunkSize;
      const chunk = buffer.slice(i, readUntil);
      const isFinalChunk = readUntil === buffer.length;

      const bytesUploadedSuccessfully = await fileService.pushBytesForUpload(
        operation,
        chunk,
        chunkId++,
        isFinalChunk
      );
      if (!bytesUploadedSuccessfully) {
        throw new Error('Could not upload file chunk');
      }
    }

    await fileService.finishUpload(operation, name, ext);

    return operation;
  };

  const downloadFile = async (fileService, itemManager, remoteIdentifier) => {
    const file = itemManager
      .getItems(ContentType.File)
      .find((file) => file.remoteIdentifier === remoteIdentifier);

    let receivedBytes = new Uint8Array();

    await fileService.downloadFile(file, (decryptedBytes) => {
      receivedBytes = new Uint8Array([...receivedBytes, ...decryptedBytes]);
    });

    return receivedBytes;
  };

  it('should create valet token from server', async function () {
    const remoteIdentifier = Factory.generateUuid();
    const token = await this.application.apiService.createFileValetToken(
      remoteIdentifier,
      'write'
    );

    expect(token.length).to.be.above(0);
  });

  it('should not create valet token from server when user has no subscription', async function () {
    localStorage.clear();

    this.context = await Factory.createAppContext();
    await this.context.launch();

    this.application = this.context.application;

    await Factory.registerUserToApplication({
      application: this.context.application,
      email: this.context.email,
      password: this.context.password,
    });

    const remoteIdentifier = Factory.generateUuid();
    const token = await this.application.apiService.createFileValetToken(
      remoteIdentifier,
      'write'
    );

    expect(token.error).to.equal('no-subscription');
  });

  it('should not create valet token from server when user has an expired subscription', async function () {
    localStorage.clear();

    this.context = await Factory.createAppContext();
    await this.context.launch();

    this.application = this.context.application;

    await Factory.registerUserToApplication({
      application: this.context.application,
      email: this.context.email,
      password: this.context.password,
    });

    await Factory.publishMockedEvent('SUBSCRIPTION_PURCHASED', {
      userEmail: this.context.email,
      subscriptionId: 1,
      subscriptionName: 'PLUS_PLAN',
      subscriptionExpiresAt: (new Date().getTime() - 3_600_000) * 1_000,
      timestamp: Date.now(),
      offline: false,
    });
    /** Wait and allow server to apply subscription to user */
    await Factory.sleep(0.5);

    const remoteIdentifier = Factory.generateUuid();
    const token = await this.application.apiService.createFileValetToken(
      remoteIdentifier,
      'write'
    );

    expect(token.error).to.equal('expired-subscription');
  });

  it('should encrypt and upload small file', async function () {
    const response = await fetch('/packages/snjs/mocha/assets/small_file.md');
    const buffer = new Uint8Array(await response.arrayBuffer());

    const operation = await uploadFile(
      this.fileService,
      buffer,
      'my-file',
      'md'
    );

    const downloadedBytes = await downloadFile(
      this.fileService,
      this.itemManager,
      operation.getRemoteIdentifier()
    );

    expect(downloadedBytes).to.eql(buffer);
  });

  it('should encrypt and upload big file', async function () {
    const response = await fetch('/packages/snjs/mocha/assets/two_mb_file.md');
    const buffer = new Uint8Array(await response.arrayBuffer());

    const operation = await uploadFile(
      this.fileService,
      buffer,
      'my-file',
      'md'
    );

    const downloadedBytes = await downloadFile(
      this.fileService,
      this.itemManager,
      operation.getRemoteIdentifier()
    );

    expect(downloadedBytes).to.eql(buffer);
  });
});
