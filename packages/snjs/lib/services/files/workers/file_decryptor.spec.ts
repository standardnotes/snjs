import { FileDecryptor } from './file_decryptor';
import { SNPureCrypto, StreamEncryptor } from '@standardnotes/sncrypto-common';
import { EncryptedFileInterface } from './../types';

describe('file decryptor', () => {
  let decryptor: FileDecryptor;
  let file: EncryptedFileInterface;
  let crypto: SNPureCrypto;

  beforeEach(() => {
    crypto = {} as jest.Mocked<SNPureCrypto>;

    crypto.xchacha20StreamInitDecryptor = jest.fn().mockReturnValue({
      state: {},
    } as StreamEncryptor);

    crypto.xchacha20StreamDecryptorPush = jest
      .fn()
      .mockReturnValue({ message: new Uint8Array([0xaa]), tag: 0 });

    file = {
      remoteIdentifier: '123',
      encryptionHeader: 'some-header',
      key: 'secret',
    };

    decryptor = new FileDecryptor('123', 'some-header', 'secret', crypto);
  });

  it('initialize', async () => {
    await decryptor.initialize();

    expect(crypto.xchacha20StreamInitDecryptor).toHaveBeenCalledWith(
      file.encryptionHeader,
      file.key
    );
  });

  it('decryptBytes should return decrypted bytes', async () => {
    await decryptor.initialize();
    const encryptedBytes = new Uint8Array([0xaa]);
    const result = await decryptor.decryptBytes(encryptedBytes);

    expect(crypto.xchacha20StreamDecryptorPush).toHaveBeenCalledWith(
      expect.any(Object),
      encryptedBytes,
      file.remoteIdentifier
    );

    expect(result.decryptedBytes.length).toEqual(1);
  });
});
