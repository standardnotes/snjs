import { EncryptAndUploadFileOperation } from './EncryptAndUpload'
import { SNPureCryptoInterface, StreamEncryptor } from '@standardnotes/sncrypto-common'
import { DecryptedFileInterface } from '../Types'
import { FilesServerInterface } from '../FilesServerInterface'

describe('encrypt and upload', () => {
  let apiService: FilesServerInterface
  let operation: EncryptAndUploadFileOperation
  let file: DecryptedFileInterface
  let crypto: SNPureCryptoInterface

  const chunkOfSize = (size: number) => {
    return new TextEncoder().encode('a'.repeat(size))
  }

  beforeEach(() => {
    apiService = {} as jest.Mocked<FilesServerInterface>
    apiService.uploadFileBytes = jest.fn().mockReturnValue(true)

    crypto = {} as jest.Mocked<SNPureCryptoInterface>

    crypto.xchacha20StreamInitEncryptor = jest.fn().mockReturnValue({
      header: 'some-header',
      state: {},
    } as StreamEncryptor)

    crypto.xchacha20StreamEncryptorPush = jest.fn().mockReturnValue(new Uint8Array())

    file = {
      remoteIdentifier: '123',
      key: 'secret',
      decryptedSize: 100,
    }
  })

  it('should initialize encryption header', () => {
    operation = new EncryptAndUploadFileOperation(file, 'api-token', crypto, apiService)

    expect(operation.getResult().encryptionHeader.length).toBeGreaterThan(0)
  })

  it('should return true when a chunk is uploaded', async () => {
    operation = new EncryptAndUploadFileOperation(file, 'api-token', crypto, apiService)

    const bytes = new Uint8Array()
    const success = await operation.pushBytes(bytes, 2, false)

    expect(success).toEqual(true)
  })

  it('should correctly report progress', async () => {
    operation = new EncryptAndUploadFileOperation(file, 'api-token', crypto, apiService)

    const bytes = chunkOfSize(60)
    await operation.pushBytes(bytes, 2, false)

    const progress = operation.getProgress()

    expect(progress.decryptedFileSize).toEqual(100)
    expect(progress.decryptedBytesUploaded).toEqual(60)
    expect(progress.decryptedBytesRemaining).toEqual(40)
    expect(progress.percentComplete).toEqual(60.0)
  })
})
