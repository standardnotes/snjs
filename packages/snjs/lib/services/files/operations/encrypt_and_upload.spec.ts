import { EncryptAndUploadFileOperation } from './encrypt_and_upload';
import { SNPureCrypto, StreamEncryptor } from '@standardnotes/sncrypto-common';
import { FilesApi, DecryptedFileInterface } from './../types';

describe('encrypt and upload', () => {
  let apiService: FilesApi;
  let operation: EncryptAndUploadFileOperation;
  let file: DecryptedFileInterface;
  let crypto: SNPureCrypto;

  beforeEach(() => {
    apiService = {} as jest.Mocked<FilesApi>;
    apiService.uploadFileBytes = jest.fn().mockReturnValue({ success: true });

    crypto = {} as jest.Mocked<SNPureCrypto>;

    crypto.xchacha20StreamInitEncryptor = jest.fn().mockReturnValue({
      header: 'some-header',
      state: {},
    } as StreamEncryptor);

    crypto.xchacha20StreamEncryptorPush = jest
      .fn()
      .mockReturnValue(new Uint8Array());

    file = {
      remoteIdentifier: '123',
      key: 'secret',
    };
  });

  it('should initialize encryption header', async () => {
    operation = new EncryptAndUploadFileOperation(
      file,
      'api-token',
      crypto,
      apiService
    );
    const header = operation.initializeHeader();

    expect(header.length).toBeGreaterThan(0);
  });

  it('should return true when a chunk is uploaded', async () => {
    operation = new EncryptAndUploadFileOperation(
      file,
      'api-token',
      crypto,
      apiService
    );
    operation.initializeHeader();

    const bytes = new Uint8Array();
    const success = await operation.pushBytes(bytes, 2, false);

    expect(success).toEqual(true);
  });
});
