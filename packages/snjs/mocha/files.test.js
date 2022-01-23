import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe.only('files', function () {
  this.timeout(Factory.TenSecondTimeout);

  beforeEach(async function () {
    localStorage.clear();

    this.context = await Factory.createAppContext();
    await this.context.launch();

    this.application = this.context.application;
    this.fileService = this.context.application.fileService;

    await Factory.registerUserToApplication({
      application: this.context.application,
      email: this.context.email,
      password: this.context.password,
    });
  });

  afterEach(async function () {
    expect(this.application.syncService.isOutOfSync()).to.equal(false);
    await Factory.safeDeinit(this.application);
    localStorage.clear();
  });

  const uploadFile = async (buffer, name, ext) => {
    const chunkSize = FileProtocolV1.ChunkSize;

    const operation = await this.fileService.beginNewFileUpload();

    for (let i = 0; i < buffer.length; i += chunkSize) {
      const readUntil =
        i + chunkSize > buffer.length ? buffer.length : i + chunkSize;
      const chunk = buffer.slice(i, readUntil);
      const isFinalChunk = readUntil === buffer.length;

      await this.fileService.pushBytesForUpload(operation, chunk, isFinalChunk);
    }

    await this.fileService.finishUpload(operation, name, ext);
    return operation;
  };

  const downloadFile = async (remoteIdentifier) => {
    const file = this.context.application.itemManager
      .getItems(ContentType.File)
      .find((file) => file.content.remoteIdentifier === remoteIdentifier);

    let receivedBytes = new Uint8Array();

    await this.fileService.downloadFile(file, (decryptedBytes) => {
      receivedBytes = new Uint8Array([...receivedBytes, ...decryptedBytes]);
    });

    return receivedBytes;
  };

  it.only('should create valet token from server', async function () {
    const token = await this.application.apiService.createFileUploadToken();
    expect(token.length).to.be.above(0);
  });

  it('should encrypt and upload file', async function () {
    const response = await fetch('http://localhost:9003/assets/two_mb_file.md');
    const buffer = response.arrayBuffer;

    const operation = await uploadFile(buffer, 'my-file', 'md');
    const downloadedBytes = await downloadFile(operation.getRemoteIdentifier());

    expect(downloadedBytes).to.eql(buffer);
  });
});
