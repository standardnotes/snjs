import { sleep } from '@standardnotes/utils'
import { SNPureCrypto, StreamEncryptor } from '@standardnotes/sncrypto-common'
import { RemoteFileInterface, EncryptedFileInterface, FileDownloadProgress } from '../Types'
import { FilesServerInterface } from '../FilesServerInterface'
import { DownloadAndDecryptFileOperation } from './DownloadAndDecrypt'

describe('download and decrypt', () => {
  let apiService: FilesServerInterface
  let operation: DownloadAndDecryptFileOperation
  let file: RemoteFileInterface & EncryptedFileInterface
  let crypto: SNPureCrypto

  const NumChunks = 5

  const chunkOfSize = (size: number) => {
    return new TextEncoder().encode('a'.repeat(size))
  }

  const downloadChunksOfSize = (size: number) => {
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
              onBytesReceived(chunkOfSize(size))

              await sleep(100, false)
            }
          }

          return new Promise<void>((resolve) => {
            void receiveFile().then(resolve)
          })
        },
      )
  }

  beforeEach(() => {
    apiService = {} as jest.Mocked<FilesServerInterface>
    downloadChunksOfSize(5)

    crypto = {} as jest.Mocked<SNPureCrypto>

    crypto.xchacha20StreamInitDecryptor = jest.fn().mockReturnValue({
      state: {},
    } as StreamEncryptor)

    crypto.xchacha20StreamDecryptorPush = jest.fn().mockReturnValue({ message: new Uint8Array([0xaa]), tag: 0 })

    file = {
      encryptedChunkSizes: [100_000],
      remoteIdentifier: '123',
      key: 'secret',
      encryptionHeader: 'some-header',
      encryptedSize: 100_000,
    }
  })

  it('run should resolve when operation is complete', async () => {
    let receivedBytes = new Uint8Array()

    operation = new DownloadAndDecryptFileOperation(file, crypto, apiService, 'api-token')

    await operation.run(async (decryptedBytes) => {
      if (decryptedBytes) {
        receivedBytes = new Uint8Array([...receivedBytes, ...decryptedBytes])
      }

      await Promise.resolve()
    })

    expect(receivedBytes.length).toEqual(NumChunks)
  })

  it('should correctly report progress', async () => {
    file = {
      encryptedChunkSizes: [100_000, 200_000, 200_000],
      remoteIdentifier: '123',
      key: 'secret',
      encryptionHeader: 'some-header',
      encryptedSize: 500_000,
    }

    downloadChunksOfSize(100_000)

    operation = new DownloadAndDecryptFileOperation(file, crypto, apiService, 'api-token')

    const progress: FileDownloadProgress = await new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/require-await
      void operation.run(async (_decryptedBytes, chunkProgress) => {
        operation.abort()
        resolve(chunkProgress)
      })
    })

    expect(progress.encryptedBytesDownloaded).toEqual(100_000)
    expect(progress.encryptedBytesRemaining).toEqual(400_000)
    expect(progress.encryptedFileSize).toEqual(500_000)
    expect(progress.percentComplete).toEqual(20.0)
  })
})
