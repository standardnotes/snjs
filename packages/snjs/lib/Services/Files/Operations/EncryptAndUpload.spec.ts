import { EncryptAndUploadFileOperation } from './EncryptAndUpload'
import { SNPureCrypto, StreamEncryptor } from '@standardnotes/sncrypto-common'
import { DecryptedFileInterface } from '../Types'
import { FilesServerInterface } from '../FilesServerInterface'

describe('encrypt and upload', () => {
  let apiService: FilesServerInterface
  let operation: EncryptAndUploadFileOperation
  let file: DecryptedFileInterface
  let crypto: SNPureCrypto

  beforeEach(() => {
    apiService = {} as jest.Mocked<FilesServerInterface>
    apiService.uploadFileBytes = jest.fn().mockReturnValue(true)

    crypto = {} as jest.Mocked<SNPureCrypto>

    crypto.xchacha20StreamInitEncryptor = jest.fn().mockReturnValue({
      header: 'some-header',
      state: {},
    } as StreamEncryptor)

    crypto.xchacha20StreamEncryptorPush = jest.fn().mockReturnValue(new Uint8Array())

    file = {
      remoteIdentifier: '123',
      key: 'secret',
    }
  })

  it('should initialize encryption header', () => {
    operation = new EncryptAndUploadFileOperation(file, 'api-token', crypto, apiService)
    const header = operation.initializeHeader()

    expect(header.length).toBeGreaterThan(0)
  })

  it('should return true when a chunk is uploaded', async () => {
    operation = new EncryptAndUploadFileOperation(file, 'api-token', crypto, apiService)
    operation.initializeHeader()

    const bytes = new Uint8Array()
    const success = await operation.pushBytes(bytes, 2, false)

    expect(success).toEqual(true)
  })
})
