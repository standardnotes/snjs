import { SodiumConstants } from '@standardnotes/sncrypto-web';
import { SNPureCrypto, StreamEncryptor } from '@standardnotes/sncrypto-common';
import { DecryptedFileInterface } from './../types';
import { FileEncryptor } from './../workers/file_encryptor';

describe('file encryptor', () => {
  let encryptor: FileEncryptor;
  let file: DecryptedFileInterface;
  let crypto: SNPureCrypto;

  beforeEach(() => {
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

    encryptor = new FileEncryptor(file, crypto);
  });

  it('should initialize header', async () => {
    const header = await encryptor.initializeHeader();

    expect(header.length).toBeGreaterThan(0);
  });

  it('pushBytes should return encrypted bytes', async () => {
    await encryptor.initializeHeader();
    const encryptedBytes = await encryptor.pushBytes(new Uint8Array(), false);

    expect(encryptedBytes).toBeInstanceOf(Uint8Array);
  });

  it('pushBytes with last chunk should pass final tag', async () => {
    await encryptor.initializeHeader();
    const decryptedBytes = new Uint8Array();
    await encryptor.pushBytes(decryptedBytes, true);

    expect(crypto.xchacha20StreamEncryptorPush).toHaveBeenCalledWith(
      expect.any(Object),
      decryptedBytes,
      file.remoteIdentifier,
      SodiumConstants.CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_TAG_FINAL
    );
  });

  it('pushBytes with not last chunk should not pass final tag', async () => {
    await encryptor.initializeHeader();
    const decryptedBytes = new Uint8Array();
    await encryptor.pushBytes(decryptedBytes, false);

    expect(crypto.xchacha20StreamEncryptorPush).toHaveBeenCalledWith(
      expect.any(Object),
      decryptedBytes,
      file.remoteIdentifier,
      undefined
    );
  });
});
