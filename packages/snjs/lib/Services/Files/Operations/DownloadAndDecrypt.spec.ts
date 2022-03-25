import { sleep } from '@standardnotes/utils'
import { SNPureCrypto, StreamEncryptor } from '@standardnotes/sncrypto-common'
import { RemoteFileInterface, EncryptedFileInterface } from '../types'
import { FilesServerInterface } from '../FilesServerInterface'
import { DownloadAndDecryptFileOperation } from './DownloadAndDecrypt'

describe('download and decrypt', () => {
  let apiService: FilesServerInterface
  let operation: DownloadAndDecryptFileOperation
  let file: RemoteFileInterface & EncryptedFileInterface
  let crypto: SNPureCrypto

  const NumChunks = 5

  beforeEach(() => {
    apiService = {} as jest.Mocked<FilesServerInterface>
    apiService.downloadFile = jest
      .fn()
      .mockImplementation(
        (
          _file: string,
          _chunkIndex: number,
          _apiToken: string,
          _rangeStart: number,
          onBytesReceived: (bytes: Uint8Array) => void,
        ) => {
          const receiveFile = async () => {
            for (let i = 0; i < NumChunks; i++) {
              onBytesReceived(Uint8Array.from([0xaa]))
              await sleep(100, false)
            }
          }

          return new Promise<void>((resolve) => {
            void receiveFile().then(resolve)
          })
        },
      )

    crypto = {} as jest.Mocked<SNPureCrypto>

    crypto.xchacha20StreamInitDecryptor = jest.fn().mockReturnValue({
      state: {},
    } as StreamEncryptor)

    crypto.xchacha20StreamDecryptorPush = jest
      .fn()
      .mockReturnValue({ message: new Uint8Array([0xaa]), tag: 0 })

    file = {
      chunkSizes: [100_000],
      remoteIdentifier: '123',
      key: 'secret',
      encryptionHeader: 'some-header',
    }
  })

  it('run should resolve when operation is complete', async () => {
    let receivedBytes = new Uint8Array()

    file = {
      chunkSizes: [100_000],
      remoteIdentifier: '123',
      key: 'secret',
      encryptionHeader: 'some-header',
    }

    operation = new DownloadAndDecryptFileOperation(
      file,
      crypto,
      apiService,
      'api-token',
      async (decryptedBytes) => {
        if (decryptedBytes) {
          receivedBytes = new Uint8Array([...receivedBytes, ...decryptedBytes])
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    )

    operation['decryptor'].decryptBytes = jest.fn().mockImplementation(() => {
      return {
        decryptedBytes: new Uint8Array([0xaa]),
        isFinalChunk: receivedBytes.length === NumChunks - 1,
      }
    })

    await operation.run()

    expect(receivedBytes.length).toEqual(NumChunks)
  })
})
